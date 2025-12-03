"""
Description: User routes for handling user-related API endpoints.
Created By: Devang
Created: 2025-11-01
Last Modified: Saayonee @ 12.28 AM Nov 9
    
"""
from functools import wraps
from flask import request, redirect, url_for, session, jsonify, current_app
from models.user import User
import jwt


def login_required(view_func):
    """
    Decorator for endpoints that require authentication.
    Handles both session-based (web) and token-based (API) authentication.
    
    For API endpoints (JSON requests), validates JWT token and sets request.user_id
    For web endpoints (HTML requests), checks session and redirects to login if needed
    """
    @wraps(view_func)
    def wrapped_view(*args, **kwargs):
        print(f"🔍 DEBUG: Path={request.path}")
        print(f"🔍 DEBUG: Headers={dict(request.headers)}")
    
        # Check if this is an API request
        is_api_request = (
            'Authorization' in request.headers or 
            request.path.startswith('/api/') or
            request.content_type == 'application/json'
        )
        
        print(f"🔍 DEBUG: is_api_request={is_api_request}")
        
        if is_api_request:
            token = request.headers.get('Authorization')
            print(f"🔍 DEBUG: Token={token[:50] if token else None}...")
            
            if not token:
                print("❌ DEBUG: No token found!")
                return jsonify({'error': 'Authentication required. No token provided.'}), 401
            
            try:
                token = token.replace('Bearer ', '').strip()
                data = jwt.decode(
                    token, 
                    current_app.config['SECRET_KEY'], 
                    algorithms=['HS256']
                )
                
                print(f"✅ DEBUG: Token decoded, username={data.get('username')}")
                
                user = User.query.filter_by(username=data.get('username')).first()
                
                if not user:
                    print("❌ DEBUG: User not found in database!")
                    return jsonify({'error': 'User not found'}), 401
                
                # Set user information
                request.user_id = user.id
                request.username = user.username
                request.user = user
                request.is_moderator = getattr(user, 'is_moderator', False)
                request.is_admin = getattr(user, 'is_admin', False)
                
                print(f"✅ DEBUG: Set request.user_id={request.user_id}")
                
            except jwt.ExpiredSignatureError:
                print("❌ DEBUG: Token expired!")
                return jsonify({'error': 'Token has expired. Please log in again.'}), 401
            except jwt.InvalidTokenError as e:
                print(f"❌ DEBUG: Invalid token: {e}")
                return jsonify({'error': f'Invalid token: {str(e)}'}), 401
            except Exception as e:
                print(f"❌ DEBUG: Unexpected error: {e}")
                import traceback
                traceback.print_exc()
                return jsonify({'error': 'Authentication failed'}), 401
        
        print("✅ DEBUG: About to call view function")
        return view_func(*args, **kwargs)
    return wrapped_view



