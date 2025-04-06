import logging
import traceback
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta
from decimal import Decimal
from .models import CustomUser, Category, Budget, Goal, Savings, Income, Expense, BudgetItem

# Set up logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=CustomUser)
def create_default_data(sender, instance, created, **kwargs):
    if created:
        try:
            logger.info(f"Creating default financial data for user: {instance.username}")
            today = now().date()

            # Create default categories
            income_categories = [
                Category.objects.get_or_create(name="Salary", cat_type="IN", user=instance)[0],
                Category.objects.get_or_create(name="Freelance", cat_type="IN", user=instance)[0],
                Category.objects.get_or_create(name="Investments", cat_type="IN", user=instance)[0]
            ]

            expense_categories = [
                Category.objects.get_or_create(name="Housing", cat_type="EX", user=instance)[0],
                Category.objects.get_or_create(name="Food", cat_type="EX", user=instance)[0],
                Category.objects.get_or_create(name="Transportation", cat_type="EX", user=instance)[0],
                Category.objects.get_or_create(name="Entertainment", cat_type="EX", user=instance)[0],
                Category.objects.get_or_create(name="Utilities", cat_type="EX", user=instance)[0]
            ]

            logger.info(f"Default categories created successfully for {instance.username}")

            # Create 3 default income sources with a variety of colors from the color selector
            income_data = [
                {
                    "name": "Monthly Salary", 
                    "amount": 5000, 
                    "description": "Regular employment income",
                    "category": income_categories[0],
                    "color": "#3B82F6"  # Blue
                },
                {
                    "name": "Freelance Work", 
                    "amount": 1500, 
                    "description": "Side projects and freelance gigs",
                    "category": income_categories[1],
                    "color": "#8B5CF6"  # Purple
                },
                {
                    "name": "Investment Returns", 
                    "amount": 500, 
                    "description": "Dividends and investment returns",
                    "category": income_categories[2],
                    "color": "#10B981"  # Green
                }
            ]
            
            # Create income sources and save colors to localStorage format
            income_colors = {}
            
            for data in income_data:
                income_item = Income.objects.create(
                    user=instance,
                    name=data["name"],
                    amount=data["amount"],
                    date=today,
                    category=data["category"],
                    description=data["description"]
                )
                # Store color for frontend localStorage
                income_colors[str(income_item.id)] = data["color"]
            
            # Save income colors to a file that will be read by the frontend on first load
            try:
                with open(f'/tmp/income_colors_{instance.id}.json', 'w') as f:
                    import json
                    json.dump(income_colors, f)
                logger.info(f"Saved income colors to file for user {instance.username}")
            except Exception as e:
                logger.error(f"Failed to save income colors: {e}")
            
            logger.info(f"Default income sources created for {instance.username}")

            # Create 3 default expense sources with a variety of colors from the color selector
            expense_data = [
                {
                    "name": "Rent/Mortgage", 
                    "amount": 2000, 
                    "description": "Monthly housing payment",
                    "category": expense_categories[0],
                    "color": "#EF4444"  # Red
                },
                {
                    "name": "Groceries", 
                    "amount": 500, 
                    "description": "Food and household supplies",
                    "category": expense_categories[1],
                    "color": "#F59E0B"  # Amber/Orange
                },
                {
                    "name": "Transportation", 
                    "amount": 300, 
                    "description": "Gas, car payment, or public transit",
                    "category": expense_categories[2],
                    "color": "#6366F1"  # Indigo
                }
            ]
            
            # Create expense sources and save colors to localStorage format
            expense_colors = {}
            
            for data in expense_data:
                expense_item = Expense.objects.create(
                    user=instance,
                    name=data["name"],
                    amount=data["amount"],
                    date=today,
                    category=data["category"],
                    description=data["description"]
                )
                # Store color for frontend localStorage
                expense_colors[str(expense_item.id)] = data["color"]
            
            # Save expense colors to a file that will be read by the frontend on first load
            try:
                with open(f'/tmp/expense_colors_{instance.id}.json', 'w') as f:
                    import json
                    json.dump(expense_colors, f)
                logger.info(f"Saved expense colors to file for user {instance.username}")
            except Exception as e:
                logger.error(f"Failed to save expense colors: {e}")
            
            logger.info(f"Default expense sources created for {instance.username}")

            # Create default emergency fund goal
            emergency_fund = Goal.objects.create(
                user=instance,
                name="Emergency Fund",
                target_amount=10000,
                current_amount=1000,
                deadline=today + timedelta(days=30),  # One month deadline
                description="Fund for unexpected expenses and emergencies"
            )
            
            logger.info(f"Default emergency fund goal created for {instance.username}")

            # Create default budgets (daily, weekly, monthly)
            # Daily budget
            daily_budget = Budget.objects.create(
                user=instance,
                name="Default Daily Budget",
                target_amount=100,
                current_amount=0,
                start_date=today,
                end_date=today + timedelta(days=1),
                description="Daily spending plan",
                period="daily"
            )
            
            # Create daily budget items with nice colors
            daily_items = [
                {"category": "Food", "planned": 30, "actual": 0, "color": "#F59E0B"},  # Amber/Orange
                {"category": "Transportation", "planned": 20, "actual": 0, "color": "#10B981"},  # Green
                {"category": "Entertainment", "planned": 10, "actual": 0, "color": "#8B5CF6"}  # Purple
            ]
            
            for item in daily_items:
                BudgetItem.objects.create(
                    budget=daily_budget,
                    category=item["category"],
                    planned=item["planned"],
                    actual=item["actual"],
                    color=item["color"]
                )
            
            # Weekly budget
            weekly_budget = Budget.objects.create(
                user=instance,
                name="Default Weekly Budget",
                target_amount=700,
                current_amount=0,
                start_date=today,
                end_date=today + timedelta(days=7),
                description="Weekly spending plan",
                period="weekly"
            )
            
            # Create weekly budget items with nice colors
            weekly_items = [
                {"category": "Groceries", "planned": 200, "actual": 0, "color": "#F59E0B"},  # Amber/Orange
                {"category": "Transportation", "planned": 100, "actual": 0, "color": "#10B981"},  # Green
                {"category": "Entertainment", "planned": 150, "actual": 0, "color": "#8B5CF6"},  # Purple
                {"category": "Dining Out", "planned": 100, "actual": 0, "color": "#EF4444"},  # Red
                {"category": "Miscellaneous", "planned": 150, "actual": 0, "color": "#3B82F6"}  # Blue
            ]
            
            for item in weekly_items:
                BudgetItem.objects.create(
                    budget=weekly_budget,
                    category=item["category"],
                    planned=item["planned"],
                    actual=item["actual"],
                    color=item["color"]
                )
            
            # Monthly budget
            monthly_budget = Budget.objects.create(
                user=instance,
                name="Default Monthly Budget",
                target_amount=3000,
                current_amount=0,
                start_date=today,
                end_date=today + timedelta(days=30),
                description="Monthly spending plan",
                period="monthly"
            )
            
            # Create monthly budget items with nice colors
            monthly_items = [
                {"category": "Housing", "planned": 1200, "actual": 0, "color": "#3B82F6"},  # Blue
                {"category": "Groceries", "planned": 600, "actual": 0, "color": "#F59E0B"},  # Amber/Orange
                {"category": "Transportation", "planned": 300, "actual": 0, "color": "#10B981"},  # Green
                {"category": "Entertainment", "planned": 200, "actual": 0, "color": "#8B5CF6"},  # Purple
                {"category": "Utilities", "planned": 350, "actual": 0, "color": "#EF4444"},  # Red
                {"category": "Savings", "planned": 350, "actual": 0, "color": "#6366F1"}  # Indigo
            ]
            
            for item in monthly_items:
                BudgetItem.objects.create(
                    budget=monthly_budget,
                    category=item["category"],
                    planned=item["planned"],
                    actual=item["actual"],
                    color=item["color"]
                )
                
            logger.info(f"Default budgets created for {instance.username}")

            # Create savings record (automatically calculated based on income and expenses)
            savings = Savings.objects.create(user=instance)
            savings.calculate_total()
            
            logger.info(f"Complete default financial data created for {instance.username}")
            
        except Exception as e:
            logger.error(f"Error creating default data for {instance.username}: {e}")
            logger.error(traceback.format_exc())
