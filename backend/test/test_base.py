"""
Description: Base test classes and utilities for database integration tests.
Author: Bryan Vela
Created: 2025-11-09
Last Modified: 
    2025-11-09 - Created reusable database setup for integration tests.
"""
import unittest
import os
from app import create_app
from database import db

class DatabaseTestCase(unittest.TestCase):
    """Base test class with database setup for integration tests"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test app configuration once for all tests"""
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        os.environ['DB_URL'] = 'sqlite:///:memory:'
        
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up app context"""
        cls.app_context.pop()
    
    def setUp(self):
        """Set up test database and client for each test"""
        self.client = self.app.test_client()
        db.create_all()
    
    def tearDown(self):
        """Clean up database after each test"""
        db.session.remove()
        db.drop_all()

class TestDataCreation(unittest.TestCase):
    
    def create_test_user(self, username='daluser', email='test@dal.ca'):
        """Helper method to create a test user"""
        from models.user import User
        return User.create({
            'username': username,
            'email': email,
            'password': 'password123',
            'display_name': f'Display {username}',
            'reputation': 0,
            'university': 'Test University'
        })
    
    def create_test_question(self, user_id, title='Test Question', body='Test body'):
        """Helper method to create a test question"""
        from models.question import Question
        return Question.create_with_sanitized_body({
            'title': title,
            'body': body,
            'user_id': user_id,
            'status': 'open',
            'type': 'technical'
        })
    
    def create_test_tag(self, tag_name='TestTag', description='Test tag description'):
        """Helper method to create a test tag"""
        from models.tag import Tag
        return Tag.create({
            'tag_name': tag_name,
            'tag_description': description
        })

class MockedTestCase(unittest.TestCase):
    """Base test class for tests that use mocks instead of real database"""
    
    def setUp(self):
        """Set up mock app for unit-style tests"""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        