"""
Description: Abstract base model for all database tables using SQLAlchemy.
Author: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created and implemented basic CRUD operations.
"""
from datetime import datetime, timezone
from app import db

class BaseModel(db.Model):
    """
    Abstract base model for all database tables.

    Attributes:
        id (int): Primary key.
        created_at (datetime): Timestamp when the record was created (UTC).
        updated_at (datetime): Timestamp when the record was last updated (UTC).
    """
    __abstract__ = True  # Indicates that this is an abstract base class

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        """
        Convert model instance to dictionary.

        Returns:
            dict: Dictionary with id, created_at, and updated_at.
        """
        return {
            'id': self.id,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def create(cls, data):
        """
        Create and save a new instance.

        Args:
            data (dict): Dictionary of fields to set.

        Returns:
            BaseModel: The created instance.
        """
        instance = cls(**data)
        db.session.add(instance)
        db.session.commit()
        return instance

    @classmethod
    def get_by_id(cls, id):
        """
        Retrieve an instance by its primary key.

        Args:
            id (int): Primary key.

        Returns:
            BaseModel or None: The found instance or None.
        """
        return cls.query.get(id)

    @classmethod
    def get_all(cls, limit=100):
        """
        Retrieve all instances, limited by count.

        Args:
            limit (int): Maximum number of records to return.

        Returns:
            list: List of instances.
        """
        return cls.query.limit(limit).all()

    def update(self, data):
        """
        Update instance fields and save.

        Args:
            data (dict): Dictionary of fields to update.

        Returns:
            None
        """
        for key, value in data.items():
            setattr(self, key, value)
        self.updated_at = datetime.now(timezone.utc)
        db.session.commit()

    def delete(self):
        """
        Delete the instance from the database.

        Returns:
            None
        """
        db.session.delete(self)
        db.session.commit()