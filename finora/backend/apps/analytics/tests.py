from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date
from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.budgets.models import Budget
from apps.investments.models import Investment
from apps.analytics.utils import (
    calculate_total_balance, calculate_monthly_income,
    calculate_monthly_expenses, calculate_savings_rate,
    calculate_financial_health_score
)

User = get_user_model()

class FinancialCalculationsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='calc@finora.com',
            full_name='Calc User',
            password='Password123!'
        )
        self.account = Account.objects.create(
            user=self.user,
            account_name='Primary Savings',
            account_type='Savings',
            balance=Decimal('50000.00')
        )

    def test_total_balance(self):
        balance = calculate_total_balance(self.user)
        self.assertEqual(balance, Decimal('50000.00'))

    def test_income_expense_calculations(self):
        today = date.today()
        # Add Income
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            transaction_type='INCOME',
            amount=Decimal('10000.00'),
            category='Salary',
            description='Monthly Salary',
            transaction_date=today
        )
        # Add Expense
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            transaction_type='EXPENSE',
            amount=Decimal('4000.00'),
            category='Food',
            description='Groceries',
            transaction_date=today
        )

        income = calculate_monthly_income(self.user)
        expenses = calculate_monthly_expenses(self.user)
        savings_rate = calculate_savings_rate(income, expenses)

        self.assertEqual(income, Decimal('10000.00'))
        self.assertEqual(expenses, Decimal('4000.00'))
        self.assertEqual(savings_rate, 60.0)

    def test_financial_health_score(self):
        score = calculate_financial_health_score(self.user)
        self.assertTrue(0 <= score <= 100)
