from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
)
from .permissions import IsAdminUser, IsAdvisor
from apps.notifications.models import Notification
from apps.audit.models import AuditLog
from apps.accounts.models import Account
from apps.transactions.models import Transaction

from django.db import transaction as db_transaction
from django.utils import timezone
from .models import AdvisorAssignment, AdvisorRequest, SystemConfiguration
from django.db.models import Q
User = get_user_model()


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            ip = get_client_ip(request)

            # Welcome notification & Audit log
            Notification.objects.create(
                user=user,
                title='👋 Welcome to Finora Wealth!',
                message='Your account has been created. Start by linking your bank account or adding a budget.',
                notification_type='System'
            )
            AuditLog.objects.create(
                user=user,
                action='USER_REGISTERED',
                ip_address=ip,
                details={'email': user.email, 'role': user.role}
            )

            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'User registered successfully.',
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Registration failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                if not user.is_active:
                    return Response({
                        'success': False,
                        'message': 'User account is deactivated.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                ip = get_client_ip(request)

                # Log activity & trigger security notification
                AuditLog.objects.create(
                    user=user,
                    action='USER_LOGIN',
                    ip_address=ip,
                    details={'email': user.email, 'role': user.role}
                )
                Notification.objects.create(
                    user=user,
                    title='🔐 Security: Sign-In Detected',
                    message=f'Active session established from {ip or "client"}.',
                    notification_type='Security'
                )

                refresh = RefreshToken.for_user(user)
                return Response({
                    'success': True,
                    'message': 'Login successful.',
                    'data': {
                        'user': UserSerializer(user).data,
                        'tokens': {
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }
                    }
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Invalid email or password.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            'success': False,
            'message': 'Invalid data provided.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            ip = get_client_ip(request)
            AuditLog.objects.create(
                user=request.user,
                action='USER_LOGOUT',
                ip_address=ip
            )
            return Response({
                'success': True,
                'message': 'Logged out successfully.'
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                'success': True,
                'message': 'Logged out.'
            }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            ip = get_client_ip(request)

            Notification.objects.create(
                user=request.user,
                title='👤 Profile Updated',
                message='Your account profile information was successfully updated.',
                notification_type='System'
            )
            AuditLog.objects.create(
                user=request.user,
                action='PROFILE_UPDATED',
                ip_address=ip,
                details={'email': request.user.email}
            )

            return Response({
                'success': True,
                'message': 'Profile updated successfully.',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Update failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    'success': False,
                    'message': 'Incorrect current password.'
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            ip = get_client_ip(request)

            Notification.objects.create(
                user=user,
                title='🛡️ Security: Password Changed',
                message='Your account security password was updated successfully.',
                notification_type='Security'
            )
            AuditLog.objects.create(
                user=user,
                action='PASSWORD_CHANGED',
                ip_address=ip,
                details={'email': user.email}
            )

            return Response({
                'success': True,
                'message': 'Password updated successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Password change failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user_exists = User.objects.filter(email=email).exists()
            return Response({
                'success': True,
                'message': 'If your email is registered, password reset instructions have been sent.',
                'data': {'reset_code': '123456'} if user_exists else {}
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Invalid input.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                
                Notification.objects.create(
                    user=user,
                    title='🛡️ Security: Password Reset',
                    message='Your account password was reset successfully.',
                    notification_type='Security'
                )
                AuditLog.objects.create(
                    user=user,
                    action='PASSWORD_RESET',
                    details={'email': user.email}
                )

                return Response({
                    'success': True,
                    'message': 'Password reset successful. You can now login.'
                }, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User with provided email does not exist.'
                }, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'success': False,
            'message': 'Reset password failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser | IsAdvisor]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        if request.user.role != 'ADMINISTRATOR':
            return Response({
                'success': False,
                'message': 'Only Administrators can create users.'
            }, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '').strip()
        full_name = request.data.get('full_name', '').strip()
        role = request.data.get('role', 'CUSTOMER')
        phone = request.data.get('phone', '').strip()
        is_active = request.data.get('is_active', True)

        if not email or not password or not full_name:
            return Response({
                'success': False,
                'message': 'Full name, email, and password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'message': 'A user with this email address already exists.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if role not in ['CUSTOMER', 'FINANCIAL_ADVISOR', 'ADMINISTRATOR']:
            role = 'CUSTOMER'

        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            role=role,
            phone=phone,
            is_active=is_active
        )

        ip = get_client_ip(request)
        AuditLog.objects.create(
            user=request.user,
            action='USER_CREATED',
            ip_address=ip,
            details={
                'created_user': user.email,
                'role': user.role,
                'module': 'User Management',
                'status': 'Success',
                'description': f'Administrator created account for {user.full_name} ({user.email}) as {user.role}'
            }
        )

        return Response({
            'success': True,
            'message': 'User created successfully.',
            'data': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        # Security check: Prevent self deactivation or demotion
        if instance.id == request.user.id:
            if 'is_active' in request.data and not request.data.get('is_active'):
                return Response({
                    'success': False,
                    'message': 'Security Protection: You cannot deactivate your own Administrator account.'
                }, status=status.HTTP_400_BAD_REQUEST)
            if 'role' in request.data and request.data.get('role') != 'ADMINISTRATOR':
                return Response({
                    'success': False,
                    'message': 'Security Protection: You cannot modify your own Administrator role.'
                }, status=status.HTTP_400_BAD_REQUEST)

        old_role = instance.role
        old_active = instance.is_active

        if 'role' in request.data and request.data['role'] in ['CUSTOMER', 'FINANCIAL_ADVISOR', 'ADMINISTRATOR']:
            instance.role = request.data['role']
        if 'is_active' in request.data:
            instance.is_active = bool(request.data['is_active'])
        if 'full_name' in request.data and request.data['full_name'].strip():
            instance.full_name = request.data['full_name'].strip()
        if 'phone' in request.data:
            instance.phone = request.data['phone'].strip()

        instance.save()
        ip = get_client_ip(request)

        # Audit log for role changes
        if instance.role != old_role:
            AuditLog.objects.create(
                user=request.user,
                action='ROLE_CHANGED',
                ip_address=ip,
                details={
                    'target_user': instance.email,
                    'old_role': old_role,
                    'new_role': instance.role,
                    'module': 'User Management',
                    'status': 'Success',
                    'description': f'Changed role of {instance.email} from {old_role} to {instance.role}'
                }
            )

        # Audit log for activation / deactivation
        if instance.is_active != old_active:
            action = 'USER_ACTIVATED' if instance.is_active else 'USER_DEACTIVATED'
            AuditLog.objects.create(
                user=request.user,
                action=action,
                ip_address=ip,
                details={
                    'target_user': instance.email,
                    'module': 'User Management',
                    'status': 'Success',
                    'description': f'{"Activated" if instance.is_active else "Deactivated"} account for {instance.email}'
                }
            )

        return Response({
            'success': True,
            'message': 'User updated successfully.',
            'data': UserSerializer(instance).data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Security check: Prevent self deletion
        if instance.id == request.user.id:
            return Response({
                'success': False,
                'message': 'Security Protection: You cannot delete your own Administrator account.'
            }, status=status.HTTP_400_BAD_REQUEST)

        ip = get_client_ip(request)
        target_email = instance.email
        target_name = instance.full_name
        instance.delete()

        AuditLog.objects.create(
            user=request.user,
            action='USER_DELETED',
            ip_address=ip,
            details={
                'target_user': target_email,
                'module': 'User Management',
                'status': 'Success',
                'description': f'Administrator deleted user account {target_name} ({target_email})'
            }
        )

        return Response({
            'success': True,
            'message': f'User account {target_email} deleted successfully.'
        }, status=status.HTTP_200_OK)


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_customers = User.objects.filter(role='CUSTOMER').count()
        total_advisors = User.objects.filter(role='FINANCIAL_ADVISOR').count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        pending_advisor_requests = AdvisorRequest.objects.filter(status='PENDING').count()
        active_advisor_assignments = AdvisorAssignment.objects.count()
        inactive_accounts = Account.objects.filter(status__in=['Inactive', 'Blocked']).count() if hasattr(Account, 'status') else inactive_users

        total_users = User.objects.count()
        total_accounts = Account.objects.count()
        active_accounts = Account.objects.filter(status='Active').count() if hasattr(Account, 'status') else total_accounts
        total_transactions = Transaction.objects.count()
        pending_alerts = Notification.objects.filter(is_read=False).count()

        roles_breakdown = {
            'CUSTOMER': total_customers,
            'FINANCIAL_ADVISOR': total_advisors,
            'ADMINISTRATOR': User.objects.filter(role='ADMINISTRATOR').count(),
        }

        account_status_breakdown = {
            'Active': active_accounts,
            'Inactive': Account.objects.filter(status='Inactive').count() if hasattr(Account, 'status') else 0,
            'Blocked': Account.objects.filter(status='Blocked').count() if hasattr(Account, 'status') else 0,
        }

        income_tx = Transaction.objects.filter(transaction_type='INCOME').count()
        expense_tx = Transaction.objects.filter(transaction_type='EXPENSE').count()
        investment_tx = Transaction.objects.filter(transaction_type='INVESTMENT').count()
        transfer_tx = Transaction.objects.filter(transaction_type='TRANSFER').count()

        # 1. Recent User Registrations (latest 6)
        recent_reg_qs = User.objects.order_by('-date_joined')[:6]
        recent_registrations = []
        for u in recent_reg_qs:
            recent_registrations.append({
                'id': u.id,
                'full_name': u.full_name,
                'email': u.email,
                'role': u.role,
                'date_joined': u.date_joined,
                'is_active': u.is_active,
            })

        # 2. Recent Advisor Requests (latest 6)
        recent_req_qs = AdvisorRequest.objects.select_related('customer', 'advisor').order_by('-created_at')[:6]
        recent_advisor_requests = []
        for r in recent_req_qs:
            recent_advisor_requests.append({
                'id': r.id,
                'customer_name': r.customer.full_name,
                'customer_email': r.customer.email,
                'advisor_name': r.advisor.full_name,
                'status': r.status,
                'request_date': r.request_date,
            })

        # 3. Recent Security Activity
        security_logs = AuditLog.objects.filter(
            Q(action__icontains='LOGIN') |
            Q(action__icontains='SECURITY') |
            Q(action__icontains='PASSWORD') |
            Q(action__icontains='AUTH')
        ).select_related('user').order_by('-timestamp')[:6]
        recent_security_activity = []
        for l in security_logs:
            recent_security_activity.append({
                'id': l.id,
                'user_email': l.user.email if l.user else 'System',
                'action': l.action,
                'ip_address': l.ip_address or '127.0.0.1',
                'timestamp': l.timestamp,
                'status': l.details.get('status', 'Logged') if isinstance(l.details, dict) else 'Logged',
            })

        # 4. Recent Administrative Actions
        admin_logs = AuditLog.objects.filter(
            user__role='ADMINISTRATOR'
        ).exclude(
            action__in={'SEED_DEMO_DATA', 'DATA_PROVISIONED', 'SYSTEM_INIT'}
        ).select_related('user').order_by('-timestamp')[:6]
        recent_admin_actions = []
        for l in admin_logs:
            desc = l.details.get('description') if isinstance(l.details, dict) and l.details.get('description') else f"{l.action} executed"
            recent_admin_actions.append({
                'id': l.id,
                'admin_email': l.user.email if l.user else 'System Admin',
                'action': l.action,
                'module': l.details.get('module', 'Administration') if isinstance(l.details, dict) else 'Administration',
                'description': desc,
                'timestamp': l.timestamp,
                'ip_address': l.ip_address or '127.0.0.1',
            })

        # General recent activities
        recent_logs = AuditLog.objects.exclude(
            action__in={'SEED_DEMO_DATA', 'DATA_PROVISIONED', 'SYSTEM_INIT'}
        ).select_related('user').order_by('-timestamp')[:8]
        recent_activities = []
        for l in recent_logs:
            module = l.details.get('module') if isinstance(l.details, dict) and l.details.get('module') else 'Administration'
            desc = l.details.get('description') if isinstance(l.details, dict) and l.details.get('description') else f'{l.user.email if l.user else "System"}: {l.action}'
            status_val = l.details.get('status') if isinstance(l.details, dict) and l.details.get('status') else 'Success'
            recent_activities.append({
                'id': l.id,
                'user_email': l.user.email if l.user else 'System',
                'user_name': l.user.full_name if l.user else 'System',
                'action': l.action,
                'module': module,
                'description': desc,
                'status': status_val,
                'ip_address': l.ip_address or '127.0.0.1',
                'timestamp': l.timestamp
            })

        return Response({
            'success': True,
            'data': {
                'total_customers': total_customers,
                'total_advisors': total_advisors,
                'active_users': active_users,
                'inactive_users': inactive_users,
                'pending_advisor_requests': pending_advisor_requests,
                'active_advisor_assignments': active_advisor_assignments,
                'inactive_accounts': inactive_accounts,
                'total_users': total_users,
                'total_accounts': total_accounts,
                'active_accounts': active_accounts,
                'total_transactions': total_transactions,
                'pending_alerts': pending_alerts,
                'roles_breakdown': roles_breakdown,
                'account_status_breakdown': account_status_breakdown,
                'transaction_activity': {
                    'income_count': income_tx,
                    'expense_count': expense_tx,
                    'investment_count': investment_tx,
                    'transfer_count': transfer_tx,
                },
                'recent_registrations': recent_registrations,
                'recent_advisor_requests': recent_advisor_requests,
                'recent_security_activity': recent_security_activity,
                'recent_admin_actions': recent_admin_actions,
                'recent_activities': recent_activities,
                'system_status': {
                    'database': 'Operational (SQLite 3.x)',
                    'jwt_auth': '256-Bit HS256 Active',
                    'api_engine': 'Django REST Framework 3.15',
                    'uptime': '100% Operational',
                    'environment': 'Production-Ready'
                }
            }
        })

class AvailableAdvisorsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Retrieve all active financial advisors
        advisors = User.objects.filter(
            role='FINANCIAL_ADVISOR',
            is_active=True
        ).order_by('full_name')

        # Check if caller has an assigned advisor or pending request
        current_assigned_advisor_id = None
        pending_request_advisor_id = None

        if request.user.role == 'CUSTOMER':
            assignment = AdvisorAssignment.objects.filter(customer=request.user).first()
            if assignment:
                current_assigned_advisor_id = assignment.advisor_id

            pending_req = AdvisorRequest.objects.filter(customer=request.user, status='PENDING').first()
            if pending_req:
                pending_request_advisor_id = pending_req.advisor_id

        data = []
        for adv in advisors:
            data.append({
                'id': adv.id,
                'full_name': adv.full_name,
                'email': adv.email,
                'phone': adv.phone or '+91 98765 11111',
                'role': 'Financial Advisor',
                'designation': 'Senior Wealth Advisor',
                'specialization': adv.specialization or 'Private Wealth Management',
                'experience': adv.experience or '8+ Years Advisory Experience',
                'bio': adv.bio or 'Dedicated private wealth manager and fiduciary steward helping clients optimize capital allocation and retirement security.',
                'profile_image': adv.profile_image.url if adv.profile_image else None,
                'status': 'Active',
                'availability_status': 'Accepting Clients',
                'is_current_advisor': adv.id == current_assigned_advisor_id,
                'has_pending_request': adv.id == pending_request_advisor_id,
            })

        return Response({
            'success': True,
            'count': len(data),
            'data': data
        })


class CustomerAdvisorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'CUSTOMER':
            return Response({
                'success': False,
                'message': 'Access restricted to customer accounts only.'
            }, status=status.HTTP_403_FORBIDDEN)

        # 1. Fetch request history for customer
        history_qs = AdvisorRequest.objects.filter(customer=request.user).select_related('advisor').order_by('-created_at')[:10]
        request_history = []
        for r in history_qs:
            request_history.append({
                'id': r.id,
                'advisor_id': r.advisor.id,
                'advisor_name': r.advisor.full_name,
                'advisor_email': r.advisor.email,
                'advisor_specialization': r.advisor.specialization or 'Wealth Management',
                'status': r.status,
                'message': r.message,
                'rejection_reason': r.rejection_reason,
                'request_date': r.request_date,
                'accepted_at': r.accepted_at,
                'rejected_at': r.rejected_at,
                'cancelled_at': r.cancelled_at,
            })

        # 2. Check active advisor assignment
        assignment = AdvisorAssignment.objects.filter(customer=request.user).select_related('advisor').first()
        if assignment and assignment.advisor and assignment.advisor.is_active:
            advisor = assignment.advisor
            data = {
                'id': advisor.id,
                'full_name': advisor.full_name,
                'email': advisor.email,
                'phone': advisor.phone or '+91 98765 11111',
                'role': 'Financial Advisor',
                'designation': assignment.designation or 'Financial Advisor',
                'specialization': advisor.specialization or assignment.specialization or 'Wealth Management',
                'experience': advisor.experience or '10+ Years Advisory Experience',
                'bio': advisor.bio or '',
                'status': 'Active',
                'availability_status': assignment.availability_status or 'Active',
                'profile_image': advisor.profile_image.url if advisor.profile_image else None,
                'assigned_date': assignment.assigned_date,
            }
            return Response({
                'success': True,
                'assigned': True,
                'has_pending_request': False,
                'pending_request': None,
                'data': data,
                'request_history': request_history
            })

        # 3. Check for any pending request
        pending_req = AdvisorRequest.objects.filter(customer=request.user, status='PENDING').select_related('advisor').first()
        if pending_req:
            pending_data = {
                'id': pending_req.id,
                'advisor_id': pending_req.advisor.id,
                'advisor_name': pending_req.advisor.full_name,
                'advisor_email': pending_req.advisor.email,
                'advisor_phone': pending_req.advisor.phone or '+91 98765 11111',
                'advisor_specialization': pending_req.advisor.specialization or 'Wealth Management',
                'advisor_experience': pending_req.advisor.experience or '8+ Years Advisory Experience',
                'advisor_profile_image': pending_req.advisor.profile_image.url if pending_req.advisor.profile_image else None,
                'request_date': pending_req.request_date,
                'status': 'Pending',
                'message': 'Your advisor request has been submitted. Waiting for the advisor to review your request.'
            }
            return Response({
                'success': True,
                'assigned': False,
                'has_pending_request': True,
                'pending_request': pending_data,
                'data': None,
                'message': 'Advisor Request Pending',
                'request_history': request_history
            })

        # 4. No assignment and no pending request
        return Response({
            'success': True,
            'assigned': False,
            'has_pending_request': False,
            'pending_request': None,
            'data': None,
            'message': 'No Advisor Assigned',
            'description': "You don't have a financial advisor yet. Browse our available advisors and request one to manage your financial planning.",
            'request_history': request_history
        })


class CustomerAdvisorRequestCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'CUSTOMER':
            return Response({
                'success': False,
                'message': 'Access restricted to customer accounts only.'
            }, status=status.HTTP_403_FORBIDDEN)

        advisor_id = request.data.get('advisor_id')
        if not advisor_id:
            return Response({
                'success': False,
                'message': 'Please select a financial advisor.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            advisor = User.objects.get(id=advisor_id, role='FINANCIAL_ADVISOR', is_active=True)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Selected financial advisor was not found or is currently inactive.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify customer does not already have an active advisor
        if AdvisorAssignment.objects.filter(customer=request.user).exists():
            return Response({
                'success': False,
                'message': 'You already have an active financial advisor assigned to your account.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify customer does not already have a pending request
        if AdvisorRequest.objects.filter(customer=request.user, status='PENDING').exists():
            return Response({
                'success': False,
                'message': 'You already have a pending advisor request awaiting review. Please wait or cancel the pending request first.'
            }, status=status.HTTP_400_BAD_REQUEST)

        msg = request.data.get('message', '').strip()

        with db_transaction.atomic():
            req_obj = AdvisorRequest.objects.create(
                customer=request.user,
                advisor=advisor,
                status='PENDING',
                message=msg,
                request_date=timezone.now()
            )

            # Notification to Financial Advisor
            Notification.objects.create(
                user=advisor,
                title='🤝 New Customer Advisor Request',
                message=f"New customer advisor request received from {request.user.full_name} ({request.user.email}).",
                notification_type='Advisor'
            )

        return Response({
            'success': True,
            'message': 'Advisor request submitted successfully. Your advisor will review your request.',
            'data': {
                'id': req_obj.id,
                'status': 'Pending',
                'advisor_name': advisor.full_name,
                'request_date': req_obj.request_date
            }
        }, status=status.HTTP_201_CREATED)


class CustomerAdvisorRequestCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        if request.user.role != 'CUSTOMER':
            return Response({
                'success': False,
                'message': 'Access restricted to customer accounts only.'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            req_obj = AdvisorRequest.objects.get(id=id, customer=request.user)
        except AdvisorRequest.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Advisor request not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        if req_obj.status != 'PENDING':
            return Response({
                'success': False,
                'message': f'Cannot cancel request with status {req_obj.status}. Only pending requests can be cancelled.'
            }, status=status.HTTP_400_BAD_REQUEST)

        req_obj.status = 'CANCELLED'
        req_obj.cancelled_at = timezone.now()
        req_obj.save()

        return Response({
            'success': True,
            'message': 'Advisor request has been cancelled successfully.'
        })


class AdvisorRequestsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'FINANCIAL_ADVISOR':
            return Response({
                'success': False,
                'message': 'Access restricted to financial advisor accounts only.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Strictly query requests received by logged-in advisor
        qs = AdvisorRequest.objects.filter(advisor=request.user).select_related('customer').order_by('-created_at')

        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter.upper())

        requests_data = []
        for r in qs:
            c = r.customer
            requests_data.append({
                'id': r.id,
                'status': r.status,
                'message': r.message,
                'request_date': r.request_date,
                'accepted_at': r.accepted_at,
                'rejected_at': r.rejected_at,
                'cancelled_at': r.cancelled_at,
                'rejection_reason': r.rejection_reason,
                'customer': {
                    'id': c.id,
                    'full_name': c.full_name,
                    'email': c.email,
                    'phone': c.phone or '+91 98765 43210',
                    'profile_image': c.profile_image.url if c.profile_image else None,
                    'date_joined': c.date_joined,
                }
            })

        # Summary counts
        all_for_adv = AdvisorRequest.objects.filter(advisor=request.user)
        stats = {
            'total': all_for_adv.count(),
            'pending': all_for_adv.filter(status='PENDING').count(),
            'accepted': all_for_adv.filter(status='ACCEPTED').count(),
            'rejected': all_for_adv.filter(status='REJECTED').count(),
            'cancelled': all_for_adv.filter(status='CANCELLED').count(),
        }

        return Response({
            'success': True,
            'stats': stats,
            'data': requests_data
        })


class AdvisorRequestAcceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        if request.user.role != 'FINANCIAL_ADVISOR':
            return Response({
                'success': False,
                'message': 'Access restricted to financial advisor accounts only.'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            req_obj = AdvisorRequest.objects.select_related('customer').get(id=id, advisor=request.user)
        except AdvisorRequest.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Advisor request not found or does not belong to you.'
            }, status=status.HTTP_404_NOT_FOUND)

        if req_obj.status != 'PENDING':
            return Response({
                'success': False,
                'message': f'Cannot accept request with status {req_obj.status}. Only pending requests can be accepted.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if customer already has active assignment
        if AdvisorAssignment.objects.filter(customer=req_obj.customer).exists():
            req_obj.status = 'CANCELLED'
            req_obj.cancelled_at = timezone.now()
            req_obj.save()
            return Response({
                'success': False,
                'message': 'Customer already has an active financial advisor assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction.atomic():
            # Update request
            req_obj.status = 'ACCEPTED'
            req_obj.accepted_at = timezone.now()
            req_obj.save()

            # Create assignment
            AdvisorAssignment.objects.update_or_create(
                customer=req_obj.customer,
                defaults={
                    'advisor': request.user,
                    'assigned_date': timezone.now(),
                    'specialization': request.user.specialization or 'Wealth Management',
                    'designation': 'Financial Advisor',
                    'availability_status': 'Active',
                    'notes': f"Assigned via accepted request #{req_obj.id}."
                }
            )

            # Cancel any other pending requests from this customer to other advisors
            AdvisorRequest.objects.filter(customer=req_obj.customer, status='PENDING').exclude(id=req_obj.id).update(
                status='CANCELLED',
                cancelled_at=timezone.now()
            )

            # Notification to customer
            Notification.objects.create(
                user=req_obj.customer,
                title='🎉 Financial Advisor Request Accepted',
                message=f"Your financial advisor request has been accepted. {request.user.full_name} is now your assigned Wealth Advisor.",
                notification_type='Advisor'
            )

        return Response({
            'success': True,
            'message': 'Customer request accepted successfully. The customer is now assigned to you.'
        })


class AdvisorRequestRejectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        if request.user.role != 'FINANCIAL_ADVISOR':
            return Response({
                'success': False,
                'message': 'Access restricted to financial advisor accounts only.'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            req_obj = AdvisorRequest.objects.select_related('customer').get(id=id, advisor=request.user)
        except AdvisorRequest.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Advisor request not found or does not belong to you.'
            }, status=status.HTTP_404_NOT_FOUND)

        if req_obj.status != 'PENDING':
            return Response({
                'success': False,
                'message': f'Cannot reject request with status {req_obj.status}. Only pending requests can be rejected.'
            }, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', '').strip()

        with db_transaction.atomic():
            req_obj.status = 'REJECTED'
            req_obj.rejected_at = timezone.now()
            req_obj.rejection_reason = reason
            req_obj.save()

            # Notification to customer
            Notification.objects.create(
                user=req_obj.customer,
                title='⚠️ Financial Advisor Request Declined',
                message="Your financial advisor request has been rejected. You can choose another available advisor.",
                notification_type='Advisor'
            )

        return Response({
            'success': True,
            'message': 'Customer request rejected.'
        })


class AdvisorAssignedClientsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'FINANCIAL_ADVISOR':
            return Response({
                'success': False,
                'message': 'Access restricted to financial advisor accounts only.'
            }, status=status.HTTP_403_FORBIDDEN)

        assignments = AdvisorAssignment.objects.filter(advisor=request.user).select_related('customer').order_by('-assigned_date')
        clients = []
        for a in assignments:
            c = a.customer
            clients.append({
                'id': c.id,
                'full_name': c.full_name,
                'email': c.email,
                'phone': c.phone or '+91 98765 43210',
                'profile_image': c.profile_image.url if c.profile_image else None,
                'date_joined': c.date_joined,
                'assigned_date': a.assigned_date,
                'specialization': a.specialization,
                'status': 'Active' if c.is_active else 'Inactive',
            })

        return Response({
            'success': True,
            'count': len(clients),
            'data': clients
        })

# =========================================================================
# SYSTEM ADMINISTRATOR: ADVISOR MANAGEMENT APIS
# =========================================================================

class AdminAdvisorsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        advisors = User.objects.filter(role='FINANCIAL_ADVISOR').order_by('-date_joined')
        data = []
        for a in advisors:
            # Query assigned customers
            assignments = AdvisorAssignment.objects.filter(advisor=a).select_related('customer')
            assigned_customers = [
                {
                    'id': asg.customer.id,
                    'full_name': asg.customer.full_name,
                    'email': asg.customer.email,
                    'phone': asg.customer.phone or '',
                    'assigned_date': asg.assigned_date,
                    'is_active': asg.customer.is_active,
                }
                for asg in assignments
            ]

            # Query pending requests
            pending_reqs = AdvisorRequest.objects.filter(advisor=a, status='PENDING').select_related('customer')
            pending_requests = [
                {
                    'id': pr.id,
                    'customer_id': pr.customer.id,
                    'customer_name': pr.customer.full_name,
                    'customer_email': pr.customer.email,
                    'request_date': pr.request_date,
                    'message': pr.message,
                }
                for pr in pending_reqs
            ]

            data.append({
                'id': a.id,
                'full_name': a.full_name,
                'email': a.email,
                'phone': a.phone or '+91 98765 11111',
                'specialization': a.specialization or 'Private Wealth Management',
                'experience': a.experience or '8+ Years Fiduciary Advisory',
                'bio': a.bio or '',
                'is_active': a.is_active,
                'status': 'Active' if a.is_active else 'Inactive',
                'assigned_customer_count': len(assigned_customers),
                'pending_request_count': len(pending_requests),
                'max_capacity': 15,
                'capacity_percentage': min(100, int((len(assigned_customers) / 15) * 100)),
                'date_joined': a.date_joined,
                'assigned_customers': assigned_customers,
                'pending_requests': pending_requests,
            })

        return Response({
            'success': True,
            'count': len(data),
            'data': data
        })


class AdminAdvisorDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, id):
        try:
            advisor = User.objects.get(id=id, role='FINANCIAL_ADVISOR')
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Advisor not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'full_name' in data:
            advisor.full_name = data['full_name'].strip()
        if 'phone' in data:
            advisor.phone = data['phone'].strip()
        if 'specialization' in data:
            advisor.specialization = data['specialization'].strip()
        if 'experience' in data:
            advisor.experience = data['experience'].strip()
        if 'bio' in data:
            advisor.bio = data['bio'].strip()
        if 'is_active' in data:
            advisor.is_active = bool(data['is_active'])

        advisor.save()

        # Audit Log
        AuditLog.objects.create(
            user=request.user,
            action='ADVISOR_PROFILE_UPDATED',
            ip_address=get_client_ip(request),
            details={
                'module': 'Advisor Management',
                'advisor_id': advisor.id,
                'advisor_email': advisor.email,
                'description': f"Admin updated advisor details for {advisor.full_name} ({advisor.email})"
            }
        )

        return Response({
            'success': True,
            'message': f"Advisor {advisor.full_name} updated successfully.",
            'data': {
                'id': advisor.id,
                'full_name': advisor.full_name,
                'email': advisor.email,
                'phone': advisor.phone,
                'specialization': advisor.specialization,
                'experience': advisor.experience,
                'bio': advisor.bio,
                'is_active': advisor.is_active,
            }
        })


class AdminAdvisorToggleStatusView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, id):
        try:
            advisor = User.objects.get(id=id, role='FINANCIAL_ADVISOR')
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Advisor not found.'}, status=status.HTTP_404_NOT_FOUND)

        advisor.is_active = not advisor.is_active
        advisor.save()

        action_name = 'ADVISOR_ACTIVATED' if advisor.is_active else 'ADVISOR_DEACTIVATED'
        status_label = 'Active' if advisor.is_active else 'Inactive'

        AuditLog.objects.create(
            user=request.user,
            action=action_name,
            ip_address=get_client_ip(request),
            details={
                'module': 'Advisor Management',
                'advisor_id': advisor.id,
                'advisor_email': advisor.email,
                'status': status_label,
                'description': f"Admin toggled advisor status to {status_label} for {advisor.full_name}."
            }
        )

        return Response({
            'success': True,
            'message': f"Advisor {advisor.full_name} is now {status_label}.",
            'is_active': advisor.is_active,
            'status': status_label
        })


# =========================================================================
# SYSTEM ADMINISTRATOR: CUSTOMER MANAGEMENT APIS
# =========================================================================

class AdminCustomersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        customers = User.objects.filter(role='CUSTOMER').select_related('advisor_assignment__advisor').order_by('-date_joined')
        data = []
        for c in customers:
            # Check advisor assignment
            assigned_advisor = None
            assignment_status = 'No Advisor Assigned'

            if hasattr(c, 'advisor_assignment') and c.advisor_assignment and c.advisor_assignment.advisor:
                adv = c.advisor_assignment.advisor
                assigned_advisor = {
                    'id': adv.id,
                    'full_name': adv.full_name,
                    'email': adv.email,
                    'phone': adv.phone or '',
                    'specialization': c.advisor_assignment.specialization or adv.specialization,
                    'assigned_date': c.advisor_assignment.assigned_date,
                    'is_active': adv.is_active,
                }
                assignment_status = 'Advisor Assigned'
            else:
                # Check pending request
                pending_req = AdvisorRequest.objects.filter(customer=c, status='PENDING').select_related('advisor').first()
                if pending_req:
                    assignment_status = 'Request Pending'

            # Request history
            req_history = [
                {
                    'id': r.id,
                    'advisor_name': r.advisor.full_name,
                    'advisor_email': r.advisor.email,
                    'advisor_specialization': r.advisor.specialization,
                    'status': r.status,
                    'request_date': r.request_date,
                    'accepted_at': r.accepted_at,
                    'rejected_at': r.rejected_at,
                    'cancelled_at': r.cancelled_at,
                    'message': r.message,
                    'rejection_reason': r.rejection_reason,
                }
                for r in AdvisorRequest.objects.filter(customer=c).select_related('advisor').order_by('-created_at')[:10]
            ]

            data.append({
                'id': c.id,
                'full_name': c.full_name,
                'email': c.email,
                'phone': c.phone or '+91 98765 43210',
                'is_active': c.is_active,
                'status': 'Active' if c.is_active else 'Inactive',
                'assigned_advisor': assigned_advisor,
                'advisor_assignment_status': assignment_status,
                'date_joined': c.date_joined,
                'request_history': req_history,
            })

        return Response({
            'success': True,
            'count': len(data),
            'data': data
        })


class AdminCustomerDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, id):
        try:
            customer = User.objects.get(id=id, role='CUSTOMER')
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'full_name' in data:
            customer.full_name = data['full_name'].strip()
        if 'phone' in data:
            customer.phone = data['phone'].strip()
        if 'is_active' in data:
            customer.is_active = bool(data['is_active'])

        customer.save()

        # Audit Log
        AuditLog.objects.create(
            user=request.user,
            action='CUSTOMER_PROFILE_UPDATED',
            ip_address=get_client_ip(request),
            details={
                'module': 'Customer Management',
                'customer_id': customer.id,
                'customer_email': customer.email,
                'description': f"Admin updated customer details for {customer.full_name} ({customer.email})"
            }
        )

        return Response({
            'success': True,
            'message': f"Customer {customer.full_name} updated successfully.",
            'data': {
                'id': customer.id,
                'full_name': customer.full_name,
                'email': customer.email,
                'phone': customer.phone,
                'is_active': customer.is_active,
            }
        })


class AdminCustomerToggleStatusView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, id):
        try:
            customer = User.objects.get(id=id, role='CUSTOMER')
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)

        customer.is_active = not customer.is_active
        customer.save()

        action_name = 'CUSTOMER_ACTIVATED' if customer.is_active else 'CUSTOMER_DEACTIVATED'
        status_label = 'Active' if customer.is_active else 'Inactive'

        AuditLog.objects.create(
            user=request.user,
            action=action_name,
            ip_address=get_client_ip(request),
            details={
                'module': 'Customer Management',
                'customer_id': customer.id,
                'customer_email': customer.email,
                'status': status_label,
                'description': f"Admin toggled customer status to {status_label} for {customer.full_name}."
            }
        )

        return Response({
            'success': True,
            'message': f"Customer {customer.full_name} is now {status_label}.",
            'is_active': customer.is_active,
            'status': status_label
        })


# =========================================================================
# SYSTEM ADMINISTRATOR: SECURITY & ACCESS CONTROL APIS
# =========================================================================

class AdminSecurityView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        admin_count = User.objects.filter(role='ADMINISTRATOR').count()
        advisor_count = User.objects.filter(role='FINANCIAL_ADVISOR').count()
        customer_count = User.objects.filter(role='CUSTOMER').count()

        roles = [
            {
                'role': 'ADMINISTRATOR',
                'label': 'System Administrator',
                'description': 'Full governance, user lifecycle management, audit trail inspection & platform controls',
                'users_count': admin_count,
                'permissions': [
                    'Admin Console Telemetry Access',
                    'User Management (Create, Edit, Toggle, Delete)',
                    'Advisor Management (Profile, Clients, Status)',
                    'Customer Management (Assignments, Request History)',
                    'Full Audit Logs Inspection',
                    'Security Policy & RBAC Governance',
                    'System Settings Configuration'
                ]
            },
            {
                'role': 'FINANCIAL_ADVISOR',
                'label': 'Financial Advisor',
                'description': 'Fiduciary wealth monitoring, client request evaluation, budget compliance & strategic advice',
                'users_count': advisor_count,
                'permissions': [
                    'Client Portfolio Surveillance (Read-Only)',
                    'Customer Requests Evaluation (Accept/Reject)',
                    'Transaction & Cash Outflow Monitoring',
                    'Budget Adherence & Burn Rate Tracking',
                    'Client Financial Health Audit',
                    'Coaching Advice & Signal Dispatching'
                ]
            },
            {
                'role': 'CUSTOMER',
                'label': 'Wealth Client (Customer)',
                'description': 'Private wealth banking, portfolio self-service, goal tracking & advisor engagement',
                'users_count': customer_count,
                'permissions': [
                    'Personal Accounts & Balance Overview',
                    'Transaction Creation & History',
                    'Budget Limit Creation & Tracking',
                    'Investment Asset Tracking',
                    'Life Goals Contribution',
                    'Available Financial Advisors Directory',
                    'Advisor Request Submission & Cancellation'
                ]
            }
        ]

        matrix = [
            {'module': 'Dashboard & Banking Ledgers', 'customer': 'Read/Write (Own)', 'advisor': 'Read-Only (Assigned Clients)', 'admin': 'Telemetry & Read-Only'},
            {'module': 'Transactions & Transfers', 'customer': 'Full Operations', 'advisor': 'Surveillance Audit Only', 'admin': 'Surveillance & Audit'},
            {'module': 'Budgets & Expense Tracking', 'customer': 'Full Operations', 'advisor': 'Compliance Tracking Only', 'admin': 'Read-Only Oversight'},
            {'module': 'Investments Portfolio', 'customer': 'Personal Holdings', 'advisor': 'AUM Multi-Asset Audit', 'admin': 'Platform AUM Metrics'},
            {'module': 'Advisor Requests & Directory', 'customer': 'Browse & Submit', 'advisor': 'Evaluate, Accept & Reject', 'admin': 'Assignment Monitoring'},
            {'module': 'User Management & Roles', 'customer': 'No Access', 'advisor': 'No Access', 'admin': 'Full Administrative Control'},
            {'module': 'Audit Logs & Governance', 'customer': 'No Access', 'advisor': 'No Access', 'admin': 'Full Immutable Audit Access'},
            {'module': 'System Settings & Config', 'customer': 'No Access', 'advisor': 'No Access', 'admin': 'Full Configuration Control'},
        ]

        security_config = {
            'auth_method': 'JWT (JSON Web Token)',
            'token_algorithm': 'HS256 256-Bit Cryptographic Signature',
            'access_token_lifetime': '60 Minutes (Rotating)',
            'refresh_token_lifetime': '7 Days',
            'password_hasher': 'PBKDF2 with SHA-256 (Django Cryptographic Core)',
            'rbac_enforcement': 'Dual-Layer (Django Permissions + React Route Guards)',
            'ip_tracking': 'Active via RemoteAddr & X-Forwarded-For',
            'active_sessions_estimated': User.objects.filter(is_active=True).count(),
        }

        # Latest security logs
        sec_logs = AuditLog.objects.filter(
            Q(action__icontains='LOGIN') |
            Q(action__icontains='SECURITY') |
            Q(action__icontains='PASSWORD') |
            Q(action__icontains='AUTH') |
            Q(action__icontains='ROLE')
        ).select_related('user').order_by('-timestamp')[:10]

        recent_logs = [
            {
                'id': sl.id,
                'user_email': sl.user.email if sl.user else 'System',
                'action': sl.action,
                'ip_address': sl.ip_address or '127.0.0.1',
                'timestamp': sl.timestamp,
                'details': sl.details
            }
            for sl in sec_logs
        ]

        return Response({
            'success': True,
            'roles': roles,
            'security_matrix': matrix,
            'security_config': security_config,
            'recent_security_logs': recent_logs
        })


# =========================================================================
# SYSTEM ADMINISTRATOR: SYSTEM SETTINGS APIS
# =========================================================================

class AdminSystemSettingsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        config, _ = SystemConfiguration.objects.get_or_create(id=1)
        return Response({
            'success': True,
            'data': {
                'app_name': config.app_name,
                'app_description': config.app_description,
                'default_currency': config.default_currency,
                'timezone_pref': config.timezone_pref,
                'date_format': config.date_format,
                'theme_mode': config.theme_mode,
                'advisor_assignment_mode': config.advisor_assignment_mode,
                'allow_customer_registration': config.allow_customer_registration,
                'maintenance_mode': config.maintenance_mode,
                'email_alerts_enabled': config.email_alerts_enabled,
                'security_audit_logging': config.security_audit_logging,
                'updated_at': config.updated_at,
                'updated_by': config.updated_by.email if config.updated_by else 'System Administrator',
            }
        })

    def patch(self, request):
        config, _ = SystemConfiguration.objects.get_or_create(id=1)
        data = request.data

        if 'app_name' in data:
            config.app_name = str(data['app_name']).strip()
        if 'app_description' in data:
            config.app_description = str(data['app_description']).strip()
        if 'default_currency' in data:
            config.default_currency = str(data['default_currency']).strip()
        if 'timezone_pref' in data:
            config.timezone_pref = str(data['timezone_pref']).strip()
        if 'date_format' in data:
            config.date_format = str(data['date_format']).strip()
        if 'theme_mode' in data:
            config.theme_mode = str(data['theme_mode']).strip()
        if 'advisor_assignment_mode' in data:
            config.advisor_assignment_mode = str(data['advisor_assignment_mode']).strip()
        if 'allow_customer_registration' in data:
            config.allow_customer_registration = bool(data['allow_customer_registration'])
        if 'maintenance_mode' in data:
            config.maintenance_mode = bool(data['maintenance_mode'])
        if 'email_alerts_enabled' in data:
            config.email_alerts_enabled = bool(data['email_alerts_enabled'])
        if 'security_audit_logging' in data:
            config.security_audit_logging = bool(data['security_audit_logging'])

        config.updated_by = request.user
        config.save()

        # Audit Log
        AuditLog.objects.create(
            user=request.user,
            action='SYSTEM_SETTINGS_UPDATED',
            ip_address=get_client_ip(request),
            details={
                'module': 'System Settings',
                'description': 'Admin updated system configuration and platform preferences.',
                'changed_fields': list(data.keys())
            }
        )

        return Response({
            'success': True,
            'message': 'System settings saved successfully.',
            'data': {
                'app_name': config.app_name,
                'app_description': config.app_description,
                'default_currency': config.default_currency,
                'timezone_pref': config.timezone_pref,
                'date_format': config.date_format,
                'theme_mode': config.theme_mode,
                'advisor_assignment_mode': config.advisor_assignment_mode,
                'allow_customer_registration': config.allow_customer_registration,
                'maintenance_mode': config.maintenance_mode,
                'email_alerts_enabled': config.email_alerts_enabled,
                'security_audit_logging': config.security_audit_logging,
                'updated_at': config.updated_at,
                'updated_by': config.updated_by.email if config.updated_by else 'System Administrator',
            }
        })

