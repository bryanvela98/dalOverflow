"""
Test for rich text body sanitization in questions.
Tests that question body content is safely sanitized before storage.
"""
import unittest
import json
from app import create_app
from database import db
from models.user import User
from models.question import Question

class TestRichTextBodySanitization(unittest.TestCase):
    def setUp(self):
        """Set up test client and database"""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            
            # Create test user using the existing method
            user_data = {
                'username': 'testuser',
                'email': 'test123@example.com',
                'password': '12345',
                'display_name': 'Test User',
                'reputation': 0,
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