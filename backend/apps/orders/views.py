from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer
