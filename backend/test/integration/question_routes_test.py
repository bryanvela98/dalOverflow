"""
Description: Integration tests for question routes API endpoints.
Author: Bryan Vela
Created: 2025-11-09
Last Modified: 
    2025-11-09 - Created initial fuzzy search endpoint tests.
"""
import unittest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from test.test_base import DatabaseTestCase, TestDataCreation
from database import db

class QuestionRoutesTestCase(DatabaseTestCase, TestDataCreation):
    """Integration tests for question routes"""

    def setUp(self):
        """Set up test data for each test"""
        super().setUp()
        
        try:
            # Create test user and questions
            self.test_user = self.create_test_user()
            
            # Create test questions with different titles for fuzzy search testing
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
            self.question3 = self.create_test_question(
                user_id=self.test_user.id,
                title="what is python best practices?",
                body="The best Python coding practices"
            )
            
            # Commit all test data
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

    def test_fuzzy_search_endpoint_exists(self):
        """Test that the fuzzy search endpoint exists and returns proper structure"""
        # Test the endpoint exists and responds
        response = self.client.get('/api/questions/search?query=test')
        
        # Should return 200 even if no results
        self.assertEqual(response.status_code, 200)
        
        # Should return JSON with results array
        data = response.get_json()
        self.assertIn('results', data)
        self.assertIsInstance(data['results'], list)

    def test_fuzzy_search_exact_match(self):
        """Test fuzzy search with exact title match"""
        response = self.client.get('/api/questions/search?query=what is python best practices?')

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Should return the exact match
        self.assertTrue(len(data['results']) >= 1)
        
        # First result should be the exact match with highest score
        first_result = data['results'][0]
        self.assertEqual(first_result['title'], "what is python best practices?")
        self.assertEqual(first_result['score'], 1.0)

    def test_fuzzy_search_partial_match(self):
        """Test fuzzy search with partial keyword match"""
        response = self.client.get('/api/questions/search?query=Python')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Should return results containing "Python" (case insensitive)
        self.assertTrue(len(data['results']) >= 1, f"Expected at least 1 result, got {len(data['results'])}")
        
        for result in data['results']:
            # Check case insensitive
            title_lower = result['title'].lower()
            self.assertIn('python', title_lower, f"'python' not found in '{result['title']}'")
            self.assertTrue(result['score'] > 0.5)
            self.assertTrue(result['score'] <= 1.0)
            
    def test_fuzzy_search_multiple_keywords(self):
        """Test fuzzy search with multiple keywords"""
        response = self.client.get('/api/questions/search?query=Python practices')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Should return results with both or either keyword
        self.assertTrue(len(data['results']) >= 1, f"Expected at least 1 result, got {len(data['results'])}")
        
        # Results should be sorted by score (highest first)
        if len(data['results']) > 1:
            scores = [result['score'] for result in data['results']]
            self.assertEqual(scores, sorted(scores, reverse=True))
        
        
    def test_fuzzy_search_no_query_parameter(self):
        """Test fuzzy search without query parameter"""
        response = self.client.get('/api/questions/search')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Should return empty results
        self.assertEqual(data['results'], [])
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'No query provided')

    def test_fuzzy_search_whitespace_handling(self):
        """Test fuzzy search handles extra whitespace"""
        response = self.client.get('/api/questions/search?query=   Python   ')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Should return results despite extra whitespace
        self.assertTrue(len(data['results']) >= 1, f"Expected at least 1 result, got {len(data['results'])}")
        
if __name__ == '__main__':
    unittest.main()