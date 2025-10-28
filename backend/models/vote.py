from .base_model import BaseModel
from database import db

class Vote(BaseModel):
    """
    Vote model representing the votes given to q particular question.

    Attributes:
    ID =  primary_key
    Question_ID = foreign key to the question table
    User_ID = foreign key to the user table
    Vote_Type = type of vote (upvote/downvote)
    Vote_date = date of vote

    """
    
    __tablename__ = "vote"
    ID = db.Column(db.String(255), primary_key=True)
    Question_ID = db.Column(db.String(255), db.ForeignKey('Question.ID'))
    User_ID = db.Column(db.String(255), db.ForeignKey('User.ID'))
    Vote_Type = db.Column(db.String(255))
    Vote_date = db.Column(db.DateTime)

    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.id,
            'question_id':self.Question_ID,
            'user_id':self.User_ID,
            'vote_type':self.Vote_Type,
            'vote_date':self.Vote_date
        })
        return base_dict