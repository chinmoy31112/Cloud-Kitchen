"""
Presentation Layer: API URL Routing
Organized by module with versioned API prefix.
"""
from django.urls import path
from presentation.api.views import (
    # Auth
    register, login, logout, refresh_token,
    # User
    user_profile, change_password, addresses, address_detail, list_users,
    # Menu
    menu_items_list, menu_item_create, menu_item_detail, menu_item_upload_image,
    categories, category_delete,
    # Order
    create_order, my_orders, all_orders, order_detail, update_order_status,
    # Cart
    get_cart, add_to_cart, update_cart_item, remove_from_cart, clear_cart,
    # Payment
    create_payment, payment_detail, payment_by_order, update_payment_status,
    # Delivery
    assign_delivery, delivery_detail, update_delivery_status,
    update_delivery_location, track_delivery, my_deliveries,
    # AI
    ai_recommend, ai_history, ai_popular_ingredients,
    # Dashboard
    dashboard_stats, sales_report, popular_items,
    kitchen_timers, update_kitchen_timer, demand_predictions,
)


# ─── Authentication URLs ─────────────────────────────────────────────────
auth_urlpatterns = [
    path('register/', register, name='auth-register'),
    path('login/', login, name='auth-login'),
    path('logout/', logout, name='auth-logout'),
    path('refresh/', refresh_token, name='auth-refresh'),
]

# ─── User URLs ────────────────────────────────────────────────────────────
user_urlpatterns = [
    path('profile/', user_profile, name='user-profile'),
    path('change-password/', change_password, name='user-change-password'),
    path('addresses/', addresses, name='user-addresses'),
    path('addresses/<int:address_id>/', address_detail, name='user-address-detail'),
    path('list/', list_users, name='user-list'),
]

# ─── Menu URLs ────────────────────────────────────────────────────────────
menu_urlpatterns = [
    path('items/', menu_items_list, name='menu-items-list'),
    path('items/create/', menu_item_create, name='menu-item-create'),
    path('items/<int:item_id>/', menu_item_detail, name='menu-item-detail'),
    path('items/<int:item_id>/upload-image/', menu_item_upload_image, name='menu-item-upload-image'),
    path('categories/', categories, name='menu-categories'),
    path('categories/<int:category_id>/', category_delete, name='menu-category-delete'),
]

# ─── Order URLs ───────────────────────────────────────────────────────────
order_urlpatterns = [
    path('create/', create_order, name='order-create'),
    path('my-orders/', my_orders, name='order-my-orders'),
    path('all/', all_orders, name='order-all'),
    path('<int:order_id>/', order_detail, name='order-detail'),
    path('<int:order_id>/status/', update_order_status, name='order-update-status'),
]

# ─── Cart URLs ────────────────────────────────────────────────────────────
cart_urlpatterns = [
    path('', get_cart, name='cart-get'),
    path('add/', add_to_cart, name='cart-add'),
    path('items/<int:item_id>/', update_cart_item, name='cart-update-item'),
    path('items/<int:item_id>/remove/', remove_from_cart, name='cart-remove-item'),
    path('clear/', clear_cart, name='cart-clear'),
]

# ─── Payment URLs ─────────────────────────────────────────────────────────
payment_urlpatterns = [
    path('create/', create_payment, name='payment-create'),
    path('<int:payment_id>/', payment_detail, name='payment-detail'),
    path('order/<int:order_id>/', payment_by_order, name='payment-by-order'),
    path('<int:payment_id>/status/', update_payment_status, name='payment-update-status'),
]

# ─── Delivery URLs ────────────────────────────────────────────────────────
delivery_urlpatterns = [
    path('assign/', assign_delivery, name='delivery-assign'),
    path('<int:delivery_id>/', delivery_detail, name='delivery-detail'),
    path('<int:delivery_id>/status/', update_delivery_status, name='delivery-update-status'),
    path('<int:delivery_id>/location/', update_delivery_location, name='delivery-update-location'),
    path('track/<int:order_id>/', track_delivery, name='delivery-track'),
    path('my-deliveries/', my_deliveries, name='delivery-my-deliveries'),
]

# ─── AI Bot URLs ──────────────────────────────────────────────────────────
ai_urlpatterns = [
    path('recommend/', ai_recommend, name='ai-recommend'),
    path('history/', ai_history, name='ai-history'),
    path('popular-ingredients/', ai_popular_ingredients, name='ai-popular-ingredients'),
]

# ─── Dashboard / Analytics URLs ──────────────────────────────────────────
dashboard_urlpatterns = [
    path('stats/', dashboard_stats, name='dashboard-stats'),
    path('sales-report/', sales_report, name='dashboard-sales-report'),
    path('popular-items/', popular_items, name='dashboard-popular-items'),
    path('kitchen-timers/', kitchen_timers, name='dashboard-kitchen-timers'),
    path('kitchen-timers/<int:timer_id>/', update_kitchen_timer, name='dashboard-update-timer'),
    path('demand-predictions/', demand_predictions, name='dashboard-demand-predictions'),
]
