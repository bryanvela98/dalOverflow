"""
Description: Test for rich text body sanitization in questions.
Tests that question body content is safely sanitized before storage.
Last Modified By: Bryan Vela
Created: 2025-11-01
Last Modified: 
    2025-10-26 - File created with test sanitation logic.
"""

import unittest
import json
import os
from datetime import datetime, timezone

# Override environment variables for testing BEFORE importing anything else
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['DB_URL'] = 'sqlite:///:memory:'

from app import create_app
from database import db
from models.user import User
from models.question import Question

class TestRichTextBodySanitization(unittest.TestCase):
    def setUp(self):
        """Set up test client and database"""
        # Use the existing app factory from app.py with overridden env vars
        self.app = create_app()
        
        # Set additional test configuration
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            
            # Create test user with all required fields
            user_data = {
                'username': 'testuser',
                'email': 'test123@example.com',
                'password': '12345',
                'display_name': 'Test User',
                'reputation': 0,
                'registration_date': datetime.now(timezone.utc),
                'university': 'Test University'
            }
            self.test_user = User.create(user_data)
            self.user_id = self.test_user.id
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            
            
    def test_sanitize_dangerous_script_tags(self):
        """Test that script tags are removed from body"""
        question_data = {
            'type': 'technical',
            'user_id': self.user_id,
            'title': 'Test Question',
            'body': '<p>Safe content</p><script>alert("XSS")</script><p>More safe content</p>',
            'status': 'open'
        }

        response = self.client.post(
            '/api/questions/',
            data=json.dumps(question_data),
            content_type='application/json'
        )

        # Debug: Print response details if not 201
        if response.status_code != 201:
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.get_json()}")
            print(f"Data: {response.get_data()}")
        
        self.assertEqual(response.status_code, 201)
        response_data = json.loads(response.data)
        
        stored_body = response_data['question']['body']
        self.assertNotIn('<script>', stored_body)
        self.assertNotIn('alert', stored_body)
        self.assertIn('<p>Safe content</p>', stored_body)

    def test_preserve_safe_html_formatting(self):
        """Test that safe HTML formatting is preserved"""
        question_data = {
            'type': 'technical',
            'user_id': self.user_id,
            'title': 'Formatting Test',
            'body': '<p>This is <strong>bold</strong> and <em>italic</em> text with <code>code</code>.</p>',
            'status': 'open'
        }
        
        response = self.client.post(
            '/api/questions/',
            data=json.dumps(question_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        response_data = json.loads(response.data)
        
        stored_body = response_data['question']['body']
        self.assertIn('<strong>bold</strong>', stored_body)
        self.assertIn('<em>italic</em>', stored_body)
        self.assertIn('<code>code</code>', stored_body)
        
    def test_remove_dangerous_attributes(self):
        """Test that dangerous attributes are removed"""
        question_data = {
            'type': 'technical',
            'user_id': self.user_id,
            'title': 'Dangerous Attributes Test',
            'body': '<p onclick="alert(\'XSS\')">Click me</p><img src="x" onerror="alert(\'XSS\')">',
            'status': 'open'
        }
        
        response = self.client.post(
            '/api/questions/',
            data=json.dumps(question_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        response_data = json.loads(response.data)
        
        stored_body = response_data['question']['body']
        self.assertNotIn('onclick', stored_body)
        self.assertNotIn('onerror', stored_body)
        
if __name__ == '__main__':
    unittest.main()