"""
Presentation Layer: Custom Permissions
Role-based access control for CookGPT API.
"""
from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    """Allows access only to customers."""
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated
                and request.user.role == 'customer')


class IsKitchenAdmin(BasePermission):
    """Allows access only to kitchen admins."""
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated
                and request.user.role == 'kitchen_admin')


class IsDeliveryAgent(BasePermission):
    """Allows access only to delivery agents."""
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated
                and request.user.role == 'delivery_agent')


class IsKitchenAdminOrReadOnly(BasePermission):
    """Kitchen admins can do anything; others can only read."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user and request.user.is_authenticated
        return (request.user and request.user.is_authenticated
                and request.user.role == 'kitchen_admin')


class IsAdminOrDeliveryAgent(BasePermission):
    """Allows access to kitchen admins and delivery agents."""
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated
                and request.user.role in ('kitchen_admin', 'delivery_agent'))
