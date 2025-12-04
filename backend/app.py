from flask import Flask
from flask_cors import CORS
from config.config_postgres import Config
from database import db

def create_app():
    app = Flask(__name__) # Create Flask app instance
    app.config.from_object(Config) # Load configuration from Config class
    
    # Override database URL if environment variable is set (for testing)
    import os
    if os.environ.get('DATABASE_URL'):
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
    
    db.init_app(app) # Initialize SQLAlchemy with the app
    
    # Disable strict slashes to prevent redirects
    app.url_map.strict_slashes = False
    
    # Enable CORS for React frontend with all necessary permissions
    CORS(app, 
            resources={r"/api/*": {"origins": [
                "http://localhost:3000", 
                "http://localhost:3001", 
                "http://localhost:5000", 
                "http://localhost:5173", 
                "https://frontend-five-roan-92.vercel.app",
                "https://frontend-cne2sdqp7-y-onees-projects.vercel.app",
                "https://frontend-6pbzspbet-y-onees-projects.vercel.app",
                "https://*.vercel.app",  # Allow all Vercel deployments
                "https://*.ngrok-free.dev"  # Allow ngrok tunnels
            ]}},
            #allow_headers=["Content-Type", "Authorization"],
            allow_headers=["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
            methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        supports_credentials=True)

    # Register blueprints for routes
    from routes.notification_routes import notification_bp
    from routes.user_routes import user_bp
    from routes.question_routes import question_bp
    from routes.registration_routes import registration_bp
    from routes.login_routes import login_bp
    from routes.questiontag_routes import questiontag_bp
    from routes.tag_routes import tag_bp
    from routes.vote_routes import vote_bp
    from routes.answer_routes import answers_bp
    from routes.comment_routes import comment_bp
    from routes.upload_routes import upload_bp
    from routes.gemini_ai_routes import ai_bp


    
    # Register the notification blueprint with a URL prefix
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(question_bp, url_prefix='/api/questions')
    app.register_blueprint(registration_bp, url_prefix='/api/auth')
    app.register_blueprint(login_bp, url_prefix='/api/auth')
    app.register_blueprint(tag_bp, url_prefix='/api/tags')
    app.register_blueprint(questiontag_bp, url_prefix='/api')
    app.register_blueprint(answers_bp, url_prefix='/api/answers')
    app.register_blueprint(vote_bp, url_prefix='/api/votes')
    app.register_blueprint(comment_bp, url_prefix='/api/comments')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')


    # Create all database tables
    with app.app_context():
        db.create_all()

    return app


# Run the app
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False) # Disable reloader to prevent config issues