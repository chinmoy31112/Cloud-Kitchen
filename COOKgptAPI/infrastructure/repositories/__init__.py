"""
Infrastructure: Concrete Repository Implementations
Django ORM-based implementations of all domain repository interfaces.
"""
from typing import Optional, List
from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q, F
from django.contrib.auth import authenticate
from django.core.cache import cache

from domain.repositories.user_repository import IUserRepository
from domain.repositories.menu_repository import IMenuRepository
from domain.repositories.order_repository import IOrderRepository
from domain.repositories.cart_repository import ICartRepository
from domain.repositories.payment_repository import IPaymentRepository
from domain.repositories.delivery_repository import IDeliveryRepository
from domain.repositories.ai_repository import IAIRepository
from domain.repositories.analytics_repository import IAnalyticsRepository
from infrastructure.models import (
    CustomUser, Address, Category, MenuItem, Cart, CartItem,
    Order, OrderItem, Payment, Delivery, AIRecommendation,
    KitchenTimer, DemandPrediction,
)


# ───────────────────────────── User Repository ─────────────────────────────

class DjangoUserRepository(IUserRepository):
    """Concrete implementation of IUserRepository using Django ORM."""

    def _user_to_dict(self, user) -> dict:
        return {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'role': user.role,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'profile_image': user.profile_image.url if user.profile_image else None,
        }

    def _address_to_dict(self, addr) -> dict:
        return {
            'id': addr.id,
            'user_id': addr.user_id,
            'label': addr.label,
            'street': addr.street,
            'city': addr.city,
            'state': addr.state,
            'pincode': addr.pincode,
            'latitude': addr.latitude,
            'longitude': addr.longitude,
            'is_default': addr.is_default,
        }

    def create(self, email, username, password, first_name, last_name, phone, role) -> dict:
        user = CustomUser.objects.create_user(
            email=email, username=username, password=password,
            first_name=first_name, last_name=last_name,
            phone=phone, role=role,
        )
        return self._user_to_dict(user)

    def get_by_id(self, user_id: int) -> Optional[dict]:
        try:
            return self._user_to_dict(CustomUser.objects.get(id=user_id))
        except CustomUser.DoesNotExist:
            return None

    def get_by_email(self, email: str) -> Optional[dict]:
        try:
            return self._user_to_dict(CustomUser.objects.get(email=email))
        except CustomUser.DoesNotExist:
            return None

    def get_by_username(self, username: str) -> Optional[dict]:
        try:
            return self._user_to_dict(CustomUser.objects.get(username=username))
        except CustomUser.DoesNotExist:
            return None

    def update(self, user_id: int, **kwargs) -> Optional[dict]:
        try:
            user = CustomUser.objects.get(id=user_id)
            for key, value in kwargs.items():
                if hasattr(user, key) and key not in ('id', 'password'):
                    setattr(user, key, value)
            user.save()
            return self._user_to_dict(user)
        except CustomUser.DoesNotExist:
            return None

    def delete(self, user_id: int) -> bool:
        try:
            CustomUser.objects.get(id=user_id).delete()
            return True
        except CustomUser.DoesNotExist:
            return False

    def list_by_role(self, role: str) -> List[dict]:
        return [self._user_to_dict(u) for u in CustomUser.objects.filter(role=role)]

    def authenticate(self, email: str, password: str) -> Optional[dict]:
        try:
            user = CustomUser.objects.get(email=email)
            if user.check_password(password):
                return self._user_to_dict(user)
        except CustomUser.DoesNotExist:
            pass
        return None

    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        try:
            user = CustomUser.objects.get(id=user_id)
            if user.check_password(old_password):
                user.set_password(new_password)
                user.save()
                return True
        except CustomUser.DoesNotExist:
            pass
        return False

    def create_address(self, user_id: int, **kwargs) -> dict:
        if kwargs.get('is_default'):
            Address.objects.filter(user_id=user_id).update(is_default=False)
        addr = Address.objects.create(user_id=user_id, **kwargs)
        return self._address_to_dict(addr)

    def get_addresses(self, user_id: int) -> List[dict]:
        return [self._address_to_dict(a) for a in Address.objects.filter(user_id=user_id)]

    def update_address(self, address_id: int, **kwargs) -> Optional[dict]:
        try:
            addr = Address.objects.get(id=address_id)
            if kwargs.get('is_default'):
                Address.objects.filter(user_id=addr.user_id).update(is_default=False)
            for key, value in kwargs.items():
                setattr(addr, key, value)
            addr.save()
            return self._address_to_dict(addr)
        except Address.DoesNotExist:
            return None

    def delete_address(self, address_id: int) -> bool:
        try:
            Address.objects.get(id=address_id).delete()
            return True
        except Address.DoesNotExist:
            return False


