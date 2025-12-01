import os
import logging
from google import genai

class GeminiServices:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-2.5-flash"
    
    def generate_answer(self, title, body):
        """Generate answer with chunking for long responses"""
        if not title or title.strip() == "":
            raise ValueError("Question title cannot be empty")
        
        try:
            # First, ask for an outline
            outline = self._generate_outline(title, body)
            
            # Then generate detailed sections
            if len(outline.split()) > 100:  # Complex topic, use chunking
                return self._generate_chunked_answer(title, body, outline)
            else:
                return self._generate_standard_answer(title, body)
                
        except Exception as e:
            logging.error(f"Gemini API error: {str(e)}")
            raise Exception(f"Failed to generate answer: {str(e)}")

    def _generate_outline(self, title, body):
        """Generate an outline to understand complexity"""
        outline_prompt = f"""Analyze this question and provide a brief outline of topics to cover:

    Question: {title}
    Details: {body}

    Provide a simple numbered outline (3-5 main points maximum):"""
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=outline_prompt,
            config={"max_output_tokens": 500, "temperature": 0.3}
        )
        
        return response.text

    def _generate_chunked_answer(self, title, body, outline):
        """Generate answer in chunks for complex topics"""
        sections = []
        
        # Extract main points from outline
        main_points = self._extract_main_points(outline)
        
        for i, point in enumerate(main_points[:3], 1):  # Limit to 3 main sections
            section_prompt = f"""You are an expert teacher. Focus ONLY on this specific aspect:

    Question: {title}
    Context: {body}
    Focus on: {point}

    Provide a complete section about this topic with HTML formatting. Be thorough but focused:"""
            
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=section_prompt,
                    config={"max_output_tokens": 1500, "temperature": 0.6}
                )
                sections.append(f"<h3>Section {i}</h3>{response.text}")
            except Exception as e:
                logging.warning(f"Error generating section {i}: {str(e)}")
                continue
        
        # Combine all sections
        complete_answer = "<div>" + "".join(sections) + "</div>"
        return complete_answer

    def _extract_main_points(self, outline):
        """Extract main points from outline"""
        lines = outline.split('\n')
        main_points = []
        
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('•') or line.startswith('-')):
                # Clean the point
                point = line.split('.', 1)[-1].strip() if '.' in line else line.strip()
                main_points.append(point)
        
        return main_points[:5]  # Limit to 5 points max

    def _generate_standard_answer(self, title, body):
        """Generate standard answer for simpler topics"""
        context = """You are an expert teacher. 
        - Provide clear, accurate, complete answers
        - Use HTML formatting for code: <pre><code>code</code></pre>
        - Use <strong> for emphasis and <em> for important concepts
        - Include practical examples
        - Ensure your response is complete and doesn't cut off mid-sentence"""
        
        prompt = f"""{context}

    Question: {title}
    Details: {body}

    Please provide a complete, well-formatted answer:"""
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config={
                "max_output_tokens": 3000,
                "temperature": 0.7,
            }
        )
        
        return response.text