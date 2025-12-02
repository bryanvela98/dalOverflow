# """
# Description: Abstract base model for all database tables using SQLAlchemy.
# Last Modified By: Bryan Vela
# Created: 2025-10-25
# Last Modified: 
#     2025-10-26 - File created and implemented basic CRUD operations.
#     2025-11-02 - Added Sanitize body and create with sanitized body content functions.
# """
# from .base_model import BaseModel
# from database import db
# from utils.html_sanitizer import sanitize_html_body

# class Question(BaseModel):
#     """
#     Question model representing the the questions asked on the website.

#     Attributes:
#         id = Primary Key.
#         type = Question Type
#         user_id = foreign key to the user table
#         title = Question title
#         body = Question Body
#         tags = Question tags
#         status = Question status(accepted or rejected)
#         accepted_answer_id = Accepted Answer
#         ai_generated_ans = AI Generated Answer
#     """
#     __tablename__ = 'questions'

#     type = db.Column(db.String(255))
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
#     title = db.Column(db.Text)
#     body = db.Column(db.Text)
#     # Many-to-many relationship with tags 
#     tags = db.relationship(
#         'Tag',
#         secondary='question_tags',
#         back_populates='questions',
#         lazy='dynamic'
#     )
#     answers = db.relationship(
#         'Answer',
#         back_populates='question',
#         lazy ='dynamic'
#     )
#     status = db.Column(db.String(255))
#     view_count = db.Column(db.Integer, default=0)
#     ai_generated_ans = db.Column(db.Text)
#     #accepted_answers_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=False)

    
#     def to_dict(self):
#         base_dict = super().to_dict()
#         base_dict.update({
#             'id':self.id,
#             'type':self.type,
#             'user_id':self.user_id,
#             'title':self.title,
#             'body':self.body,
#             'tags': [tag.to_dict() for tag in self.tags.all()],  # Convert relationship to list of tag dicts
#             'answers': [answer.to_dict() for answer in self.answers.all()],  # Convert relationship to list of answer dicts
#             'status':self.status,
#             'view_count': self.view_count or 0,
#             'ai_generated_ans': self.ai_generated_ans,
#             #'accepted_answers_id':self.accepted_answers_id
#         })
#         return base_dict
    
#     def sanitize_body(self):
#         """Sanitize the body content before saving"""
#         if self.body:
#             self.body = sanitize_html_body(self.body)

#     def increment_view_count(self):
#         """Increment the view count for this question"""
#         if self.view_count is None:
#             self.view_count = 0
#         self.view_count += 1
#         db.session.commit()
#         return self.view_count

#     @classmethod
#     def create_with_sanitized_body(cls, data):
#         """Create question with sanitized body content"""
#         question = cls(**data)
#         question.sanitize_body()
#         db.session.add(question)
#         db.session.commit()
#         return question
    
#     @classmethod
#     def create_with_tags(cls, data, tag_ids=None):
#         """Create question with sanitized body and associate tags"""
#         try:
#             # question creation
#             question_data = {k: v for k, v in data.items() if k != 'tag_ids'}
#             question = cls.create_with_sanitized_body(question_data)
            
#             # Refresh to ensure we have the ID
#             db.session.refresh(question)
            
#             # associate tag
#             if tag_ids:
#                 from models.tag import Tag
#                 from models.questiontag import QuestionTag
                
#                 for tag_id in tag_ids:
#                     tag = Tag.get_by_id(int(tag_id))
#                     if tag:
#                         QuestionTag.create({
#                             'question_id': question.id,
#                             'tag_id': int(tag_id)
#                         })
                
#                 db.session.commit()
            
#             return question
#         except Exception as e:
#             db.session.rollback()
#             raise e

