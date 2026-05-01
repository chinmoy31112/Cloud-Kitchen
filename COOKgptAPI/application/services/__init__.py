"""
Application Layer: Service Implementations
Business logic for all CookGPT services.
"""
from typing import Optional, List
from datetime import date, timedelta
from django.core.cache import cache
import google.generativeai as genai
import json
import os

from application.interfaces import (
    IAuthService, IUserService, IMenuService, IOrderService,
    ICartService, IPaymentService, IDeliveryService, IAIService, IAnalyticsService,
)
from infrastructure.repositories import (
    DjangoUserRepository, DjangoMenuRepository, DjangoOrderRepository,
    DjangoCartRepository, DjangoPaymentRepository, DjangoDeliveryRepository,
    DjangoAIRepository, DjangoAnalyticsRepository,
)


# ──────────────────────────── Auth Service ─────────────────────────────────

class AuthService(IAuthService):
    def __init__(self):
        self.user_repo = DjangoUserRepository()

    def register(self, data: dict) -> dict:
        # Check if user already exists
        existing = self.user_repo.get_by_email(data.get('email', ''))
        if existing:
            raise ValueError("A user with this email already exists.")

        existing_username = self.user_repo.get_by_username(data.get('username', ''))
        if existing_username:
            raise ValueError("A user with this username already exists.")

        user = self.user_repo.create(
            email=data['email'],
            username=data['username'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            role=data.get('role', 'customer'),
        )
        return user

    def login(self, email: str, password: str) -> Optional[dict]:
        return self.user_repo.authenticate(email, password)


# ──────────────────────────── User Service ─────────────────────────────────

class UserService(IUserService):
    def __init__(self):
        self.user_repo = DjangoUserRepository()

    def get_profile(self, user_id: int) -> Optional[dict]:
        return self.user_repo.get_by_id(user_id)

    def update_profile(self, user_id: int, data: dict) -> Optional[dict]:
        return self.user_repo.update(user_id, **data)

    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        return self.user_repo.change_password(user_id, old_password, new_password)

    def get_addresses(self, user_id: int) -> List[dict]:
        return self.user_repo.get_addresses(user_id)

    def add_address(self, user_id: int, data: dict) -> dict:
        return self.user_repo.create_address(user_id, **data)

    def update_address(self, address_id: int, data: dict) -> Optional[dict]:
        return self.user_repo.update_address(address_id, **data)

    def delete_address(self, address_id: int) -> bool:
        return self.user_repo.delete_address(address_id)


# ──────────────────────────── Menu Service ─────────────────────────────────

class MenuService(IMenuService):
    def __init__(self):
        self.menu_repo = DjangoMenuRepository()

    def create_item(self, data: dict) -> dict:
        return self.menu_repo.create_item(**data)

    def get_item(self, item_id: int) -> Optional[dict]:
        cache_key = f'menu_item_{item_id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        item = self.menu_repo.get_item_by_id(item_id)
        if item:
            cache.set(cache_key, item, timeout=300)
        return item

    def list_items(self, category_id=None, is_available=None, search='') -> List[dict]:
        cache_key = f'menu_list_{category_id}_{is_available}_{search}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        items = self.menu_repo.list_items(category_id, is_available, search)
        cache.set(cache_key, items, timeout=120)
        return items

    def update_item(self, item_id: int, data: dict) -> Optional[dict]:
        result = self.menu_repo.update_item(item_id, **data)
        if result:
            cache.delete(f'menu_item_{item_id}')
            # Invalidate list caches
            cache.delete_pattern('menu_list_*') if hasattr(cache, 'delete_pattern') else None
        return result

    def delete_item(self, item_id: int) -> bool:
        result = self.menu_repo.delete_item(item_id)
        if result:
            cache.delete(f'menu_item_{item_id}')
        return result

    def create_category(self, data: dict) -> dict:
        return self.menu_repo.create_category(**data)

    def list_categories(self) -> List[dict]:
        cache_key = 'categories_list'
        cached = cache.get(cache_key)
        if cached:
            return cached
        cats = self.menu_repo.list_categories()
        cache.set(cache_key, cats, timeout=600)
        return cats

    def delete_category(self, category_id: int) -> bool:
        result = self.menu_repo.delete_category(category_id)
        if result:
            cache.delete('categories_list')
        return result


# ──────────────────────────── Order Service ────────────────────────────────

class OrderService(IOrderService):
    def __init__(self):
        self.order_repo = DjangoOrderRepository()
        self.cart_repo = DjangoCartRepository()
        self.payment_repo = DjangoPaymentRepository()
        self.analytics_repo = DjangoAnalyticsRepository()

    def place_order(self, user_id: int, data: dict) -> dict:
        order = self.order_repo.create(
            user_id=user_id,
            delivery_address_id=data['delivery_address_id'],
            items=data['items'],
            special_instructions=data.get('special_instructions', ''),
        )

        # Create payment record
        payment_method = data.get('payment_method', 'cash_on_delivery')
        self.payment_repo.create(
            order_id=order['id'],
            amount=order['total'],
            method=payment_method,
        )

        # Create kitchen timers for each order item
        for item in order.get('items', []):
            self.analytics_repo.create_timer(
                order_id=order['id'],
                order_item_id=item['id'],
                menu_item_name=item['menu_item_name'],
                estimated_time=15,  # Default prep time
            )

        # Clear user's cart after placing order
        cart = self.cart_repo.get_or_create(user_id)
        self.cart_repo.clear_cart(cart['id'])

        return order

    def get_order(self, order_id: int) -> Optional[dict]:
        return self.order_repo.get_by_id(order_id)

    def get_user_orders(self, user_id: int) -> List[dict]:
        return self.order_repo.list_by_user(user_id)

    def get_all_orders(self, status=None) -> List[dict]:
        return self.order_repo.list_all(status)

    def update_order_status(self, order_id, status, estimated_time=None):
        return self.order_repo.update_status(order_id, status, estimated_time)


# ──────────────────────────── Cart Service ─────────────────────────────────

class CartService(ICartService):
    def __init__(self):
        self.cart_repo = DjangoCartRepository()

    def get_cart(self, user_id: int) -> dict:
        return self.cart_repo.get_or_create(user_id)

    def add_item(self, user_id: int, menu_item_id: int, quantity: int) -> dict:
        cart = self.cart_repo.get_or_create(user_id)
        return self.cart_repo.add_item(cart['id'], menu_item_id, quantity)

    def remove_item(self, user_id: int, item_id: int) -> bool:
        cart = self.cart_repo.get_or_create(user_id)
        return self.cart_repo.remove_item(cart['id'], item_id)

    def update_item_quantity(self, user_id: int, item_id: int, quantity: int):
        cart = self.cart_repo.get_or_create(user_id)
        return self.cart_repo.update_item_quantity(cart['id'], item_id, quantity)

    def clear_cart(self, user_id: int) -> bool:
        cart = self.cart_repo.get_or_create(user_id)
        return self.cart_repo.clear_cart(cart['id'])


# ──────────────────────────── Payment Service ──────────────────────────────

class PaymentService(IPaymentService):
    def __init__(self):
        self.payment_repo = DjangoPaymentRepository()

    def create_payment(self, data: dict) -> dict:
        return self.payment_repo.create(
            order_id=data['order_id'],
            amount=data['amount'],
            method=data.get('method', 'cash_on_delivery'),
            transaction_id=data.get('transaction_id', ''),
        )

    def get_payment(self, payment_id: int) -> Optional[dict]:
        return self.payment_repo.get_by_id(payment_id)

    def get_payment_by_order(self, order_id: int) -> Optional[dict]:
        return self.payment_repo.get_by_order(order_id)

    def update_payment_status(self, payment_id: int, status: str) -> Optional[dict]:
        return self.payment_repo.update_status(payment_id, status)


# ──────────────────────────── Delivery Service ─────────────────────────────

class DeliveryService(IDeliveryService):
    def __init__(self):
        self.delivery_repo = DjangoDeliveryRepository()
        self.order_repo = DjangoOrderRepository()

    def assign_delivery(self, data: dict) -> dict:
        delivery = self.delivery_repo.create(
            order_id=data['order_id'],
            agent_id=data['agent_id'],
            estimated_time=data.get('estimated_time'),
        )
        # Update order status to out_for_delivery
        self.order_repo.update_status(data['order_id'], 'out_for_delivery')
        return delivery

    def get_delivery(self, delivery_id: int) -> Optional[dict]:
        return self.delivery_repo.get_by_id(delivery_id)

    def update_delivery_status(self, delivery_id: int, data: dict):
        status = data.get('status', '')
        result = self.delivery_repo.update_status(delivery_id, status, **{
            k: v for k, v in data.items() if k != 'status'
        })
        # If delivered, update order status too
        if result and status == 'delivered':
            self.order_repo.update_status(result['order_id'], 'delivered')
        return result

    def get_agent_deliveries(self, agent_id: int, status=None):
        return self.delivery_repo.list_by_agent(agent_id, status)

    def update_location(self, delivery_id, lat, lng):
        return self.delivery_repo.update_location(delivery_id, lat, lng)

    def track_delivery(self, order_id: int) -> Optional[dict]:
        return self.delivery_repo.get_by_order(order_id)


# ──────────────────────────── AI Recipe Service ────────────────────────────

class AIService(IAIService):
    """AI-powered recipe recommendation service with built-in recipe database."""

    # Built-in recipe database for ingredient matching
    RECIPE_DATABASE = [
        {
            'name': 'Vegetable Fried Rice',
            'description': 'Quick and flavorful fried rice with mixed vegetables',
            'ingredients': ['rice', 'onion', 'garlic', 'carrot', 'peas', 'soy sauce', 'oil', 'egg'],
            'instructions': [
                'Cook rice and let it cool',
                'Heat oil in a wok, scramble egg',
                'Add garlic and onion, stir-fry',
                'Add carrots and peas',
                'Add cooled rice and soy sauce',
                'Toss everything together and serve hot'
            ],
            'preparation_time': 10, 'cooking_time': 15, 'servings': 4,
            'difficulty': 'easy', 'cuisine': 'Chinese',
        },
        {
            'name': 'Paneer Butter Masala',
            'description': 'Creamy and rich paneer curry in tomato-based gravy',
            'ingredients': ['paneer', 'tomato', 'onion', 'butter', 'cream', 'garlic', 'ginger', 'garam masala', 'oil'],
            'instructions': [
                'Blend tomatoes, onion, and cashews into a smooth paste',
                'Heat butter and oil, add garlic-ginger paste',
                'Add the blended paste and cook until oil separates',
                'Add garam masala, salt, and sugar',
                'Add paneer cubes and cream',
                'Simmer for 5 minutes and serve with naan or rice'
            ],
            'preparation_time': 15, 'cooking_time': 25, 'servings': 4,
            'difficulty': 'medium', 'cuisine': 'Indian',
        },
        {
            'name': 'Egg Omelette',
            'description': 'Simple and fluffy egg omelette with vegetables',
            'ingredients': ['egg', 'onion', 'tomato', 'green chili', 'salt', 'pepper', 'oil', 'butter'],
            'instructions': [
                'Beat eggs with salt and pepper',
                'Chop onion, tomato, and green chili finely',
                'Mix vegetables into beaten eggs',
                'Heat butter/oil in a pan',
                'Pour egg mixture and cook on medium heat',
                'Flip and cook the other side, serve hot'
            ],
            'preparation_time': 5, 'cooking_time': 5, 'servings': 1,
            'difficulty': 'easy', 'cuisine': 'Indian',
        },
        {
            'name': 'Chicken Curry',
            'description': 'Traditional Indian chicken curry with rich spices',
            'ingredients': ['chicken', 'onion', 'tomato', 'garlic', 'ginger', 'turmeric', 'chili powder', 'coriander', 'cumin', 'oil', 'salt'],
            'instructions': [
                'Marinate chicken with turmeric, salt, and chili powder',
                'Heat oil and fry onions until golden',
                'Add garlic-ginger paste and cook',
                'Add tomatoes and cook until soft',
                'Add spices and cook until oil separates',
                'Add marinated chicken and cook for 20-25 minutes',
                'Garnish with coriander leaves and serve'
            ],
            'preparation_time': 15, 'cooking_time': 35, 'servings': 4,
            'difficulty': 'medium', 'cuisine': 'Indian',
        },
        {
            'name': 'Pasta Aglio e Olio',
            'description': 'Classic Italian pasta with garlic and olive oil',
            'ingredients': ['pasta', 'garlic', 'olive oil', 'chili flakes', 'parsley', 'salt', 'pepper'],
            'instructions': [
                'Boil pasta until al dente',
                'Slice garlic thinly',
                'Heat olive oil and fry garlic until golden',
                'Add chili flakes',
                'Toss in cooked pasta with some pasta water',
                'Garnish with parsley and serve'
            ],
            'preparation_time': 5, 'cooking_time': 15, 'servings': 2,
            'difficulty': 'easy', 'cuisine': 'Italian',
        },
        {
            'name': 'Dal Tadka',
            'description': 'Yellow lentil dal tempered with spices',
            'ingredients': ['toor dal', 'onion', 'tomato', 'garlic', 'cumin', 'turmeric', 'mustard seeds', 'ghee', 'green chili', 'coriander', 'salt'],
            'instructions': [
                'Wash and pressure cook dal with turmeric',
                'Heat ghee, add mustard seeds and cumin',
                'Add chopped onion and garlic, fry until golden',
                'Add tomatoes and green chilies',
                'Add cooked dal and mix well',
                'Simmer for 10 minutes, garnish with coriander'
            ],
            'preparation_time': 10, 'cooking_time': 25, 'servings': 4,
            'difficulty': 'easy', 'cuisine': 'Indian',
        },
        {
            'name': 'Grilled Cheese Sandwich',
            'description': 'Crispy grilled sandwich with melted cheese',
            'ingredients': ['bread', 'cheese', 'butter', 'tomato', 'onion'],
            'instructions': [
                'Butter one side of each bread slice',
                'Layer cheese, tomato, and onion slices',
                'Place another bread slice on top, butter side out',
                'Grill on a pan until golden and cheese melts',
                'Cut diagonally and serve hot'
            ],
            'preparation_time': 5, 'cooking_time': 5, 'servings': 1,
            'difficulty': 'easy', 'cuisine': 'American',
        },
        {
            'name': 'Aloo Gobi',
            'description': 'Dry potato and cauliflower curry with Indian spices',
            'ingredients': ['potato', 'cauliflower', 'onion', 'tomato', 'turmeric', 'cumin', 'coriander', 'garam masala', 'green chili', 'oil', 'salt'],
            'instructions': [
                'Cut potato and cauliflower into florets',
                'Heat oil, add cumin seeds',
                'Add onion and fry until translucent',
                'Add tomatoes, turmeric, and spices',
                'Add potato and cauliflower, mix well',
                'Cover and cook on low heat until tender',
                'Garnish with coriander and serve'
            ],
            'preparation_time': 10, 'cooking_time': 25, 'servings': 4,
            'difficulty': 'easy', 'cuisine': 'Indian',
        },
        {
            'name': 'Smoothie Bowl',
            'description': 'Healthy fruit smoothie bowl with toppings',
            'ingredients': ['banana', 'milk', 'yogurt', 'honey', 'berries', 'granola', 'chia seeds'],
            'instructions': [
                'Blend banana, milk, and yogurt until smooth',
                'Pour into a bowl',
                'Top with berries, granola, and chia seeds',
                'Drizzle with honey and serve immediately'
            ],
            'preparation_time': 5, 'cooking_time': 0, 'servings': 1,
            'difficulty': 'easy', 'cuisine': 'American',
        },
        {
            'name': 'Biryani',
            'description': 'Aromatic layered rice dish with spices',
            'ingredients': ['rice', 'chicken', 'onion', 'yogurt', 'garlic', 'ginger', 'biryani masala', 'saffron', 'milk', 'ghee', 'mint', 'coriander', 'salt'],
            'instructions': [
                'Soak rice for 30 minutes, parboil',
                'Marinate chicken with yogurt and spices',
                'Fry onions until crispy for garnish',
                'Cook marinated chicken until half done',
                'Layer rice and chicken in a heavy pot',
                'Add saffron milk, mint, and ghee',
                'Seal and cook on low heat (dum) for 25 minutes',
                'Garnish with fried onions and serve'
            ],
            'preparation_time': 30, 'cooking_time': 45, 'servings': 6,
            'difficulty': 'hard', 'cuisine': 'Indian',
        },
        {
            'name': 'Masala Dosa',
            'description': 'Crispy crepe filled with spiced potato filling',
            'ingredients': ['rice', 'urad dal', 'potato', 'onion', 'mustard seeds', 'turmeric', 'green chili', 'curry leaves', 'oil', 'salt'],
            'instructions': [
                'Soak rice and urad dal overnight, grind into batter',
                'Ferment batter for 8-10 hours',
                'Boil and mash potatoes with turmeric',
                'Temper mustard seeds, onion, and curry leaves',
                'Mix tempered ingredients with mashed potato',
                'Spread batter on hot griddle, drizzle oil',
                'Place potato filling and fold, serve with chutney'
            ],
            'preparation_time': 20, 'cooking_time': 10, 'servings': 2,
            'difficulty': 'medium', 'cuisine': 'Indian',
        },
        {
            'name': 'Chocolate Mug Cake',
            'description': 'Quick microwave chocolate cake in a mug',
            'ingredients': ['flour', 'sugar', 'cocoa powder', 'egg', 'milk', 'oil', 'vanilla'],
            'instructions': [
                'Mix flour, sugar, and cocoa powder in a mug',
                'Add egg, milk, oil, and vanilla',
                'Stir well until smooth',
                'Microwave for 1-2 minutes',
                'Let cool for a minute and enjoy'
            ],
            'preparation_time': 3, 'cooking_time': 2, 'servings': 1,
            'difficulty': 'easy', 'cuisine': 'American',
        },
    ]

    # Synonym mapping for flexible ingredient matching
    INGREDIENT_SYNONYMS = {
        'tomatoes': 'tomato', 'potatoes': 'potato', 'onions': 'onion',
        'eggs': 'egg', 'carrots': 'carrot', 'chilies': 'chili',
        'chillies': 'chili', 'chilli': 'chili', 'chilis': 'chili',
        'capsicum': 'bell pepper', 'curd': 'yogurt', 'dahi': 'yogurt',
        'atta': 'flour', 'maida': 'flour', 'chawal': 'rice',
        'aloo': 'potato', 'pyaz': 'onion', 'tamatar': 'tomato',
        'dhaniya': 'coriander', 'jeera': 'cumin', 'haldi': 'turmeric',
        'mirch': 'chili', 'adrak': 'ginger', 'lehsun': 'garlic',
        'basmati': 'rice', 'paneer cheese': 'paneer',
        'chicken breast': 'chicken', 'chicken thigh': 'chicken',
        'olive oil': 'oil', 'vegetable oil': 'oil', 'sunflower oil': 'oil',
        'coconut oil': 'oil', 'refined oil': 'oil',
    }

    def __init__(self):
        self.ai_repo = DjangoAIRepository()
        # Pull Gemini API key from environment variable for security
        self.api_key = os.environ.get("GEMINI_API_KEY", "DUMMY_KEY_FOR_LOCAL_DEV")
        genai.configure(api_key=self.api_key)
        # Use Gemma 4 31B model
        self.model = genai.GenerativeModel('gemma-4-31b-it')

    def _normalize_ingredient(self, ingredient: str) -> str:
        """Normalize ingredient name using synonyms."""
        ing = ingredient.strip().lower()
        return self.INGREDIENT_SYNONYMS.get(ing, ing)

    def _calculate_match_score(self, user_ingredients: set, recipe_ingredients: list) -> float:
        """Calculate how well user's ingredients match a recipe."""
        recipe_set = {self._normalize_ingredient(i) for i in recipe_ingredients}
        matches = user_ingredients.intersection(recipe_set)
        if not recipe_set:
            return 0.0
        return len(matches) / len(recipe_set)

    def recommend_recipes(self, user_id: int, ingredients: list) -> dict:
        """
        Generate recipe recommendations using Google Gemini AI.
        """
        try:
            # Create a prompt for Gemini to generate recipe recommendations
            ingredients_str = ", ".join(ingredients)
            prompt = f"""You are a professional chef and culinary expert. Based on the following ingredients: {ingredients_str}

Please generate 5 creative and delicious recipe recommendations. For each recipe, provide a JSON object with the following structure:
{{
    "name": "Recipe Name",
    "description": "Brief description of the dish",
    "ingredients": ["ingredient1", "ingredient2", ...],
    "instructions": ["step1", "step2", ...],
    "preparation_time": number_in_minutes,
    "cooking_time": number_in_minutes,
    "servings": number,
    "difficulty": "easy/medium/hard",
    "cuisine": "cuisine_type",
    "why_this_recipe": "Why this recipe works with your ingredients"
}}

Return ONLY a JSON array with 5 recipe objects, no additional text or markdown formatting. Start with [ and end with ].
"""
            
            # Call Gemini API
            response = self.model.generate_content(prompt)
            
            # Parse the response
            response_text = response.text.strip()
            
            # Extract JSON from the response (in case there's extra text)
            if response_text.startswith('['):
                json_str = response_text[:response_text.rfind(']')+1]
            else:
                json_str = response_text[response_text.find('['):response_text.rfind(']')+1]
            
            recommended_recipes = json.loads(json_str)
            
            # Ensure we have a list and limit to 5 recipes
            if not isinstance(recommended_recipes, list):
                recommended_recipes = [recommended_recipes]
            recommended_recipes = recommended_recipes[:5]
            
            # Save to database for future reference
            saved = self.ai_repo.save_query(user_id, ingredients, recommended_recipes)
            
            return {
                'id': saved['id'],
                'input_ingredients': ingredients,
                'recommended_recipes': recommended_recipes,
                'total_matches': len(recommended_recipes),
            }
        
        except Exception as e:
            # Fallback to the hardcoded recipe database if Gemini fails
            print(f"Gemini API Error: {str(e)}")
            # Normalize user ingredients
            normalized = {self._normalize_ingredient(i) for i in ingredients}

            # Score each recipe
            scored_recipes = []
            for recipe in self.RECIPE_DATABASE:
                score = self._calculate_match_score(normalized, recipe['ingredients'])
                if score >= 0.3:  # At least 30% match
                    recipe_data = {**recipe, 'match_score': round(score * 100, 1)}
                    scored_recipes.append(recipe_data)

            # Sort by match score (highest first)
            scored_recipes.sort(key=lambda r: r['match_score'], reverse=True)
            top_recipes = scored_recipes[:5]

            # Save to database for future reference
            saved = self.ai_repo.save_query(user_id, ingredients, top_recipes)

            return {
                'id': saved['id'],
                'input_ingredients': ingredients,
                'recommended_recipes': top_recipes,
                'total_matches': len(scored_recipes),
            }

    def get_history(self, user_id: int) -> List[dict]:
        return self.ai_repo.get_history(user_id)

    def get_popular_ingredients(self) -> List[dict]:
        return self.ai_repo.get_popular_ingredients()

    # ──────────── Few-Shot Examples for Conversational AI ─────────────────
    _FEW_SHOT_EXAMPLES = [
        {'role': 'user', 'parts': ["hi"]},
        {'role': 'model', 'parts': ["Hey! I am CookGPT. How can I help you today? You can ask me about cooking, recipes, nutrition, or anything food-related!"]},
        {'role': 'user', 'parts': ["what can you do?"]},
        {'role': 'model', 'parts': ["I'm your personal culinary assistant. I can suggest recipes based on your ingredients, provide step-by-step cooking guides, and offer nutritional advice. What's on your mind?"]},
    ]

    @staticmethod
    def _clean_response(text):
        """
        Aggressively strip any leaked internal reasoning/metadata.
        Handles the pattern where the model outputs reasoning, then
        writes the actual answer (sometimes duplicated).
        """
        import re
        if not text:
            return text

        # ── Pattern 1: Model puts the real answer in quotes, then repeats it ──
        # E.g.: * "Hello! ..." \n Hello! ...
        # Find the last substantial block that isn't metadata
        quoted_match = re.search(r'\*\s*"(.+?)"\s*\n+([\s\S]*)', text, re.DOTALL)
        if quoted_match:
            after_quote = quoted_match.group(2).strip()
            if after_quote and len(after_quote) > 10:
                return after_quote

        # ── Pattern 2: Strip all lines that look like reasoning/metadata ──
        lines = text.split('\n')
        junk_re = re.compile(
            r'^\s*[\*\-]?\s*('
            r'User (said|asks?|question|input|wants)|'
            r'Topic[:\s]|Role[:\s]|Persona[:\s]|Constraint|'
            r'Context[:\s]|Background[:\s]|'
            r'Expertise[:\s]|Goal[:\s]|Formatting[:\s]|'
            r'Rules?[:\s]|'
            r'My Role|This falls under|Output rule|'
            r'Greeting rule|Topic Constraint|'
            r'No internal|Follow output|No metadata|'
            r'descriptions? of actions?|'
            r'Reply directly|NEVER echo|NEVER write|'
            r'\d+\.\s+Only answer about cooking|'
            r'\d+\.\s+Off-topic:|'
            r'\d+\.\s+Reply DIRECTLY'
            r')',
            re.IGNORECASE
        )

        cleaned = []
        for line in lines:
            stripped = line.strip()
            # Skip junk lines
            if junk_re.search(stripped):
                continue
            # Skip lines that are just bullet points with short meta-descriptions
            if re.match(r'^\s*\*\s*(Warm|Friendly|Concise|Helpful|Professional|Enthusiastic)', stripped, re.IGNORECASE):
                continue
            # Skip lines like "* Offer assistance..." or "* Greet the user..."
            if re.match(r'^\s*\*\s*(Offer|Greet|Ask what|Provide)', stripped, re.IGNORECASE):
                continue
            cleaned.append(line)

        # Remove leading empty lines
        while cleaned and not cleaned[0].strip():
            cleaned.pop(0)

        result = '\n'.join(cleaned).strip()

        # ── Pattern 3: If result starts with a quoted version of itself ──
        # e.g. "Hey! What's up?" \n Hey! What's up?
        quote_dup = re.match(r'^"(.+?)"\s*\n+([\s\S]*)', result, re.DOTALL)
        if quote_dup:
            inner = quote_dup.group(1).strip()
            rest = quote_dup.group(2).strip()
            # If the rest starts with the same text, use the rest
            if rest.startswith(inner[:20]):
                return rest
            # Otherwise return the unquoted version
            return inner if len(inner) > len(rest) else rest

        # ── Pattern 4: Remove leading stray bullet ──
        result = re.sub(r'^[\*\-]\s+"?', '', result).strip()
        result = result.strip('"').strip()

        return result if result else text.strip()

    def _build_contents(self, message, conversation_history):
        """Build contents with few-shot examples + conversation history."""
        # Start with few-shot examples that teach the model correct behavior
        contents = list(self._FEW_SHOT_EXAMPLES)

        # Add conversation history
        for entry in conversation_history[-20:]:
            role = entry.get('role', 'user')
            text = entry.get('content', '')
            if role == 'user':
                contents.append({'role': 'user', 'parts': [text]})
            elif role == 'assistant':
                contents.append({'role': 'model', 'parts': [text]})

        # Add the current user message
        contents.append({'role': 'user', 'parts': [message]})
        return contents

    def _get_chat_model(self):
        """Create a GenerativeModel with a strict system instruction."""
        return genai.GenerativeModel(
            'gemini-1.5-flash', # Using a more stable model name
            system_instruction=(
                "You are CookGPT, a world-class professional chef and nutritional expert. "
                "YOUR CORE RULE: Respond DIRECTLY and ELEGANTLY. "
                "NEVER output internal reasoning, thought processes, persona descriptions, "
                "or formatting rules. NEVER start a response with bullet points or asterisks. "
                "If the user says 'hi' or greets you, respond with: 'Hey! I am CookGPT. "
                "How can I help you today? You can ask me about cooking, recipes, nutrition, "
                "or anything food-related!'"
            )
        )

    def chat_with_ai(self, user_id: int, message: str, conversation_history: list) -> dict:
        """Non-streaming chat — returns full response at once."""
        try:
            contents = self._build_contents(message, conversation_history)
            chat_model = self._get_chat_model()
            response = chat_model.generate_content(contents)
            ai_reply = self._clean_response(response.text)
            return {
                'success': True,
                'message': ai_reply,
                'role': 'assistant',
            }
        except Exception as e:
            print(f"CookGPT Chat Error: {str(e)}")
            return {
                'success': False,
                'message': "I'm having a little trouble right now. Please try again in a moment! 🍳",
                'role': 'assistant',
                'error': str(e),
            }

    def stream_chat(self, user_id: int, message: str, conversation_history: list):
        """
        Streaming chat generator — yields cleaned text chunks.
        Used by the SSE endpoint for real-time word-by-word display.
        """
        import re
        try:
            contents = self._build_contents(message, conversation_history)
            chat_model = self._get_chat_model()
            response = chat_model.generate_content(contents, stream=True)

            junk_re = re.compile(
                r'^\s*[\*\-]?\s*('
                r'The user (said|says?|asks?|is|wants)|'
                r'User (intent|input)[:\s]|'
                r'CookGPT \(culinary AI\)|CookGPT:|'
                r'Answer only about|Direct replies|No meta-commentary|No summaries|'
                r'I (need to|should|will) (maintain|acknowledge|offer|provide|keep)|'
                r'Previous interaction[:\s]|Personality[:\s]|Goal[:\s]|Option \d[:\s]|'
                r'Enthusiastic, knowledgeable|'
                r'Topic[:\s]|Role[:\s]|Persona[:\s]|Constraint|'
                r'Context[:\s]|Background[:\s]|'
                r'Expertise[:\s]|Formatting[:\s]|'
                r'Rules?[:\s]|'
                r'My Role|This falls under|Output rule|'
                r'Greeting (rule|should)|Topic Constraint|'
                r'No internal|Follow output|No metadata|'
                r'descriptions? of actions?|'
                r'Reply directly|NEVER echo|NEVER write|'
                r'\d+\.\s+Only answer about cooking|'
                r'\d+\.\s+Off-topic:|'
                r'\d+\.\s+Reply DIRECTLY|'
                r'Offer |Greet |Warm|Friendly|Concise|Helpful|'
                r'".*?"' # Matches quoted options if it tries to list them
                r')',
                re.IGNORECASE
            )

            buffer = ''
            started_real_content = False

            for chunk in response:
                if not chunk.text:
                    continue

                buffer += chunk.text

                # Process complete lines from the buffer
                while '\n' in buffer:
                    line, buffer = buffer.split('\n', 1)

                    # Skip or clean junk lines
                    if junk_re.search(line.strip()):
                        # Sometimes the AI appends the actual answer directly after the reasoning
                        split_line = re.split(r'\.(?=[A-Z][a-z])', line.strip(), 1)
                        if len(split_line) == 2 and len(split_line[1]) > 5:
                            line = split_line[1] # Keep the actual answer part
                        else:
                            continue
                    
                    # Skip empty lines before real content starts
                    if not started_real_content and not line.strip():
                        continue
                        
                    # Skip quoted duplicates like * "Hello!"
                    if re.match(r'^\s*\*?\s*".*"$', line.strip()):
                        continue

                    started_real_content = True
                    yield line + '\n'

            # Yield remaining buffer
            if buffer.strip():
                if not junk_re.search(buffer.strip()):
                    clean = buffer.strip().strip('"').strip()
                    if clean:
                        yield clean

        except Exception as e:
            print(f"CookGPT Stream Error: {str(e)}")
            yield "I'm having a little trouble right now. Please try again in a moment! 🍳"


# ──────────────────────── Analytics Service ─────────────────────────────────

class AnalyticsService(IAnalyticsService):
    def __init__(self):
        self.analytics_repo = DjangoAnalyticsRepository()

    def get_dashboard(self) -> dict:
        cache_key = 'dashboard_stats'
        cached = cache.get(cache_key)
        if cached:
            return cached
        stats = self.analytics_repo.get_dashboard_stats()
        cache.set(cache_key, stats, timeout=60)
        return stats

    def get_sales_report(self, start_date, end_date) -> dict:
        daily_sales = self.analytics_repo.get_daily_sales(start_date, end_date)
        popular_items = self.analytics_repo.get_popular_items()
        total_revenue = sum(d['total_revenue'] for d in daily_sales)
        total_orders = sum(d['total_orders'] for d in daily_sales)
        return {
            'daily_sales': daily_sales,
            'popular_items': popular_items,
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'period': f"{start_date} to {end_date}",
        }

    def get_popular_items(self, limit=10) -> List[dict]:
        return self.analytics_repo.get_popular_items(limit)

    def get_active_timers(self) -> List[dict]:
        return self.analytics_repo.get_active_timers()

    def update_timer(self, timer_id: int, status: str):
        return self.analytics_repo.update_timer_status(timer_id, status)

    def get_predictions(self, target_date=None) -> List[dict]:
        return self.analytics_repo.get_predictions(target_date)