# ───────────────────────────── Menu Repository ─────────────────────────────

class DjangoMenuRepository(IMenuRepository):
    """Concrete implementation of IMenuRepository using Django ORM."""

    def _item_to_dict(self, item) -> dict:
        return {
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': float(item.price),
            'category_id': item.category_id,
            'category_name': item.category.name if item.category else '',
            'image': item.image.url if item.image else None,
            'is_available': item.is_available,
            'is_vegetarian': item.is_vegetarian,
            'preparation_time': item.preparation_time,
            'calories': item.calories,
            'rating': item.rating,
            'total_ratings': item.total_ratings,
            'created_at': item.created_at,
            'updated_at': item.updated_at,
        }

    def _category_to_dict(self, cat) -> dict:
        return {
            'id': cat.id,
            'name': cat.name,
            'description': cat.description,
            'image': cat.image.url if cat.image else None,
            'is_active': cat.is_active,
        }

    def create_item(self, **kwargs) -> dict:
        item = MenuItem.objects.create(**kwargs)
        return self._item_to_dict(item)

    def get_item_by_id(self, item_id: int) -> Optional[dict]:
        try:
            return self._item_to_dict(
                MenuItem.objects.select_related('category').get(id=item_id)
            )
        except MenuItem.DoesNotExist:
            return None

    def list_items(self, category_id=None, is_available=None, search='') -> List[dict]:
        qs = MenuItem.objects.select_related('category').all()
        if category_id:
            qs = qs.filter(category_id=category_id)
        if is_available is not None:
            qs = qs.filter(is_available=is_available)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return [self._item_to_dict(i) for i in qs]

    def update_item(self, item_id: int, **kwargs) -> Optional[dict]:
        try:
            item = MenuItem.objects.get(id=item_id)
            for key, val in kwargs.items():
                if hasattr(item, key):
                    setattr(item, key, val)
            item.save()
            return self._item_to_dict(item)
        except MenuItem.DoesNotExist:
            return None

    def delete_item(self, item_id: int) -> bool:
        try:
            MenuItem.objects.get(id=item_id).delete()
            return True
        except MenuItem.DoesNotExist:
            return False

    def update_item_image(self, item_id: int, image_path: str) -> Optional[dict]:
        try:
            item = MenuItem.objects.get(id=item_id)
            item.image = image_path
            item.save()
            return self._item_to_dict(item)
        except MenuItem.DoesNotExist:
            return None

    def create_category(self, name: str, description: str = '') -> dict:
        cat = Category.objects.create(name=name, description=description)
        return self._category_to_dict(cat)

    def list_categories(self) -> List[dict]:
        return [self._category_to_dict(c) for c in Category.objects.filter(is_active=True)]

    def update_category(self, category_id: int, **kwargs) -> Optional[dict]:
        try:
            cat = Category.objects.get(id=category_id)
            for key, val in kwargs.items():
                setattr(cat, key, val)
            cat.save()
            return self._category_to_dict(cat)
        except Category.DoesNotExist:
            return None

    def delete_category(self, category_id: int) -> bool:
        try:
            Category.objects.get(id=category_id).delete()
            return True
        except Category.DoesNotExist:
            return False


# ───────────────────────────── Order Repository ────────────────────────────

