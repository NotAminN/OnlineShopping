"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from apps.products.views import CategoryViewSet, ProductViewSet
from django.views.static import serve
from django.conf import settings

FRONTEND_DIST = settings.BASE_DIR.parent / 'Front' / 'dist'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    
    # OpenAPI Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Storefront categories (top-level for the frontend)
    path('api/categories/', CategoryViewSet.as_view({'get': 'list'}), name='categories'),
    path('api/categories/<slug:slug>/', CategoryViewSet.as_view({'get': 'retrieve'}), name='category-detail'),
    
    # Serve Frontend Pages and Assets
    path('', serve, {'document_root': FRONTEND_DIST, 'path': 'index.html'}),
    re_path(r'^(?P<path>.*\..*)$', serve, {'document_root': FRONTEND_DIST}),
]
