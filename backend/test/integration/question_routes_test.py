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


class QuestionRoutesTestCase(DatabaseTestCase, TestDataCreation):
    """Integration tests for question routes"""

    def test_fuzzy_search_endpoint_exists(self):
        """Test that the fuzzy search endpoint exists and returns proper structure"""
        # Create a test user first
        user = self.create_test_user()
        
        # Test the endpoint exists and responds
        response = self.client.get('/questions/search?query=test')
        
        # Should return 200 even if no results (we'll implement this)
        self.assertEqual(response.status_code, 200)
        
        # Should return JSON with results array
        data = response.get_json()
        self.assertIn('results', data)
        self.assertIsInstance(data['results'], list)


if __name__ == '__main__':
    unittest.main()