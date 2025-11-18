"""
Description: Base test classes and utilities for database integration tests.
Author: Bryan Vela
Created: 2025-11-09
Last Modified: 
    2025-11-09 - Created reusable database setup for integration tests.
"""
import unittest
import os
import time
from app import create_app
from database import db


class TestConfig:
    """Test configuration that forces SQLite usage"""
    TESTING = True
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Use temporary file for SQLite database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    # Override any environment variables
    DATABASE_URL = 'sqlite:///:memory:'
    
    
class DatabaseTestCase(unittest.TestCase):
    """Base test class with database setup for integration tests"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test app configuration once for all tests"""
        # Force environment variables to use SQLite
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        os.environ['DB_URL'] = 'sqlite:///:memory:'
        os.environ['FLASK_ENV'] = 'testing'
        
        # Create app with test config
        cls.app = create_app()
        
        # Override any existing configuration
        cls.app.config.from_object(TestConfig)
        
        # Ensure we're using SQLite
        cls.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        

        with cls.app.app_context():
            db.create_all()


    
    @classmethod
    def tearDownClass(cls):
        """Clean up app context"""
        try:
            db.session.remove()
            db.drop_all()
        except Exception:
            pass
        finally:
            cls.app_context.pop()
    
    def setUp(self):
        """Set up test database and client for each test"""
        self.client = self.app.test_client()
        
        # Clean database state
        try:
            # Clear all data but don't drop/recreate tables
            db.session.rollback()
            
            # Delete all data from tables
            meta = db.metadata
            for table in reversed(meta.sorted_tables):
                db.session.execute(table.delete())
            
            db.session.commit()
        except Exception as e:
            # If drop fails, try to clean up manually
            try:
                db.session.rollback()
                # If clearing fails, recreate tables
                db.drop_all()
                db.create_all()
                db.session.commit()
            except Exception:
                # If all else fails, just create tables
                db.create_all()
                db.session.commit()
    
    def tearDown(self):
        """Clean up database after each test"""
        try:
            db.session.rollback()
        except Exception:
            pass

class TestDataCreation:
    """Helper methods for creating test data"""
    
    def create_test_user(self, username=None, email=None):
        """Helper method to create a test user with unique identifiers"""
        from models.user import User
        from datetime import datetime
        
        # Generate unique identifiers if not provided
        if username is None or email is None:
            unique_suffix = str(int(time.time() * 1000000))  # Microsecond timestamp
            username = username or f'testuser_{unique_suffix}'
            email = email or f'test_{unique_suffix}@dal.ca'
        
        try:
            user = User.create({
                'username': username,
                'email': email,
                'password': 'password123',
                'display_name': f'Display {username}',
                'reputation': 0,
                'registration_date': datetime.utcnow(),
                'university': 'Test University'
            })
            db.session.flush()  # Ensure user gets an ID
            return user
        except Exception as e:
            db.session.rollback()
            raise e
    
    def create_test_question(self, user_id, title='Test Question', body='Test body'):
        """Helper method to create a test question"""
        from models.question import Question
        
        try:
            question = Question.create_with_sanitized_body({
                'title': title,
                'body': body,
                'user_id': user_id,
                'status': 'open',
                'type': 'technical'
            })
            db.session.flush()  # Ensure question gets an ID
            return question
        except Exception as e:
            db.session.rollback()
            raise e
        
    def create_test_answer(self, user_id, question_id, body='Test body'):
        """Helper method to create a test answer"""
        from models.answer import Answer
        
        try:
            answer = Answer.create({
                'question_id': question_id,
                'user_id': user_id,
                'body': body
            })
            db.session.flush()  # Ensure answer gets an ID
            return answer
        except Exception as e:
            db.session.rollback()
            raise e
    
    def create_test_tag(self, tag_name='TestTag', description='Test tag description'):
        """Helper method to create a test tag"""
        from models.tag import Tag
        
        try:
            tag = Tag.create({
                'tag_name': tag_name,
                'tag_description': description
            })
            db.session.flush()  # Ensure tag gets an ID
            return tag
        except Exception as e:
            db.session.rollback()
            raise e

    def create_test_question_tag(self, question_id, tag_id):
        """Helper method to create a question-tag association"""
        from models.questiontag import QuestionTag
        
        try:
            question_tag = QuestionTag.create({
                'question_id': question_id,
                'tag_id': tag_id
            })
            db.session.flush()  # Ensure association gets an ID
            return question_tag
        except Exception as e:
            db.session.rollback()
            raise e
        
    def create_test_vote(self, target_id, user_id, vote_type='upvote', target_type='question'):
        """Helper method to create a test vote"""
        from models.vote import Vote
        try:
            vote = Vote.create({
                'target_id': target_id,
                'user_id': user_id,
                'vote_type': vote_type,
                'target_type': target_type
            })
            db.session.flush()  # Ensure vote gets an ID
            return vote
        except Exception as e:
            db.session.rollback()
            raise e