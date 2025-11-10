import unittest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) # this is to ensure imports work correctly

from test.test_base import DatabaseTestCase, TestDataCreation
from database import db

class QuestionTagRoutesTestCase(DatabaseTestCase, TestDataCreation):
    
    def setUp(self):
        """Set up test data for each test"""
        super().setUp()
        
        try:
            # Create test user and questions
            self.test_user = self.create_test_user()
            
            # test questions with various titles and bodies
            self.question1 = self.create_test_question(
                user_id=self.test_user.id,
                title="How to implement Python fuzzy search?",
                body="I need help with fuzzy search implementation"
            )
            self.question2 = self.create_test_question(
                user_id=self.test_user.id,
                title="Database optimization techniques?",
                body="Best practices for database performance"
            )
            
            # tag creation 
            self.tag_python = self.create_test_tag("Python","Python programming")
            self.tag_database = self.create_test_tag("Database","Database management")
            self.tag_programming = self.create_test_tag("Programming","General programming")

            # Commit all test data
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
        
    # endpoint existence test
    def test_get_tags_endpoint_exists(self):
        """GET /api/questions/{id}/tags endpoint exists"""
        response = self.client.get(f'/api/questions/{self.question1.id}/tags')
        
        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)
        
        # Should return JSON
        data = response.get_json()
        self.assertIsNotNone(data)

    # Empty tags response
    def test_get_tags_empty_response(self):

        response = self.client.get(f'/api/questions/{self.question1.id}/tags')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('tags', data)
        self.assertEqual(len(data['tags']), 0)
        
    # non existent question
    def test_get_tags_question_not_found(self):
        """returns 404"""
        response = self.client.get('/api/questions/99999/tags')
        
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn('error', data)