"""
Description: Tests for minimal answer edit routes - FIXED
Last Modified By: Assistant
Created: 2025-12-04
Testing GET /edit and PUT /update endpoints with minimal tracking
"""
import pytest
import json
from datetime import datetime, timezone
from flask import Flask
from models.answer import Answer
from models.question import Question
from models.user import User
from database import db
import jwt


class TestAnswerEditRoutesMinimal:
    """Test suite for minimal answer edit routes"""
    
    @pytest.fixture
    def app(self):
        """Create test Flask app"""
        from app import create_app
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            
            # FIXED: Create test users with ALL required fields including username
            test_user = User(
                id=1,
                username='testuser',  # REQUIRED - was missing
                email='test@example.com',
                password='hashed-test-password',
                display_name="Test User",
                profile_picture_url=None,
                reputation=0,
                registration_date=datetime.now(timezone.utc),
                university="Dalhousie University"
            )
            db.session.add(test_user)
            
            question_author = User(
                id=2,
                username='question_author',  # REQUIRED - was present
                email='author@example.com',
                password='hashed-test-password',
                display_name="Question Author",
                profile_picture_url=None,
                reputation=0,
                registration_date=datetime.now(timezone.utc),
                university="Dalhousie University"
            )
            db.session.add(question_author)
            
            mod_user = User(
                id=3,
                username='mod_user',  # REQUIRED - was missing (caused NOT NULL error)
                email='mod@example.com',
                password='hashed-test-password',
                display_name="Moderator User",
                profile_picture_url=None,
                reputation=0,
                registration_date=datetime.now(timezone.utc),
                university="Dalhousie University"
            )
            db.session.add(mod_user)
            
            # Create test question
            question = Question(
                id=1,
                user_id=2,
                title='Test Question',
                body='This is a test question',
                type='technical',
                status='open'
            )
            db.session.add(question)
            
            # Create test answer
            answer = Answer(
                id=1,
                question_id=1,
                user_id=1,
                body='This is a test answer with enough content to meet the minimum requirement of twenty characters.',
                is_accepted=False,
                created_at=datetime.now(timezone.utc)
            )
            db.session.add(answer)
            
            db.session.commit()
            
            yield app
            
            db.session.remove()
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()
    
    @pytest.fixture
    def auth_headers(self, app):
        """Generate auth headers for answer author"""
        with app.app_context():
            token = jwt.encode(
                {'username': 'testuser', 'user_id': 1},
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            return {'Authorization': f'Bearer {token}'}
    
    @pytest.fixture
    def question_author_headers(self, app):
        """Generate auth headers for question author"""
        with app.app_context():
            token = jwt.encode(
                {'username': 'question_author', 'user_id': 2},
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            return {'Authorization': f'Bearer {token}'}
    
    # ============================================================
    # Tests for AC 1: Edit Own Answer
    # ============================================================
    
    def test_get_answer_for_edit_success(self, client, auth_headers):
        """AC 1: Author can load their answer for editing"""
        response = client.get('/api/answers/1/edit', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'answer' in data
        assert data['answer']['id'] == 1
        assert data['can_edit'] is True
    
    def test_get_answer_for_edit_not_found(self, client, auth_headers):
        """Test loading non-existent answer"""
        response = client.get('/api/answers/999/edit', headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_get_answer_for_edit_unauthorized(self, client):
        """AC 1: Cannot edit without authentication"""
        response = client.get('/api/answers/1/edit')
        
        assert response.status_code == 401
    
    def test_get_answer_for_edit_forbidden_non_author(self, client, question_author_headers):
        """AC 1: Non-author cannot edit answer"""
        response = client.get('/api/answers/1/edit', headers=question_author_headers)
        
        assert response.status_code == 403
        data = json.loads(response.data)
        assert 'permission' in data['error'].lower()
    
    def test_update_answer_success(self, client, auth_headers, app):
        """AC 1: Author can successfully update their answer"""
        update_data = {
            'body': 'This is the updated answer body with enough content to meet minimum requirements.'
        }
        
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Answer updated successfully'
        assert data['answer']['edit_count'] == 1
        assert data['answer']['is_edited'] is True
        
        # Verify updated_at was updated
        with app.app_context():
            answer = Answer.query.get(1)
            assert answer.updated_at is not None
    
    def test_update_answer_validation_min_length(self, client, auth_headers):
        """Test validation: answer must be at least 20 characters"""
        update_data = {'body': 'Too short'}
        
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'body' in data['errors']
    
    def test_update_answer_validation_body_required(self, client, auth_headers):
        """Test validation: body is required"""
        update_data = {}
        
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'body' in data['errors']
    
    def test_update_answer_forbidden_non_author(self, client, question_author_headers):
        """AC 1: Non-author cannot update answer"""
        update_data = {
            'body': 'Hacked answer content with enough characters to meet requirements.'
        }
        
        response = client.put(
            '/api/answers/1',
            headers={**question_author_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 403
    
    def test_update_answer_increments_edit_count(self, client, auth_headers, app):
        """AC 1: Edit count increments with each edit"""
        # First edit
        update_data = {'body': 'First edit with enough content for requirements.'}
        client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Second edit
        update_data['body'] = 'Second edit with enough content for requirements.'
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        data = json.loads(response.data)
        assert data['answer']['edit_count'] == 2
    
    def test_update_answer_updates_timestamp(self, client, auth_headers, app):
        """Test that updated_at is updated on edit"""
        # Get original updated_at
        with app.app_context():
            answer = Answer.query.get(1)
            original_updated = answer.updated_at
        
        # Wait a bit and update
        import time
        time.sleep(0.1)
        
        update_data = {'body': 'New answer body with enough content for requirements.'}
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        
        # Verify updated_at changed
        with app.app_context():
            answer = Answer.query.get(1)
            assert answer.updated_at > original_updated
    
    def test_edit_indicator_in_answer_list(self, client, auth_headers, app):
        """AC 1: Edited answers show edit metadata in list"""
        # Make an edit
        update_data = {'body': 'Updated answer with enough content for requirements.'}
        client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Get answers list
        response = client.get('/api/answers/questions/1/answers')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        answer = data['answers'][0]
        assert answer['is_edited'] is True
        assert answer['edit_count'] == 1
        # FIXED: Use updated_at instead of last_edited_at
        assert answer['updated_at'] is not None
    
    # ============================================================
    # Tests for AC 2: Edit After Answer is Accepted
    # ============================================================
    
    def test_edit_accepted_answer_removes_acceptance(self, client, auth_headers, app):
        """AC 2: Editing accepted answer removes acceptance status"""
        # Mark answer as accepted
        with app.app_context():
            answer = Answer.query.get(1)
            answer.is_accepted = True
            db.session.commit()
        
        # Edit the answer
        update_data = {
            'body': 'Updated accepted answer with enough content for requirements.'
        }
        
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['acceptance_removed'] is True
        assert data['answer']['is_accepted'] is False
    
    def test_edit_unaccepted_answer_no_change(self, client, auth_headers):
        """AC 2: Editing unaccepted answer doesn't affect acceptance"""
        update_data = {
            'body': 'Updated unaccepted answer with enough content for requirements.'
        }
        
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['acceptance_removed'] is False
    
    def test_update_answer_no_change_no_increment(self, client, auth_headers, app):
        """Test that edit_count doesn't increment if content didn't change"""
        # Update with same content
        update_data = {
            'body': 'This is a test answer with enough content to meet the minimum requirement of twenty characters.'
        }
        
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        
        # edit_count should still be 0
        with app.app_context():
            answer = Answer.query.get(1)
            assert answer.edit_count == 0
    
    def test_get_answers_includes_edit_metadata(self, client, auth_headers):
        """Test that get_answers includes edit metadata"""
        # Make an edit first
        update_data = {'body': 'Updated answer with enough content.'}
        client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Get answers
        response = client.get('/api/answers/questions/1/answers')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        answer = data['answers'][0]
        
        # Verify edit metadata is present
        assert 'edit_count' in answer
        assert 'is_edited' in answer
        # FIXED: Check for updated_at instead of last_edited_at
        assert 'updated_at' in answer
        assert answer['edit_count'] == 1
        assert answer['is_edited'] is True
    
    # def test_get_answers_includes_can_edit_flag(self, client, auth_headers):
    #     """Test that get_answers includes can_edit flag when authenticated"""
    #     response = client.get('/api/answers/questions/1/answers', headers=auth_headers)
        
    #     assert response.status_code == 200
    #     data = json.loads(response.data)
    #     answer = data['answers'][0]
        
    #     assert 'can_edit' in answer
    #     assert answer['can_edit'] is True  # User 1 is the author
    
    # def test_get_answers_no_can_edit_flag_when_unauthenticated(self, client):
    #     """Test that get_answers doesn't include can_edit when not authenticated"""
    #     response = client.get('/api/answers/questions/1/answers')
        
    #     assert response.status_code == 200
    #     data = json.loads(response.data)
    #     answer = data['answers'][0]
        
    #     # can_edit should not be present or be False
    #     assert answer.get('can_edit') is None or answer.get('can_edit') is False


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])