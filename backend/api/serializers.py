from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Category, Income, Expense, Savings, Budget, BudgetItem, Goal

User = get_user_model()


# ====================== AUTHENTICATION SERIALIZERS ======================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'full_name', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            username=validated_data['username'],
            full_name=validated_data['full_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        update_last_login(None, user)

        return {"user": user}  # ✅ Return a User instance, NOT a dictionary


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'full_name')


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'full_name']


# ====================== MODEL SERIALIZERS ======================
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'cat_type', 'user']
        read_only_fields = ['user']


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'name', 'amount', 'date', 'category', 'description', 'user']
        read_only_fields = ['user']


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'name', 'amount', 'date', 'category', 'description', 'user']
        read_only_fields = ['user']


class SavingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Savings
        fields = ['id', 'total', 'user']
        read_only_fields = ['user', 'total']


class BudgetItemSerializer(serializers.ModelSerializer):
    remaining = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    progress = serializers.FloatField(read_only=True)
    
    class Meta:
        model = BudgetItem
        fields = ['id', 'category', 'planned', 'actual', 'color', 'remaining', 'progress']


class BudgetSerializer(serializers.ModelSerializer):
    items = BudgetItemSerializer(many=True, read_only=False, required=False)
    
    class Meta:
        model = Budget
        fields = ['id', 'name', 'target_amount', 'current_amount', 'start_date', 'end_date', 'description', 'period', 'user', 'items']
        read_only_fields = ['user']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        budget = Budget.objects.create(**validated_data)
        
        for item_data in items_data:
            BudgetItem.objects.create(budget=budget, **item_data)
            
        return budget
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Update budget fields
        instance.name = validated_data.get('name', instance.name)
        instance.target_amount = validated_data.get('target_amount', instance.target_amount)
        instance.current_amount = validated_data.get('current_amount', instance.current_amount)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.description = validated_data.get('description', instance.description)
        instance.period = validated_data.get('period', instance.period)
        instance.save()
        
        # Handle budget items - if we receive a list of items, replace existing ones
        if items_data:
            # Delete existing items and create new ones
            instance.items.all().delete()
            for item_data in items_data:
                BudgetItem.objects.create(budget=instance, **item_data)
        
        return instance


class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'deadline', 'description', 'progress', 'user']
        read_only_fields = ['user', 'progress']

    def get_progress(self, obj):
        return obj.progress
