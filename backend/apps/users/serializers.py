from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Address

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatarInitials = serializers.CharField(source='avatar_initials', read_only=True)
    joinedAt = serializers.DateTimeField(source='date_joined', read_only=True, format="%Y-%m-%d")

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'mobile', 'first_name', 'last_name', 'avatarInitials', 'joinedAt')
        read_only_fields = ('id', 'username')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'mobile', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            mobile=validated_data.get('mobile', ''),
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user',)
