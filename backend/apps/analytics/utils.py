from decimal import Decimal
from django.db.models import Sum
from datetime import datetime
from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.budgets.models import Budget
from apps.investments.models import Investment
from apps.goals.models import Goal

def calculate_total_balance(user):
    total = Account.objects.filter(user=user, status='Active').aggregate(sum=Sum('balance'))['sum']
    return total or Decimal('0.00')

def calculate_monthly_income(user, month=None, year=None):
    now = datetime.now()
    month = month or now.month
    year = year or now.year
    total = Transaction.objects.filter(
        user=user,
        transaction_type='INCOME',
        transaction_date__month=month,
        transaction_date__year=year
    ).aggregate(sum=Sum('amount'))['sum']
    return total or Decimal('0.00')

def calculate_monthly_expenses(user, month=None, year=None):
    now = datetime.now()
    month = month or now.month
    year = year or now.year
    total = Transaction.objects.filter(
        user=user,
        transaction_type='EXPENSE',
        transaction_date__month=month,
        transaction_date__year=year
    ).aggregate(sum=Sum('amount'))['sum']
    return total or Decimal('0.00')

def calculate_savings_rate(monthly_income, monthly_expenses):
    inc = Decimal(str(monthly_income))
    exp = Decimal(str(monthly_expenses))
    if inc <= Decimal('0.00'):
        return 0.0
    savings = inc - exp
    rate = (savings / inc) * Decimal('100.0')
    return round(float(max(Decimal('0.00'), rate)), 1)

def calculate_net_worth(user):
    total_cash = calculate_total_balance(user)
    investment_val = Investment.objects.filter(user=user).aggregate(sum=Sum('current_value'))['sum'] or Decimal('0.00')
    
    # Subtract credit card / debt balance
    debt = Account.objects.filter(user=user, account_type='Credit Card', status='Active').aggregate(sum=Sum('balance'))['sum'] or Decimal('0.00')
    
    net_worth = (total_cash + investment_val) - abs(debt)
    return net_worth

def calculate_budget_usage(user, month=None, year=None):
    now = datetime.now()
    month = month or now.month
    year = year or now.year
    budgets = Budget.objects.filter(user=user, month=month, year=year)
    
    total_limit = budgets.aggregate(sum=Sum('monthly_limit'))['sum'] or Decimal('0.00')
    if total_limit <= Decimal('0.00'):
        return 0.0

    total_spent = Decimal('0.00')
    for b in budgets:
        spent = Transaction.objects.filter(
            user=user,
            category__iexact=b.category,
            transaction_type='EXPENSE',
            transaction_date__month=month,
            transaction_date__year=year
        ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        total_spent += spent

    usage_pct = (total_spent / total_limit) * Decimal('100.0')
    return round(float(usage_pct), 1)

def calculate_investment_returns(user):
    investments = Investment.objects.filter(user=user)
    invested = investments.aggregate(sum=Sum('invested_amount'))['sum'] or Decimal('0.00')
    current = investments.aggregate(sum=Sum('current_value'))['sum'] or Decimal('0.00')
    profit_loss = current - invested
    ret_pct = (profit_loss / invested * Decimal('100.0')) if invested > 0 else Decimal('0.00')
    return {
        'total_invested': str(invested),
        'current_value': str(current),
        'profit_loss': str(profit_loss),
        'return_percentage': round(float(ret_pct), 2)
    }

def calculate_goal_progress(user):
    goals = Goal.objects.filter(user=user)
    total_target = goals.aggregate(sum=Sum('target_amount'))['sum'] or Decimal('0.00')
    total_current = goals.aggregate(sum=Sum('current_amount'))['sum'] or Decimal('0.00')
    pct = (total_current / total_target * Decimal('100.0')) if total_target > 0 else Decimal('0.00')
    return round(float(pct), 1)

def calculate_financial_health_score(user):
    """
    Computes financial health score (0 to 100) based on:
    - Savings rate (weight: 35%)
    - Budget adherence (weight: 25%)
    - Investment diversification (weight: 20%)
    - Debt-to-Asset ratio (weight: 20%)
    """
    income = calculate_monthly_income(user)
    expenses = calculate_monthly_expenses(user)
    savings_rate = calculate_savings_rate(income, expenses)
    budget_usage = calculate_budget_usage(user)

    # 1. Savings score (0-35)
    savings_score = min(35.0, (savings_rate / 30.0) * 35.0)

    # 2. Budget score (0-25)
    if budget_usage <= 80:
        budget_score = 25.0
    elif budget_usage <= 100:
        budget_score = 25.0 - ((budget_usage - 80) * 1.0)
    else:
        budget_score = max(0.0, 25.0 - ((budget_usage - 100) * 2.5))

    # 3. Investment score (0-20)
    inv_count = Investment.objects.filter(user=user).values('asset_type').distinct().count()
    inv_score = min(20.0, inv_count * 5.0)

    # 4. Emergency / Cash buffer score (0-20)
    cash = calculate_total_balance(user)
    months_covered = float(cash / expenses) if expenses > 0 else 6.0
    cash_score = min(20.0, (months_covered / 6.0) * 20.0)

    total_score = int(round(savings_score + budget_score + inv_score + cash_score))
    return max(0, min(100, total_score))
