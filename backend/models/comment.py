"""
Description: Abstract base model for all database tables using SQLAlchemy.
Last Modified By: Bryan
Created: 2025-10-25
Last Modified: 
    2025-11-24 - File created and implemented basic CRUD operations.
"""
from .base_model import BaseModel
from database import db

class Comment(BaseModel):
    """
    Comment model representing the comments made on answers.

    Attributes:
    id = Primary Key.
    user_id = foreign key to the user table
    question_id = foreign key to the question table
    answer_id = foreign key to the answer table
    content = body of the answer

    """

    __tablename__ = "comments"

    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    answer_id = db.Column(db.Integer, db.ForeignKey('answers.id'), nullable=False)
    content = db.Column(db.Text)

    answer = db.relationship(
        'Answer',
        back_populates='comments'
    )


    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.id,
            'user_id':self.user_id,
            'answer_id':self.answer_id,
            'content':self.content
        })
        return base_dict