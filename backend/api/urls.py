from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CategoryViewSet, IncomeViewSet, ExpenseViewSet,
    SavingsViewSet, BudgetViewSet, GoalViewSet
)
from .auth_views import (
    RegisterAPIView, LoginAPIView, LogoutAPIView, UserAPIView
)
from .signup_view import signup_view

# Router for ViewSets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'income', IncomeViewSet, basename='income')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'savings', SavingsViewSet, basename='savings')

# URL patterns
urlpatterns = [
    path("", include(router.urls)),  # ViewSets for models
    path("register/", signup_view, name="register"),  # Use our explicit function-based view for registration
    path("signup/", signup_view, name="signup"),      # Alternative endpoint that also uses the same view
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("user/", UserAPIView.as_view(), name="user"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
