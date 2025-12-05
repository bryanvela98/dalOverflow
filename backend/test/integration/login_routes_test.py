"""
Description: Integration tests for login routes API endpoints.
Author: Saayonee Dhepe
Created: 2025-12-03
Last Modified: 
    2025-12-03 - Created initial login routes integration tests.
"""
import unittest
import sys
import os
import bcrypt
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) )

from test.test_base import DatabaseTestCase
from database import db
from models.user import User


class LoginRoutesTestCase(DatabaseTestCase):
    """Integration tests for login routes"""

    def setUp(self):
        """Set up test data for each test"""
        super().setUp()
        
        try:
            # Create a test user with hashed password
            hashed_password = bcrypt.hashpw(b"testpassword123", bcrypt.gensalt()).decode('utf-8')
            self.test_user = User(
                username="testuser",
                email="test@dal.ca",
                password=hashed_password,
                display_name="Test User",
                profile_picture_url=None,
                reputation=0,
                registration_date=datetime.now(),
                university="Dalhousie University"
            )
            db.session.add(self.test_user)
            db.session.commit()
            
        except Exception as e:
            db.session.rollback()
            raise e

    def test_login_endpoint_exists(self):
        """Test that the POST /api/auth/login endpoint exists"""
        payload = {
            'email': 'test@dal.ca',
            'password': 'testpassword123'
        }
        response = self.client.post('/api/auth/login', json=payload)
        
        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)

    def test_login_missing_email(self):
        """Test login fails when email is missing"""
        payload = {
            'password': 'testpassword123'
        }
        response = self.client.post('/api/auth/login', json=payload)
        
        # Should return success: false
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertFalse(data['success'])
        self.assertIn('required', data['message'].lower())

    def test_login_missing_pswd(self):
        """Test login fails when password is missing"""
        payload = {
            'email': 'test@dal.ca'
        }
        response = self.client.post('/api/auth/login', json=payload)
        
        # Should return success: false
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertFalse(data['success'])
        self.assertIn('required', data['message'].lower())

    def test_login_invalid_cred(self):
        """Test login fails with invalid password"""
        payload = {
            'email': 'test@dal.ca',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/auth/login', json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertFalse(data['success'])
        self.assertIn('invalid', data['message'].lower())

    def test_login_nonexistent_user(self):
        """Test login fails with nonexistent email"""
        payload = {
            'email': 'nonexistent@dal.ca',
            'password': 'testpassword123'
        }
        response = self.client.post('/api/auth/login', json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertFalse(data['success'])
        self.assertIn('invalid', data['message'].lower())

    def test_logout_endpoint_exists(self):
        """Test that the POST /api/auth/logout endpoint exists"""
        response = self.client.post('/api/auth/logout')
        
        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)

    def test_logout_success(self):
        """Test logout returns success message"""
        response = self.client.post('/api/auth/logout')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        # Logout should return success response
        self.assertIn('message', data)
        self.assertIn('logout', data['message'].lower())

    def test_chk_login_endpoint_exist(self):
        """Test that the GET /api/auth/check-login endpoint exists"""
        response = self.client.get('/api/auth/check-login')
        
        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)

    def test_chk_login_not_logged_in(self):
        """Test check-login returns loggedIn: false when not logged in"""
        response = self.client.get('/api/auth/check-login')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertFalse(data['loggedIn'])

    def test_login_page_endpoint_exist(self):
        """Test that the GET /api/auth/login endpoint exists"""
        response = self.client.get('/api/auth/login')
        
        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)

    def test_login_pg_return_next_url(self):
        """Test login page returns next URL parameter"""
        response = self.client.get('/api/auth/login?next=/api/questions')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['next'], '/api/questions')