class DjangoOrderRepository(IOrderRepository):
    """Concrete implementation of IOrderRepository using Django ORM."""

    def _order_to_dict(self, order) -> dict:
        addr = order.delivery_address
        addr_str = f"{addr.street}, {addr.city}" if addr else ''
        return {
            'id': order.id,
            'order_number': order.order_number,
            'user_id': order.user_id,
            'user_name': order.user.get_full_name() or order.user.username,
            'delivery_address_id': order.delivery_address_id,
            'delivery_address': addr_str,
            'status': order.status,
            'subtotal': float(order.subtotal),
            'discount': float(order.discount),
            'delivery_charge': float(order.delivery_charge),
            'tax': float(order.tax),
            'total': float(order.total),
            'special_instructions': order.special_instructions,
            'estimated_delivery_time': order.estimated_delivery_time,
            'items': list(order.items.values(
                'id', 'menu_item_id', 'menu_item_name',
                'quantity', 'unit_price', 'total_price', 'special_instructions'
            )),
            'created_at': order.created_at,
            'updated_at': order.updated_at,
        }

    def create(self, user_id, delivery_address_id, items, special_instructions='', **kwargs):
        from decimal import Decimal
        order = Order.objects.create(
            user_id=user_id,
            delivery_address_id=delivery_address_id,
            special_instructions=special_instructions,
        )

        subtotal = Decimal('0')
        for item_data in items:
            menu_item = MenuItem.objects.get(id=item_data['menu_item_id'])
            item_total = menu_item.price * item_data['quantity']
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                menu_item_name=menu_item.name,
                quantity=item_data['quantity'],
                unit_price=menu_item.price,
                total_price=item_total,
                special_instructions=item_data.get('special_instructions', ''),
            )
            subtotal += item_total

        tax = subtotal * Decimal('0.05')  # 5% GST
        delivery_charge = Decimal('40') if subtotal < Decimal('500') else Decimal('0')
        total = subtotal + tax + delivery_charge

        order.subtotal = subtotal
        order.tax = tax
        order.delivery_charge = delivery_charge
        order.total = total
        order.save()

        return self._order_to_dict(Order.objects.select_related(
            'user', 'delivery_address').prefetch_related('items').get(id=order.id))

    def get_by_id(self, order_id: int) -> Optional[dict]:
        try:
            order = Order.objects.select_related(
                'user', 'delivery_address'
            ).prefetch_related('items').get(id=order_id)
            return self._order_to_dict(order)
        except Order.DoesNotExist:
            return None

    def list_by_user(self, user_id: int) -> List[dict]:
        orders = Order.objects.select_related(
            'user', 'delivery_address'
        ).prefetch_related('items').filter(user_id=user_id)
        return [self._order_to_dict(o) for o in orders]

    def list_all(self, status=None) -> List[dict]:
        qs = Order.objects.select_related(
            'user', 'delivery_address'
        ).prefetch_related('items')
        if status:
            qs = qs.filter(status=status)
        return [self._order_to_dict(o) for o in qs]

    def update_status(self, order_id, status, estimated_delivery_time=None):
        try:
            order = Order.objects.get(id=order_id)
            order.status = status
            if estimated_delivery_time:
                order.estimated_delivery_time = estimated_delivery_time
            order.save()
            return self._order_to_dict(
                Order.objects.select_related('user', 'delivery_address')
                .prefetch_related('items').get(id=order_id)
            )
        except Order.DoesNotExist:
            return None

    def get_order_items(self, order_id: int) -> List[dict]:
        return list(OrderItem.objects.filter(order_id=order_id).values(
            'id', 'menu_item_id', 'menu_item_name',
            'quantity', 'unit_price', 'total_price'
        ))


# ───────────────────────────── Cart Repository ─────────────────────────────

