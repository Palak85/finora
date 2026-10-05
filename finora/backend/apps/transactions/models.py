from django.db import models
from django.conf import settings
from decimal import Decimal
import uuid

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
        ('TRANSFER', 'Transfer'),
        ('INVESTMENT', 'Investment'),
    )

    CATEGORIES = (
        ('Food', 'Food & Dining'),
        ('Transport', 'Transport & Fuel'),
        ('Shopping', 'Shopping'),
        ('Utilities', 'Bills & Utilities'),
        ('Entertainment', 'Entertainment'),
        ('Healthcare', 'Healthcare'),
        ('Education', 'Education'),
        ('Bills', 'Bills'),
        ('Salary', 'Salary'),
        ('Investment', 'Investment'),
        ('Other', 'Other'),
    )

    PAYMENT_METHODS = (
        ('UPI', 'UPI'),
        ('Debit Card', 'Debit Card'),
        ('Credit Card', 'Credit Card'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Cash', 'Cash'),
        ('Net Banking', 'Net Banking'),
        ('Other', 'Other'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    account = models.ForeignKey(
        'accounts.Account',
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    description = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHODS, default='UPI')
    transaction_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    reference_id = models.CharField(max_length=64, unique=True, db_index=True)
    is_recurring = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-transaction_date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'transaction_date']),
            models.Index(fields=['account', 'transaction_date']),
            models.Index(fields=['category']),
            models.Index(fields=['transaction_type']),
        ]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if not self.reference_id:
            self.reference_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

        super().save(*args, **kwargs)

        # Update account balance for new transactions
        if is_new and self.account:
            if self.transaction_type == 'INCOME':
                self.account.balance += Decimal(str(self.amount))
            elif self.transaction_type in ['EXPENSE', 'INVESTMENT']:
                self.account.balance -= Decimal(str(self.amount))
            elif self.transaction_type == 'TRANSFER':
                self.account.balance -= Decimal(str(self.amount))
            self.account.save()

    def __str__(self):
        return f"{self.transaction_type} ₹{self.amount} - {self.description} ({self.transaction_date})"
