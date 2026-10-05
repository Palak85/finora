from django.db import models
from django.conf import settings
import random

class Account(models.Model):
    ACCOUNT_TYPES = (
        ('Savings', 'Savings Account'),
        ('Current', 'Current Account'),
        ('Salary', 'Salary Account'),
        ('Credit Card', 'Credit Card'),
        ('Investment', 'Investment Account'),
    )

    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Blocked', 'Blocked'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='accounts'
    )
    account_name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=30, choices=ACCOUNT_TYPES, default='Savings')
    account_number = models.CharField(max_length=34)
    masked_account_number = models.CharField(max_length=34, blank=True)
    bank_name = models.CharField(max_length=100, default='Finora Bank')
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['account_type']),
        ]

    def save(self, *args, **kwargs):
        if not self.account_number:
            # Generate realistic 12-digit random account number if not provided
            self.account_number = "".join([str(random.randint(0, 9)) for _ in range(12)])
        
        # Always calculate masked account number (e.g., "•••• •••• 4892")
        raw_clean = str(self.account_number).replace(' ', '').replace('-', '')
        last_4 = raw_clean[-4:] if len(raw_clean) >= 4 else raw_clean
        self.masked_account_number = f"•••• •••• {last_4}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.account_name} ({self.masked_account_number}) - ₹{self.balance}"