class DjangoCartRepository(ICartRepository):

    def _cart_to_dict(self, cart) -> dict:
        items = []
        subtotal = 0
        for ci in cart.items.select_related('menu_item').all():
            total = float(ci.menu_item.price) * ci.quantity
            items.append({
                'id': ci.id,
                'menu_item_id': ci.menu_item_id,
                'menu_item_name': ci.menu_item.name,
                'menu_item_price': float(ci.menu_item.price),
                'quantity': ci.quantity,
                'total_price': total,
            })
            subtotal += total
        return {
            'id': cart.id,
            'user_id': cart.user_id,
            'items': items,
            'subtotal': subtotal,
            'discount': 0,
            'total': subtotal,
            'item_count': len(items),
        }

    def get_or_create(self, user_id: int) -> dict:
        cart, _ = Cart.objects.get_or_create(user_id=user_id)
        return self._cart_to_dict(cart)

    def add_item(self, cart_id: int, menu_item_id: int, quantity: int = 1) -> dict:
        cart = Cart.objects.get(id=cart_id)
        ci, created = CartItem.objects.get_or_create(
            cart=cart, menu_item_id=menu_item_id,
            defaults={'quantity': quantity}
        )
        if not created:
            ci.quantity += quantity
            ci.save()
        return self._cart_to_dict(cart)

    def remove_item(self, cart_id: int, item_id: int) -> bool:
        try:
            CartItem.objects.get(id=item_id, cart_id=cart_id).delete()
            return True
        except CartItem.DoesNotExist:
            return False

    def update_item_quantity(self, cart_id, item_id, quantity):
        try:
            ci = CartItem.objects.get(id=item_id, cart_id=cart_id)
            ci.quantity = quantity
            ci.save()
            return self._cart_to_dict(Cart.objects.get(id=cart_id))
        except CartItem.DoesNotExist:
            return None

    def get_cart_items(self, cart_id: int) -> List[dict]:
        cart = Cart.objects.get(id=cart_id)
        return self._cart_to_dict(cart)['items']

    def clear_cart(self, cart_id: int) -> bool:
        CartItem.objects.filter(cart_id=cart_id).delete()
        return True

    def get_cart_total(self, cart_id: int) -> dict:
        cart = Cart.objects.get(id=cart_id)
        data = self._cart_to_dict(cart)
        return {'subtotal': data['subtotal'], 'total': data['total']}


# ───────────────────────────── Payment Repository ──────────────────────────

class DjangoPaymentRepository(IPaymentRepository):

    def _payment_to_dict(self, p) -> dict:
        return {
            'id': p.id,
            'order_id': p.order_id,
            'amount': float(p.amount),
            'method': p.method,
            'status': p.status,
            'transaction_id': p.transaction_id,
            'payment_gateway_response': p.payment_gateway_response,
            'created_at': p.created_at,
            'updated_at': p.updated_at,
        }

    def create(self, order_id, amount, method, transaction_id='') -> dict:
        p = Payment.objects.create(
            order_id=order_id, amount=amount,
            method=method, transaction_id=transaction_id,
        )
        return self._payment_to_dict(p)

    def get_by_id(self, payment_id: int) -> Optional[dict]:
        try:
            return self._payment_to_dict(Payment.objects.get(id=payment_id))
        except Payment.DoesNotExist:
            return None

    def get_by_order(self, order_id: int) -> Optional[dict]:
        try:
            return self._payment_to_dict(Payment.objects.get(order_id=order_id))
        except Payment.DoesNotExist:
            return None

    def update_status(self, payment_id, status, gateway_response=''):
        try:
            p = Payment.objects.get(id=payment_id)
            p.status = status
            if gateway_response:
                p.payment_gateway_response = gateway_response
            p.save()
            return self._payment_to_dict(p)
        except Payment.DoesNotExist:
            return None

    def list_by_user(self, user_id: int) -> List[dict]:
        payments = Payment.objects.filter(order__user_id=user_id)
        return [self._payment_to_dict(p) for p in payments]


# ───────────────────────────── Delivery Repository ─────────────────────────

