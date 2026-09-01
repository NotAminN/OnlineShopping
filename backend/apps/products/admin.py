from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'brand', 'price', 'stock', 'sold', 'featured', 'new_arrival']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['category', 'brand', 'featured', 'new_arrival']
    search_fields = ['name', 'brand', 'slug']
