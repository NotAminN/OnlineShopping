from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('mobile',)}),
    )
    list_display = ['username', 'email', 'mobile', 'first_name', 'last_name', 'is_staff']

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'province', 'city', 'is_default']
    search_fields = ['user__username', 'title', 'city']
    list_filter = ['is_default', 'province']
