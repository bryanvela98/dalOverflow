import os

class Config:
    # Make sure this matches your DataGrip connection exactly
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://myuser:dal1234@localhost/dalgroup2db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret")
    
    @classmethod
    def print_db_uri(cls):
        print(f"Database URI: {cls.SQLALCHEMY_DATABASE_URI}")