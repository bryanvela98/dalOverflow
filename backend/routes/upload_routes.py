"""
Description: Routes for handling image uploads (e.g., profile pictures) to Cloudinary or other storage.
Created: 2025-11-28
"""
from flask import Blueprint, request, jsonify
import requests
import os

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/profile-picture', methods=['POST', 'OPTIONS'])
def upload_profile_picture():
    if request.method == 'OPTIONS':
        return '', 204
    """Upload a profile picture to Cloudinary and return the image URL."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
        upload_preset = os.getenv('CLOUDINARY_UPLOAD_PRESET')
        api_url = f'https://api.cloudinary.com/v1_1/{cloud_name}/image/upload'

        files = {'file': (file.filename, file.stream, file.mimetype)}
        data = {'upload_preset': upload_preset}
        response = requests.post(api_url, files=files, data=data)
        result = response.json()
        if 'secure_url' in result:
            return jsonify({'url': result['secure_url']}), 200
        else:
            return jsonify({'error': 'Upload failed', 'details': result}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
