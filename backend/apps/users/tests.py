from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/users/register/'
        self.login_url = '/api/users/login/'
        self.profile_url = '/api/users/profile/'

    def test_user_registration(self):
        payload = {
            'full_name': 'Test User',
            'email': 'testuser@finora.com',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'role': 'CUSTOMER',
            'phone': '9876543210'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['user']['email'], 'testuser@finora.com')

    def test_login_and_access_profile(self):
        user = User.objects.create_user(
            email='login@finora.com',
            full_name='Login Test',
            password='Password123!'
        )
        login_res = self.client.post(self.login_url, {
            'email': 'login@finora.com',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        access_token = login_res.data['data']['tokens']['access']

        # Set Bearer token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        profile_res = self.client.get(self.profile_url)
        self.assertEqual(profile_res.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_res.data['data']['email'], 'login@finora.com')
