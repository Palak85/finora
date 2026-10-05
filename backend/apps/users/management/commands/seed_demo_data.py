from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date, timedelta
import random

from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.budgets.models import Budget
from apps.investments.models import Investment
from apps.goals.models import Goal
from apps.notifications.models import Notification
from apps.audit.models import AuditLog

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial realistic demo data for Finora application'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting demo data seed process...'))

        # 1. Create Users
        customer, created = User.objects.get_or_create(
            email='customer@finora.com',
            defaults={
                'full_name': 'Alex Mercer',
                'role': 'CUSTOMER',
                'phone': '+91 98765 43210',
                'is_verified': True,
                'is_active': True,
            }
        )
        if created:
            customer.set_password('Password123!')
            customer.save()
            self.stdout.write(self.style.SUCCESS('Created Customer: customer@finora.com / Password123!'))

        advisor, created = User.objects.get_or_create(
            email='advisor@finora.com',
            defaults={
                'full_name': 'Sarah Jenkins (Wealth Advisor)',
                'role': 'FINANCIAL_ADVISOR',
                'phone': '+91 98765 11111',
                'is_verified': True,
                'is_active': True,
            }
        )
        if created:
            advisor.set_password('Password123!')
            advisor.save()
            self.stdout.write(self.style.SUCCESS('Created Advisor: advisor@finora.com / Password123!'))

        admin, created = User.objects.get_or_create(
            email='admin@finora.com',
            defaults={
                'full_name': 'System Administrator',
                'role': 'ADMINISTRATOR',
                'phone': '+91 98765 99999',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
                'is_active': True,
            }
        )
        if created:
            admin.set_password('Password123!')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created Admin: admin@finora.com / Password123!'))

        # 2. Create Accounts for Customer
        acc_savings, _ = Account.objects.get_or_create(
            user=customer,
            account_name='HDFC Imperia Savings',
            defaults={
                'account_type': 'Savings',
                'bank_name': 'HDFC Bank',
                'account_number': '50100234918234',
                'balance': Decimal('145800.00'),
                'currency': 'INR',
                'status': 'Active'
            }
        )

        acc_salary, _ = Account.objects.get_or_create(
            user=customer,
            account_name='SBI Salary Preferred',
            defaults={
                'account_type': 'Salary',
                'bank_name': 'State Bank of India',
                'account_number': '3049102938411',
                'balance': Decimal('98250.00'),
                'currency': 'INR',
                'status': 'Active'
            }
        )

        acc_cc, _ = Account.objects.get_or_create(
            user=customer,
            account_name='ICICI Sapphiro Credit Card',
            defaults={
                'account_type': 'Credit Card',
                'bank_name': 'ICICI Bank',
                'account_number': '4312891029384892',
                'balance': Decimal('28400.00'),
                'currency': 'INR',
                'status': 'Active'
            }
        )

        acc_inv, _ = Account.objects.get_or_create(
            user=customer,
            account_name='Zerodha Equity Wallet',
            defaults={
                'account_type': 'Investment',
                'bank_name': 'Zerodha Broking',
                'account_number': 'ZRD-91827364',
                'balance': Decimal('325000.00'),
                'currency': 'INR',
                'status': 'Active'
            }
        )

        # 3. Create Transactions across past 90 days
        today = date.today()
        sample_txns = [
            ('INCOME', 'Salary', 'Monthly Tech Corp Salary', Decimal('125000.00'), acc_salary, 'Bank Transfer', 'Salary'),
            ('INCOME', 'Investment', 'Dividend Payout - Reliance', Decimal('4500.00'), acc_savings, 'Net Banking', 'Investment'),
            ('EXPENSE', 'Food', 'Organic Grocery Shopping', Decimal('3420.00'), acc_cc, 'Credit Card', 'Food'),
            ('EXPENSE', 'Utilities', 'Electricity & Wi-Fi Bill', Decimal('2850.00'), acc_savings, 'UPI', 'Utilities'),
            ('EXPENSE', 'Shopping', 'Amazon Electronics & Accessories', Decimal('8490.00'), acc_cc, 'Credit Card', 'Shopping'),
            ('EXPENSE', 'Transport', 'Shell Fuel Refill', Decimal('2500.00'), acc_cc, 'Credit Card', 'Transport'),
            ('EXPENSE', 'Entertainment', 'Netflix & Spotify Annual Subscriptions', Decimal('1499.00'), acc_cc, 'UPI', 'Entertainment'),
            ('EXPENSE', 'Healthcare', 'Apollo Pharmacy Medicines', Decimal('1200.00'), acc_savings, 'UPI', 'Healthcare'),
            ('INVESTMENT', 'Investment', 'SIP Purchase - Parag Parikh Flexi Cap', Decimal('15000.00'), acc_inv, 'Bank Transfer', 'Investment'),
            ('EXPENSE', 'Food', 'Dinner at Golden Dragon Restaurant', Decimal('2600.00'), acc_cc, 'Credit Card', 'Food'),
            ('EXPENSE', 'Shopping', 'Zara Clothing Haul', Decimal('6200.00'), acc_cc, 'Credit Card', 'Shopping'),
            ('INCOME', 'Other', 'Freelance Design Retainer', Decimal('25000.00'), acc_savings, 'UPI', 'Other'),
        ]

        # Seed multiple transactions for past 3 months
        for month_offset in range(3):
            for t_type, cat, desc, amount, acc, p_method, orig_cat in sample_txns:
                txn_d = today - timedelta(days=(month_offset * 30) + random.randint(1, 28))
                ref = f"TXN-{random.randint(100000, 999999)}-{month_offset}"
                Transaction.objects.get_or_create(
                    reference_id=ref,
                    defaults={
                        'user': customer,
                        'account': acc,
                        'transaction_type': t_type,
                        'amount': amount,
                        'category': cat,
                        'description': f"{desc} ({txn_d.strftime('%b')})",
                        'payment_method': p_method,
                        'transaction_date': txn_d,
                        'is_recurring': (t_type == 'INCOME' or cat in ['Utilities', 'Investment'])
                    }
                )

        # 4. Create Budgets
        budgets_data = [
            ('Food', Decimal('15000.00')),
            ('Shopping', Decimal('12000.00')),
            ('Utilities', Decimal('5000.00')),
            ('Transport', Decimal('6000.00')),
            ('Entertainment', Decimal('4000.00')),
        ]
        for cat, limit in budgets_data:
            Budget.objects.get_or_create(
                user=customer,
                category=cat,
                month=today.month,
                year=today.year,
                defaults={'monthly_limit': limit}
            )

        # 5. Create Investments
        investments_data = [
            ('Reliance Industries Ltd', 'Stocks', Decimal('25'), Decimal('2420.00'), Decimal('2780.00'), date(2025, 3, 15)),
            ('TCS Limited', 'Stocks', Decimal('15'), Decimal('3500.00'), Decimal('3920.00'), date(2025, 4, 10)),
            ('Parag Parikh Flexi Cap Fund', 'Mutual Funds', Decimal('1500'), Decimal('45.00'), Decimal('58.20'), date(2024, 1, 10)),
            ('Sovereign Gold Bond 2025', 'Gold', Decimal('10'), Decimal('6200.00'), Decimal('7450.00'), date(2024, 8, 20)),
            ('Nifty 50 ETF', 'ETF', Decimal('200'), Decimal('220.00'), Decimal('254.00'), date(2024, 11, 5)),
        ]
        for name, a_type, qty, buy_p, cur_p, p_date in investments_data:
            Investment.objects.get_or_create(
                user=customer,
                asset_name=name,
                defaults={
                    'asset_type': a_type,
                    'quantity': qty,
                    'average_buy_price': buy_p,
                    'current_value': qty * cur_p,
                    'purchase_date': p_date
                }
            )

        # 6. Create Goals
        goals_data = [
            ('Emergency Shield Fund', Decimal('300000.00'), Decimal('225000.00'), date(2026, 12, 31), Decimal('15000.00')),
            ('Tesla Model Y Downpayment', Decimal('800000.00'), Decimal('340000.00'), date(2027, 6, 30), Decimal('25000.00')),
            ('European Vacation 2027', Decimal('250000.00'), Decimal('120000.00'), date(2027, 9, 15), Decimal('10000.00')),
        ]
        for g_name, target, cur, t_date, contrib in goals_data:
            Goal.objects.get_or_create(
                user=customer,
                name=g_name,
                defaults={
                    'target_amount': target,
                    'current_amount': cur,
                    'target_date': t_date,
                    'monthly_contribution': contrib,
                    'status': 'IN_PROGRESS'
                }
            )

        # 7. Create Notifications
        notifs = [
            ('Budget Alert: Food & Dining', 'You have reached 78% of your monthly food budget limit.', 'Budget Alert'),
            ('Salary Credited', '₹1,25,000 credited to your SBI Salary Account.', 'Salary'),
            ('Investment Dividend Payout', 'Reliance Industries credited ₹4,500 dividend to your savings account.', 'Investment'),
            ('Security Alert', 'Successful login detected from macOS Chrome in New Delhi.', 'Security'),
        ]
        for title, msg, n_type in notifs:
            Notification.objects.get_or_create(
                user=customer,
                title=title,
                defaults={'message': msg, 'notification_type': n_type}
            )

        # 8. Audit Log
        AuditLog.objects.create(
            user=admin,
            action='SEED_DEMO_DATA',
            ip_address='127.0.0.1',
            details={'message': 'Initial system demo data generated successfully.'}
        )

        self.stdout.write(self.style.SUCCESS('Finora demo data seeded successfully!'))
