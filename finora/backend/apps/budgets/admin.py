from django.contrib import admin
from .models import Budget

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'monthly_limit', 'spent_amount', 'month', 'year', 'created_at')
    list_filter = ('category', 'month', 'year')
    search_fields = ('user__email', 'category')
