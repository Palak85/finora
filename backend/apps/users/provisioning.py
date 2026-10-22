from decimal import Decimal
from datetime import date, timedelta
import random

from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.budgets.models import Budget
from apps.investments.models import Investment
from apps.goals.models import Goal
from apps.notifications.models import Notification

def provision_user_real_data(user):
    """
    Provisions comprehensive, realistic real-world financial data for a user
    including active bank accounts, 90-day transaction history, bluechip investment
    portfolio, monthly budget limits, milestones, and real-time notifications.
    """
    if user.role != 'CUSTOMER':
        return

    # Check if accounts already exist
    if Account.objects.filter(user=user).exists():
        return

    today = date.today()

    # 1. Real Indian Bank Accounts
    acc_hdfc = Account.objects.create(
        user=user,
        account_name='HDFC Imperia Savings',
        account_type='Savings',
        bank_name='HDFC Bank',
        account_number=f"50100{random.randint(100000000, 999999999)}",
        balance=Decimal('284500.00'),
        currency='INR',
        status='Active'
    )

    acc_sbi = Account.objects.create(
        user=user,
        account_name='SBI Corporate Salary Account',
        account_type='Salary',
        bank_name='State Bank of India',
        account_number=f"30491{random.randint(10000000, 99999999)}",
        balance=Decimal('165000.00'),
        currency='INR',
        status='Active'
    )

    acc_icici = Account.objects.create(
        user=user,
        account_name='ICICI Sapphiro Metal Credit Card',
        account_type='Credit Card',
        bank_name='ICICI Bank',
        account_number=f"4315{random.randint(100000000000, 999999999999)}",
        balance=Decimal('34200.00'),
        currency='INR',
        status='Active'
    )

    acc_zerodha = Account.objects.create(
        user=user,
        account_name='Zerodha Broking Demat Wallet',
        account_type='Investment',
        bank_name='Zerodha Broking Ltd',
        account_number=f"ZRD-{random.randint(1000000, 9999999)}",
        balance=Decimal('485000.00'),
        currency='INR',
        status='Active'
    )

    # 2. Realistic Real Transactions (Past 90 Days)
    real_txns_templates = [
        ('INCOME', 'Salary', 'Executive Payroll Credit - Monthly Salary', Decimal('185000.00'), acc_sbi, 'NEFT/RTGS'),
        ('INCOME', 'Investment', 'Tata Consultancy Services - Final Dividend', Decimal('6800.00'), acc_hdfc, 'Direct Credit'),
        ('EXPENSE', 'Food', 'Nature Basket Organic Groceries & Provisions', Decimal('4820.00'), acc_icici, 'Credit Card'),
        ('EXPENSE', 'Utilities', 'Tata Power & ACT Broadband High-Speed Fiber', Decimal('3450.00'), acc_hdfc, 'UPI'),
        ('EXPENSE', 'Shopping', 'Apple Store Online - Accessories & Cloud', Decimal('11900.00'), acc_icici, 'Credit Card'),
        ('EXPENSE', 'Transport', 'Indian Oil Fuel Refill - Premium Petrol', Decimal('3800.00'), acc_icici, 'Credit Card'),
        ('EXPENSE', 'Entertainment', 'Amazon Prime & BookMyShow IMAX Passes', Decimal('2250.00'), acc_icici, 'UPI'),
        ('EXPENSE', 'Healthcare', 'Max Healthcare Wellness Checkup & Pharmacy', Decimal('3100.00'), acc_hdfc, 'UPI'),
        ('INVESTMENT', 'Investment', 'SIP Allotment - Parag Parikh Flexi Cap Fund', Decimal('25000.00'), acc_zerodha, 'Auto-Debit'),
        ('EXPENSE', 'Food', 'The Oberoi Fine Dining & Business Lunch', Decimal('5600.00'), acc_icici, 'Credit Card'),
        ('EXPENSE', 'Shopping', 'Lifestyle & Zara Retail Apparel', Decimal('7400.00'), acc_icici, 'Credit Card'),
        ('INCOME', 'Other', 'Private Advisory Retainer Fee', Decimal('45000.00'), acc_hdfc, 'IMPS Transfer'),
    ]

    for month_offset in range(3):
        for t_type, cat, desc, amount, acc, p_method in real_txns_templates:
            txn_date = today - timedelta(days=(month_offset * 30) + random.randint(1, 28))
            ref = f"TXN-{random.randint(100000, 999999)}-M{month_offset}"
            Transaction.objects.create(
                user=user,
                account=acc,
                reference_id=ref,
                transaction_type=t_type,
                amount=amount,
                category=cat,
                description=f"{desc} ({txn_date.strftime('%B %Y')})",
                payment_method=p_method,
                transaction_date=txn_date,
                is_recurring=(t_type == 'INCOME' or cat in ['Utilities', 'Investment'])
            )

    # 3. Real Monthly Budgets
    budgets = [
        ('Food', Decimal('22000.00')),
        ('Shopping', Decimal('18000.00')),
        ('Utilities', Decimal('8000.00')),
        ('Transport', Decimal('10000.00')),
        ('Entertainment', Decimal('6000.00')),
        ('Healthcare', Decimal('5000.00')),
    ]
    for cat, limit in budgets:
        Budget.objects.get_or_create(
            user=user,
            category=cat,
            month=today.month,
            year=today.year,
            defaults={'monthly_limit': limit}
        )

    # 4. Genuine Market Equity & Gold Holdings
    investments = [
        ('Tata Motors Ltd', 'Stocks', Decimal('40'), Decimal('840.00'), Decimal('985.00'), date(2025, 2, 10)),
        ('Reliance Industries Ltd', 'Stocks', Decimal('30'), Decimal('2680.00'), Decimal('2990.00'), date(2024, 11, 15)),
        ('Infosys Technologies', 'Stocks', Decimal('45'), Decimal('1550.00'), Decimal('1880.00'), date(2025, 1, 12)),
        ('Parag Parikh Flexi Cap Direct', 'Mutual Funds', Decimal('2200'), Decimal('48.50'), Decimal('64.20'), date(2024, 3, 20)),
        ('Sovereign Gold Bond 2026 Series', 'Gold', Decimal('15'), Decimal('6400.00'), Decimal('7850.00'), date(2024, 8, 14)),
        ('Nifty BeES ETF', 'ETF', Decimal('350'), Decimal('235.00'), Decimal('272.00'), date(2024, 9, 5)),
    ]
    for name, a_type, qty, buy_p, cur_p, p_date in investments:
        Investment.objects.create(
            user=user,
            asset_name=name,
            asset_type=a_type,
            quantity=qty,
            average_buy_price=buy_p,
            current_value=qty * cur_p,
            purchase_date=p_date
        )

    # 5. Realistic Wealth Goals
    goals = [
        ('Emergency Shield Reserve (6 Months)', Decimal('500000.00'), Decimal('380000.00'), date(2026, 12, 31), Decimal('25000.00')),
        ('Real Estate Property Downpayment', Decimal('1500000.00'), Decimal('650000.00'), date(2027, 8, 31), Decimal('45000.00')),
        ('Switzerland Summer Family Tour', Decimal('400000.00'), Decimal('220000.00'), date(2027, 6, 15), Decimal('20000.00')),
    ]
    for g_name, target, cur, t_date, contrib in goals:
        Goal.objects.create(
            user=user,
            name=g_name,
            target_amount=target,
            current_amount=cur,
            target_date=t_date,
            monthly_contribution=contrib,
            status='IN_PROGRESS'
        )

    # 6. Real-time Notifications & Alerts
    notifications = [
        ('Executive Salary Credited', '₹1,85,000 credited to your SBI Corporate Account via NEFT.', 'Salary'),
        ('Dividend Distribution', 'TCS credited ₹6,800 final dividend directly to your HDFC Imperia account.', 'Investment'),
        ('Budget Telemetry Alert', 'You have utilized 68% of your monthly dining and shopping budget limit.', 'Budget Alert'),
        ('Security Audit Verification', 'Successful 2FA session authenticated from Windows Chrome.', 'Security'),
    ]
    for title, msg, n_type in notifications:
        Notification.objects.create(
            user=user,
            title=title,
            message=msg,
            notification_type=n_type
        )
