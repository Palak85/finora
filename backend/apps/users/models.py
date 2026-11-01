from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, role='CUSTOMER', **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            full_name=full_name,
            role=role,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('role', 'ADMINISTRATOR')

        return self.create_user(email, full_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('CUSTOMER', 'Customer'),
        ('FINANCIAL_ADVISOR', 'Financial Advisor'),
        ('ADMINISTRATOR', 'Administrator'),
    )

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='CUSTOMER')
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    specialization = models.CharField(max_length=150, default='Private Wealth Management', blank=True)
    experience = models.CharField(max_length=100, default='8+ Years Wealth Advisory', blank=True)
    bio = models.TextField(blank=True, default='')
    
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    date_joined = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.role}"

    @property
    def assigned_advisor(self):
        if hasattr(self, 'advisor_assignment') and self.advisor_assignment:
            return self.advisor_assignment.advisor
        return None


class AdvisorAssignment(models.Model):
    customer = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='advisor_assignment',
        limit_choices_to={'role': 'CUSTOMER'}
    )
    advisor = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='client_assignments',
        limit_choices_to={'role': 'FINANCIAL_ADVISOR'}
    )
    assigned_date = models.DateTimeField(default=timezone.now)
    specialization = models.CharField(max_length=150, default='Wealth Management', blank=True)
    designation = models.CharField(max_length=150, default='Financial Advisor', blank=True)
    availability_status = models.CharField(max_length=50, default='Active', blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'advisor_assignments'
        verbose_name = 'Advisor Assignment'
        verbose_name_plural = 'Advisor Assignments'

    def __str__(self):
        return f"{self.customer.full_name} -> {self.advisor.full_name}"

class AdvisorRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    )

    customer = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='sent_advisor_requests',
        limit_choices_to={'role': 'CUSTOMER'}
    )
    advisor = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='received_advisor_requests',
        limit_choices_to={'role': 'FINANCIAL_ADVISOR'}
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    message = models.TextField(blank=True, default='')
    rejection_reason = models.TextField(blank=True, default='')

    request_date = models.DateTimeField(default=timezone.now)
    accepted_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'advisor_requests'
        ordering = ['-created_at']
        verbose_name = 'Advisor Request'
        verbose_name_plural = 'Advisor Requests'

    def __str__(self):
        return f"Request #{self.id}: {self.customer.full_name} -> {self.advisor.full_name} ({self.status})"

class SystemConfiguration(models.Model):
    app_name = models.CharField(max_length=150, default='FINORA Pro – Private Wealth Suite')
    app_description = models.CharField(max_length=255, default='Fiduciary Online Banking & Personal Wealth Management System')
    default_currency = models.CharField(max_length=20, default='INR (₹)')
    timezone_pref = models.CharField(max_length=50, default='Asia/Kolkata (IST UTC+5:30)')
    date_format = models.CharField(max_length=50, default='DD MMM YYYY')
    theme_mode = models.CharField(max_length=50, default='Dark Gold Luxury')
    advisor_assignment_mode = models.CharField(max_length=100, default='Client Request & Fiduciary Approval')
    allow_customer_registration = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    email_alerts_enabled = models.BooleanField(default=True)
    security_audit_logging = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = 'system_configuration'
        verbose_name = 'System Configuration'
        verbose_name_plural = 'System Configuration'

    def __str__(self):
        return f"{self.app_name} ({self.default_currency})"

