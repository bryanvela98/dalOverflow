"""
Description: Abstract base model for all database tables using SQLAlchemy.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
"""
from .base_model import BaseModel
from database import db

class Question(BaseModel):
    """
    Question model representing the the questions asked on the website.

    Attributes:
        id = Primary Key.
        type = Question Type
        user_id = foreign key to the user table
        title = Question title
        body = Question Body
        tags = Question tags
        status = Question status(accepted or rejected)
        accepted_answer_id = Accepted Answer
    """
    __tablename__ = 'questions'

    type = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.Text)
    body = db.Column(db.Text)
    # Many-to-many relationship with tags 
    tags = db.relationship(
        'Tag',
        secondary='question_tags',
        back_populates='questions',
        lazy='dynamic'
    )
    status = db.Column(db.String(255))
    #accepted_answers_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=False)

    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.id,
            'type':self.type,
            'user_id':self.user_id,
            'title':self.title,
            'body':self.body,
            'tags': [tag.to_dict() for tag in self.tags.all()],  # Convert relationship to list of tag dicts
            'status':self.status
            #'accepted_answers_id':self.accepted_answers_id
        })
        return base_dict