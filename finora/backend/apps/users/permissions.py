from rest_framework import permissions

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'CUSTOMER' or request.user.role == 'ADMINISTRATOR' or request.user.is_superuser)
        )

class IsAdvisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'FINANCIAL_ADVISOR' or request.user.role == 'ADMINISTRATOR' or request.user.is_superuser)
        )

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'ADMINISTRATOR' or request.user.is_superuser)
        )

class IsOwnerOrAdvisorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or request.user.is_superuser:
            return True
        owner = getattr(obj, 'user', None)
        return owner == request.user