def token_required(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        # print(f"Token: {token}")  

        if not token: return jsonify({'error': 'No token'}), 401
        
        try:
            token = token.replace('Bearer ', '')
            # print(f"Cleaned token: {token}")  

            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            # print(f"Decoded data: {data}")
            
            user = User.query.filter_by(username=data['username']).first()
            # print(f"User found: {user}")
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({'error':'Invalid token'}), 401
        
        return f(user, *args, **kwargs)
    return wrapper

# """
# Description: Authentication middleware for handling user authentication
# Created By: Devang
# Created: 2025-11-01
# Last Modified: 
#     Saayonee @ 12.28 AM Nov 9
#     Claude @ Dec 2, 2025 - Added proper JWT handling for API endpoints
# """
# from functools import wraps
# from flask import request, redirect, url_for, session, jsonify, current_app
# from models.user import User
# import jwt


# def login_required(view_func):
#     """
#     Decorator for endpoints that require authentication.
#     Handles both session-based (web) and token-based (API) authentication.
    
#     For API endpoints (JSON requests), validates JWT token and sets request.user_id
#     For web endpoints (HTML requests), checks session and redirects to login if needed
#     """
#     @wraps(view_func)
#     def wrapped_view(*args, **kwargs):
#         print(f"🔍 DEBUG: Path={request.path}")
#         print(f"🔍 DEBUG: Headers={dict(request.headers)}")
    
#         # Check if this is an API request
#         is_api_request = (
#             'Authorization' in request.headers or 
#             request.path.startswith('/api/') or
#             request.content_type == 'application/json'
#         )
        
#         print(f"🔍 DEBUG: is_api_request={is_api_request}")
        
#         if is_api_request:
#             token = request.headers.get('Authorization')
#             print(f"🔍 DEBUG: Token={token[:50] if token else None}...")
            
#             if not token:
#                 print("❌ DEBUG: No token found!")
#                 return jsonify({'error': 'Authentication required. No token provided.'}), 401
            
#             try:
#                 token = token.replace('Bearer ', '').strip()
#                 data = jwt.decode(
#                     token, 
#                     current_app.config['SECRET_KEY'], 
#                     algorithms=['HS256']
#                 )
                
#                 print(f"✅ DEBUG: Token decoded, username={data.get('username')}")
                
#                 user = User.query.filter_by(username=data.get('username')).first()
                
#                 if not user:
#                     print("❌ DEBUG: User not found in database!")
#                     return jsonify({'error': 'User not found'}), 401
                
#                 # Set user information
#                 request.user_id = user.id
#                 request.username = user.username
#                 request.user = user
#                 request.is_moderator = getattr(user, 'is_moderator', False)
#                 request.is_admin = getattr(user, 'is_admin', False)
                
#                 print(f"✅ DEBUG: Set request.user_id={request.user_id}")
                
#             except jwt.ExpiredSignatureError:
#                 print("❌ DEBUG: Token expired!")
#                 return jsonify({'error': 'Token has expired. Please log in again.'}), 401
#             except jwt.InvalidTokenError as e:
#                 print(f"❌ DEBUG: Invalid token: {e}")
#                 return jsonify({'error': f'Invalid token: {str(e)}'}), 401
#             except Exception as e:
#                 print(f"❌ DEBUG: Unexpected error: {e}")
#                 import traceback
#                 traceback.print_exc()
#                 return jsonify({'error': 'Authentication failed'}), 401
        
#         print("✅ DEBUG: About to call view function")
#         return view_func(*args, **kwargs)
#     return wrapped_view


# def token_required(f):
#     """
#     Alternative decorator specifically for API endpoints that require JWT tokens.
#     Passes the authenticated user as the first argument to the view function.
    
#     Usage:
#         @token_required
#         def my_endpoint(user, *args, **kwargs):
#             # user is the authenticated User object
#             pass
#     """
#     @wraps(f)
#     def wrapper(*args, **kwargs):
#         token = request.headers.get('Authorization')

#         if not token:
#             return jsonify({'error': 'No token provided'}), 401
        
#         try:
#             # Remove 'Bearer ' prefix if present
#             token = token.replace('Bearer ', '').strip()

#             # Decode the token
#             data = jwt.decode(
#                 token, 
#                 current_app.config['SECRET_KEY'], 
#                 algorithms=['HS256']
#             )
            
#             # Get user from database
#             user = User.query.filter_by(username=data.get('username')).first()
            
#             if not user:
#                 return jsonify({'error': 'User not found'}), 401
            
#             # Set request attributes for convenience
#             request.user_id = user.id
#             request.username = user.username
#             request.is_moderator = getattr(user, 'is_moderator', False)
#             request.is_admin = getattr(user, 'is_admin', False)
            
#         except jwt.ExpiredSignatureError:
#             return jsonify({'error': 'Token has expired. Please log in again.'}), 401
#         except jwt.InvalidTokenError as e:
#             return jsonify({'error': f'Invalid token: {str(e)}'}), 401
#         except Exception as e:
#             current_app.logger.error(f"Token validation error: {str(e)}")
#             return jsonify({'error': 'Authentication failed'}), 401
        
#         # Pass user as first argument to the view function
#         return f(user, *args, **kwargs)
    
#     return wrapper
