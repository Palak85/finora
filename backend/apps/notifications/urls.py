from django.urls import path
from .views import (
    NotificationListView, NotificationMarkReadView,
    NotificationMarkAllReadView, NotificationDeleteView,
    SendAdvisorRecommendationView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('send-advice/', SendAdvisorRecommendationView.as_view(), name='send_advisor_advice'),
    path('<int:id>/read/', NotificationMarkReadView.as_view(), name='notification_mark_read'),
    path('read-all/', NotificationMarkAllReadView.as_view(), name='notification_read_all'),
    path('<int:id>/', NotificationDeleteView.as_view(), name='notification_delete'),
]
