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
    query_lower = query.lower()
    title_lower = title.lower()
    
    # Simple exact match scoring
    if query_lower == title_lower:
        return 1.0
    elif query_lower in title_lower:
        return 0.8
    else:
        return 0.0

def search_questions(query):
    
    if not query or not query.strip():
        return []
    
    questions = get_all_questions()
    results = []
    
    for question in questions:
        score = calculate_score(query, question['title'])
        if score > 0:
            result = {
                'id': question['id'],
                'title': question['title'],
                'score': score
            }
            results.append(result)
    # score descending sort
    results.sort(key=lambda x: x['score'], reverse=True)
    return results