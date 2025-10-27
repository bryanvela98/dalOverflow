from flask import Flask
from sqlalchemy import SQLAlchemy

app = Flask(__name__) # Create Flask app instance
db = SQLAlchemy(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


# Run the app
if __name__ == '__main__':
    app.run(debug=True) # Enabling debug mode makes every code change auto-restart the server