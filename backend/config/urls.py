from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from apps.users.views import (
    AvailableAdvisorsView, CustomerAdvisorView,
    CustomerAdvisorRequestCreateView, CustomerAdvisorRequestCancelView,
    AdvisorRequestsListView, AdvisorRequestAcceptView,
    AdvisorRequestRejectView, AdvisorAssignedClientsView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # OpenAPI Schema & Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Dedicated Customer Advisor Assignment & Request Endpoints
    path('api/customer/available-advisors/', AvailableAdvisorsView.as_view(), name='customer_available_advisors'),
    path('api/customer/my-advisor/', CustomerAdvisorView.as_view(), name='customer_my_advisor'),
    path('api/customer/advisor-requests/', CustomerAdvisorRequestCreateView.as_view(), name='customer_advisor_requests'),
    path('api/customer/advisor-requests/<int:id>/cancel/', CustomerAdvisorRequestCancelView.as_view(), name='customer_advisor_request_cancel'),
    
    # Dedicated Financial Advisor Request Management Endpoints
    path('api/advisor/customer-requests/', AdvisorRequestsListView.as_view(), name='advisor_customer_requests'),
    path('api/advisor/customer-requests/<int:id>/accept/', AdvisorRequestAcceptView.as_view(), name='advisor_accept_request'),
    path('api/advisor/customer-requests/<int:id>/reject/', AdvisorRequestRejectView.as_view(), name='advisor_reject_request'),
    path('api/advisor/assigned-clients/', AdvisorAssignedClientsView.as_view(), name='advisor_assigned_clients'),
    
    # Application REST APIs
    path('api/users/', include('apps.users.urls')),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/investments/', include('apps.investments.urls')),
    path('api/goals/', include('apps.goals.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/audit/', include('apps.audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
