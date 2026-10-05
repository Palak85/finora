from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from apps.accounts.models import Account
from apps.accounts.serializers import AccountSerializer
from apps.transactions.models import Transaction
from apps.transactions.serializers import TransactionSerializer
from apps.goals.models import Goal
from apps.goals.serializers import GoalSerializer
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.analytics.utils import (
    calculate_total_balance, calculate_monthly_income,
    calculate_monthly_expenses, calculate_savings_rate,
    calculate_net_worth, calculate_budget_usage,
    calculate_investment_returns, calculate_financial_health_score
)

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Determine target user if advisor/admin query_param is provided
        target_user = user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            target_user_id = request.query_params.get('user_id')
            if target_user_id:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                try:
                    target_user = User.objects.get(id=target_user_id)
                except User.DoesNotExist:
                    pass

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
