from django.db import models
from django.conf import settings
from apps.products.models import Product
from django.utils.translation import gettext_lazy as _

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('paid', _('Paid')),
        ('shipped', _('Shipped')),
        ('delivered', _('Delivered')),
        ('cancelled', _('Cancelled')),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.BigIntegerField(_('total price'), default=0)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('order')
        verbose_name_plural = _('orders')
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    quantity = models.PositiveIntegerField(_('quantity'), default=1)
    unit_price = models.BigIntegerField(_('unit price'))
    
    # Optional fields to freeze the product state at the time of order
    selected_size = models.CharField(_('selected size'), max_length=50, blank=True)
    selected_color = models.CharField(_('selected color'), max_length=50, blank=True)

    class Meta:
        verbose_name = _('order item')
        verbose_name_plural = _('order items')

    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Unknown'} for Order {self.order.id}"
