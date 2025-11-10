"""
Description: Unit tests for fuzzy search functionality.
Last Modified By: Bryan Vela
Created: 2025-11-07
Last Modified: 
    2025-11-07 - Refactored to unit tests for fuzzy search function only.
"""
import unittest
from unittest.mock import patch, MagicMock
from utils.fuzzy_search import *

class TestFuzzySearchBasic(unittest.TestCase):

    
    def test_search_exact_match_returns_result(self):
        """Test that exact title match returns high score result"""
        
        # Mock question data
        mock_questions = [
            {'id': 1, 'title': 'what is the most common use of flask?'},
            {'id': 2, 'title': 'what is the easiest Python Guide?'}
        ]
        
        with patch('utils.fuzzy_search.get_all_questions') as mock_get:
            mock_get.return_value = mock_questions
            
            results = search_questions('Flask Tutorial')
            
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['id'], 1)
            self.assertGreater(results[0]['score'], 0.8) # High score for exact match

    def test_search_empty_query_returns_empty(self):
        """Test that empty query returns no results"""
        from utils.fuzzy_search import search_questions
        
        results = search_questions('')
        self.assertEqual(results, [])
        
        results = search_questions('   ')  # whitespace only
        self.assertEqual(results, [])
    
    def test_search_partial_match_lower_score(self):
        """Test that partial matches return lower scores"""
        from utils.fuzzy_search import search_questions
        
        mock_questions = [
            {'id': 1, 'title': 'what is the Flask Web Development?'},
        ]
        
        with patch('utils.fuzzy_search.get_all_questions') as mock_get:
            mock_get.return_value = mock_questions
            
            results = search_questions('Flask')
            
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['id'], 1)
            self.assertLess(results[0]['score'], 1.0)  # leess than exact match
            self.assertGreater(results[0]['score'], 0.0)  # But still found
    
    def test_search_no_match_returns_empty(self):
        """Test that queries with no matches return empty results"""
        
        mock_questions = [
            {'id': 1, 'title': 'Flask Tutorial'},
        ]
        
        with patch('utils.fuzzy_search.get_all_questions') as mock_get:
            mock_get.return_value = mock_questions
            
            results = search_questions('JavaScript')  # No match
            
            self.assertEqual(results, [])
    def test_search_word_order_independent(self):
            """Test that word order doesn't affect matching"""
            from utils.fuzzy_search import search_questions
            
            mock_questions = [
                {'id': 1, 'title': 'whats the best Python Flask Tutorial?'},
            ]
            
            with patch('utils.fuzzy_search.get_all_questions') as mock_get:
                mock_get.return_value = mock_questions
                
                # Both queries should find the same result
                results1 = search_questions('Flask Python')
                results2 = search_questions('Python Flask')
                
                self.assertEqual(len(results1), 1)
                self.assertEqual(len(results2), 1)
                self.assertEqual(results1[0]['score'], results2[0]['score'])
                
if __name__ == '__main__':
    unittest.main()