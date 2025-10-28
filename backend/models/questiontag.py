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

    #question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    #tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), nullable=False)
    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            #question_id': self.question_id,
            #'tag_id': self.tag_id
        })
        return base_dict
