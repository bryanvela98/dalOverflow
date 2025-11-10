"""
Description: User model for managing application users and their profiles.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created with user authentication and profile management.
"""
from .base_model import BaseModel
from database import db

class User(BaseModel):
    """
    User model representing application users.

    Attributes:
        id (str): Primary key.
        username (str): Username of the user.
        email (str): Email address.
        password (str): Hashed password.
        display_name (str): Display name.
        profile_picture_url (str): URL to profile picture.
        reputation (int): User reputation score.
        registration_date (datetime): Registration timestamp.
        university (str): University name.
    """
    __tablename__ = 'users'

    username = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(255), nullable=True)
    profile_picture_url = db.Column(db.Text, nullable=True)
    reputation = db.Column(db.Integer, default=0)
    registration_date = db.Column(db.DateTime, nullable=False)
    university = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'display_name': self.display_name,
            'profile_picture_url': self.profile_picture_url,
            'reputation': self.reputation,
            'registration_date': self.registration_date,
            'university': self.university
        })
        return base_dict
    
@classmethod
def get_by_id(cls, user_id):
    """Get a user by ID."""
    return cls.query.get(user_id)