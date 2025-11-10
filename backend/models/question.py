"""
Description: Abstract base model for all database tables using SQLAlchemy.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
    2025-11-02 - Added Sanitize body and create with sanitized body content functions.
"""
from .base_model import BaseModel
from database import db
from utils.html_sanitizer import sanitize_html_body

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
    answers = db.relationship(
        'Answer',
        back_populates='question',
        lazy ='dynamic'
    )
    status = db.Column(db.String(255))
    view_count = db.Column(db.Integer, default=0)
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
            'answers': [answer.to_dict() for answer in self.answers.all()],  # Convert relationship to list of answer dicts
            'status':self.status,
            'view_count': self.view_count or 0
            #'accepted_answers_id':self.accepted_answers_id
        })
        return base_dict
    
    def sanitize_body(self):
        """Sanitize the body content before saving"""
        if self.body:
            self.body = sanitize_html_body(self.body)

    def increment_view_count(self):
        """Increment the view count for this question"""
        if self.view_count is None:
            self.view_count = 0
        self.view_count += 1
        db.session.commit()
        return self.view_count

    @classmethod
    def create_with_sanitized_body(cls, data):
        """Create question with sanitized body content"""
        question = cls(**data)
        question.sanitize_body()
        db.session.add(question)
        db.session.commit()
        return question