class DjangoDeliveryRepository(IDeliveryRepository):

    def _delivery_to_dict(self, d) -> dict:
        return {
            'id': d.id,
            'order_id': d.order_id,
            'agent_id': d.agent_id,
            'agent_name': d.agent.get_full_name() if d.agent else '',
            'status': d.status,
            'pickup_time': d.pickup_time,
            'delivery_time': d.delivery_time,
            'current_latitude': d.current_latitude,
            'current_longitude': d.current_longitude,
            'estimated_time': d.estimated_time,
            'distance': d.distance,
            'delivery_notes': d.delivery_notes,
            'created_at': d.created_at,
        }

    def create(self, order_id, agent_id, estimated_time=None) -> dict:
        d = Delivery.objects.create(
            order_id=order_id, agent_id=agent_id,
            estimated_time=estimated_time,
        )
        return self._delivery_to_dict(Delivery.objects.select_related('agent').get(id=d.id))

    def get_by_id(self, delivery_id: int) -> Optional[dict]:
        try:
            return self._delivery_to_dict(
                Delivery.objects.select_related('agent').get(id=delivery_id))
        except Delivery.DoesNotExist:
            return None

    def get_by_order(self, order_id: int) -> Optional[dict]:
        try:
            return self._delivery_to_dict(
                Delivery.objects.select_related('agent').get(order_id=order_id))
        except Delivery.DoesNotExist:
            return None

    def update_status(self, delivery_id, status, **kwargs):
        try:
            d = Delivery.objects.get(id=delivery_id)
            d.status = status
            if status == 'picked':
                d.pickup_time = timezone.now()
            elif status == 'delivered':
                d.delivery_time = timezone.now()
            for k, v in kwargs.items():
                if hasattr(d, k):
                    setattr(d, k, v)
            d.save()
            return self._delivery_to_dict(
                Delivery.objects.select_related('agent').get(id=delivery_id))
        except Delivery.DoesNotExist:
            return None

    def list_by_agent(self, agent_id, status=None):
        qs = Delivery.objects.select_related('agent').filter(agent_id=agent_id)
        if status:
            qs = qs.filter(status=status)
        return [self._delivery_to_dict(d) for d in qs]

    def update_location(self, delivery_id, latitude, longitude):
        try:
            d = Delivery.objects.get(id=delivery_id)
            d.current_latitude = latitude
            d.current_longitude = longitude
            d.save()
            return self._delivery_to_dict(
                Delivery.objects.select_related('agent').get(id=delivery_id))
        except Delivery.DoesNotExist:
            return None


# ─────────────────────────── AI Recommendation Repository ──────────────────

class DjangoAIRepository(IAIRepository):

    def save_query(self, user_id, ingredients, recipes) -> dict:
        rec = AIRecommendation.objects.create(
            user_id=user_id,
            input_ingredients=ingredients,
            recommended_recipes=recipes,
        )
        return {
            'id': rec.id,
            'user_id': rec.user_id,
            'input_ingredients': rec.input_ingredients,
            'recommended_recipes': rec.recommended_recipes,
            'created_at': rec.created_at,
        }

    def get_history(self, user_id, limit=10):
        recs = AIRecommendation.objects.filter(user_id=user_id)[:limit]
        return [{
            'id': r.id,
            'input_ingredients': r.input_ingredients,
            'recommended_recipes': r.recommended_recipes,
            'created_at': r.created_at,
        } for r in recs]

    def get_popular_ingredients(self, limit=20):
        from collections import Counter
        all_ingredients = []
        for rec in AIRecommendation.objects.all():
            all_ingredients.extend(rec.input_ingredients)
        counter = Counter(all_ingredients)
        return [{'ingredient': ing, 'count': cnt}
                for ing, cnt in counter.most_common(limit)]

    def get_query_by_id(self, query_id):
        try:
            r = AIRecommendation.objects.get(id=query_id)
            return {
                'id': r.id,
                'user_id': r.user_id,
                'input_ingredients': r.input_ingredients,
                'recommended_recipes': r.recommended_recipes,
                'created_at': r.created_at,
            }
        except AIRecommendation.DoesNotExist:
            return None


# ─────────────────────────── Analytics Repository ──────────────────────────

