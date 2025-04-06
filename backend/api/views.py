from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.urls import reverse
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from .models import Category, Income, Expense, Savings, Budget, Goal
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    CategorySerializer, IncomeSerializer, ExpenseSerializer,
    SavingsSerializer, BudgetSerializer, GoalSerializer
)
import logging

# Root View
def root_view(request):
    html_content = f"""
    <html>
        <head>
            <title>API Home</title>
        </head>
        <body>
            <h1>Welcome to the API</h1>
            <ul>
                <li><a href="{reverse('register')}">Register</a></li>
                <li><a href="{reverse('login')}">Login</a></li>
                <li><a href="{reverse('logout')}">Logout</a></li>
                <li><a href="{reverse('user')}">User Info</a></li>
                <li><a href="/admin/">Admin Panel</a></li>
            </ul>
        </body>
    </html>
    """
    return HttpResponse(html_content)

User = get_user_model()

# Authentication Views
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Log that user was created successfully
        logger = logging.getLogger(__name__)
        logger.info(f"User registered successfully: {user.username} ({user.email})")
        logger.info(f"Default data creation should be triggered by signals.py")

        refresh = RefreshToken.for_user(user)
        
        response = Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
        
        # Set cookies if using cookie-based auth
        response.set_cookie('refresh_token', str(refresh), httponly=True)
        return response

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        response = Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
        response.set_cookie('refresh_token', str(refresh), httponly=True)
        return response

class LogoutView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh") or request.COOKIES.get('refresh_token')
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            response = Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class UserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

# Model ViewSets
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavingsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SavingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Savings.objects.filter(user=self.request.user)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
