"""
Presentation Layer: API Views (Controllers)
All REST API endpoint handlers for the CookGPT Cloud Kitchen System.
"""
from datetime import datetime
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from application.services import (
    AuthService, UserService, MenuService, OrderService,
    CartService, PaymentService, DeliveryService, AIService, AnalyticsService,
)
from presentation.api.serializers import (
    RegisterSerializer, LoginSerializer, ChangePasswordSerializer,
    UserProfileSerializer, AddressSerializer,
    CategorySerializer, MenuItemSerializer, MenuItemUpdateSerializer, MenuItemImageSerializer,
    CreateOrderSerializer, OrderStatusUpdateSerializer, OrderResponseSerializer,
    AddToCartSerializer, UpdateCartItemSerializer, CartResponseSerializer,
    CreatePaymentSerializer, PaymentStatusSerializer, PaymentResponseSerializer,
    AssignDeliverySerializer, DeliveryStatusUpdateSerializer, DeliveryLocationSerializer,
    DeliveryResponseSerializer,
    AIQuerySerializer, AIRecommendationResponseSerializer, AIHistorySerializer,
    DashboardSerializer, SalesReportQuerySerializer, KitchenTimerSerializer, TimerStatusSerializer,
)
from presentation.api.permissions import (
    IsCustomer, IsKitchenAdmin, IsDeliveryAgent,
    IsKitchenAdminOrReadOnly, IsAdminOrDeliveryAgent,
)


# ════════════════════════════════════════════════════════════════════════════
# AUTH CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='post', request_body=RegisterSerializer,
                     operation_description="Register a new user (Customer/Kitchen Admin/Delivery Agent)",
                     tags=['Authentication'])
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        auth_service = AuthService()
        user = auth_service.register(serializer.validated_data)
        # Generate JWT tokens
        from infrastructure.models import CustomUser
        user_obj = CustomUser.objects.get(id=user['id'])
        refresh = RefreshToken.for_user(user_obj)
        response = Response({
            'success': True,
            'message': 'Registration successful',
            'data': {
                'user': user,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }
        }, status=status.HTTP_201_CREATED)
        # Set cookies
        response.set_cookie('access_token', str(refresh.access_token),
                            httponly=True, samesite='Lax', max_age=86400)
        response.set_cookie('refresh_token', str(refresh),
                            httponly=True, samesite='Lax', max_age=604800)
        return response
    except ValueError as e:
        return Response({'success': False, 'message': str(e)},
                        status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=LoginSerializer,
                     operation_description="Login with email and password. Returns JWT tokens.",
                     tags=['Authentication'])
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login and get JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    auth_service = AuthService()
    user = auth_service.login(
        serializer.validated_data['email'],
        serializer.validated_data['password'],
    )
    if user:
        from infrastructure.models import CustomUser
        user_obj = CustomUser.objects.get(id=user['id'])
        refresh = RefreshToken.for_user(user_obj)
        response = Response({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }
        })
        response.set_cookie('access_token', str(refresh.access_token),
                            httponly=True, samesite='Lax', max_age=86400)
        response.set_cookie('refresh_token', str(refresh),
                            httponly=True, samesite='Lax', max_age=604800)
        return response
    return Response({'success': False, 'message': 'Invalid email or password'},
                    status=status.HTTP_401_UNAUTHORIZED)


@swagger_auto_schema(method='post',
                     operation_description="Logout and clear auth cookies",
                     tags=['Authentication'])
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout - clear cookies."""
    response = Response({'success': True, 'message': 'Logged out successfully'})
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response


@swagger_auto_schema(method='post',
                     request_body=openapi.Schema(
                         type=openapi.TYPE_OBJECT,
                         properties={'refresh': openapi.Schema(type=openapi.TYPE_STRING)},
                         required=['refresh']
                     ),
                     operation_description="Refresh JWT access token",
                     tags=['Authentication'])
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh access token using refresh token."""
    refresh = request.data.get('refresh') or request.COOKIES.get('refresh_token')
    if not refresh:
        return Response({'success': False, 'message': 'Refresh token required'},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh)
        response = Response({
            'success': True,
            'data': {'access': str(token.access_token)}
        })
        response.set_cookie('access_token', str(token.access_token),
                            httponly=True, samesite='Lax', max_age=86400)
        return response
    except Exception:
        return Response({'success': False, 'message': 'Invalid refresh token'},
                        status=status.HTTP_401_UNAUTHORIZED)


