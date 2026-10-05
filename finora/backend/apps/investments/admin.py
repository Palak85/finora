from django.contrib import admin
from .models import Investment

@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ('asset_name', 'user', 'asset_type', 'quantity', 'invested_amount', 'current_value', 'profit_loss', 'profit_loss_percentage')
    list_filter = ('asset_type',)
    search_fields = ('asset_name', 'user__email')
