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

#!!! when session is ready, uncomment the following code
# def login_required(view_func):
#     @wraps(view_func)
#     def wrapped_view(*args,**kwargs):
#         if 'user_id' not in session:
#             next_url = request.path

#             return redirect(url_for('login.login', next=next_url))
#         return view_func(*args,**kwargs)
#     return wrapped_view



#temporary mock session for testing redirection.
#If user tries to access questions endpoint without dummy_user=1 then redirectin takes place
def login_required(view_func):
    @wraps(view_func)
    def wrapped_view(*args,**kwargs):

        if request.args.get("dummy_user") == "1":
            session['user_id'] = 999

        if 'user_id' not in session and 'user' not in session:
            next_url = request.path

            return redirect(url_for('login.login', next=next_url))
        return view_func(*args,**kwargs)
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
