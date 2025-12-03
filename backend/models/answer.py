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
from .answer_edit_history import AnswerEditHistory  # <- Add this import
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
    last_edited_at = timestamp of last edit
    last_edited_by = user who made the last edit
    """

    __tablename__ = "answers"

    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    body = db.Column(db.Text)
    is_accepted = db.Column(db.Boolean, default=False)
    edit_count = db.Column(db.Integer, default=0)
    last_edited_at = db.Column(db.DateTime)
    last_edited_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
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
    edit_history = db.relationship(
        'AnswerEditHistory',
        back_populates='answer',
        lazy='dynamic',
        order_by='AnswerEditHistory.created_at.desc()'
    )

    def can_be_edited_by(self, user_id, is_moderator=False):
        """
        Check if a user can edit this answer (AC 1)
        
        Args:
            user_id: ID of the user attempting to edit
            is_moderator: Whether the user is a moderator
            
        Returns:
            bool: True if user can edit, False otherwise
        """
        # Author can always edit their own answer
        if self.user_id == user_id:
            return True
        
        # Moderators can edit any answer
        if is_moderator:
            return True
        
        return False

    def update_with_history(self, editor_id, body=None, edit_reason=None, is_moderator=False):
        """
        Update answer and create history record
        
        Args:
            editor_id: ID of user making the edit
            body: New body content (optional)
            edit_reason: Reason for the edit (optional)
            is_moderator: Whether editor is a moderator
            
        Returns:
            bool: True if update successful
            
        Raises:
            PermissionError: If user doesn't have permission to edit
            ValueError: If validation fails
        """
        # Check permissions
        if not self.can_be_edited_by(editor_id, is_moderator):
            raise PermissionError("You do not have permission to edit this answer")
        
        # Store previous values for history
        previous_body = self.body
        previous_is_accepted = self.is_accepted
        
        # Track what changed
        body_changed = False
        acceptance_status_changed = False
        
        # Update body if provided
        if body is not None:
            # Validate body length
            from bs4 import BeautifulSoup
            plain_text = BeautifulSoup(body, 'html.parser').get_text()
            if len(plain_text.strip()) < 20:
                raise ValueError("Answer body must be at least 20 characters")
            
            # Sanitize HTML
            sanitized_body = sanitize_html_body(body)
            
            if sanitized_body != self.body:
                self.body = sanitized_body
                body_changed = True
        
        # AC 2: If answer was accepted and content changed, remove acceptance
        if body_changed and self.is_accepted:
            self.is_accepted = False
            acceptance_status_changed = True
        
        # Update edit metadata
        if body_changed:
            self.edit_count += 1
            self.last_edited_at = datetime.utcnow()
            self.last_edited_by = editor_id
        
        # Create history record
        if body_changed or acceptance_status_changed:
            from models.answer_edit_history import AnswerEditHistory
            
            history = AnswerEditHistory(
                answer_id=self.id,
                editor_id=editor_id,
                previous_body=previous_body,
                new_body=self.body if body_changed else None,
                previous_is_accepted=previous_is_accepted,
                new_is_accepted=self.is_accepted if acceptance_status_changed else None,
                edit_reason=edit_reason,
                is_moderator_edit=is_moderator
            )
            
            db.session.add(history)
        
        # Commit changes
        try:
            db.session.commit()
            
            # AC 2: Notify question author if accepted answer was edited
            if acceptance_status_changed and previous_is_accepted:
                # TODO: Implement notification
                logging.info(f"Accepted answer {self.id} was edited - notify question author")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            logging.error(f"Error updating answer: {str(e)}")
            raise

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
        })
        
        if include_edit_info:
            base_dict.update({
                'edit_count': self.edit_count,
                'last_edited_at': self.last_edited_at.isoformat() if self.last_edited_at else None,
                'last_edited_by': self.last_edited_by,
                'is_edited': self.edit_count > 0,
            })
        
        # Add permission flag
        if current_user_id:
            base_dict['can_edit'] = self.can_be_edited_by(current_user_id)
        
        return base_dict