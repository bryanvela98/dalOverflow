"""
Description: Answer model with edit tracking capabilities
Last Modified By: Mahek
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
    2025-12-02 - Added edit tracking fields and methods
"""
from .base_model import BaseModel
from database import db
from datetime import datetime, timedelta
from utils.html_sanitizer import sanitize_html_body
import logging


class Answer(BaseModel):
    """
    Answer model representing the answers given to the questions posted.

    Attributes:
    id = Primary Key.
    question_id = foreign key to the question table
    user_id = foreign key to the user table
    body = body of the answer
    is_accepted = whether this answer is accepted by question author
    edit_count = number of times this answer has been edited
    """

    __tablename__ = "answers"

    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    body = db.Column(db.Text)
    is_accepted = db.Column(db.Boolean, default=False)
    edit_count = db.Column(db.Integer, default=0)
    
    # Relationships
    question = db.relationship(
        'Question',
        back_populates='answers'
    )
    comments = db.relationship(
        'Comment',
        back_populates='answer',
        lazy='dynamic'
    )

    def can_be_edited_by(self, user_id):
        """
        Check if a user can edit this answer (AC 1)
        
        Args:
            user_id: ID of the user attempting to edit
            
        Returns:
            bool: True if user can edit, False otherwise
        """
        # Author can always edit their own answer
        if self.user_id == user_id:
            return True
        
        return False
  
       

    def update_answer(self, body):
        """
        Update answer content (AC 1, AC 2)
        
        Args:
            body: New content
            
        Raises:
            ValueError: If validation fails
        """
        # Validate
        from bs4 import BeautifulSoup
        plain_text = BeautifulSoup(body, 'html.parser').get_text()
        if len(plain_text.strip()) < 20:
            raise ValueError("Answer body must be at least 20 characters")
        
        # Sanitize
        sanitized_body = sanitize_html_body(body)
        
        # Check if content actually changed
        if sanitized_body == self.body:
            return  # No changes
        
        # AC 2: Remove acceptance if content changed
        was_accepted = self.is_accepted
        if was_accepted:
            self.is_accepted = False
            logging.info(f"Answer {self.id}: Acceptance removed due to edit")
        
        # Update content
        self.body = sanitized_body
        self.edit_count = (self.edit_count or 0) + 1
        
        # updated_at is automatically set by BaseModel's onupdate
        db.session.commit()

    def to_dict(self, include_edit_info=False, current_user_id=None):
        """
        Convert answer to dictionary
        
        Args:
            include_edit_info: Whether to include edit metadata
            current_user_id: ID of current user (for permission checks)
            
        Returns:
            dict: Answer data
        """
        base_dict = super().to_dict()
        base_dict.update({
            'id': self.id,
            'question_id': self.question_id,
            'user_id': self.user_id,
            'body': self.body,
            'is_accepted': self.is_accepted if hasattr(self, 'is_accepted') else False,
            'edit_count': self.edit_count or 0,
            'is_edited': (self.edit_count or 0) > 0,
        })
        
        
        # Add permission flag
        if current_user_id:
            base_dict['can_edit'] = self.can_be_edited_by(current_user_id)
        
        return base_dict