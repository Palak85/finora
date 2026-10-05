from django.db import models
from django.conf import settings
from decimal import Decimal

class Budget(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    category = models.CharField(max_length=50)
    monthly_limit = models.DecimalField(max_digits=14, decimal_places=2)
    spent_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    month = models.IntegerField(default=10)
    year = models.IntegerField(default=2026)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'budgets'
        unique_together = ('user', 'category', 'month', 'year')
        ordering = ['-year', '-month', 'category']

    def __str__(self):
        return f"{self.user.email} - {self.category} ({self.month}/{self.year}) Limit: ₹{self.monthly_limit}"
