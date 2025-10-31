"""
Description: Login routes for handling requests related to login
Author: Saayonee Dhepe
Created: 2025-10-30
"""
from flask import Blueprint, request, jsonify, session
from services.user_login import user_login

# Create Blueprint for login routes
login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'})
        
        # Create login instance and verify credentials
        login_handler = user_login()
        if login_handler.verify_credentials(email, password):
            # Store user info in session
            user_info = login_handler.get_user_info()
            session['user'] = user_info
            
            return jsonify({
                'success': True, 
                'message': 'Login successful',
                'user': user_info
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid email or password'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Login failed'})

@login_bp.route('/logout', methods=['POST'])
def logout():
    try:
        login_handler = user_login()
        login_handler.logout()
        session.pop('user', None) 
        
        return jsonify({'success': True, 'message': 'Logout successful'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Logout failed'})

@login_bp.route('/check-login', methods=['GET'])
def check_login():
    user_info = session.get('user')
    if user_info:
        return jsonify({'loggedIn': True, 'user': user_info})
    else:
        return jsonify({'loggedIn': False})