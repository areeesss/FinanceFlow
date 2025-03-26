from django.contrib import admin
from django.urls import path, include
from api.views import root_view

urlpatterns = [
    path('', root_view, name='home'),
    path('api/', include('api.urls')),
    path('admin/', admin.site.urls),
]
