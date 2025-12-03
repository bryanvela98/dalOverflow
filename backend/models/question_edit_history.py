"""
Description: Question Edit History model for tracking all edits made to questions
Last Modified By: Mahek
Created: 2025-12-02
Maintains audit trail of all question modifications
"""
from .base_model import BaseModel
from database import db
from datetime import datetime


class QuestionEditHistory(BaseModel):
    """
    Model for tracking question edit history
    
    Attributes:
        id: Primary key
        question_id: Foreign key to questions table
        editor_id: Foreign key to users table (who made the edit)
        previous_title: Title before edit
        new_title: Title after edit
        previous_body: Body before edit
        new_body: Body after edit
        previous_tag_ids: Tag IDs before edit (stored as JSON)
        new_tag_ids: Tag IDs after edit (stored as JSON)
        edit_reason: Optional reason for the edit
        is_moderator_edit: Whether edit was made by moderator
        requires_review: Whether edit requires moderator review
    """
    __tablename__ = 'question_edit_history'
    
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    editor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    previous_title = db.Column(db.Text)
    new_title = db.Column(db.Text)
    previous_body = db.Column(db.Text)
    new_body = db.Column(db.Text)
    
    # Store as JSON for tag IDs
    previous_tag_ids = db.Column(db.JSON)
    new_tag_ids = db.Column(db.JSON)
    
    edit_reason = db.Column(db.Text)
    is_moderator_edit = db.Column(db.Boolean, default=False)
    requires_review = db.Column(db.Boolean, default=False)
    
    # Relationships
    question = db.relationship(
        'Question',
        back_populates='edit_history'
    )
    
    editor = db.relationship(
        'User',
        foreign_keys=[editor_id]
    )
    
    def to_dict(self, include_content_diff=False):
        """
        Convert edit history to dictionary
        
        Args:
            include_content_diff: Whether to include full content (can be large)
        """
        base_dict = super().to_dict()
        base_dict.update({
            'id': self.id,
            'question_id': self.question_id,
            'editor_id': self.editor_id,
            'edit_reason': self.edit_reason,
            'is_moderator_edit': self.is_moderator_edit,
            'requires_review': self.requires_review,
            'created_at': self.created_at.isoformat() if self.created_at else None
        })
        
        # Always include title changes
        if self.previous_title != self.new_title:
            base_dict['title_changed'] = True
            base_dict['previous_title'] = self.previous_title
            base_dict['new_title'] = self.new_title
        
        # Include tag changes
        if self.previous_tag_ids != self.new_tag_ids:
            base_dict['tags_changed'] = True
            base_dict['previous_tag_ids'] = self.previous_tag_ids
            base_dict['new_tag_ids'] = self.new_tag_ids
        
        # Optionally include full content diff
        if include_content_diff:
            base_dict['previous_body'] = self.previous_body
            base_dict['new_body'] = self.new_body
        else:
            # Just indicate if body changed
            base_dict['body_changed'] = self.previous_body != self.new_body
        
        return base_dict
    
    @classmethod
    def get_by_question_id(cls, question_id, limit=None):
        """
        Get edit history for a specific question
        
        Args:
            question_id: ID of the question
            limit: Optional limit on number of records
            
        Returns:
            list: List of edit history records
        """
        query = cls.query.filter_by(question_id=question_id).order_by(cls.created_at.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
    
    @classmethod
    def get_recent_edits(cls, limit=10):
        """Get recent edits across all questions"""
        return cls.query.order_by(cls.created_at.desc()).limit(limit).all()
    
    @classmethod
    def get_edits_by_user(cls, user_id, limit=None):
        """
        Get all edits made by a specific user
        
        Args:
            user_id: ID of the user
            limit: Optional limit on number of records
        """
        query = cls.query.filter_by(editor_id=user_id).order_by(cls.created_at.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
    
    @classmethod
    def get_edits_requiring_review(cls):
        """Get all edits that require moderator review"""
        return cls.query.filter_by(requires_review=True).order_by(cls.created_at.desc()).all()