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
from .models import AdvisorAssignment, AdvisorRequest
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
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()

        total_accounts = Account.objects.count()
        active_accounts = Account.objects.filter(status='Active').count() if hasattr(Account, 'status') else total_accounts
        total_transactions = Transaction.objects.count()
        pending_alerts = Notification.objects.filter(is_read=False).count()

        roles_breakdown = {
            'CUSTOMER': User.objects.filter(role='CUSTOMER').count(),
            'FINANCIAL_ADVISOR': User.objects.filter(role='FINANCIAL_ADVISOR').count(),
            'ADMINISTRATOR': User.objects.filter(role='ADMINISTRATOR').count(),
        }

        # Account status breakdown
        account_status_breakdown = {
            'Active': Account.objects.filter(status='Active').count() if hasattr(Account, 'status') else total_accounts,
            'Inactive': Account.objects.filter(status='Inactive').count() if hasattr(Account, 'status') else 0,
            'Blocked': Account.objects.filter(status='Blocked').count() if hasattr(Account, 'status') else 0,
        }

        # Transaction breakdown
        income_tx = Transaction.objects.filter(transaction_type='INCOME').count()
        expense_tx = Transaction.objects.filter(transaction_type='EXPENSE').count()
        investment_tx = Transaction.objects.filter(transaction_type='INVESTMENT').count()
        transfer_tx = Transaction.objects.filter(transaction_type='TRANSFER').count()

        # Recent activities (latest 8 audit logs)
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

        # Recent security alerts
        security_notifications = Notification.objects.filter(
            notification_type='Security'
        ).select_related('user').order_by('-created_at')[:5]

        security_alerts = []
        for n in security_notifications:
            security_alerts.append({
                'id': n.id,
                'user_email': n.user.email,
                'title': n.title,
                'message': n.message,
                'created_at': n.created_at,
                'is_read': n.is_read
            })

        return Response({
            'success': True,
            'data': {
                'total_users': total_users,
                'active_users': active_users,
                'inactive_users': inactive_users,
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
                'recent_activities': recent_activities,
                'security_alerts': security_alerts,
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

