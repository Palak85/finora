from django.db import models
from django.conf import settings
from decimal import Decimal

class Goal(models.Model):
    STATUS_CHOICES = (
        ('IN_PROGRESS', 'In Progress'),
        ('ACHIEVED', 'Achieved'),
        ('PAUSED', 'Paused'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='goals'
    )
    name = models.CharField(max_length=150)
    target_amount = models.DecimalField(max_digits=14, decimal_places=2)
    current_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    target_date = models.DateField()
    monthly_contribution = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'goals'
        ordering = ['target_date']

    def save(self, *args, **kwargs):
        if self.current_amount >= self.target_amount and self.status == 'IN_PROGRESS':
            self.status = 'ACHIEVED'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} (₹{self.current_amount} / ₹{self.target_amount})"
