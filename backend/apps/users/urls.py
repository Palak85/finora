from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    ChangePasswordView, ForgotPasswordView, ResetPasswordView,
    UserListView, UserDetailView, AdminStatsView,
    AvailableAdvisorsView, CustomerAdvisorView,
    CustomerAdvisorRequestCreateView, CustomerAdvisorRequestCancelView,
    AdvisorRequestsListView, AdvisorRequestAcceptView,
    AdvisorRequestRejectView, AdvisorAssignedClientsView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),
    path('admin-stats/', AdminStatsView.as_view(), name='admin_stats'),
    
    # Customer Advisor Assignment APIs
    path('available-advisors/', AvailableAdvisorsView.as_view(), name='available_advisors'),
    path('my-advisor/', CustomerAdvisorView.as_view(), name='customer_advisor'),
    path('advisor-requests/', CustomerAdvisorRequestCreateView.as_view(), name='customer_advisor_request_create'),
    path('advisor-requests/<int:id>/cancel/', CustomerAdvisorRequestCancelView.as_view(), name='customer_advisor_request_cancel'),
    
    # Financial Advisor Management APIs
    path('advisor/requests/', AdvisorRequestsListView.as_view(), name='advisor_requests_list'),
    path('advisor/requests/<int:id>/accept/', AdvisorRequestAcceptView.as_view(), name='advisor_request_accept'),
    path('advisor/requests/<int:id>/reject/', AdvisorRequestRejectView.as_view(), name='advisor_request_reject'),
    path('advisor/assigned-clients/', AdvisorAssignedClientsView.as_view(), name='advisor_assigned_clients'),
    
    path('', UserListView.as_view(), name='user_list'),
    path('<int:id>/', UserDetailView.as_view(), name='user_detail'),
]
