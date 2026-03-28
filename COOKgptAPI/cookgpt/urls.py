"""
CookGPT URL Configuration
Root URL routing with Swagger UI.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from presentation.api.urls import (
    auth_urlpatterns, user_urlpatterns, menu_urlpatterns,
    order_urlpatterns, cart_urlpatterns, payment_urlpatterns,
    delivery_urlpatterns, ai_urlpatterns, dashboard_urlpatterns,
)

# ─── Swagger / OpenAPI Schema ────────────────────────────────────────────
schema_view = get_schema_view(
    openapi.Info(
        title="CookGPT - Cloud Kitchen API",
        default_version='v1',
        description="""
## CookGPT Cloud Kitchen Management System API

### Features:
- 🔐 **Authentication**: JWT-based auth with role-based access (Customer, Kitchen Admin, Delivery Agent)
- 🍔 **Menu Management**: CRUD operations for food items and categories
- 🛒 **Cart System**: Add, remove, update quantities
- 📦 **Order Management**: Place orders, track status
- 💳 **Payments**: Cash on delivery, UPI, Online payment
- 🚚 **Delivery Tracking**: Real-time delivery status and GPS tracking
- 🤖 **AI Bot**: Recipe recommendations based on available ingredients
- 📊 **Analytics Dashboard**: Sales reports, popular items, kitchen timers

### Authentication:
Use the **Authorize** button above with: `Bearer <your-access-token>`
        """,
        terms_of_service="https://www.cookgpt.com/terms/",
        contact=openapi.Contact(email="support@cookgpt.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# ─── URL Patterns ────────────────────────────────────────────────────────
urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Swagger UI
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc-ui'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='swagger-json'),

    # API v1 endpoints
    path('api/v1/auth/', include(auth_urlpatterns)),
    path('api/v1/users/', include(user_urlpatterns)),
    path('api/v1/menu/', include(menu_urlpatterns)),
    path('api/v1/orders/', include(order_urlpatterns)),
    path('api/v1/cart/', include(cart_urlpatterns)),
    path('api/v1/payments/', include(payment_urlpatterns)),
    path('api/v1/delivery/', include(delivery_urlpatterns)),
    path('api/v1/ai/', include(ai_urlpatterns)),
    path('api/v1/dashboard/', include(dashboard_urlpatterns)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
