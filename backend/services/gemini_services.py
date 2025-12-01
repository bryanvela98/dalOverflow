import os
import logging
from google import genai

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-1.5-flash"
    
    def generate_answer(self, title, body):
        """
        Generate an answer for a programming question
        
        Args:
            title (str): Question title
            body (str): Question details/body
            
        Returns:
            str: Generated answer with HTML formatting for code
        """
        if not title or title.strip() == "":
            raise ValueError("Question title cannot be empty")
        
        try:
            # Define context for programming questions
            context = """You are an expert teacher. 
            - Provide clear, accurate, concise answers to questions
            - Use HTML formatting for code: <pre><code>your code here</code></pre>
            - Use <strong> for emphasis and <em> for important concepts
            - Break answers into logical sections with proper HTML structure
            - Include practical examples when relevant"""
            
            # creating the prompt
            prompt = f"""{context}

                    Question: {title}

                    Details: {body}

                    Please provide a comprehensive answer with proper HTML formatting for any code examples:"""
            
            # Call Gemini API
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "max_output_tokens": 500,
                    "temperature": 0.7,
                }
            )
            
            return response.text
            
        except Exception as e:
            logging.error(f"Gemini API error: {str(e)}")
            raise Exception(f"Failed to generate answer: {str(e)}")