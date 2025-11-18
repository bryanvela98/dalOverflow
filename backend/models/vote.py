"""
Description: Abstract base model for all database tables using SQLAlchemy.
Last Modified By: Mahek
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
"""
from .base_model import BaseModel
from database import db

class Vote(BaseModel):
    """
    Vote model representing the votes given to a particular question.

    Attributes:
    id =  Primary Key.
    target_id = id of the question or answer being voted on
    user_id = foreign key to the user table
    vote_type = type of vote (upvote/downvote)
    vote_date = date of vote

    """
    __tablename__ = "votes"

    target_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vote_type = db.Column(db.String(255))
    target_type = db.Column(db.String(50))  # 'question' or 'answer'

    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.id,
            'target_id':self.target_id,
            'user_id':self.user_id,
            'vote_type':self.vote_type,
            'target_type':self.target_type
        })
        return base_dict