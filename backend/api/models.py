from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    CAT_TYPE_CHOICES = [
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    ]
    name = models.CharField(max_length=255)
    cat_type = models.CharField(max_length=10, choices=CAT_TYPE_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Income(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    amount = models.IntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Expense(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    amount = models.IntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Savings(models.Model):
    total = models.IntegerField()
    income = models.ForeignKey(Income, on_delete=models.CASCADE)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Savings {self.id}"

class Transaction(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Budget(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class RecurringPayment(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    amount = models.IntegerField()
    frequency = models.CharField(max_length=50)
    next_date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Debt(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    amount = models.IntegerField()
    due_date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name