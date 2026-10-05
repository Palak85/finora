from django.urls import path
from .views import BudgetListCreateView, BudgetDetailView

urlpatterns = [
    path('', BudgetListCreateView.as_view(), name='budget_list_create'),
    path('<int:id>/', BudgetDetailView.as_view(), name='budget_detail'),
]
