import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Category, Product

def run():
    with open('../seed_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Load categories
    for cat in data.get('categories', []):
        Category.objects.get_or_create(
            slug=cat['slug'],
            defaults={
                'name': cat['name'],
                'image': cat['image'],
                'description': cat.get('description', '')
            }
        )
    print("Categories loaded.")

    # Remove products not in seed_data
    valid_slugs = [prod['slug'] for prod in data.get('products', [])]
    deleted_count, _ = Product.objects.exclude(slug__in=valid_slugs).delete()
    if deleted_count:
        print(f"Removed {deleted_count} stale products.")

    # Load products (update existing rows so image/data changes propagate)
    for prod in data.get('products', []):
        try:
            category = Category.objects.get(slug=prod['category'])
            Product.objects.update_or_create(
                slug=prod['slug'],
                defaults={
                    'name': prod['name'],
                    'category': category,
                    'brand': prod['brand'],
                    'price': prod['price'],
                    'original_price': prod.get('originalPrice'),
                    'images': prod['images'],
                    'colors': prod['colors'],
                    'sizes': prod['sizes'],
                    'material': prod['material'],
                    'description': prod['description'],
                    'rating': prod['rating'],
                    'reviews': prod['reviews'],
                    'sold': prod['sold'],
                    'stock': prod['stock'],
                    'tags': prod['tags'],
                    'featured': prod['featured'],
                    'new_arrival': prod.get('newArrival', False),
                }
            )
        except Exception as e:
            print(f"Failed to load product {prod.get('slug')}: {e}")
            
    print("Products loaded.")

if __name__ == '__main__':
    run()