# ════════════════════════════════════════════════════════════════════════════
# USER CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='get', operation_description="Get user profile", tags=['Users'])
@swagger_auto_schema(method='put', request_body=UserProfileSerializer,
                     operation_description="Update user profile", tags=['Users'])
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get or update current user's profile."""
    user_service = UserService()
    if request.method == 'GET':
        profile = user_service.get_profile(request.user.id)
        return Response({'success': True, 'data': profile})

    serializer = UserProfileSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated = user_service.update_profile(request.user.id, serializer.validated_data)
    return Response({'success': True, 'data': updated})


@swagger_auto_schema(method='post', request_body=ChangePasswordSerializer,
                     operation_description="Change user password",
                     tags=['Users'])
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change current user's password."""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user_service = UserService()
    success = user_service.change_password(
        request.user.id,
        serializer.validated_data['old_password'],
        serializer.validated_data['new_password'],
    )
    if success:
        return Response({'success': True, 'message': 'Password changed successfully'})
    return Response({'success': False, 'message': 'Invalid old password'},
                    status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='get', operation_description="List delivery addresses", tags=['Users'])
@swagger_auto_schema(method='post', request_body=AddressSerializer,
                     operation_description="Add a delivery address", tags=['Users'])
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def addresses(request):
    """List or add addresses."""
    user_service = UserService()
    if request.method == 'GET':
        addrs = user_service.get_addresses(request.user.id)
        return Response({'success': True, 'data': addrs})

    serializer = AddressSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    addr = user_service.add_address(request.user.id, serializer.validated_data)
    return Response({'success': True, 'data': addr}, status=status.HTTP_201_CREATED)


@swagger_auto_schema(method='put', request_body=AddressSerializer,
                     operation_description="Update an address", tags=['Users'])
