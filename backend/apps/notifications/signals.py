from decimal import Decimal
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum

from apps.notifications.models import Notification
from apps.audit.models import AuditLog
from apps.transactions.models import Transaction
from apps.accounts.models import Account
from apps.investments.models import Investment
from apps.budgets.models import Budget
from apps.goals.models import Goal


@receiver(post_save, sender=Transaction)
def handle_transaction_saved(sender, instance, created, **kwargs):
    if created:
        account_name = instance.account.account_name if instance.account else "Account"
        bank_name = instance.account.bank_name if instance.account else "Finora"

        # Determine notification content based on transaction type
        if instance.transaction_type == 'INCOME':
            title = f"💰 Income Credited: ₹{instance.amount:,.2f}"
            message = f"Received ₹{instance.amount:,.2f} for '{instance.description}' credited to {bank_name} ({account_name})."
            notif_type = 'Salary' if instance.category == 'Salary' else 'Transaction'
        elif instance.transaction_type == 'EXPENSE':
            title = f"💳 Expense Recorded: ₹{instance.amount:,.2f}"
            message = f"Spent ₹{instance.amount:,.2f} on {instance.category} ('{instance.description}') via {instance.payment_method} from {account_name}."
            notif_type = 'Transaction'
        elif instance.transaction_type == 'TRANSFER':
            title = f"🔄 Fund Transfer: ₹{instance.amount:,.2f}"
            message = f"Transferred ₹{instance.amount:,.2f} from {account_name}. Reference ID: {instance.reference_id}."
            notif_type = 'Transaction'
        elif instance.transaction_type == 'INVESTMENT':
            title = f"📈 Investment Allocation: ₹{instance.amount:,.2f}"
            message = f"Allocated ₹{instance.amount:,.2f} towards '{instance.description}' from {account_name}."
            notif_type = 'Investment'
        else:
            title = f"Transaction Recorded: ₹{instance.amount:,.2f}"
            message = f"Transaction '{instance.description}' recorded successfully."
            notif_type = 'Transaction'

        Notification.objects.create(
            user=instance.user,
            title=title,
            message=message,
            notification_type=notif_type
        )

        # High-value expense alert (>= ₹10,000)
        if instance.transaction_type == 'EXPENSE' and instance.amount >= Decimal('10000.00'):
            Notification.objects.create(
                user=instance.user,
                title=f"⚠️ High-Value Expense Alert: ₹{instance.amount:,.2f}",
                message=f"Large expense of ₹{instance.amount:,.2f} recorded on {bank_name} ({account_name}).",
                notification_type='Security'
            )

        # Budget monitoring for expenses
        if instance.transaction_type == 'EXPENSE' and instance.transaction_date:
            month = instance.transaction_date.month
            year = instance.transaction_date.year
            budget = Budget.objects.filter(
                user=instance.user,
                category=instance.category,
                month=month,
                year=year
            ).first()

            if budget and budget.monthly_limit > 0:
                total_spent = Transaction.objects.filter(
                    user=instance.user,
                    category=instance.category,
                    transaction_type='EXPENSE',
                    transaction_date__year=year,
                    transaction_date__month=month
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

                if total_spent > budget.monthly_limit:
                    Notification.objects.create(
                        user=instance.user,
                        title=f"🚨 Budget Exceeded: {instance.category}",
                        message=f"You have spent ₹{total_spent:,.2f}, surpassing your ₹{budget.monthly_limit:,.2f} limit for {instance.category}.",
                        notification_type='Budget Alert'
                    )
               
               

        # Low account balance alert
        if instance.account and instance.account.balance < Decimal('2000.00') and instance.account.account_type in ['Savings', 'Current', 'Salary']:
            Notification.objects.create(
                user=instance.user,
                title=f"⚠️ Low Balance Warning: {bank_name}",
                message=f"Available balance in {account_name} dropped to ₹{instance.account.balance:,.2f}.",
                notification_type='Security'
            )

        # Audit Log
        AuditLog.objects.create(
            user=instance.user,
            action='TRANSACTION_CREATED',
            details={
                'transaction_id': instance.id,
                'amount': str(instance.amount),
                'type': instance.transaction_type,
                'category': instance.category,
                'reference_id': instance.reference_id
            }
        )
    else:
        # Transaction updated
        AuditLog.objects.create(
            user=instance.user,
            action='TRANSACTION_UPDATED',
            details={
                'transaction_id': instance.id,
                'amount': str(instance.amount),
                'type': instance.transaction_type,
                'reference_id': instance.reference_id
            }
        )


@receiver(post_delete, sender=Transaction)
def handle_transaction_deleted(sender, instance, **kwargs):
    Notification.objects.create(
        user=instance.user,
        title="Transaction Removed",
        message=f"Transaction #{instance.reference_id} ('{instance.description}') of ₹{instance.amount:,.2f} was deleted.",
        notification_type='Transaction'
    )
    AuditLog.objects.create(
        user=instance.user,
        action='TRANSACTION_DELETED',
        details={'reference_id': instance.reference_id, 'amount': str(instance.amount)}
    )


@receiver(post_save, sender=Account)
def handle_account_saved(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title="🏦 New Account Linked",
            message=f"Linked {instance.bank_name} - {instance.account_name} ({instance.account_type}) with starting balance ₹{instance.balance:,.2f}.",
            notification_type='Account'
        )
        AuditLog.objects.create(
            user=instance.user,
            action='ACCOUNT_CREATED',
            details={'account_id': instance.id, 'name': instance.account_name, 'bank': instance.bank_name}
        )
    else:
        AuditLog.objects.create(
            user=instance.user,
            action='ACCOUNT_UPDATED',
            details={'account_id': instance.id, 'name': instance.account_name, 'balance': str(instance.balance)}
        )


@receiver(post_delete, sender=Account)
def handle_account_deleted(sender, instance, **kwargs):
    Notification.objects.create(
        user=instance.user,
        title="Account Unlinked",
        message=f"Account '{instance.account_name}' ({instance.bank_name}) was deleted from your portfolio.",
        notification_type='Account'
    )
    AuditLog.objects.create(
        user=instance.user,
        action='ACCOUNT_DELETED',
        details={'account_name': instance.account_name, 'bank': instance.bank_name}
    )


@receiver(post_save, sender=Investment)
def handle_investment_saved(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title=f"📊 Investment Added: {instance.asset_name}",
            message=f"Added {instance.quantity} units of {instance.asset_name} ({instance.asset_type}) at avg price ₹{instance.average_buy_price:,.2f}. Total invested: ₹{instance.invested_amount:,.2f}.",
            notification_type='Investment'
        )
        AuditLog.objects.create(
            user=instance.user,
            action='INVESTMENT_CREATED',
            details={'asset_name': instance.asset_name, 'invested_amount': str(instance.invested_amount)}
        )
    else:
        AuditLog.objects.create(
            user=instance.user,
            action='INVESTMENT_UPDATED',
            details={'asset_name': instance.asset_name, 'current_value': str(instance.current_value)}
        )


@receiver(post_delete, sender=Investment)
def handle_investment_deleted(sender, instance, **kwargs):
    Notification.objects.create(
        user=instance.user,
        title=f"Investment Removed: {instance.asset_name}",
        message=f"Position for {instance.asset_name} ({instance.asset_type}) was removed from your portfolio.",
        notification_type='Investment'
    )
    AuditLog.objects.create(
        user=instance.user,
        action='INVESTMENT_DELETED',
        details={'asset_name': instance.asset_name}
    )


@receiver(post_save, sender=Budget)
def handle_budget_saved(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title=f"🎯 Budget Set: {instance.category}",
            message=f"Monthly limit of ₹{instance.monthly_limit:,.2f} configured for {instance.category} ({instance.month}/{instance.year}).",
            notification_type='Budget Alert'
        )
        AuditLog.objects.create(
            user=instance.user,
            action='BUDGET_CREATED',
            details={'category': instance.category, 'limit': str(instance.monthly_limit)}
        )
    else:
        Notification.objects.create(
            user=instance.user,
            title=f"Budget Updated: {instance.category}",
            message=f"Monthly limit updated to ₹{instance.monthly_limit:,.2f} for {instance.category}.",
            notification_type='Budget Alert'
        )
        AuditLog.objects.create(
            user=instance.user,
            action='BUDGET_UPDATED',
            details={'category': instance.category, 'limit': str(instance.monthly_limit)}
        )


@receiver(post_save, sender=Goal)
def handle_goal_saved(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title=f"🎯 New Goal: {instance.name}",
            message=f"Target: ₹{instance.target_amount:,.2f} by {instance.target_date}. Start saving today!",
            notification_type='Goal'
        )
        AuditLog.objects.create(
            user=instance.user,
            action='GOAL_CREATED',
            details={'goal_name': instance.name, 'target_amount': str(instance.target_amount)}
        )
    else:
        if instance.status == 'ACHIEVED':
            Notification.objects.create(
                user=instance.user,
                title=f"🏆 Goal Achieved: {instance.name}!",
                message=f"Congratulations! You reached your savings target of ₹{instance.target_amount:,.2f} for {instance.name}.",
                notification_type='Goal'
            )
            AuditLog.objects.create(
                user=instance.user,
                action='GOAL_ACHIEVED',
                details={'goal_name': instance.name, 'target_amount': str(instance.target_amount)}
            )
        else:
            AuditLog.objects.create(
                user=instance.user,
                action='GOAL_UPDATED',
                details={'goal_name': instance.name, 'current_amount': str(instance.current_amount)}
            )
