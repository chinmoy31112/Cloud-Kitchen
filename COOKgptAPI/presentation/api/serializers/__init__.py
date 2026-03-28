"""
Presentation Layer: DRF Serializers
Request/response validation for all API endpoints.
"""
from rest_framework import serializers


# ──────────────────────── Auth Serializers ─────────────────────────────────

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=6, write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, default='')
    last_name = serializers.CharField(max_length=150, required=False, default='')
    phone = serializers.CharField(max_length=15, required=False, default='')
    role = serializers.ChoiceField(
        choices=['customer', 'kitchen_admin', 'delivery_agent'],
        default='customer',
    )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=6, write_only=True)


# ──────────────────────── User Serializers ─────────────────────────────────

class UserProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    username = serializers.CharField(read_only=True)
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    phone = serializers.CharField(max_length=15, required=False)
    role = serializers.CharField(read_only=True)
    profile_image = serializers.CharField(read_only=True, allow_null=True)


class AddressSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    label = serializers.CharField(max_length=50, default='Home')
    street = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=10)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    is_default = serializers.BooleanField(default=False)


# ──────────────────────── Menu Serializers ─────────────────────────────────

class CategorySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, default='')
    image = serializers.CharField(read_only=True, allow_null=True)
    is_active = serializers.BooleanField(read_only=True)


class MenuItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, default='')
    price = serializers.FloatField()
    category_id = serializers.IntegerField(required=False, allow_null=True)
    category_name = serializers.CharField(read_only=True)
    image = serializers.CharField(read_only=True, allow_null=True)
    is_available = serializers.BooleanField(default=True)
    is_vegetarian = serializers.BooleanField(default=False)
    preparation_time = serializers.IntegerField(default=15)
    calories = serializers.IntegerField(required=False, allow_null=True)
    rating = serializers.FloatField(read_only=True)
    total_ratings = serializers.IntegerField(read_only=True)


class MenuItemUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(required=False)
    price = serializers.FloatField(required=False)
    category_id = serializers.IntegerField(required=False, allow_null=True)
    is_available = serializers.BooleanField(required=False)
    is_vegetarian = serializers.BooleanField(required=False)
    preparation_time = serializers.IntegerField(required=False)
    calories = serializers.IntegerField(required=False, allow_null=True)


class MenuItemImageSerializer(serializers.Serializer):
    image = serializers.ImageField()


# ──────────────────────── Order Serializers ────────────────────────────────

class OrderItemInputSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    special_instructions = serializers.CharField(required=False, default='')


class CreateOrderSerializer(serializers.Serializer):
    delivery_address_id = serializers.IntegerField()
    items = OrderItemInputSerializer(many=True)
    special_instructions = serializers.CharField(required=False, default='')
    payment_method = serializers.ChoiceField(
        choices=['cash_on_delivery', 'upi', 'online'],
        default='cash_on_delivery',
    )


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['pending', 'accepted', 'preparing', 'ready',
                 'out_for_delivery', 'delivered', 'cancelled']
    )
    estimated_delivery_time = serializers.IntegerField(required=False, allow_null=True)


class OrderItemResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    menu_item_id = serializers.IntegerField()
    menu_item_name = serializers.CharField()
    quantity = serializers.IntegerField()
    unit_price = serializers.FloatField()
    total_price = serializers.FloatField()
    special_instructions = serializers.CharField()


class OrderResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order_number = serializers.CharField()
    user_name = serializers.CharField()
    delivery_address = serializers.CharField()
    status = serializers.CharField()
    subtotal = serializers.FloatField()
    discount = serializers.FloatField()
    delivery_charge = serializers.FloatField()
    tax = serializers.FloatField()
    total = serializers.FloatField()
    items = serializers.ListField()
    special_instructions = serializers.CharField()
    estimated_delivery_time = serializers.IntegerField(allow_null=True)
    created_at = serializers.DateTimeField()


