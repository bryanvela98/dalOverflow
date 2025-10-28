"""
Description: Abstract base model for all database tables using SQLAlchemy.
Author: Mahek
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
"""
from .base_model import BaseModel
from database import db

class Comment(BaseModel):
    """
    Comment model representing the answers given to the questions posted.

    Attributes:
    id = Primary Key.
    question_id = foreign key to the question table
    user_id = foreign key to the user table
    body = body of the comment
    creation_date = comment creation date
    last_modified_date = comment last modified on date

    """
   
    __tablename__ = "comments"

    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    body = db.Column(db.Text)
    creation_date = db.Column(db.DateTime)
    last_modified_date = db.Column(db.DateTime)

    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.id,
            'question_id':self.question_id,
            'user_id':self.user_id,
            'body':self.body,
            'creation_date': self.creation_date,
            'last_modified_date':self.last_modified_date
        })
        return base_dict