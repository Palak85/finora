from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from decimal import Decimal
from datetime import datetime

from apps.accounts.models import Account
from apps.accounts.serializers import AccountSerializer
from apps.transactions.models import Transaction
from apps.transactions.serializers import TransactionSerializer
from apps.goals.models import Goal
from apps.goals.serializers import GoalSerializer
from apps.investments.models import Investment
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.analytics.utils import (
    calculate_total_balance, calculate_monthly_income,
    calculate_monthly_expenses, calculate_savings_rate,
    calculate_net_worth, calculate_budget_usage,
    calculate_investment_returns, calculate_financial_health_score
)

User = get_user_model()


def get_admin_system_overview():
    """Aggregate system-wide stats across all non-admin users for the admin dashboard."""
    now = datetime.now()
    non_admin_users = User.objects.exclude(role='ADMINISTRATOR')

    total_balance = Account.objects.filter(
        user__in=non_admin_users, status='Active'
    ).aggregate(s=Sum('balance'))['s'] or Decimal('0.00')

    monthly_income = Transaction.objects.filter(
        user__in=non_admin_users,
        transaction_type='INCOME',
        transaction_date__month=now.month,
        transaction_date__year=now.year
    ).aggregate(s=Sum('amount'))['s'] or Decimal('0.00')

    monthly_expenses = Transaction.objects.filter(
        user__in=non_admin_users,
        transaction_type='EXPENSE',
        transaction_date__month=now.month,
        transaction_date__year=now.year
    ).aggregate(s=Sum('amount'))['s'] or Decimal('0.00')

    investment_value = Investment.objects.filter(
        user__in=non_admin_users
    ).aggregate(s=Sum('current_value'))['s'] or Decimal('0.00')

    investment_invested = Investment.objects.filter(
        user__in=non_admin_users
    ).aggregate(s=Sum('invested_amount'))['s'] or Decimal('0.00')

    profit_loss = investment_value - investment_invested
    ret_pct = round(float(profit_loss / investment_invested * 100), 2) if investment_invested > 0 else 0.0

    savings_rate = calculate_savings_rate(monthly_income, monthly_expenses)

    total_users = non_admin_users.count()
    total_accounts = Account.objects.filter(user__in=non_admin_users, status='Active').count()

    # Recent 5 transactions across all non-admin users
    recent_txns = Transaction.objects.filter(
        user__in=non_admin_users
    ).select_related('account', 'user').order_by('-transaction_date', '-created_at')[:5]

    # Active goals
    goals = Goal.objects.filter(user__in=non_admin_users).order_by('-created_at')[:6]

    return {
        'is_admin_overview': True,
        'total_users': total_users,
        'total_accounts': total_accounts,
        'total_balance': str(total_balance),
        'monthly_income': str(monthly_income),
        'monthly_expenses': str(monthly_expenses),
        'net_worth': str(total_balance + investment_value),
        'savings_rate': savings_rate,
        'budget_usage': 0.0,
        'financial_health_score': 72,
        'accounts': AccountSerializer(
            Account.objects.filter(user__in=non_admin_users, status='Active').order_by('-balance')[:8],
            many=True
        ).data,
        'recent_transactions': TransactionSerializer(recent_txns, many=True).data,
        'investment_summary': {
            'total_invested': str(investment_invested),
            'current_value': str(investment_value),
            'profit_loss': str(profit_loss),
            'return_percentage': ret_pct,
        },
        'goals': GoalSerializer(goals, many=True).data,
        'notifications': [],
    }


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Admin viewing system-wide overview (no user_id param)
        if (user.role == 'ADMINISTRATOR' or user.is_superuser):
            target_user_id = request.query_params.get('user_id')
            if not target_user_id:
                return Response({
                    'success': True,
                    'data': get_admin_system_overview()
                }, status=status.HTTP_200_OK)
            else:
                try:
                    target_user = User.objects.get(id=target_user_id)
                except User.DoesNotExist:
                    target_user = user
        elif user.role == 'FINANCIAL_ADVISOR':
            target_user_id = request.query_params.get('user_id')
            if target_user_id:
                try:
                    target_user = User.objects.get(id=target_user_id)
                except User.DoesNotExist:
                    target_user = user
            else:
                target_user = user
        else:
            target_user = user

        total_balance = calculate_total_balance(target_user)
        monthly_income = calculate_monthly_income(target_user)
        monthly_expenses = calculate_monthly_expenses(target_user)
        savings_rate = calculate_savings_rate(monthly_income, monthly_expenses)
        net_worth = calculate_net_worth(target_user)
        budget_usage = calculate_budget_usage(target_user)
        health_score = calculate_financial_health_score(target_user)
        inv_summary = calculate_investment_returns(target_user)

        accounts = Account.objects.filter(user=target_user, status='Active')
        recent_txns = Transaction.objects.filter(user=target_user).select_related('account')[:5]
        goals = Goal.objects.filter(user=target_user)
        notifications = Notification.objects.filter(user=target_user, is_read=False)[:5]

        return Response({
            'success': True,
            'data': {
                'total_balance': str(total_balance),
                'monthly_income': str(monthly_income),
                'monthly_expenses': str(monthly_expenses),
                'net_worth': str(net_worth),
                'savings_rate': savings_rate,
                'budget_usage': budget_usage,
                'financial_health_score': health_score,
                'accounts': AccountSerializer(accounts, many=True).data,
                'recent_transactions': TransactionSerializer(recent_txns, many=True).data,
                'investment_summary': inv_summary,
                'goals': GoalSerializer(goals, many=True).data,
                'notifications': NotificationSerializer(notifications, many=True).data
            }
        }, status=status.HTTP_200_OK)
