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