class DjangoAnalyticsRepository(IAnalyticsRepository):

    def get_dashboard_stats(self) -> dict:
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(
            status='delivered').aggregate(s=Sum('total'))['s'] or 0
        total_customers = CustomUser.objects.filter(role='customer').count()
        total_menu_items = MenuItem.objects.count()
        pending = Order.objects.filter(status='pending').count()
        delivered = Order.objects.filter(status='delivered').count()
        cancelled = Order.objects.filter(status='cancelled').count()
        avg_val = Order.objects.aggregate(a=Avg('total'))['a'] or 0
        return {
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'total_customers': total_customers,
            'total_menu_items': total_menu_items,
            'pending_orders': pending,
            'delivered_orders': delivered,
            'cancelled_orders': cancelled,
            'average_order_value': float(avg_val),
        }

    def get_daily_sales(self, start_date, end_date):
        from django.db.models.functions import TruncDate
        sales = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        ).annotate(
            day=TruncDate('created_at')
        ).values('day').annotate(
            total_orders=Count('id'),
            total_revenue=Sum('total'),
        ).order_by('day')
        return [{'date': str(s['day']), 'total_orders': s['total_orders'],
                 'total_revenue': float(s['total_revenue'] or 0)} for s in sales]

    def get_popular_items(self, limit=10):
        items = OrderItem.objects.values(
            'menu_item_id', 'menu_item_name'
        ).annotate(
            total_ordered=Sum('quantity'),
            total_revenue=Sum('total_price'),
        ).order_by('-total_ordered')[:limit]
        return [{'menu_item_id': i['menu_item_id'],
                 'menu_item_name': i['menu_item_name'],
                 'total_ordered': i['total_ordered'],
                 'total_revenue': float(i['total_revenue'] or 0)} for i in items]

    def get_revenue_by_period(self, period='daily'):
        from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
        trunc_map = {'daily': TruncDate, 'weekly': TruncWeek, 'monthly': TruncMonth}
        trunc_fn = trunc_map.get(period, TruncDate)
        data = Order.objects.filter(status='delivered').annotate(
            period=trunc_fn('created_at')
        ).values('period').annotate(
            revenue=Sum('total'), orders=Count('id')
        ).order_by('period')
        return [{'period': str(d['period']), 'revenue': float(d['revenue'] or 0),
                 'orders': d['orders']} for d in data]

    def get_customer_stats(self):
        total = CustomUser.objects.filter(role='customer').count()
        active = CustomUser.objects.filter(role='customer', orders__isnull=False).distinct().count()
        return {'total_customers': total, 'active_customers': active,
                'inactive_customers': total - active}

    def create_timer(self, order_id, order_item_id, menu_item_name, estimated_time):
        t = KitchenTimer.objects.create(
            order_id=order_id, order_item_id=order_item_id,
            menu_item_name=menu_item_name, estimated_time=estimated_time,
        )
        return {'id': t.id, 'order_id': t.order_id, 'menu_item_name': t.menu_item_name,
                'estimated_time': t.estimated_time, 'status': t.status}

    def update_timer_status(self, timer_id, status):
        try:
            t = KitchenTimer.objects.get(id=timer_id)
            t.status = status
            if status == 'in_progress':
                t.started_at = timezone.now()
            elif status == 'completed':
                t.completed_at = timezone.now()
                if t.started_at:
                    t.actual_time = int((t.completed_at - t.started_at).total_seconds() / 60)
            t.save()
            return {'id': t.id, 'status': t.status, 'actual_time': t.actual_time}
        except KitchenTimer.DoesNotExist:
            return None

    def get_active_timers(self):
        timers = KitchenTimer.objects.filter(
            status__in=['pending', 'in_progress']
        ).select_related('order')
        return [{'id': t.id, 'order_number': t.order.order_number,
                 'menu_item_name': t.menu_item_name,
                 'estimated_time': t.estimated_time, 'status': t.status,
                 'started_at': t.started_at} for t in timers]

    def save_prediction(self, menu_item_id, predicted_date, predicted_quantity, confidence):
        p = DemandPrediction.objects.create(
            menu_item_id=menu_item_id, predicted_date=predicted_date,
            predicted_quantity=predicted_quantity, confidence=confidence,
        )
        return {'id': p.id, 'menu_item_id': p.menu_item_id,
                'predicted_date': str(p.predicted_date),
                'predicted_quantity': p.predicted_quantity,
                'confidence': p.confidence}

    def get_predictions(self, target_date=None):
        qs = DemandPrediction.objects.select_related('menu_item').all()
        if target_date:
            qs = qs.filter(predicted_date=target_date)
        return [{'id': p.id, 'menu_item_name': p.menu_item.name,
                 'predicted_date': str(p.predicted_date),
                 'predicted_quantity': p.predicted_quantity,
                 'actual_quantity': p.actual_quantity,
                 'confidence': p.confidence} for p in qs]
