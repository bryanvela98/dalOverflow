"""
Description: Unit tests for fuzzy search functionality.
Last Modified By: Bryan Vela
Created: 2025-11-07
Last Modified: 
    2025-11-07 - Refactored to unit tests for fuzzy search function only.
"""
import unittest
from unittest.mock import patch, MagicMock

class TestFuzzySearchBasic(unittest.TestCase):

    
    def test_search_exact_match_returns_result(self):
        """Test that exact title match returns high score result"""
        from utils.fuzzy_search import search_questions
        
        # Mock question data
        mock_questions = [
            {'id': 1, 'title': 'Flask Tutorial', 'body': 'Learn Flask basics'},
            {'id': 2, 'title': 'Python Guide', 'body': 'Python programming'}
        ]
        
        with patch('utils.fuzzy_search.get_all_questions') as mock_get:
            mock_get.return_value = mock_questions
            
            results = search_questions('Flask Tutorial')
            
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['id'], 1)
            self.assertGreater(results[0]['score'], 0.8) # High score for exact match

if __name__ == '__main__':
    unittest.main()