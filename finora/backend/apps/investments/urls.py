from django.urls import path
from .views import InvestmentListCreateView, InvestmentDetailView, PortfolioSummaryView

urlpatterns = [
    path('', InvestmentListCreateView.as_view(), name='investment_list_create'),
    path('portfolio/', PortfolioSummaryView.as_view(), name='investment_portfolio'),
    path('<int:id>/', InvestmentDetailView.as_view(), name='investment_detail'),
]
