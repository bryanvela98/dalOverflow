import os
from dotenv import load_dotenv

load_dotenv()

port = os.getenv("PORT")

database_url = os.getenv("DB_URL") 

print(f"hello {port}")

class Config:
    # Make sure this matches your DataGrip connection exactly
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        database_url
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret")
    
    @classmethod
    def print_db_uri(cls):
        print(f"Database URI: {cls.SQLALCHEMY_DATABASE_URI}")