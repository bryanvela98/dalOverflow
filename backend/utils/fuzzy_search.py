"""
Description: Fuzzy search utility functions for searching questions based on title.
Last Modified By: Bryan Vela
Created: 2025-11-07
Last Modified: 
    2025-11-07 - Creation and logic.
"""

def get_all_questions():

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
    
    # Exact title match gets highest score
    if query.lower().strip() == title.lower().strip():
        return 1.0
    
    query_words = set(query.lower().split())
    title_words = set(title.lower().split())
    
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
    
    # Weight the score
    final_score = title_score * 0.8

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