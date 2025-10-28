from .base_model import BaseModel
from database import db

class Tag(BaseModel):
    """
    Tag model representing the tags given to a particular question.

    Attributes:
    ID = primary_key
    Tag_Name = specifies tag name
    Tag_Description = specifies tag description
    Tag_Creation_Date = specifies tag creation date

    """
    
    __tablename__ = "tag"
    ID = db.Column(db.String(255), primary_key=True)
    Tag_Name = db.Column(db.String(255))
    Tag_Description = db.Column(db.Text)
    Tag_Creation_Date = db.Column(db.Date)

    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'id':self.id,
            'tag_name':self.Tag_Name,
            'tag_description':self.Tag_Description,
            'tag_creation_date':self.Tag_Creation_Date
        })
        return base_dict