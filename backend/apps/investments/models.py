from django.db import models
from django.conf import settings
from decimal import Decimal

class Investment(models.Model):
    ASSET_TYPES = (
        ('Stocks', 'Stocks'),
        ('Mutual Funds', 'Mutual Funds'),
        ('Gold', 'Gold'),
        ('Fixed Deposits', 'Fixed Deposits'),
        ('Cryptocurrency', 'Cryptocurrency'),
        ('ETF', 'ETF'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='investments'
    )
    asset_name = models.CharField(max_length=150)
    asset_type = models.CharField(max_length=50, choices=ASSET_TYPES)
    quantity = models.DecimalField(max_digits=14, decimal_places=4)
    average_buy_price = models.DecimalField(max_digits=14, decimal_places=2)
    invested_amount = models.DecimalField(max_digits=14, decimal_places=2)
    current_value = models.DecimalField(max_digits=14, decimal_places=2)
    profit_loss = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    profit_loss_percentage = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    purchase_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'investments'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Auto calculate invested_amount, profit_loss, and percentage
        qty = Decimal(str(self.quantity))
        buy_p = Decimal(str(self.average_buy_price))
        self.invested_amount = qty * buy_p
        
        cur_v = Decimal(str(self.current_value))
        self.profit_loss = cur_v - self.invested_amount
        
        if self.invested_amount > 0:
            self.profit_loss_percentage = (self.profit_loss / self.invested_amount) * Decimal('100.0')
        else:
            self.profit_loss_percentage = Decimal('0.00')

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.asset_name} ({self.asset_type}) - ₹{self.current_value}"
