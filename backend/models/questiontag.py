"""
Description: QuestionTag model for managing many-to-many relationships between questions and tags.
Author: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created with question-tag association functionality.
"""
from .base_model import BaseModel
from database import db

class QuestionTag(BaseModel):
    """
    QuestionTag model representing the association between questions and tags.

    Attributes:
        id (int): Primary key.
        question_id (int): Foreign key to Question table.
        tag_id (int): Foreign key to Tag table.
    """
    __tablename__ = 'question_tags'

    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), nullable=False)
    
    # Prevent duplicate question-tag pairs
    __table_args__ = (db.UniqueConstraint('question_id', 'tag_id', name='unique_question_tag'),)
    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id': self.id,
            'question_id': self.question_id,
            'tag_id': self.tag_id
        })
        return base_dict