# ──────────────────────── Cart Serializers ─────────────────────────────────

class AddToCartSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)


class CartItemResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    menu_item_id = serializers.IntegerField()
    menu_item_name = serializers.CharField()
    menu_item_price = serializers.FloatField()
    quantity = serializers.IntegerField()
    total_price = serializers.FloatField()


class CartResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    items = CartItemResponseSerializer(many=True)
    subtotal = serializers.FloatField()
    discount = serializers.FloatField()
    total = serializers.FloatField()
    item_count = serializers.IntegerField()


# ──────────────────────── Payment Serializers ──────────────────────────────

class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    method = serializers.ChoiceField(
        choices=['cash_on_delivery', 'upi', 'online'],
        default='cash_on_delivery',
    )
    transaction_id = serializers.CharField(required=False, default='')


class PaymentStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['pending', 'success', 'failed', 'refunded']
    )


class PaymentResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order_id = serializers.IntegerField()
    amount = serializers.FloatField()
    method = serializers.CharField()
    status = serializers.CharField()
    transaction_id = serializers.CharField()
    created_at = serializers.DateTimeField()


# ──────────────────────── Delivery Serializers ─────────────────────────────

class AssignDeliverySerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    agent_id = serializers.IntegerField()
    estimated_time = serializers.IntegerField(required=False, allow_null=True)


class DeliveryStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['assigned', 'picked', 'in_transit', 'delivered', 'failed']
    )
    current_latitude = serializers.FloatField(required=False, allow_null=True)
    current_longitude = serializers.FloatField(required=False, allow_null=True)
    delivery_notes = serializers.CharField(required=False, default='')


class DeliveryLocationSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class DeliveryResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order_id = serializers.IntegerField()
    agent_id = serializers.IntegerField()
    agent_name = serializers.CharField()
    status = serializers.CharField()
    pickup_time = serializers.DateTimeField(allow_null=True)
    delivery_time = serializers.DateTimeField(allow_null=True)
    current_latitude = serializers.FloatField(allow_null=True)
    current_longitude = serializers.FloatField(allow_null=True)
    estimated_time = serializers.IntegerField(allow_null=True)
    distance = serializers.FloatField(allow_null=True)
    created_at = serializers.DateTimeField()


# ──────────────────────── AI Serializers ───────────────────────────────────

class AIQuerySerializer(serializers.Serializer):
    ingredients = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1,
        help_text="List of ingredients available at home"
    )


class RecipeSerializer(serializers.Serializer):
    name = serializers.CharField()
    description = serializers.CharField()
    ingredients = serializers.ListField(child=serializers.CharField())
    instructions = serializers.ListField(child=serializers.CharField())
    preparation_time = serializers.IntegerField()
    cooking_time = serializers.IntegerField()
    servings = serializers.IntegerField()
    difficulty = serializers.CharField()
    cuisine = serializers.CharField()
    match_score = serializers.FloatField()


class AIRecommendationResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    input_ingredients = serializers.ListField(child=serializers.CharField())
    recommended_recipes = serializers.ListField()
    total_matches = serializers.IntegerField()


class AIHistorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    input_ingredients = serializers.ListField(child=serializers.CharField())
    recommended_recipes = serializers.ListField()
    created_at = serializers.DateTimeField()


# ──────────────────────── Analytics Serializers ────────────────────────────

class DashboardSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_revenue = serializers.FloatField()
    total_customers = serializers.IntegerField()
    total_menu_items = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    delivered_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()
    average_order_value = serializers.FloatField()


class SalesReportQuerySerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()


class KitchenTimerSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    order_number = serializers.CharField(read_only=True)
    menu_item_name = serializers.CharField()
    estimated_time = serializers.IntegerField()
    status = serializers.CharField()
    started_at = serializers.DateTimeField(allow_null=True, read_only=True)


class TimerStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['pending', 'in_progress', 'completed']
    )
