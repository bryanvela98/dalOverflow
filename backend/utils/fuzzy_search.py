"""
Description: Fuzzy search utility functions for searching questions based on title.
Last Modified By: Bryan Vela
Created: 2025-11-07
Last Modified: 
    2025-11-07 - Creation and logic.
"""
import re

def get_all_questions():
    """Get all questions from the database."""
    try:
        from models.question import Question
        questions = Question.get_all()
        return [question.to_dict() for question in questions] if questions else []
    except Exception:
        return []

def calculate_score(query, title):
    """
    Calculate a simple similarity score based on query presence in title.

    Args:
        query (str): Search query
        title (str): Question title

    Returns:
        float: Similarity score between 0 and 1
    """
    if not query or not title:
        return 0.0
    
    # Clean and normalize text - remove punctuation and convert to lowercase

    clean_query = re.sub(r'[^\w\s]', '', query.lower().strip())
    clean_title = re.sub(r'[^\w\s]', '', title.lower().strip())
    
    # Exact title match gets highest score
    if clean_query == clean_title:
        return 1.0
    
    query_words = set(clean_query.split())
    title_words = set(clean_title.split())
    
    # removing common stop words to improve matching
    stop_words = {'the', 'is', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'what', 'how', 'when', 'where', 'why'}
    query_words = query_words - stop_words
    title_words = title_words - stop_words
    
    # Calc word overlap (excluding stop words)
    title_overlap = len(query_words.intersection(title_words))
    total_query_words = len(query_words)
    
    if total_query_words == 0:
        return 0.0
    
    # Score based on meaningful word overlap
    title_score = title_overlap / total_query_words
    
    # Weight the score - generous for partial matches
    final_score = title_score * 0.9

    return min(final_score, 1.0)  # Cap at 1.0

def search_questions(query):
    
    if not query or not query.strip():
        return []
    
    questions = get_all_questions()
    results = []
    
    for question in questions:
        score = calculate_score(query, question['title'])
        if score > 0.5:  # including decent scores
            result = {
                'id': question['id'],
                'title': question['title'],
                'score': score
            }
            results.append(result)
    # score descending sort
    results.sort(key=lambda x: x['score'], reverse=True)
    return results