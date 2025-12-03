"""
Description: Service class for interacting with the Gemini AI API.
Last Modified By: Bryan Vela
Created: 2025-12-01
Last Modified: 
    2025-12-01 - File created with AI response generation and summarization.
"""
import os
import logging
from google import genai
from google.genai.types import FinishReason

class GeminiServices:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-2.5-flash"
    
    def generate_answer(self, title, body):
        """
        Generate an answer for a programming question
        
        Args:
            title (str): Question title
            body (str): Question details/body
            
        Returns:
            tuple[str, bool]: A tuple containing the generated answer text 
                              and a boolean indicating if it was truncated.
        """
        if not title or title.strip() == "":
            raise ValueError("Question title cannot be empty")
        
        try:

            # Define context for programming questions
            context = """You're an expert teacher providing that first identifies the difficulty of the content and provides clear and concise answers. Follow this guidelines:
            1. If the question is simple, provide a direct answer without unnecessary elaboration.
            2. Provide examples if the content requires it.
            3. Use proper HTML formatting for code snippets.
            4. Ensure to use bold for important terms."""

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
                    "max_output_tokens": 4000,
                    "temperature": 0.7,
                }
            )

            truncated = self.is_response_truncated(response)

            if truncated:
                logging.info("Answer was truncated. Requesting a concise version.")
                concise_prompt = f"""The previous answer was too long. Provide a more concise answer for the same question, focusing on the key points.

                        Question: {title}

                        Details: {body}

                        Please provide a concise answer with proper HTML formatting for any code examples:"""

                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=concise_prompt,
                    config={
                        "max_output_tokens": 10000,
                        "temperature": 0.5,
                    }
                )
                # The new response is concise, so we assume it's not truncated.
                return response.text, False
            
            return response.text, truncated
            
        except Exception as e:
            logging.error(f"Gemini API error: {str(e)}")

    def summarize_answers(self, answers):
        """
        Summarizes a collection of answers. The summarization should focus on
        the answers' bodies and synthesize a single, improved answer.

        Args:
            answers (list|dict): Either a list of answer dictionaries or a single
                                 answer dict. Each answer dict is expected to
                                 contain a 'body' field (string).

        Returns:
            tuple[str, bool]: A tuple containing the summary text and a boolean
                              indicating if it was truncated.
        """
        try:
            context = """You are a technical teacher tasked with summarizing multiple answers.
                    Focus the summarization on the answers' bodies: compare the
                    proposed solutions, identify the most accurate and up-to-date
                    recommendations, and synthesize a single, improved summary.
                    Follow these guidelines:
                    1. Prioritize conciseness.
                    2. If answers disagree, explain the tradeoffs and recommend the best option.
                    3. Use proper HTML formatting for code snippets (`<pre><code>...</code></pre>`) and bold tags (`<b>...</b>`) for important terms.
                    4. The final output should be a single cohesive summary derived from the provided answers' bodies.
                """

            # Normalize input: accept a dict (single answer) or a list of answers
            if isinstance(answers, dict):
                answers_list = [answers]
            elif isinstance(answers, list):
                answers_list = answers
            else:
                raise ValueError("`answers` must be a list of answer dicts or a single answer dict")

            # Build the content text focusing on bodies
            content_text = "Collected Answer Bodies:\n\n"
            for idx, ans in enumerate(answers_list, start=1):
                body = ans.get('body', '') if isinstance(ans, dict) else str(ans)
                content_text += f"Answer #{idx}: {body}\n\n"

            prompt = f"{context}\nHere are the collected answers to synthesize:\n\n{content_text}\nPlease provide a single, comprehensive summary based on the answers above:\n"

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={"max_output_tokens": 4000, "temperature": 0.7}
            )

            truncated = self.is_response_truncated(response)

            if truncated:
                logging.info("Summary was truncated. Requesting a concise version.")
                concise_prompt = f"The previous summary was too long. Provide a more concise summary of the same answers, focusing on the key points.\n\n{content_text}"
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=concise_prompt,
                    config={"max_output_tokens": 4000, "temperature": 0.5}
                )
                return response.text, False

            return response.text, truncated

        except Exception as e:
            logging.error(f"Gemini API summary error: {str(e)}")
            raise Exception(f"Failed to generate summary: {str(e)}")
        
    def is_response_truncated(self, response) -> bool:
        """
        Check if the Gemini API response was truncated due to token limits.

        Args:
            response: The GenerateContentResponse object from the Gemini API.

        Returns:
            bool: True if the answer was truncated, False otherwise.
        """
        if response and response.candidates:
            # The finish_reason will be MAX_TOKENS if the response was cut off.
            if response.candidates[0].finish_reason == FinishReason.MAX_TOKENS:
                logging.warning("Gemini response was truncated due to max_output_tokens limit.")
                return True
        return False
    
