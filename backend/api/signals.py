import logging
import traceback
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from .models import CustomUser, Category, Budget, Goal, Savings, Income, Expense

# Set up logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=CustomUser)
def create_default_data(sender, instance, created, **kwargs):
    if created:
        try:
            logger.info(f"Creating default financial data for user: {instance.username}")

            # ✅ Create default categories
            income_category, _ = Category.objects.get_or_create(name="Salary", cat_type="IN", user=instance)
            expense_category, _ = Category.objects.get_or_create(name="Rent", cat_type="EX", user=instance)

            logger.info(f"Default categories created successfully for {instance.username}")

            # ✅ Create default income
            default_income = Income.objects.create(
                user=instance,
                name="Starting Salary",
                amount=5000,  # Example default income
                category=income_category,
                description="Initial funds upon account creation"
            )
            logger.info(f"Default income created: {default_income}")

            # ✅ Create default expense
            default_expense = Expense.objects.create(
                user=instance,
                name="Initial Expenses",
                amount=2000,  # Example default expense
                category=expense_category,
                description="Basic initial expenses"
            )
            logger.info(f"Default expense created: {default_expense}")

            # ✅ Create savings record (automatically calculated)
            savings = Savings.objects.create(user=instance)
            savings.calculate_total()  # Update savings based on default income & expense
            logger.info(f"Savings record created successfully for {instance.username}")

            # ✅ Create default budget
            budget = Budget.objects.create(
                user=instance,
                name="Monthly Budget",
                description="Default monthly budget",
                target_amount=3000,
                current_amount=0,
                start_date=now(),
                end_date=now().replace(day=28),
            )
            logger.info(f"Default budget created successfully for {instance.username}")

            # ✅ Create default financial goal
            goal = Goal.objects.create(
                user=instance,
                name="Emergency Fund",
                description="Save for emergencies",
                target_amount=5000,
                current_amount=0,
                deadline=now().replace(year=now().year + 1),
            )
            logger.info(f"Default financial goal created successfully for {instance.username}")

        except Exception as e:
            logger.error(f"Error creating default data for user {instance.username}: {e}")
            logger.error(traceback.format_exc())  # Logs full error traceback for debugging
