"""
Description: Abstract base model for all database tables using SQLAlchemy.
Last Modified By: Mahek
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
"""
from .base_model import BaseModel
from database import db

class Answer(BaseModel):
    """
    Answer model representing the answers given to the questions posted.

    Attributes:
    id = Primary Key.
    question_id = foreign key to the question table
    user_id = foreign key to the user table
    body = body of the answer

    """

    __tablename__ = "answers"

    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    body = db.Column(db.Text)


    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.id,
            'question_id':self.question_id,
            'user_id':self.user_id,
            'body':self.body
        })
        return base_dict