"""
Description: Question model with edit functionality
Last Modified By: Claude
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
        last_edited_at = Timestamp of last edit
        last_edited_by = User ID of last editor
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
    last_edited_at = db.Column(db.DateTime, nullable=True)
    last_edited_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationship for edit history
    edit_history = db.relationship(
        'QuestionEditHistory',
        back_populates='question',
        lazy='dynamic',
        order_by='QuestionEditHistory.created_at.desc()'
    )

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
        })
        
        if include_edit_info:
            base_dict.update({
                'edit_count': self.edit_count or 0,
                'last_edited_at': self.last_edited_at.isoformat() if self.last_edited_at else None,
                'last_edited_by': self.last_edited_by,
                'is_edited': self.edit_count > 0
            })
        
        if current_user_id:
            # Check if current user can edit
            can_edit, requires_review = self.can_be_edited_by(
                user_id=current_user_id,
                is_moderator=self._is_moderator(current_user_id)
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

    def can_be_edited_by(self, user_id, is_moderator=False):
        """
        Check if a user can edit this question
        
        Args:
            user_id: ID of the user attempting to edit
            is_moderator: Whether the user is a moderator
            
        Returns:
            tuple: (can_edit: bool, requires_review: bool)
        """
        # Moderators can always edit
        if is_moderator:
            return True, False
        
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
    
    def _is_moderator(self, user_id):
        """Check if user is a moderator (to be implemented based on your user model)"""
        from models.user import User
        user = User.get_by_id(user_id)
        return user and getattr(user, 'is_moderator', False)
    
    def update_with_history(self, editor_id, title=None, body=None, tag_ids=None, 
                           edit_reason=None, is_moderator=False):
        """
        Update question with history tracking
        
        Args:
            editor_id: ID of user making the edit
            title: New title (optional)
            body: New body (optional)
            tag_ids: New tag IDs (optional)
            edit_reason: Reason for edit (optional)
            is_moderator: Whether editor is a moderator
            
        Returns:
            Question: Updated question instance
            
        Raises:
            PermissionError: If user cannot edit
            ValueError: If validation fails
        """
        # Check permissions
        can_edit, requires_review = self.can_be_edited_by(editor_id, is_moderator)
        if not can_edit:
            raise PermissionError("User does not have permission to edit this question")
        
        # Store previous values for history
        previous_title = self.title
        previous_body = self.body
        previous_tag_ids = [tag.id for tag in self.tags.all()]
        
        # Validate new values
        if title is not None:
            if not title or len(title.strip()) == 0:
                raise ValueError("Title is required")
            if len(title) > 120:
                raise ValueError("Title must not exceed 120 characters")
            self.title = title.strip()
        
        if body is not None:
            if not body or len(body.strip()) < 20:
                raise ValueError("Body must be at least 20 characters")
            self.body = body
            self.sanitize_body()
        
        if tag_ids is not None:
            if len(tag_ids) < 1:
                raise ValueError("At least one tag is required")
            if len(tag_ids) > 5:
                raise ValueError("Maximum 5 tags allowed")
            
            # Update tags
            from models.tag import Tag
            from models.questiontag import QuestionTag
            
            # Remove old tag associations
            QuestionTag.query.filter_by(question_id=self.id).delete()
            
            # Add new tag associations
            for tag_id in tag_ids:
                tag = Tag.get_by_id(int(tag_id))
                if not tag:
                    raise ValueError(f"Tag with id {tag_id} not found")
                QuestionTag.create({
                    'question_id': self.id,
                    'tag_id': int(tag_id)
                })
        
        # Update edit metadata
        self.edit_count = (self.edit_count or 0) + 1
        self.last_edited_at = datetime.utcnow()
        self.last_edited_by = editor_id
        
        # Create history record
        from models.question_edit_history import QuestionEditHistory
        QuestionEditHistory.create({
            'question_id': self.id,
            'editor_id': editor_id,
            'previous_title': previous_title,
            'new_title': self.title,
            'previous_body': previous_body,
            'new_body': self.body,
            'previous_tag_ids': previous_tag_ids,
            'new_tag_ids': tag_ids if tag_ids else previous_tag_ids,
            'edit_reason': edit_reason,
            'is_moderator_edit': is_moderator,
            'requires_review': requires_review
        })
        
        db.session.commit()
        return self
    
    def get_edit_history(self):
        """Get edit history for this question"""
        return [history.to_dict() for history in self.edit_history.all()]

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