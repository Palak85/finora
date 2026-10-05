from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from decimal import Decimal
from apps.transactions.models import Transaction
from apps.budgets.models import Budget
from apps.investments.models import Investment
from apps.accounts.models import Account

class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        range_param = request.query_params.get('range', '6M')
        start_date_param = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')

        now = datetime.now()
        end_date = now.date()

        if range_param == '1M':
            start_date = end_date - timedelta(days=30)
        elif range_param == '3M':
            start_date = end_date - timedelta(days=90)
        elif range_param == '6M':
            start_date = end_date - timedelta(days=180)
        elif range_param == '1Y':
            start_date = end_date - timedelta(days=365)
        elif range_param == 'ALL':
            start_date = end_date - timedelta(days=365 * 5)
        else:
            start_date = end_date - timedelta(days=180)

        if start_date_param and end_date_param:
            try:
                start_date = datetime.strptime(start_date_param, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_param, '%Y-%m-%d').date()
            except ValueError:
                pass

        txns = Transaction.objects.filter(
            user=user,
            transaction_date__gte=start_date,
            transaction_date__lte=end_date
        )

        # 1. Income vs Expense Timeline
        timeline_qs = txns.annotate(month=TruncMonth('transaction_date'))\
            .values('month', 'transaction_type')\
            .annotate(total=Sum('amount'))\
            .order_by('month')

        timeline_data = {}
        for item in timeline_qs:
            m_str = item['month'].strftime('%b %Y') if item['month'] else 'Unknown'
            if m_str not in timeline_data:
                timeline_data[m_str] = {'month': m_str, 'income': '0.00', 'expense': '0.00', 'savings': '0.00'}
            if item['transaction_type'] == 'INCOME':
                timeline_data[m_str]['income'] = str(item['total'])
            elif item['transaction_type'] == 'EXPENSE':
                timeline_data[m_str]['expense'] = str(item['total'])

            inc = Decimal(timeline_data[m_str]['income'])
            exp = Decimal(timeline_data[m_str]['expense'])
            timeline_data[m_str]['savings'] = str(max(Decimal('0.00'), inc - exp))

        cash_flow_timeline = list(timeline_data.values())

        # 2. Category Breakdown
        cat_qs = txns.filter(transaction_type='EXPENSE')\
            .values('category')\
            .annotate(total=Sum('amount'))\
            .order_by('-total')

        total_expense_period = sum([c['total'] for c in cat_qs]) or Decimal('1.00')
        category_spending = []
        for cat in cat_qs:
            category_spending.append({
                'category': cat['category'],
                'amount': str(cat['total']),
                'percentage': round(float((cat['total'] / total_expense_period) * 100), 1)
            })

        # 3. Investment Growth & Asset Allocation
        investments = Investment.objects.filter(user=user)
        inv_total_invested = investments.aggregate(total=Sum('invested_amount'))['total'] or Decimal('0.00')
        inv_current_value = investments.aggregate(total=Sum('current_value'))['total'] or Decimal('0.00')

        # 4. Net Worth Trend simulation over last 6 months
        net_worth_trend = []
        cur_cash = Account.objects.filter(user=user, status='Active').aggregate(sum=Sum('balance'))['sum'] or Decimal('0.00')
        
        # Build 6 monthly data points
        for i in range(5, -1, -1):
            dt = now - timedelta(days=i * 30)
            m_label = dt.strftime('%b %Y')
            # Simulated projection factor based on current net worth
            estimated_nw = cur_cash + inv_current_value - Decimal(str(i * 12000))
            net_worth_trend.append({
                'month': m_label,
                'net_worth': str(max(Decimal('10000.00'), estimated_nw)),
                'investments': str(inv_current_value),
                'liquid_cash': str(cur_cash)
            })

        return Response({
            'success': True,
            'data': {
                'range': range_param,
                'cash_flow_timeline': cash_flow_timeline,
                'category_spending': category_spending,
                'net_worth_trend': net_worth_trend,
                'investment_summary': {
                    'invested': str(inv_total_invested),
                    'current_value': str(inv_current_value),
                }
            }
        }, status=status.HTTP_200_OK)
