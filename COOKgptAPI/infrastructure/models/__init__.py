"""
Infrastructure Django ORM Models
All database models for the CookGPT Cloud Kitchen System.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


# ─── User Models ─────────────────────────────────────────────────────────

class CustomUser(AbstractUser):
    """Custom user model with role-based access."""

    class Role(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        KITCHEN_ADMIN = 'kitchen_admin', 'Kitchen Admin'
        DELIVERY_AGENT = 'delivery_agent', 'Delivery Agent'

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, default='')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.email} ({self.role})"


class Address(models.Model):
    """User address for delivery."""

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50, default='Home')
    street = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'addresses'

    def __str__(self):
        return f"{self.label}: {self.street}, {self.city}"


# ─── Menu Models ─────────────────────────────────────────────────────────

class Category(models.Model):
    """Food category."""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='category_images/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """Food menu item."""

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                 null=True, related_name='items')
    image = models.ImageField(upload_to='menu_images/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_vegetarian = models.BooleanField(default=False)
    preparation_time = models.PositiveIntegerField(default=15, help_text='Time in minutes')
    calories = models.PositiveIntegerField(null=True, blank=True)
    rating = models.FloatField(default=0.0)
    total_ratings = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'menu_items'

    def __str__(self):
        return f"{self.name} - ₹{self.price}"


# ─── Cart Models ─────────────────────────────────────────────────────────

class Cart(models.Model):
    """Shopping cart for a user."""

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'carts'

    def __str__(self):
        return f"Cart - {self.user.email}"


class CartItem(models.Model):
    """Individual item in a cart."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cart_items'
        unique_together = ('cart', 'menu_item')

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"

    @property
    def total_price(self):
        return self.menu_item.price * self.quantity


# ─── Order Models ────────────────────────────────────────────────────────

class Order(models.Model):
    """Customer order."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        PREPARING = 'preparing', 'Preparing'
        READY = 'ready', 'Ready'
        OUT_FOR_DELIVERY = 'out_for_delivery', 'Out for Delivery'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    order_number = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='orders')
    delivery_address = models.ForeignKey(Address, on_delete=models.SET_NULL,
                                         null=True, related_name='orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    special_instructions = models.TextField(blank=True, default='')
    estimated_delivery_time = models.PositiveIntegerField(null=True, blank=True,
                                                          help_text='Estimated time in minutes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"CG-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number} - {self.status}"


class OrderItem(models.Model):
    """Individual item in an order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    menu_item_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    special_instructions = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.menu_item_name} x {self.quantity}"


# ─── Payment Models ─────────────────────────────────────────────────────

class Payment(models.Model):
    """Payment for an order."""

    class Method(models.TextChoices):
        CASH_ON_DELIVERY = 'cash_on_delivery', 'Cash on Delivery'
        UPI = 'upi', 'UPI'
        ONLINE = 'online', 'Online Payment'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices,
                              default=Method.CASH_ON_DELIVERY)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    transaction_id = models.CharField(max_length=100, blank=True, default='')
    payment_gateway_response = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"Payment {self.id} - {self.method} - {self.status}"


# ─── Delivery Models ────────────────────────────────────────────────────

class Delivery(models.Model):
    """Delivery tracking for an order."""

    class Status(models.TextChoices):
        ASSIGNED = 'assigned', 'Assigned'
        PICKED = 'picked', 'Picked Up'
        IN_TRANSIT = 'in_transit', 'In Transit'
        DELIVERED = 'delivered', 'Delivered'
        FAILED = 'failed', 'Failed'

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    agent = models.ForeignKey(CustomUser, on_delete=models.SET_NULL,
                              null=True, related_name='deliveries',
                              limit_choices_to={'role': 'delivery_agent'})
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ASSIGNED)
    pickup_time = models.DateTimeField(null=True, blank=True)
    delivery_time = models.DateTimeField(null=True, blank=True)
    current_latitude = models.FloatField(null=True, blank=True)
    current_longitude = models.FloatField(null=True, blank=True)
    estimated_time = models.PositiveIntegerField(null=True, blank=True,
                                                 help_text='Estimated minutes')
    distance = models.FloatField(null=True, blank=True, help_text='Distance in km')
    delivery_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deliveries'
        verbose_name_plural = 'Deliveries'

    def __str__(self):
        return f"Delivery for {self.order.order_number} - {self.status}"


# ─── AI Recommendation Models ───────────────────────────────────────────

class AIRecommendation(models.Model):
    """Stores AI recipe recommendation queries and results."""

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE,
                             related_name='ai_recommendations')
    input_ingredients = models.JSONField(default=list)
    recommended_recipes = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_recommendations'
        ordering = ['-created_at']

    def __str__(self):
        return f"AI Query by {self.user.email} - {self.created_at}"


# ─── Analytics / Kitchen Timer Models ────────────────────────────────────

class KitchenTimer(models.Model):
    """Kitchen Display System timer for tracking preparation."""

    class TimerStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='timers')
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE,
                                   related_name='timer', null=True)
    menu_item_name = models.CharField(max_length=200)
    estimated_time = models.PositiveIntegerField(help_text='Estimated minutes')
    actual_time = models.PositiveIntegerField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=TimerStatus.choices,
                              default=TimerStatus.PENDING)

    class Meta:
        db_table = 'kitchen_timers'

    def __str__(self):
        return f"Timer: {self.menu_item_name} - {self.status}"


class DemandPrediction(models.Model):
    """AI-based demand prediction for menu items."""

    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE,
                                  related_name='predictions')
    predicted_date = models.DateField()
    predicted_quantity = models.PositiveIntegerField()
    actual_quantity = models.PositiveIntegerField(null=True, blank=True)
    confidence = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'demand_predictions'

    def __str__(self):
        return f"Prediction: {self.menu_item.name} on {self.predicted_date}"
