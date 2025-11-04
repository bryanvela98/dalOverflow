"""
Description: User routes for handling user-related API endpoints.
Created By: Devang
Created: 2025-11-01
Last Modified: 
    
"""
from functools import wraps
from flask import request, redirect, url_for, session

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