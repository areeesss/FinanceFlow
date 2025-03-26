from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        # Use the exact URL names from your urls.py
        self.register_url = reverse('register')  # matches name='register'
        self.login_url = reverse('login')       # matches name='login'
        self.logout_url = reverse('logout')     # matches name='logout'
        self.user_url = reverse('user')         # matches name='user'
        
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'full_name': 'Test User',
            'password': 'securepassword123',
            'password2': 'securepassword123'
        }
    
    def test_register_user(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)
        self.assertTrue('user' in response.data)

    
    def test_register_mismatched_passwords(self):
        data = self.user_data.copy()
        data['password2'] = 'differentpassword'
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_user(self):
        # First register
        self.client.post(self.register_url, self.user_data)
        
        # Then login
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
    
    def test_get_user_info(self):
        # Register and login
        self.client.post(self.register_url, self.user_data)
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(self.login_url, login_data)
        
        # Test authenticated endpoint
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])

def test_login_with_invalid_credentials(self):
    response = self.client.post(self.login_url, {
        'email': 'wrong@example.com',
        'password': 'wrongpassword'
    })
    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

def test_access_protected_endpoint(self):
    # First register and login
    self.client.post(self.register_url, self.user_data)
    login_res = self.client.post(self.login_url, {
        'email': self.user_data['email'],
        'password': self.user_data['password']
    })
    
    # Test accessing protected endpoint
    token = login_res.data['access']
    response = self.client.get(
        self.user_url,
        HTTP_AUTHORIZATION=f'Bearer {token}'
    )
    self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout(self):
        # Register and login
        self.client.post(self.register_url, self.user_data)
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(self.login_url, login_data)
        
        # Test logout
        token = login_response.data['refresh']
        response = self.client.post(self.logout_url, {'refresh': token})
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)