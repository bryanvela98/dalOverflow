"""
Description: Abstract base model for all database tables using SQLAlchemy.
Last Modified By: Devang
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
"""
from .base_model import BaseModel
from database import db

class Tag(BaseModel):
    """
    Tag model representing the tags given to a particular question.

    Attributes:
    id = Primary Key.
    tag_name = specifies tag name
    tag_description = specifies tag description
    tag_creation_date = specifies tag creation date

    """
    
    __tablename__ = "tags"

    tag_name = db.Column(db.String(255))
    tag_description = db.Column(db.Text)
    tag_creation_date = db.Column(db.Date)
    # Many-to-many relationship with questions
    questions = db.relationship(
        'Question',
        secondary='question_tags',
        back_populates='tags',
        lazy='dynamic'
    )

    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.id,
            'tag_name':self.tag_name,
            'tag_description':self.tag_description,
            'tag_creation_date':self.tag_creation_date,
            'question_count': self.questions.count()
        })
        return base_dict