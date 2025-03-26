from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # Remove 'first_name' and 'last_name' from fieldsets
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Personal Info'), {'fields': ('full_name',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    # Remove 'first_name' and 'last_name' from add_fieldsets
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'full_name', 'password1', 'password2'),
        }),
    )

    list_display = ('email', 'username', 'full_name', 'is_staff')
    search_fields = ('email', 'username', 'full_name')
    ordering = ('email',)

# Register the custom admin
admin.site.register(CustomUser, CustomUserAdmin)
