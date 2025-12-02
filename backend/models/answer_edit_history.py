"""
Description: Model for tracking answer edit history
Last Modified By: Claude
Created: 2025-12-02
"""
from database import db
from datetime import datetime


class AnswerEditHistory(db.Model):
    """
    Model for tracking all edits made to answers
    
    Provides complete audit trail of answer modifications
    """
    __tablename__ = 'answer_edit_history'
    
    id = db.Column(db.Integer, primary_key=True)
    answer_id = db.Column(db.Integer, db.ForeignKey('answers.id', ondelete='CASCADE'), nullable=False)
    editor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Content changes
    previous_body = db.Column(db.Text)
    new_body = db.Column(db.Text)
    
    # Acceptance status changes (AC 2)
    previous_is_accepted = db.Column(db.Boolean)
    new_is_accepted = db.Column(db.Boolean)
    
    # Metadata
    edit_reason = db.Column(db.Text)
    is_moderator_edit = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    answer = db.relationship(
        'Answer',
        back_populates='edit_history'
    )
    editor = db.relationship(
        'User',
        foreign_keys=[editor_id],
        backref='answer_edits'
    )
    
    @classmethod
    def get_by_answer_id(cls, answer_id, limit=None):
        """
        Get edit history for an answer
        
        Args:
            answer_id: ID of the answer
            limit: Maximum number of records to return
            
        Returns:
            list: List of AnswerEditHistory objects
        """
        query = cls.query.filter_by(answer_id=answer_id).order_by(cls.created_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def to_dict(self, include_content_diff=False):
        """
        Convert history record to dictionary
        
        Args:
            include_content_diff: Whether to include full body content
            
        Returns:
            dict: History data
        """
        result = {
            'id': self.id,
            'answer_id': self.answer_id,
            'editor_id': self.editor_id,
            'edit_reason': self.edit_reason,
            'is_moderator_edit': self.is_moderator_edit,
            'created_at': self.created_at.isoformat(),
            'body_changed': self.new_body is not None,
            'acceptance_changed': self.new_is_accepted is not None,
        }
        
        # Include full content if requested
        if include_content_diff:
            result.update({
                'previous_body': self.previous_body,
                'new_body': self.new_body,
                'previous_is_accepted': self.previous_is_accepted,
                'new_is_accepted': self.new_is_accepted,
            })
        
        return result