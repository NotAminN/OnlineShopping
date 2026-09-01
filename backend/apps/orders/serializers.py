from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductSerializer
from apps.products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    # Frontend sends the product slug (not the numeric PK)
    product = serializers.SlugRelatedField(slug_field='slug', queryset=Product.objects.all())
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'unit_price', 'selected_size', 'selected_color']
        read_only_fields = ['unit_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_price', 'created_at', 'updated_at', 'items']
        read_only_fields = ['user', 'status', 'total_price', 'created_at', 'updated_at']

class CreateOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = ['items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        
        # Calculate total price
        total_price = 0
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            unit_price = product.price # Should probably calculate discount if any, but price is good for now
            total_price += unit_price * quantity
            item_data['unit_price'] = unit_price

        order = Order.objects.create(user=user, total_price=total_price, status='pending')
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        return order
