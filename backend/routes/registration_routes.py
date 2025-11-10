"""
Description: registration routes for handling requests related to registration
Author: Saayonee Dhepe
Created: 2025-10-31
"""
from flask import Blueprint, request, jsonify
from services.user_registration import UserRegistrationService

registration_bp = Blueprint('registration', __name__)

register = UserRegistrationService()


@registration_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not register.validate_email(email=email):
        return jsonify({"success": False, "message": "Email must be a @dal.ca address"}), 400

    try:
        result = register.create_user(email=email, password=password)
        if result:
            return jsonify({"success": True, "message": "OTP sent to your email"})
        else:
            return jsonify({"success": False, "message": "User already exists! Please Log in!"}), 400

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Server error"}), 500


@registration_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    try:

        if register.verify_and_create_user(otp):
            return jsonify({"success": True, "message": "Registration Completed!!"})
        else:
            return jsonify({"success": False, "message": "Invalid or expired OTP. Please try again."}), 400

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Server error during OTP verification"}), 500


@registration_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    
    if not register.validate_email(email=email):
        return jsonify({"success": False, "message": "Email must be a @dal.ca address"}), 400
    
    try:
        if not register.user_exists(email):
            return jsonify({"success": False, "message": "No account found with this email"}), 400
            
        register.reset_otp(email)
        return jsonify({"success": True, "message": "Password reset OTP sent to your email"})
        
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Error sending reset link"}), 500

@registration_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")
    
    try:
        if register.reset_password(email, otp, new_password):
            return jsonify({"success": True, "message": "Password reset successfully"})
        else:
            return jsonify({"success": False, "message": "Invalid OTP or user not found"}), 400
            
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Error resetting password"}), 500