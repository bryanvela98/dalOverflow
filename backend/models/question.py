"""
Description: Question model with edit functionality
Last Modified By: Mahek
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
    2025-11-02 - Added Sanitize body and create with sanitized body content functions.
    2025-12-02 - Added edit functionality with history tracking and permissions
"""
from .base_model import BaseModel
from database import db
from utils.html_sanitizer import sanitize_html_body
from datetime import datetime, timedelta
from sqlalchemy import event


class Question(BaseModel):
    """
    Question model representing the questions asked on the website.

    Attributes:
        id = Primary Key.
        type = Question Type
        user_id = foreign key to the user table
        title = Question title
        body = Question Body
        tags = Question tags
        status = Question status(accepted or rejected)
        accepted_answer_id = Accepted Answer
        ai_generated_ans = AI Generated Answer
        edit_count = Number of times edited
    """
    __tablename__ = 'questions'

    type = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.Text, nullable=False)
    body = db.Column(db.Text, nullable=False)
    
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
        lazy='dynamic'
    )
    
    status = db.Column(db.String(255), default='open')
    view_count = db.Column(db.Integer, default=0)
    ai_generated_ans = db.Column(db.Text)
    
    # Edit tracking fields
    edit_count = db.Column(db.Integer, default=0)
    

    def to_dict(self, include_edit_info=False, current_user_id=None):
        """
        Convert question to dictionary with optional edit information
        
        Args:
            include_edit_info: Include edit-related metadata
            current_user_id: ID of current user to check permissions
        """
        base_dict = super().to_dict()
        answers_list = self.answers.all()
        base_dict.update({
            'id':self.id,
            'type':self.type,
            'user_id':self.user_id,
            'title':self.title,
            'body':self.body,
            'tags': [tag.to_dict() for tag in self.tags.all()],
            'answers': [answer.to_dict() for answer in answers_list],
            'answerCount': len(answers_list),
            'voteCount': 0,
            'status':self.status,
            'view_count': self.view_count or 0,
            'ai_generated_ans': self.ai_generated_ans,
            'edit_count': self.edit_count or 0,
            'is_edited': self.edit_count > 0
        })
        
        
        
        if current_user_id:
            # Check if current user can edit
            can_edit, requires_review = self.can_be_edited_by(
                user_id=current_user_id
            )
            base_dict.update({
                'can_edit': can_edit,
                'requires_review': requires_review
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

    def can_be_edited_by(self, user_id):
        """
        Check if a user can edit this question
        
        Args:
            user_id: ID of the user attempting to edit
            
        Returns:
            tuple: (can_edit: bool, requires_review: bool)
        """
        
        # Non-authors cannot edit
        if self.user_id != user_id:
            return False, False
        
        # Author can edit within 10 minutes without review
        time_since_creation = datetime.utcnow() - self.created_at
        if time_since_creation <= timedelta(minutes=10):
            return True, False
        
        # After 10 minutes, author can still edit but may need review
        # This can be configured based on your policy
        return True, True
    
    
    
    def _validate_and_update_title(self, title):
        """
        Validate and update title if changed
        
        Args:
            title: New title value
            
        Returns:
            bool: True if title was updated
            
        Raises:
            ValueError: If validation fails
        """
        if title is None or title == self.title:
            return False
            
        if not title or len(title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if len(title) > 120:
            raise ValueError("Title must not exceed 120 characters")
            
        self.title = title.strip()
        return True
    
    def _validate_and_update_body(self, body):
        """
        Validate and update body if changed
        
        Args:
            body: New body content
            
        Returns:
            bool: True if body was updated
            
        Raises:
            ValueError: If validation fails
        """
        if body is None:
            return False
            
        sanitized_body = sanitize_html_body(body)
        if sanitized_body == self.body:
            return False
            
        from bs4 import BeautifulSoup
        plain_text = BeautifulSoup(sanitized_body, 'html.parser').get_text()
        if len(plain_text.strip()) < 20:
            raise ValueError("Body must be at least 20 characters")
            
        self.body = sanitized_body
        return True
    
    def _validate_tag_ids(self, tag_ids):
        """
        Validate tag IDs
        
        Args:
            tag_ids: List of tag IDs
            
        Raises:
            ValueError: If validation fails
        """
        if len(tag_ids) < 1:
            raise ValueError("At least one tag is required")
        if len(tag_ids) > 5:
            raise ValueError("Maximum 5 tags allowed")
        if len(tag_ids) != len(set(tag_ids)):
            raise ValueError("Duplicate tags not allowed")
    
    def _update_tags(self, tag_ids):
        """
        Update question tags
        
        Args:
            tag_ids: List of tag IDs
            
        Returns:
            bool: True if tags were updated
        """
        if tag_ids is None:
            return False
            
        self._validate_tag_ids(tag_ids)
        
        from models.tag import Tag
        self.tags = []
        for tag_id in tag_ids:
            tag = Tag.query.get(tag_id)
            if tag:
                self.tags.append(tag)
        
        return True
    
    def update_question(self, title=None, body=None, tag_ids=None):
        """
        Update question content
        
        Args:
            title: New title (optional)
            body: New body (optional)
            tag_ids: New tag IDs (optional)
            
        Raises:
            ValueError: If validation fails
        """
        something_changed = False
        
        # Update each field using dedicated methods
        something_changed |= self._validate_and_update_title(title)
        something_changed |= self._validate_and_update_body(body)
        something_changed |= self._update_tags(tag_ids)
        
        if something_changed:
            self.edit_count = (self.edit_count or 0) + 1
            # updated_at is automatically set by BaseModel's onupdate
        
        db.session.commit()

    @classmethod
    def create_with_sanitized_body(cls, data):
        """Create question with sanitized body content"""
        question = cls(**data)
        question.sanitize_body()
        db.session.add(question)
        db.session.commit()
        return question
    
    @classmethod
    def create_with_tags(cls, data, tag_ids=None):
        """Create question with sanitized body and associate tags"""
        try:
            # question creation
            question_data = {k: v for k, v in data.items() if k != 'tag_ids'}
            question = cls.create_with_sanitized_body(question_data)
            
            # Refresh to ensure we have the ID
            db.session.refresh(question)
            
            # associate tags
            if tag_ids:
                from models.tag import Tag
                from models.questiontag import QuestionTag
                
                for tag_id in tag_ids:
                    tag = Tag.get_by_id(int(tag_id))
                    if tag:
                        QuestionTag.create({
                            'question_id': question.id,
                            'tag_id': int(tag_id)
                        })
                
                db.session.commit()
            
            return question
        except Exception as e:
            db.session.rollback()
            raise e


# Event listener to update updated_at timestamp
@event.listens_for(Question, 'before_update')
def update_timestamp(mapper, connection, target):
    """Automatically update updated_at timestamp before update"""
    target.updated_at = datetime.utcnow()