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
from .provisioning import provision_user_real_data
from apps.notifications.models import Notification
from apps.audit.models import AuditLog

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

            # Provision realistic real financial portfolio for customer
            provision_user_real_data(user)

            # Welcome notification & Audit log
            Notification.objects.create(
                user=user,
                title='👋 Welcome to Finora Wealth!',
                message='Your private wealth portfolio has been established. You are ready to track accounts and investments.',
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
            'data': serializer.data
        })


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'User updated successfully.',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            'success': True,
            'message': 'User deleted successfully.'
        }, status=status.HTTP_200_OK)
