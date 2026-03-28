import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cookgpt.settings')
django.setup()

from infrastructure.models import Category, MenuItem

def seed_database():
    print("Clearing existing menu data to populate world menu...")
    MenuItem.objects.all().delete()
    Category.objects.all().delete()

    categories_data = [
        {"name": "Indian Cuisine", "description": "Authentic and spicy Indian delicacies."},
        {"name": "Italian Classics", "description": "Traditional pizzas, pastas, and breads."},
        {"name": "Japanese Sushi & Maki", "description": "Fresh seafood, rolls, and Japanese staples."},
        {"name": "Mexican Taqueria", "description": "Tacos, burritos, and vibrant flavors."},
        {"name": "American Comfort", "description": "Classic burgers, fries, and BBQ."},
        {"name": "Middle Eastern Delights", "description": "Shawarma, hummus, and Mediterranean grills."},
        {"name": "Thai & Southeast Asian", "description": "Sweet, spicy, and sour curries and noodles."},
        {"name": "Desserts & Bakery", "description": "Cakes, pastries, and sweet endings."},
        {"name": "Beverages", "description": "Refreshing drinks, shakes, and mocktails."}
    ]

    print("Creating Categories...")
    category_objs = {}
    for cat_data in categories_data:
        cat, created = Category.objects.get_or_create(name=cat_data["name"], defaults={"description": cat_data["description"]})
        category_objs[cat_data["name"]] = cat

    items_data = [
        # Indian
        {"category": "Indian Cuisine", "name": "Butter Chicken", "description": "Tender chicken cooked in a rich, creamy tomato-based gravy.", "price": 350.00, "is_vegetarian": False, "preparation_time": 30, "calories": 550},
        {"category": "Indian Cuisine", "name": "Paneer Tikka Masala", "description": "Grilled cottage cheese cubes in a spiced tomato gravy.", "price": 280.00, "is_vegetarian": True, "preparation_time": 25, "calories": 400},
        {"category": "Indian Cuisine", "name": "Hyderabadi Chicken Biryani", "description": "Aromatic basmati rice layered with marinated chicken and spices.", "price": 400.00, "is_vegetarian": False, "preparation_time": 45, "calories": 650},
        {"category": "Indian Cuisine", "name": "Garlic Naan", "description": "Soft flatbread baked in a tandoor, topped with garlic and butter.", "price": 60.00, "is_vegetarian": True, "preparation_time": 10, "calories": 180},
        {"category": "Indian Cuisine", "name": "Masala Dosa", "description": "Crispy rice crepe filled with spiced potato mash, served with chutney and sambar.", "price": 150.00, "is_vegetarian": True, "preparation_time": 15, "calories": 320},

        # Italian
        {"category": "Italian Classics", "name": "Margherita Pizza", "description": "Classic pizza with San Marzano tomatoes, fresh mozzarella, and basil.", "price": 450.00, "is_vegetarian": True, "preparation_time": 20, "calories": 800},
        {"category": "Italian Classics", "name": "Spaghetti Carbonara", "description": "Pasta tossed with egg, pecorino romano, guanciale, and black pepper.", "price": 550.00, "is_vegetarian": False, "preparation_time": 25, "calories": 750},
        {"category": "Italian Classics", "name": "Lasagna Bolognese", "description": "Layers of pasta, rich meat sauce, and creamy béchamel, baked to perfection.", "price": 600.00, "is_vegetarian": False, "preparation_time": 40, "calories": 850},
        {"category": "Italian Classics", "name": "Mushroom Risotto", "description": "Creamy Arborio rice cooked with wild mushrooms and parmesan cheese.", "price": 480.00, "is_vegetarian": True, "preparation_time": 30, "calories": 600},

        # Japanese
        {"category": "Japanese Sushi & Maki", "name": "Salmon Nigiri", "description": "Fresh slices of raw salmon served over vinegared rice.", "price": 300.00, "is_vegetarian": False, "preparation_time": 15, "calories": 200},
        {"category": "Japanese Sushi & Maki", "name": "Spicy Tuna Roll", "description": "Sushi roll filled with fresh tuna and spicy mayo.", "price": 350.00, "is_vegetarian": False, "preparation_time": 20, "calories": 300},
        {"category": "Japanese Sushi & Maki", "name": "Chicken Teriyaki Bento", "description": "Grilled chicken glazed in sweet teriyaki sauce, served with rice and salad.", "price": 500.00, "is_vegetarian": False, "preparation_time": 25, "calories": 600},
        {"category": "Japanese Sushi & Maki", "name": "Vegetable Tempura Udon", "description": "Thick wheat noodles in a savory broth with crispy vegetable tempura.", "price": 450.00, "is_vegetarian": True, "preparation_time": 30, "calories": 500},

        # Mexican
        {"category": "Mexican Taqueria", "name": "Beef Tacos (3 pcs)", "description": "Soft corn tortillas filled with seasoned beef, onions, cilantro, and salsa.", "price": 250.00, "is_vegetarian": False, "preparation_time": 15, "calories": 450},
        {"category": "Mexican Taqueria", "name": "Chicken Fajita Burrito", "description": "Large flour tortilla stuffed with grilled chicken, peppers, onions, rice, and beans.", "price": 380.00, "is_vegetarian": False, "preparation_time": 20, "calories": 700},
        {"category": "Mexican Taqueria", "name": "Vegetarian Nachos Supreme", "description": "Crispy tortilla chips topped with melted cheese, jalapeños, black beans, guacamole, and sour cream.", "price": 320.00, "is_vegetarian": True, "preparation_time": 15, "calories": 850},
        {"category": "Mexican Taqueria", "name": "Classic Quesadilla", "description": "Grilled flour tortilla filled with a blend of Mexican cheeses, served with pico de gallo.", "price": 280.00, "is_vegetarian": True, "preparation_time": 15, "calories": 550},

        # American
        {"category": "American Comfort", "name": "Classic Cheeseburger", "description": "Juicy beef patty topped with melted cheddar cheese, lettuce, tomato, and pickles on a toasted bun.", "price": 350.00, "is_vegetarian": False, "preparation_time": 20, "calories": 800},
        {"category": "American Comfort", "name": "BBQ Pork Ribs", "description": "Slow-cooked pork ribs smothered in a tangy BBQ sauce, served with coleslaw.", "price": 650.00, "is_vegetarian": False, "preparation_time": 45, "calories": 950},
        {"category": "American Comfort", "name": "Macaroni and Cheese", "description": "Elbow macaroni baked in a creamy, cheesy sauce, topped with breadcrumbs.", "price": 300.00, "is_vegetarian": True, "preparation_time": 25, "calories": 600},
        {"category": "American Comfort", "name": "Buffalo Wings (6 pcs)", "description": "Crispy chicken wings tossed in a spicy buffalo sauce, served with blue cheese dressing.", "price": 320.00, "is_vegetarian": False, "preparation_time": 20, "calories": 500},

        # Middle Eastern
        {"category": "Middle Eastern Delights", "name": "Chicken Shawarma Wrap", "description": "Thinly sliced marinated chicken wrapped in flatbread with garlic sauce and pickles.", "price": 280.00, "is_vegetarian": False, "preparation_time": 15, "calories": 550},
        {"category": "Middle Eastern Delights", "name": "Hummus & Pita", "description": "Creamy chickpea dip blended with tahini, olive oil, and lemon juice, served with warm pita bread.", "price": 200.00, "is_vegetarian": True, "preparation_time": 10, "calories": 350},
        {"category": "Middle Eastern Delights", "name": "Lamb Kabob Platter", "description": "Grilled skewered lamb served with saffron rice and grilled vegetables.", "price": 550.00, "is_vegetarian": False, "preparation_time": 30, "calories": 700},
        {"category": "Middle Eastern Delights", "name": "Falafel Plate (5 pcs)", "description": "Deep-fried balls made from ground chickpeas and herbs, served with tahini sauce.", "price": 250.00, "is_vegetarian": True, "preparation_time": 20, "calories": 400},

        # Thai
        {"category": "Thai & Southeast Asian", "name": "Pad Thai Noodles", "description": "Stir-fried rice noodles with tofu, egg, peanuts, and bean sprouts in a tangy tamarind sauce.", "price": 380.00, "is_vegetarian": True, "preparation_time": 20, "calories": 550},
        {"category": "Thai & Southeast Asian", "name": "Green Curry Chicken", "description": "Spicy green coconut curry with chicken, bamboo shoots, and Thai basil, served with jasmine rice.", "price": 450.00, "is_vegetarian": False, "preparation_time": 25, "calories": 600},
        {"category": "Thai & Southeast Asian", "name": "Tom Yum Soup", "description": "Hot and sour aromatic broth with shrimp, mushrooms, lemongrass, and galangal.", "price": 350.00, "is_vegetarian": False, "preparation_time": 20, "calories": 250},
        {"category": "Thai & Southeast Asian", "name": "Mango Sticky Rice", "description": "Sweet glutinous rice topped with fresh mango slices and coconut milk.", "price": 250.00, "is_vegetarian": True, "preparation_time": 10, "calories": 400},

        # Desserts
        {"category": "Desserts & Bakery", "name": "Tiramisu", "description": "Layered Italian dessert made with coffee-soaked ladyfingers and mascarpone cheese.", "price": 300.00, "is_vegetarian": True, "preparation_time": 10, "calories": 450},
        {"category": "Desserts & Bakery", "name": "Chocolate Lava Cake", "description": "Warm chocolate cake with a gooey, molten center, served with vanilla ice cream.", "price": 350.00, "is_vegetarian": True, "preparation_time": 15, "calories": 600},
        {"category": "Desserts & Bakery", "name": "New York Cheesecake", "description": "Classic baked cheesecake with a graham cracker crust and a rich, creamy filling.", "price": 320.00, "is_vegetarian": True, "preparation_time": 10, "calories": 550},

        # Beverages
        {"category": "Beverages", "name": "Mango Lassi", "description": "Refreshing yogurt-based drink blended with sweet mango pulp.", "price": 120.00, "is_vegetarian": True, "preparation_time": 5, "calories": 200},
        {"category": "Beverages", "name": "Iced Matcha Latte", "description": "Chilled green tea matcha mixed with milk and sweetened lightly.", "price": 180.00, "is_vegetarian": True, "preparation_time": 5, "calories": 150},
        {"category": "Beverages", "name": "Virgin Mojito", "description": "Classic mocktail with fresh mint, lime juice, simple syrup, and club soda.", "price": 150.00, "is_vegetarian": True, "preparation_time": 5, "calories": 100},
        {"category": "Beverages", "name": "Espresso", "description": "Strong, concentrated shot of pure Italian coffee.", "price": 100.00, "is_vegetarian": True, "preparation_time": 5, "calories": 5}
    ]

    print(f"Inserting {len(items_data)} World Food Items...")
    for item in items_data:
        MenuItem.objects.create(
            category=category_objs[item["category"]],
            name=item["name"],
            description=item["description"],
            price=item["price"],
            is_vegetarian=item["is_vegetarian"],
            preparation_time=item["preparation_time"],
            calories=item["calories"]
        )

    print("Successfully populated the CookGPT menu database with a vast array of global cuisines!")

if __name__ == '__main__':
    seed_database()
