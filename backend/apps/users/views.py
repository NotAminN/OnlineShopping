from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Address
from .serializers import UserSerializer, RegisterSerializer, AddressSerializer

User = get_user_model()


class IdentifierTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accepts username OR mobile as the identifier field."""

    def validate(self, attrs):
        identifier = attrs.get(self.username_field)
        try:
            user = User.objects.get(Q(mobile=identifier))
        except (User.DoesNotExist, ValueError, TypeError):
            return super().validate(attrs)
        except User.MultipleObjectsReturned:
            return super().validate(attrs)
        else:
            attrs[self.username_field] = user.username
            return super().validate(attrs)


class LoginView(TokenObtainPairView):
    serializer_class = IdentifierTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            identifier = request.data.get('username') or request.data.get('identifier') or ''
            user = User.objects.filter(Q(username=identifier) | Q(mobile=identifier)).first()
            if user:
                response.data['user'] = UserSerializer(user).data
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
