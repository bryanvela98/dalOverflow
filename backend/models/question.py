from .base_model import BaseModel
from database import db

class Question(BaseModel):
    """
    Question model representing the the questions asked on the website.

    Attributes:
        ID = Primary Key.
        Type = Question Type
        User_ID = foreign key to the user tavle
        Title = Question title
        Body = Question Body
        Creation_Date = Question creation date
        Last_modified_on_Date = Question last modified on date
        Status = Question status(accepted or rejected)
        Accepted_Answer_ID = Accepted Answer
    """
    __tablename__ = 'question'

    ID = db.Column(db.String(255), primary_key=True)
    Type = db.Column(db.String(255))
    User_ID = db.Column(db.String(255), db.ForeignKey('User.ID'))
    Title = db.Column(db.Text)
    Body = db.Column(db.Text)
    Creation_Date = db.Column(db.DateTime)
    Last_modified_on_Date = db.Column(db.DateTime)
    Status = db.Column(db.String(255))
    Accepted_Answer_ID = db.Column(db.String(255))

    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.ID,
            'type':self.Type,
            'user_id':self.User_ID,
            'title':self.Title,
            'body':self.Body,
            'creation_date':self.Creation_Date,
            'last_modified_on_date':self.Last_modified_on_Date,
            'status':self.Last_modified_on_Date,
            'accepted_answer':self.Accepted_Answer_ID
        })
        return base_dict