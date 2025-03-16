from django.contrib import admin
from django.urls import path, include
from authentication.views import LoginView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from authentication.views import RegisterView  # Correct import path
from django.views.generic import TemplateView  # Import TemplateView

urlpatterns = [  
    path('api/register/', RegisterView.as_view(), name='register'),  

    path('login/', LoginView.as_view(), name='login'),  

    path('admin/', admin.site.urls),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
path('', TemplateView.as_view(template_name='frontend/index.html')),  # Serve the frontend

]
