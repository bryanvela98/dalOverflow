"""
Description: Unit tests for gemini_services functionality.
Last Modified By: Bryan Vela
Created: 2025-12-03
Last Modified: 
    2025-12-03 - Refactored to unit tests for gemini_services function only.
"""
import unittest
import os
from unittest.mock import patch, MagicMock
from services.gemini_services import GeminiServices
from google.genai.types import FinishReason


class GeminiServicesTestCase(unittest.TestCase):
    """Test cases for GeminiServices"""

    def setUp(self):
        """Set up test fixtures"""
        # Set a fake API key for testing
        os.environ['GEMINI_API_KEY'] = 'test-api-key-12345'

    def tearDown(self):
        """Clean up after tests"""
        if 'GEMINI_API_KEY' in os.environ:
            del os.environ['GEMINI_API_KEY']

    @patch('services.gemini_services.genai.Client')
    def test_init_with_api_key(self, mock_client):
        """Test GeminiServices initialization with valid API key"""
        service = GeminiServices()
        
        self.assertIsNotNone(service.api_key)
        self.assertEqual(service.api_key, 'test-api-key-12345')
        self.assertEqual(service.model_name, 'gemini-2.5-flash')
        mock_client.assert_called_once_with(api_key='test-api-key-12345')

    def test_init_without_api_key(self):
        """Test GeminiServices initialization fails without API key"""
        del os.environ['GEMINI_API_KEY']
        
        with self.assertRaises(ValueError) as context:
            GeminiServices()
        
        self.assertIn('GEMINI_API_KEY', str(context.exception))

    @patch('services.gemini_services.genai.Client')
    def test_generate_answer_success(self, mock_client):
        """Test successful answer generation"""
        # Mock the API response
        mock_response = MagicMock()
        mock_response.text = "<p>This is a test answer with <b>bold text</b></p>"
        mock_response.candidates = [MagicMock()]
        mock_response.candidates[0].finish_reason = FinishReason.STOP
        
        mock_client_instance = mock_client.return_value
        mock_client_instance.models.generate_content.return_value = mock_response
        
        service = GeminiServices()
        answer, is_truncated = service.generate_answer(
            "How to use Python?",
            "I need help with Python basics"
        )
        
        self.assertIsNotNone(answer)
        self.assertIn("test answer", answer)
        self.assertFalse(is_truncated)
        mock_client_instance.models.generate_content.assert_called_once()

    @patch('services.gemini_services.genai.Client')
    def test_generate_answer_empty_title(self, mock_client):
        """Test answer generation fails with empty title"""
        service = GeminiServices()
        
        with self.assertRaises(ValueError) as context:
            service.generate_answer("", "Some body text")
        
        self.assertIn("title cannot be empty", str(context.exception))

    @patch('services.gemini_services.genai.Client')
    def test_generate_answer_whitespace_title(self, mock_client):
        """Test answer generation fails with whitespace-only title"""
        service = GeminiServices()
        
        with self.assertRaises(ValueError) as context:
            service.generate_answer("   ", "Some body text")
        
        self.assertIn("title cannot be empty", str(context.exception))

    @patch('services.gemini_services.genai.Client')
    def test_generate_answer_truncated(self, mock_client):
        """Test answer generation when response is truncated"""
        # First call returns truncated response
        mock_truncated_response = MagicMock()
        mock_truncated_response.text = "Truncated answer..."
        mock_truncated_response.candidates = [MagicMock()]
        mock_truncated_response.candidates[0].finish_reason = FinishReason.MAX_TOKENS
        
        # Second call returns complete response
        mock_complete_response = MagicMock()
        mock_complete_response.text = "<p>Complete concise answer</p>"
        mock_complete_response.candidates = [MagicMock()]
        mock_complete_response.candidates[0].finish_reason = FinishReason.STOP
        
        mock_client_instance = mock_client.return_value
        mock_client_instance.models.generate_content.side_effect = [
            mock_truncated_response,
            mock_complete_response
        ]
        
        service = GeminiServices()
        answer, is_truncated = service.generate_answer(
            "Complex question",
            "Very detailed body"
        )
        
        self.assertIsNotNone(answer)
        self.assertIn("Complete concise answer", answer)
        self.assertFalse(is_truncated)  # Final response is not truncated
        self.assertEqual(mock_client_instance.models.generate_content.call_count, 2)

    @patch('services.gemini_services.genai.Client')
    @patch('services.gemini_services.logging')
    def test_generate_answer_api_error(self, mock_logging, mock_client):
        """Test answer generation handles API errors"""
        mock_client_instance = mock_client.return_value
        mock_client_instance.models.generate_content.side_effect = Exception("API Error")
        
        service = GeminiServices()
        
        # Should not raise, but log error
        result = service.generate_answer("Test", "Test body")
        
        # Check that error was logged
        mock_logging.error.assert_called()
        self.assertIsNone(result)

    @patch('services.gemini_services.genai.Client')
    def test_summarize_answers_with_list(self, mock_client):
        """Test summarize_answers with list of answers"""
        mock_response = MagicMock()
        mock_response.text = "<p>Summary of all answers</p>"
        mock_response.candidates = [MagicMock()]
        mock_response.candidates[0].finish_reason = FinishReason.STOP
        
        mock_client_instance = mock_client.return_value
        mock_client_instance.models.generate_content.return_value = mock_response
        
        service = GeminiServices()
        answers = [
            {'body': 'First answer body'},
            {'body': 'Second answer body'}
        ]
        
        summary, is_truncated = service.summarize_answers(answers)
        
        self.assertIsNotNone(summary)
        self.assertIn("Summary", summary)
        self.assertFalse(is_truncated)
        mock_client_instance.models.generate_content.assert_called_once()

    @patch('services.gemini_services.genai.Client')
    def test_summarize_answers_with_single_dict(self, mock_client):
        """Test summarize_answers with single answer dict"""
        mock_response = MagicMock()
        mock_response.text = "<p>Summary of single answer</p>"
        mock_response.candidates = [MagicMock()]
        mock_response.candidates[0].finish_reason = FinishReason.STOP
        
        mock_client_instance = mock_client.return_value
        mock_client_instance.models.generate_content.return_value = mock_response
        
        service = GeminiServices()
        answer = {'body': 'Single answer body'}
        
        summary, is_truncated = service.summarize_answers(answer)
        
        self.assertIsNotNone(summary)
        self.assertFalse(is_truncated)

    @patch('services.gemini_services.genai.Client')
    def test_summarize_answers_truncated(self, mock_client):
        """Test summarize_answers when response is truncated"""
        # First call returns truncated
        mock_truncated = MagicMock()
        mock_truncated.text = "Truncated summary..."
        mock_truncated.candidates = [MagicMock()]
        mock_truncated.candidates[0].finish_reason = FinishReason.MAX_TOKENS
        
        # Second call returns complete
        mock_complete = MagicMock()
        mock_complete.text = "<p>Complete summary</p>"
        mock_complete.candidates = [MagicMock()]
        mock_complete.candidates[0].finish_reason = FinishReason.STOP
        
        mock_client_instance = mock_client.return_value
        mock_client_instance.models.generate_content.side_effect = [
            mock_truncated,
            mock_complete
        ]
        
        service = GeminiServices()
        answers = [{'body': 'Answer 1'}, {'body': 'Answer 2'}]
        
        summary, is_truncated = service.summarize_answers(answers)
        
        self.assertIsNotNone(summary)
        self.assertFalse(is_truncated)
        self.assertEqual(mock_client_instance.models.generate_content.call_count, 2)

    @patch('services.gemini_services.genai.Client')
    def test_summarize_answers_invalid_type(self, mock_client):
        """Test summarize_answers with invalid input type"""
        service = GeminiServices()
        
        with self.assertRaises(Exception) as context:
            service.summarize_answers("invalid string")
        
        self.assertIn("Failed to generate summary", str(context.exception))

    @patch('services.gemini_services.genai.Client')
    @patch('services.gemini_services.logging')
    def test_summarize_answers_api_error(self, mock_logging, mock_client):
        """Test summarize_answers handles API errors"""
        mock_client_instance = mock_client.return_value
        mock_client_instance.models.generate_content.side_effect = Exception("API Error")
        
        service = GeminiServices()
        answers = [{'body': 'Test answer'}]
        
        with self.assertRaises(Exception) as context:
            service.summarize_answers(answers)
        
        self.assertIn("Failed to generate summary", str(context.exception))
        mock_logging.error.assert_called()

    @patch('services.gemini_services.genai.Client')
    def test_is_response_truncated_true(self, mock_client):
        """Test is_response_truncated returns True for MAX_TOKENS"""
        service = GeminiServices()
        
        mock_response = MagicMock()
        mock_response.candidates = [MagicMock()]
        mock_response.candidates[0].finish_reason = FinishReason.MAX_TOKENS
        
        result = service.is_response_truncated(mock_response)
        
        self.assertTrue(result)

    @patch('services.gemini_services.genai.Client')
    def test_is_response_truncated_false(self, mock_client):
        """Test is_response_truncated returns False for STOP"""
        service = GeminiServices()
        
        mock_response = MagicMock()
        mock_response.candidates = [MagicMock()]
        mock_response.candidates[0].finish_reason = FinishReason.STOP
        
        result = service.is_response_truncated(mock_response)
        
        self.assertFalse(result)

    @patch('services.gemini_services.genai.Client')
    def test_is_response_truncated_no_candidates(self, mock_client):
        """Test is_response_truncated with no candidates"""
        service = GeminiServices()
        
        mock_response = MagicMock()
        mock_response.candidates = []
        
        result = service.is_response_truncated(mock_response)
        
        self.assertFalse(result)

    @patch('services.gemini_services.genai.Client')
    def test_is_response_truncated_none_response(self, mock_client):
        """Test is_response_truncated with None response"""
        service = GeminiServices()
        
        result = service.is_response_truncated(None)
        
        self.assertFalse(result)


if __name__ == '__main__':
    unittest.main()
