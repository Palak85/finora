from django.contrib import admin
from .models import Goal

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'target_amount', 'current_amount', 'monthly_contribution', 'status', 'target_date')
    list_filter = ('status',)
    search_fields = ('name', 'user__email')
