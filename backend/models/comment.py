from .base_model import BaseModel
from database import db

class Comment(BaseModel):
    """
    Comment model representing the answers given to the questions posted.

    Attributes:
    ID = Primary Key.
    Question_ID = foreign key to the question table
    User_ID = foreign key to the user table
    Body = body of the comment
    Creation_Date = comment creation date
    Last_Modified_Date = comment last modified on date

    """
   
    __tablename__ = "comment"

    ID = db.Column(db.String(255), primary_key=True)
    Question_ID = db.Column(db.String(255), db.ForeignKey('Question.ID'))
    User_ID = db.Column(db.String(255), db.ForeignKey('User.ID'))
    Body = db.Column(db.Text)
    Creation_Date = db.Column(db.DateTime)
    Last_Modified_Date = db.Column(db.DateTime)

    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.ID,
            'question_id':self.Question_ID,
            'user_id':self.User_ID,
            'body':self.Body,
            'creation_date': self.Creation_Date,
            'last_modified_date':self.Last_Modified_Date
        })
        return base_dict