from .base_model import BaseModel
from app import db

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
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
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