@swagger_auto_schema(method='delete', operation_description="Delete an address", tags=['Users'])
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def address_detail(request, address_id):
    """Update or delete a specific address."""
    user_service = UserService()
    if request.method == 'PUT':
        serializer = AddressSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        result = user_service.update_address(address_id, serializer.validated_data)
        if result:
            return Response({'success': True, 'data': result})
        return Response({'success': False, 'message': 'Address not found'},
                        status=status.HTTP_404_NOT_FOUND)

    success = user_service.delete_address(address_id)
    if success:
        return Response({'success': True, 'message': 'Address deleted'})
    return Response({'success': False, 'message': 'Address not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='get',
                     manual_parameters=[
                         openapi.Parameter('role', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                                           enum=['customer', 'kitchen_admin', 'delivery_agent'])
                     ],
                     operation_description="List users by role (Admin only)",
                     tags=['Users'])
@api_view(['GET'])
@permission_classes([IsKitchenAdmin])
def list_users(request):
    """List users by role (admin only)."""
    from infrastructure.repositories import DjangoUserRepository
    role = request.query_params.get('role', 'customer')
    repo = DjangoUserRepository()
    users = repo.list_by_role(role)
    return Response({'success': True, 'data': users})


# ════════════════════════════════════════════════════════════════════════════
# MENU CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='get',
                     manual_parameters=[
                         openapi.Parameter('category_id', openapi.IN_QUERY,
                                           type=openapi.TYPE_INTEGER, required=False),
                         openapi.Parameter('is_available', openapi.IN_QUERY,
                                           type=openapi.TYPE_BOOLEAN, required=False),
                         openapi.Parameter('search', openapi.IN_QUERY,
                                           type=openapi.TYPE_STRING, required=False),
                     ],
                     operation_description="List all menu items with optional filters",
                     tags=['Menu'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def menu_items_list(request):
    """List menu items with optional filters."""
    menu_service = MenuService()
    items = menu_service.list_items(
        category_id=request.query_params.get('category_id'),
        is_available=request.query_params.get('is_available'),
        search=request.query_params.get('search', ''),
    )
    return Response({'success': True, 'data': items, 'count': len(items)})


@swagger_auto_schema(method='post', request_body=MenuItemSerializer,
                     operation_description="Create a new menu item (Kitchen Admin only)",
                     tags=['Menu'])
@api_view(['POST'])
@permission_classes([IsKitchenAdmin])
def menu_item_create(request):
    """Create a new menu item."""
    serializer = MenuItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    menu_service = MenuService()
    item = menu_service.create_item(serializer.validated_data)
    return Response({'success': True, 'data': item}, status=status.HTTP_201_CREATED)


@swagger_auto_schema(method='get', operation_description="Get a menu item", tags=['Menu'])
@swagger_auto_schema(method='put', request_body=MenuItemUpdateSerializer,
                     operation_description="Update a menu item", tags=['Menu'])
@swagger_auto_schema(method='delete', operation_description="Delete a menu item", tags=['Menu'])
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsKitchenAdminOrReadOnly])
def menu_item_detail(request, item_id):
    """Get, update or delete a menu item."""
    menu_service = MenuService()

    if request.method == 'GET':
        item = menu_service.get_item(item_id)
        if item:
            return Response({'success': True, 'data': item})
        return Response({'success': False, 'message': 'Item not found'},
                        status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = MenuItemUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        item = menu_service.update_item(item_id, serializer.validated_data)
        if item:
            return Response({'success': True, 'data': item})
        return Response({'success': False, 'message': 'Item not found'},
                        status=status.HTTP_404_NOT_FOUND)

    success = menu_service.delete_item(item_id)
    if success:
        return Response({'success': True, 'message': 'Item deleted'})
    return Response({'success': False, 'message': 'Item not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='post', request_body=MenuItemImageSerializer,
                     operation_description="Upload image for a menu item",
                     tags=['Menu'])
@api_view(['POST'])
@permission_classes([IsKitchenAdmin])
def menu_item_upload_image(request, item_id):
    """Upload image for a menu item."""
    if 'image' not in request.FILES:
        return Response({'success': False, 'message': 'No image provided'},
                        status=status.HTTP_400_BAD_REQUEST)
    from infrastructure.models import MenuItem as MenuItemModel
    try:
        item = MenuItemModel.objects.get(id=item_id)
        item.image = request.FILES['image']
        item.save()
        return Response({'success': True, 'message': 'Image uploaded',
                         'data': {'image': item.image.url}})
    except MenuItemModel.DoesNotExist:
        return Response({'success': False, 'message': 'Item not found'},
                        status=status.HTTP_404_NOT_FOUND)


# ─── Category endpoints ──────────────────────────────────────────────────

@swagger_auto_schema(method='get', operation_description="List food categories", tags=['Menu'])
@swagger_auto_schema(method='post', request_body=CategorySerializer,
                     operation_description="Create a food category", tags=['Menu'])
@api_view(['GET', 'POST'])
@permission_classes([IsKitchenAdminOrReadOnly])
def categories(request):
    """List or create categories."""
    menu_service = MenuService()
    if request.method == 'GET':
        cats = menu_service.list_categories()
        return Response({'success': True, 'data': cats})

    serializer = CategorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    cat = menu_service.create_category(serializer.validated_data)
    return Response({'success': True, 'data': cat}, status=status.HTTP_201_CREATED)


@swagger_auto_schema(method='delete',
                     operation_description="Delete a category (Kitchen Admin only)",
                     tags=['Menu'])
@api_view(['DELETE'])
@permission_classes([IsKitchenAdmin])
def category_delete(request, category_id):
    """Delete a category."""
    menu_service = MenuService()
    success = menu_service.delete_category(category_id)
    if success:
        return Response({'success': True, 'message': 'Category deleted'})
    return Response({'success': False, 'message': 'Category not found'},
                    status=status.HTTP_404_NOT_FOUND)


# ════════════════════════════════════════════════════════════════════════════
# ORDER CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='post', request_body=CreateOrderSerializer,
                     operation_description="Place a new order (Customer only)",
                     tags=['Orders'])
@api_view(['POST'])
@permission_classes([IsCustomer])
def create_order(request):
    """Place a new order."""
    serializer = CreateOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    order_service = OrderService()
    try:
        order = order_service.place_order(request.user.id, serializer.validated_data)
        return Response({'success': True, 'data': order}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'success': False, 'message': str(e)},
                        status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='get',
                     operation_description="Get current user's order history",
                     tags=['Orders'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """Get current user's orders."""
    order_service = OrderService()
    orders = order_service.get_user_orders(request.user.id)
    return Response({'success': True, 'data': orders, 'count': len(orders)})


@swagger_auto_schema(method='get',
                     manual_parameters=[
                         openapi.Parameter('status', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                                           enum=['pending', 'accepted', 'preparing', 'ready',
                                                 'out_for_delivery', 'delivered', 'cancelled'],
                                           required=False),
                     ],
                     operation_description="List all orders (Kitchen Admin only)",
                     tags=['Orders'])
@api_view(['GET'])
@permission_classes([IsKitchenAdmin])
def all_orders(request):
    """List all orders (admin only)."""
    order_service = OrderService()
    status_filter = request.query_params.get('status')
    orders = order_service.get_all_orders(status_filter)
    return Response({'success': True, 'data': orders, 'count': len(orders)})


@swagger_auto_schema(method='get',
                     operation_description="Get order details by ID",
                     tags=['Orders'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    """Get order details."""
    order_service = OrderService()
    order = order_service.get_order(order_id)
    if order:
        return Response({'success': True, 'data': order})
    return Response({'success': False, 'message': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='patch', request_body=OrderStatusUpdateSerializer,
                     operation_description="Update order status (Kitchen Admin only)",
                     tags=['Orders'])
@api_view(['PATCH'])
@permission_classes([IsKitchenAdmin])
def update_order_status(request, order_id):
    """Update order status."""
    serializer = OrderStatusUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    order_service = OrderService()
    result = order_service.update_order_status(
        order_id,
        serializer.validated_data['status'],
        serializer.validated_data.get('estimated_delivery_time'),
    )
    if result:
        return Response({'success': True, 'data': result})
    return Response({'success': False, 'message': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND)


# ════════════════════════════════════════════════════════════════════════════
# CART CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='get',
                     operation_description="Get current user's cart",
                     tags=['Cart'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """Get current user's cart."""
    cart_service = CartService()
    cart = cart_service.get_cart(request.user.id)
    return Response({'success': True, 'data': cart})


@swagger_auto_schema(method='post', request_body=AddToCartSerializer,
                     operation_description="Add item to cart",
                     tags=['Cart'])
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """Add item to cart."""
    serializer = AddToCartSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    cart_service = CartService()
    cart = cart_service.add_item(
        request.user.id,
        serializer.validated_data['menu_item_id'],
        serializer.validated_data['quantity'],
    )
    return Response({'success': True, 'data': cart})


@swagger_auto_schema(method='put', request_body=UpdateCartItemSerializer,
                     operation_description="Update cart item quantity",
                     tags=['Cart'])
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """Update cart item quantity."""
    serializer = UpdateCartItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    cart_service = CartService()
    cart = cart_service.update_item_quantity(
        request.user.id, item_id, serializer.validated_data['quantity'])
    if cart:
        return Response({'success': True, 'data': cart})
    return Response({'success': False, 'message': 'Item not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='delete',
                     operation_description="Remove item from cart",
                     tags=['Cart'])
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    """Remove item from cart."""
    cart_service = CartService()
    success = cart_service.remove_item(request.user.id, item_id)
    if success:
        return Response({'success': True, 'message': 'Item removed from cart'})
    return Response({'success': False, 'message': 'Item not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='delete',
                     operation_description="Clear entire cart",
                     tags=['Cart'])
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """Clear all items from cart."""
    cart_service = CartService()
    cart_service.clear_cart(request.user.id)
    return Response({'success': True, 'message': 'Cart cleared'})


# ════════════════════════════════════════════════════════════════════════════
# PAYMENT CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='post', request_body=CreatePaymentSerializer,
                     operation_description="Create a payment for an order",
                     tags=['Payments'])
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """Create payment for an order."""
    serializer = CreatePaymentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    payment_service = PaymentService()
    payment = payment_service.create_payment(serializer.validated_data)
    return Response({'success': True, 'data': payment}, status=status.HTTP_201_CREATED)


@swagger_auto_schema(method='get',
                     operation_description="Get payment details",
                     tags=['Payments'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_detail(request, payment_id):
    """Get payment details."""
    payment_service = PaymentService()
    payment = payment_service.get_payment(payment_id)
    if payment:
        return Response({'success': True, 'data': payment})
    return Response({'success': False, 'message': 'Payment not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='get',
                     operation_description="Get payment by order ID",
                     tags=['Payments'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_by_order(request, order_id):
    """Get payment by order ID."""
    payment_service = PaymentService()
    payment = payment_service.get_payment_by_order(order_id)
    if payment:
        return Response({'success': True, 'data': payment})
    return Response({'success': False, 'message': 'Payment not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='patch', request_body=PaymentStatusSerializer,
                     operation_description="Update payment status (Admin only)",
                     tags=['Payments'])
@api_view(['PATCH'])
@permission_classes([IsKitchenAdmin])
def update_payment_status(request, payment_id):
    """Update payment status."""
    serializer = PaymentStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    payment_service = PaymentService()
    result = payment_service.update_payment_status(
        payment_id, serializer.validated_data['status'])
    if result:
        return Response({'success': True, 'data': result})
    return Response({'success': False, 'message': 'Payment not found'},
                    status=status.HTTP_404_NOT_FOUND)


# ════════════════════════════════════════════════════════════════════════════
# DELIVERY CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='post', request_body=AssignDeliverySerializer,
                     operation_description="Assign a delivery agent to an order (Admin only)",
                     tags=['Delivery'])
@api_view(['POST'])
@permission_classes([IsKitchenAdmin])
def assign_delivery(request):
    """Assign delivery agent to an order."""
    serializer = AssignDeliverySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    delivery_service = DeliveryService()
    delivery = delivery_service.assign_delivery(serializer.validated_data)
    return Response({'success': True, 'data': delivery}, status=status.HTTP_201_CREATED)


@swagger_auto_schema(method='get',
                     operation_description="Get delivery details",
                     tags=['Delivery'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def delivery_detail(request, delivery_id):
    """Get delivery details."""
    delivery_service = DeliveryService()
    delivery = delivery_service.get_delivery(delivery_id)
    if delivery:
        return Response({'success': True, 'data': delivery})
    return Response({'success': False, 'message': 'Delivery not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='patch', request_body=DeliveryStatusUpdateSerializer,
                     operation_description="Update delivery status (Admin/Agent)",
                     tags=['Delivery'])
@api_view(['PATCH'])
@permission_classes([IsAdminOrDeliveryAgent])
def update_delivery_status(request, delivery_id):
    """Update delivery status."""
    serializer = DeliveryStatusUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    delivery_service = DeliveryService()
    result = delivery_service.update_delivery_status(delivery_id, serializer.validated_data)
    if result:
        return Response({'success': True, 'data': result})
    return Response({'success': False, 'message': 'Delivery not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='put', request_body=DeliveryLocationSerializer,
                     operation_description="Update delivery agent's current location",
                     tags=['Delivery'])
@api_view(['PUT'])
@permission_classes([IsDeliveryAgent])
def update_delivery_location(request, delivery_id):
    """Update delivery agent location."""
    serializer = DeliveryLocationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    delivery_service = DeliveryService()
    result = delivery_service.update_location(
        delivery_id,
        serializer.validated_data['latitude'],
        serializer.validated_data['longitude'],
    )
    if result:
        return Response({'success': True, 'data': result})
    return Response({'success': False, 'message': 'Delivery not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='get',
                     operation_description="Track delivery for an order",
                     tags=['Delivery'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_delivery(request, order_id):
    """Track delivery for a specific order."""
    delivery_service = DeliveryService()
    tracking = delivery_service.track_delivery(order_id)
    if tracking:
        return Response({'success': True, 'data': tracking})
    return Response({'success': False, 'message': 'No delivery found for this order'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='get',
                     manual_parameters=[
                         openapi.Parameter('status', openapi.IN_QUERY,
                                           type=openapi.TYPE_STRING, required=False,
                                           enum=['assigned', 'picked', 'in_transit', 'delivered']),
                     ],
                     operation_description="Get deliveries assigned to current agent",
                     tags=['Delivery'])
@api_view(['GET'])
@permission_classes([IsDeliveryAgent])
def my_deliveries(request):
    """Get current delivery agent's deliveries."""
    delivery_service = DeliveryService()
    deliveries = delivery_service.get_agent_deliveries(
        request.user.id,
        request.query_params.get('status'),
    )
    return Response({'success': True, 'data': deliveries, 'count': len(deliveries)})


# ════════════════════════════════════════════════════════════════════════════
# AI RECOMMENDATION CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='post', request_body=AIQuerySerializer,
                     operation_description="Get AI recipe recommendations based on available ingredients",
                     tags=['AI Bot'])
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_recommend(request):
    """Get recipe recommendations based on available ingredients."""
    serializer = AIQuerySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    ai_service = AIService()
    result = ai_service.recommend_recipes(
        request.user.id,
        serializer.validated_data['ingredients'],
    )
    return Response({'success': True, 'data': result})


@swagger_auto_schema(method='get',
                     operation_description="Get user's AI recommendation history",
                     tags=['AI Bot'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_history(request):
    """Get user's AI recommendation history."""
    ai_service = AIService()
    history = ai_service.get_history(request.user.id)
    return Response({'success': True, 'data': history, 'count': len(history)})


@swagger_auto_schema(method='get',
                     operation_description="Get most popular ingredients searched by users",
                     tags=['AI Bot'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_popular_ingredients(request):
    """Get popular ingredients that users often search for."""
    ai_service = AIService()
    ingredients = ai_service.get_popular_ingredients()
    return Response({'success': True, 'data': ingredients})


# ════════════════════════════════════════════════════════════════════════════
# ANALYTICS / DASHBOARD CONTROLLER
# ════════════════════════════════════════════════════════════════════════════

@swagger_auto_schema(method='get',
                     operation_description="Get dashboard statistics (Admin only)",
                     tags=['Dashboard'])
@api_view(['GET'])
@permission_classes([IsKitchenAdmin])
def dashboard_stats(request):
    """Get dashboard statistics."""
    analytics_service = AnalyticsService()
    stats = analytics_service.get_dashboard()
    return Response({'success': True, 'data': stats})


@swagger_auto_schema(method='get',
                     manual_parameters=[
                         openapi.Parameter('start_date', openapi.IN_QUERY,
                                           type=openapi.TYPE_STRING, required=True,
                                           description='Format: YYYY-MM-DD'),
                         openapi.Parameter('end_date', openapi.IN_QUERY,
                                           type=openapi.TYPE_STRING, required=True,
                                           description='Format: YYYY-MM-DD'),
                     ],
                     operation_description="Get sales report for a date range (Admin only)",
                     tags=['Dashboard'])
@api_view(['GET'])
@permission_classes([IsKitchenAdmin])
def sales_report(request):
    """Get sales report for a date range."""
    try:
        start = datetime.strptime(request.query_params.get('start_date', ''), '%Y-%m-%d').date()
        end = datetime.strptime(request.query_params.get('end_date', ''), '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return Response({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'},
                        status=status.HTTP_400_BAD_REQUEST)
    analytics_service = AnalyticsService()
    report = analytics_service.get_sales_report(start, end)
    return Response({'success': True, 'data': report})


@swagger_auto_schema(method='get',
                     operation_description="Get popular menu items (Admin only)",
                     tags=['Dashboard'])
@api_view(['GET'])
@permission_classes([IsKitchenAdmin])
def popular_items(request):
    """Get popular menu items."""
    limit = int(request.query_params.get('limit', 10))
    analytics_service = AnalyticsService()
    items = analytics_service.get_popular_items(limit)
    return Response({'success': True, 'data': items})


@swagger_auto_schema(method='get',
                     operation_description="Get active kitchen timers (KDS)",
                     tags=['Dashboard'])
@api_view(['GET'])
@permission_classes([IsKitchenAdmin])
def kitchen_timers(request):
    """Get active kitchen timers."""
    analytics_service = AnalyticsService()
    timers = analytics_service.get_active_timers()
    return Response({'success': True, 'data': timers})


@swagger_auto_schema(method='patch', request_body=TimerStatusSerializer,
                     operation_description="Update kitchen timer status",
                     tags=['Dashboard'])
@api_view(['PATCH'])
@permission_classes([IsKitchenAdmin])
def update_kitchen_timer(request, timer_id):
    """Update kitchen timer status."""
    serializer = TimerStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    analytics_service = AnalyticsService()
    result = analytics_service.update_timer(timer_id, serializer.validated_data['status'])
    if result:
        return Response({'success': True, 'data': result})
    return Response({'success': False, 'message': 'Timer not found'},
                    status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='get',
                     operation_description="Get demand predictions (Admin only)",
                     tags=['Dashboard'])
@api_view(['GET'])
@permission_classes([IsKitchenAdmin])
def demand_predictions(request):
    """Get demand predictions."""
    target_date = request.query_params.get('date')
    if target_date:
        try:
            target_date = datetime.strptime(target_date, '%Y-%m-%d').date()
        except ValueError:
            target_date = None
    analytics_service = AnalyticsService()
    predictions = analytics_service.get_predictions(target_date)
    return Response({'success': True, 'data': predictions})
