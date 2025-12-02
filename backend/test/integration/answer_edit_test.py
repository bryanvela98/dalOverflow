"""
Description: Tests for answer edit and history routes
Last Modified By: Claude
Created: 2025-12-02
Testing the GET /edit, PUT /update, and GET /history endpoints for answers
"""
import pytest
import json
from datetime import datetime, timedelta
from flask import Flask
from models.answer import Answer
from models.answer_edit_history import AnswerEditHistory
from models.user import User
from models.question import Question
from database import db
import jwt


class TestAnswerEditRoutes:
    """Test suite for answer edit routes"""
    
    @pytest.fixture
    def app(self):
        """Create test Flask app"""
        from app import create_app
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            
            # Create test users
            test_user = User(
                id=1,
                username='testuser',
                email='test@example.com',
                is_moderator=False
            )
            db.session.add(test_user)
            
            question_author = User(
                id=2,
                username='question_author',
                email='author@example.com',
                is_moderator=False
            )
            db.session.add(question_author)
            
            mod_user = User(
                id=3,
                username='moderator',
                email='mod@example.com',
                is_moderator=True
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
                created_at=datetime.utcnow()
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
    
    @pytest.fixture
    def mod_auth_headers(self, app):
        """Generate moderator auth headers"""
        with app.app_context():
            token = jwt.encode(
                {'username': 'moderator', 'user_id': 3, 'is_moderator': True},
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            return {'Authorization': f'Bearer {token}'}
    
    # ============================================================
    # Tests for AC 1: Edit Own Answer
    # ============================================================
    
    def test_get_answer_for_edit_success(self, client, auth_headers):
        """AC 1: Author can load their answer for editing"""
        response = client.get(
            '/api/answers/1/edit',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'answer' in data
        assert data['answer']['id'] == 1
        assert data['can_edit'] is True
    
    def test_get_answer_for_edit_not_found(self, client, auth_headers):
        """Test loading non-existent answer for editing"""
        response = client.get(
            '/api/answers/999/edit',
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_get_answer_for_edit_unauthorized(self, client):
        """AC 1: Cannot edit without authentication"""
        response = client.get('/api/answers/1/edit')
        
        assert response.status_code == 401
    
    def test_get_answer_for_edit_forbidden_non_author(self, client, question_author_headers):
        """AC 1: Non-author cannot edit answer"""
        response = client.get(
            '/api/answers/1/edit',
            headers=question_author_headers
        )
        
        assert response.status_code == 403
        data = json.loads(response.data)
        assert 'permission' in data['error'].lower()
    
    def test_get_answer_for_edit_moderator_can_edit(self, client, mod_auth_headers):
        """Test moderator can edit any answer"""
        response = client.get(
            '/api/answers/1/edit',
            headers=mod_auth_headers
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['can_edit'] is True
    
    def test_update_answer_success(self, client, auth_headers):
        """AC 1: Author can successfully update their answer"""
        update_data = {
            'body': 'This is the updated answer body with enough content to meet minimum requirements.',
            'edit_reason': 'Fixed typo'
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
    
    def test_update_answer_creates_history(self, client, auth_headers, app):
        """AC 1: Updating answer creates history record"""
        update_data = {
            'body': 'New answer body with enough content to meet minimum requirements.',
            'edit_reason': 'Test edit'
        }
        
        response = client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        
        with app.app_context():
            history = AnswerEditHistory.get_by_answer_id(1)
            assert len(history) == 1
            assert history[0].edit_reason == 'Test edit'
    
    def test_update_answer_increments_edit_count(self, client, auth_headers):
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
        response = client.get('/api/questions/1/answers')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        answer = data['answers'][0]
        assert answer['is_edited'] is True
        assert answer['edit_count'] == 1
        assert answer['last_edited_at'] is not None
    
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
    
    def test_acceptance_change_tracked_in_history(self, client, auth_headers, app):
        """AC 2: Acceptance removal is tracked in history"""
        # Mark answer as accepted
        with app.app_context():
            answer = Answer.query.get(1)
            answer.is_accepted = True
            db.session.commit()
        
        # Edit the answer
        update_data = {
            'body': 'Updated accepted answer with enough content.'
        }
        
        client.put(
            '/api/answers/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        with app.app_context():
            history = AnswerEditHistory.get_by_answer_id(1)
            assert len(history) == 1
            assert history[0].previous_is_accepted is True
            assert history[0].new_is_accepted is False
    
    # ============================================================
    # Tests for GET /api/answers/<id>/history
    # ============================================================
    
    def test_get_answer_history_empty(self, client):
        """Test getting history for answer with no edits"""
        response = client.get('/api/answers/1/history')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['answer_id'] == 1
        assert data['edit_count'] == 0
        assert len(data['history']) == 0
    
    def test_get_answer_history_with_edits(self, client, auth_headers):
        """Test getting history after making edits"""
        # Make two edits
        for i in range(2):
            update_data = {
                'body': f'Edit {i+1} with enough content for requirements.',
                'edit_reason': f'Reason {i+1}'
            }
            client.put(
                '/api/answers/1',
                headers={**auth_headers, 'Content-Type': 'application/json'},
                data=json.dumps(update_data)
            )
        
        response = client.get('/api/answers/1/history')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['edit_count'] == 2
        assert len(data['history']) == 2
        assert data['history'][0]['edit_reason'] == 'Reason 2'  # Most recent first
    
    def test_get_answer_history_not_found(self, client):
        """Test getting history for non-existent answer"""
        response = client.get('/api/answers/999/history')
        
        assert response.status_code == 404
    
    def test_get_answer_history_with_limit(self, client, auth_headers):
        """Test getting history with limit parameter"""
        # Make 3 edits
        for i in range(3):
            update_data = {'body': f'Edit {i+1} with enough content.'}
            client.put(
                '/api/answers/1',
                headers={**auth_headers, 'Content-Type': 'application/json'},
                data=json.dumps(update_data)
            )
        
        response = client.get('/api/answers/1/history?limit=2')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['history']) == 2
        assert data['edit_count'] == 3
    
    # ============================================================
    # Tests for Moderator Functionality
    # ============================================================
    
    def test_moderator_can_edit_any_answer(self, client, mod_auth_headers):
        """Test moderator can edit any answer"""
        update_data = {
            'body': 'Moderator edited this answer with enough content.'
        }
        
        response = client.put(
            '/api/answers/1',
            headers={**mod_auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
    
    def test_moderator_edit_tracked_in_history(self, client, mod_auth_headers, app):
        """Test moderator edits are marked in history"""
        update_data = {
            'body': 'Moderator edited this answer with enough content.'
        }
        
        client.put(
            '/api/answers/1',
            headers={**mod_auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        with app.app_context():
            history = AnswerEditHistory.get_by_answer_id(1)
            assert history[0].is_moderator_edit is True
            assert history[0].editor_id == 3  # Moderator user


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])