from flask import Flask

app = Flask(__name__) # Create Flask app instance

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


# Run the app
if __name__ == '__main__':
    app.run(debug=True) # Enabling debug mode makes every code change auto-restart the server