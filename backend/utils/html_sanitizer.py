"""
Description: HTML sanitizer for question body content.
Removes dangerous HTML while preserving safe formatting.
Last Modified By: Bryan Vela
Created: 2025-11-01
Last Modified: 
    2025-10-26 - File created with add_sanitization_function logic.
"""

import bleach

def sanitize_html_body(content):
    """
    Sanitize HTML content for safe storage in question body.
    
    Args:
        content (str): Raw HTML content
        
    Returns:
        str: Sanitized HTML content
    """
    if not content:
        return ''
    
    # Allowed tags for question body
    allowed_tags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 
        'code', 'pre', 'blockquote', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'
    ]