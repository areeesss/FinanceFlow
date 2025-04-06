# Generated by Django 5.1.7 on 2025-04-06 09:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='budget',
            name='period',
            field=models.CharField(choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')], default='monthly', max_length=10),
        ),
        migrations.CreateModel(
            name='BudgetItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(max_length=100)),
                ('planned', models.DecimalField(decimal_places=2, max_digits=10)),
                ('actual', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('color', models.CharField(blank=True, max_length=20, null=True)),
                ('budget', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.budget')),
            ],
        ),
    ]
