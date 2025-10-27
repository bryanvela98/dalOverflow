<<<<<<< HEAD
from flask import Flask
from sqlalchemy import SQLAlchemy

app = Flask(__name__) # Create Flask app instance
db = SQLAlchemy(app)
=======
from flask import Flask, request, jsonify
from flask_cors import CORS

from routes import app_routes

app = Flask(__name__) # Create Flask app instance
CORS(app)

>>>>>>> origin/develop

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

app_routes(app)

# Run the app
if __name__ == '__main__':
    app.run(debug=True) # Enabling debug mode makes every code change auto-restart the server