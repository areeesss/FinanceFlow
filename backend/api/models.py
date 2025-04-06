from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.dispatch import receiver
from django.db.models import Sum
from django.utils import timezone
from django.conf import settings


class CustomUser(AbstractUser):
    full_name = models.CharField(max_length=255)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)

    first_name = None 
    last_name = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']

    def __str__(self):
        return self.full_name

class Category(models.Model):
    INCOME = 'IN'
    EXPENSE = 'EX'
    CATEGORY_TYPES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]
    
    name = models.CharField(max_length=100)
    cat_type = models.CharField(max_length=2, choices=CATEGORY_TYPES)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.get_cat_type_display()}: {self.name}"

class Income(models.Model):
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=timezone.now)  # Added default
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name}: ${self.amount}"

class Expense(models.Model):
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=timezone.now)  # Added default
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name}: ${self.amount}"
    
class Savings(models.Model):
    total = models.IntegerField(default=0)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def calculate_total(self):
        total_income = Income.objects.filter(user=self.user).aggregate(Sum('amount'))['amount__sum'] or 0
        total_expense = Expense.objects.filter(user=self.user).aggregate(Sum('amount'))['amount__sum'] or 0
        self.total = total_income - total_expense
        self.save()

    def __str__(self):
        return f"Savings for {self.user.username}"

class Budget(models.Model):
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    start_date = models.DateField(default=timezone.now)  # Changed
    end_date = models.DateField()
    description = models.TextField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    period = models.CharField(max_length=10, choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')], default='monthly')

    def __str__(self):
        return f"{self.name} (${self.current_amount}/${self.target_amount})"

class BudgetItem(models.Model):
    budget = models.ForeignKey(Budget, related_name='items', on_delete=models.CASCADE)
    category = models.CharField(max_length=100)
    planned = models.DecimalField(max_digits=10, decimal_places=2)
    actual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    color = models.CharField(max_length=20, blank=True, null=True)  # For storing color code

    @property
    def remaining(self):
        return self.planned - self.actual
    
    @property
    def progress(self):
        if self.planned <= 0:
            return 0
        return min(100, (self.actual / self.planned) * 100)

    def __str__(self):
        return f"{self.category} (${self.actual}/${self.planned})"

class Goal(models.Model):
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField()
    description = models.TextField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    @property
    def progress(self):
        return (self.current_amount / self.target_amount) * 100 if self.target_amount else 0

    def __str__(self):
        return f"{self.name} ({self.progress:.0f}%)"