"""
Description: Notification model for managing user notifications and alerts.
Author: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created with notification system functionality.
"""
from .base_model import BaseModel
from database import db

class Notification(BaseModel):
    """
    Notification model representing notifications for users.

    Attributes:
        id (int): Primary key.
        user_id (int): Foreign key to User table.
        header (str): Notification header/title.
        body (str): Notification body/content.
    """
    __tablename__ = 'notifications'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    header = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'user_id': self.user_id,
            'header': self.header,
            'body': self.body
        })
        return base_dict
    
    # Method to get notifications for a specific user
    @classmethod
    def get_notifications_for_user(cls, user_id):
        return cls.query.filter_by(user_id=user_id).all()