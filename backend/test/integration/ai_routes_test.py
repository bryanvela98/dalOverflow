import unittest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from test.test_base import DatabaseTestCase, TestDataCreation
from unittest.mock import patch


class AiRoutesTestCase(DatabaseTestCase, TestDataCreation):
    
    @patch('services.gemini_services.GeminiServices.generate_answer')
    def test_post_ai_answer_success(self, mock_generate):
        """Test POST /api/ai/answer generates AI response with HTML"""
        mock_generate.return_value = "<p>You can create lists in Python like this:</p><pre><code>my_list = [1, 2, 3]</code></pre>"

        payload = {
            'title': 'How to create a list in Python?',
            'body': 'I want to know different ways to create lists'
        }
        
        response = self.client.post('/api/ai/answer', json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('answer', data)
        self.assertIn('<pre><code>', data['answer'])
        self.assertEqual(data['title'], 'How to create a list in Python?')
    
    def test_post_ai_answer_missing_title(self):
        """Test POST /api/ai/answer fails without title"""
        payload = {'body': 'some details'}
        
        response = self.client.post('/api/ai/answer', json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        
    @patch('services.gemini_services.GeminiServices.summarize_answers')
    def test_post_ai_summary_success(self, mock_summarize):
        """Test POST /api/ai/summarize generates a summary from answer and its comments"""
        mock_summarize.return_value = ("<p>This is a summary of the best answer.</p>", False)

        payload = {
            "answer": 
                {
                    "body": "The oldest and most upvoted answer. Use Array.prototype.slice.call(arguments).",
                    "comments": [
                        {"body": "This is outdated now."},
                        {"body": "Works, but there are better ways."}
                    ]
                },
        }
        
        response = self.client.post('/api/ai/summarize', json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('summary', data)
        self.assertEqual(data['summary'], "<p>This is a summary of the best answer.</p>")
        mock_summarize.assert_called_once_with(payload['answer'])
        
if __name__ == '__main__':
    unittest.main()