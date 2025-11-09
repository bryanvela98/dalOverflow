"""
Description: Unit tests for HTML sanitization in question body content.
Tests the sanitize_html_body function directly without database integration.
Last Modified By: Bryan Vela
Created: 2025-11-01
Last Modified: 
    2025-11-09 - Refactored to unit tests for sanitization function only.
"""

import unittest
from utils.html_sanitizer import sanitize_html_body

class TestHtmlSanitization(unittest.TestCase):
    
    def test_sanitize_dangerous_script_tags(self):
        """Test that script tags are removed from content"""
        input_html = '<p>Safe content</p><script>alert("XSS")</script><p>More safe content</p>'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('<script>', result)
        self.assertNotIn('alert', result)
        self.assertIn('<p>Safe content</p>', result)
        self.assertIn('<p>More safe content</p>', result)

    def test_preserve_safe_html_formatting(self):
        """Test that safe HTML formatting is preserved"""
        input_html = '<p>This is <strong>bold</strong> and <em>italic</em> text with <code>code</code>.</p>'
        
        result = sanitize_html_body(input_html)
        
        self.assertIn('<strong>bold</strong>', result)
        self.assertIn('<em>italic</em>', result)
        self.assertIn('<code>code</code>', result)
        self.assertEqual(result, input_html) 
        
    def test_remove_dangerous_attributes(self):
        """Test that dangerous attributes are removed"""
        input_html = '<p onclick="alert(\'XSS\')">Click me</p><img src="x" onerror="alert(\'XSS\')">'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('onclick', result)
        self.assertNotIn('onerror', result)
        self.assertIn('<p>Click me</p>', result)
        # img tag should be removed completely since it's not in allowed tags
        self.assertNotIn('<img', result)

    def test_empty_content(self):
        """Test handling of empty content"""
        self.assertEqual(sanitize_html_body(''), '')
        self.assertEqual(sanitize_html_body(None), '')

    def test_plain_text_content(self):
        """Test that plain text passes through unchanged"""
        input_text = 'This is just plain text with no HTML.'
        result = sanitize_html_body(input_text)
        self.assertEqual(result, input_text)

    def test_nested_script_tags(self):
        """Test handling of nested or malformed script tags"""
        input_html = '<p>Safe</p><script><script>alert("nested")</script></script><p>More safe</p>'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('<script>', result)
        self.assertNotIn('alert', result)
        self.assertNotIn('nested', result)
        self.assertIn('<p>Safe</p>', result)
        self.assertIn('<p>More safe</p>', result)

    def test_case_insensitive_script_removal(self):
        """Test that script tags are removed regardless of case"""
        input_html = '<p>Safe</p><SCRIPT>alert("XSS")</SCRIPT><Script>alert("XSS2")</Script>'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('alert', result)
        self.assertNotIn('XSS', result)
        self.assertNotIn('XSS2', result)
        self.assertEqual(result, '<p>Safe</p>')

    def test_allowed_link_attributes(self):
        """Test that allowed attributes on links are preserved"""
        input_html = '<p><a href="https://dal.com" title="dal">Link</a></p>'
        
        result = sanitize_html_body(input_html)
        
        self.assertIn('href="https://dal.com"', result)
        self.assertIn('title="dal"', result)
        self.assertIn('<a', result)

    def test_disallowed_protocols(self):
        """Test that disallowed protocols are removed"""
        input_html = '<a href="javascript:alert(\'XSS\')">Bad Link</a>'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('javascript:', result)
        self.assertNotIn('alert', result)
        # Link should remain but without the href
        self.assertIn('<a>Bad Link</a>', result)

    def test_code_and_pre_tags_with_classes(self):
        """Test that code and pre tags preserve allowed class attributes"""
        input_html = '<pre class="language-python"><code class="highlight">print("hello")</code></pre>'
        
        result = sanitize_html_body(input_html)
        
        self.assertIn('class="language-python"', result)
        self.assertIn('class="highlight"', result)
        self.assertIn('print("hello")', result)
        
if __name__ == '__main__':
    unittest.main()