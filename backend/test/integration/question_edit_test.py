"""
Description: Tests for minimal question edit routes
Last Modified By: Mahek
Created: 2025-12-02
Testing GET /edit and PUT /update endpoints with minimal tracking
"""
import pytest
import json
from datetime import datetime, timedelta
from flask import Flask
from models.question import Question
from models.user import User
from models.tag import Tag
from database import db
import jwt


class TestQuestionEditRoutesMinimal:
    """Test suite for minimal question edit routes"""
    
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
                email='test@example.com'
            )
            db.session.add(test_user)
            
            
            other_user = User(
                id=3,
                username='otheruser',
                email='other@example.com'
            )
            db.session.add(other_user)
            
            # Create test tags
            tag1 = Tag(id=1, tag_name='python', tag_description='Python programming')
            tag2 = Tag(id=2, tag_name='javascript', tag_description='JavaScript')
            db.session.add(tag1)
            db.session.add(tag2)
            
            # Create test question
            question = Question(
                id=1,
                user_id=1,
                title='Test Question',
                body='This is a test question with enough content to meet requirements.',
                type='technical',
                status='open',
                created_at=datetime.utcnow()
            )
            db.session.add(question)
            
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
        """Generate auth headers with JWT token"""
        with app.app_context():
            token = jwt.encode(
                {'username': 'testuser', 'user_id': 1},
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            return {'Authorization': f'Bearer {token}'}
    
    
    @pytest.fixture
    def other_auth_headers(self, app):
        """Generate other user auth headers"""
        with app.app_context():
            token = jwt.encode(
                {'username': 'otheruser', 'user_id': 3},
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            return {'Authorization': f'Bearer {token}'}
    
    # ============================================================
    # Tests for GET /api/questions/<id>/edit
    # ============================================================
    
    def test_get_question_for_edit_success(self, client, auth_headers):
        """Test successfully loading question for editing"""
        response = client.get('/api/questions/1/edit', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'question' in data
        assert data['question']['id'] == 1
        assert data['question']['title'] == 'Test Question'
        assert data['can_edit'] is True
        assert 'requires_review' in data
    
    def test_get_question_for_edit_not_found(self, client, auth_headers):
        """Test loading non-existent question"""
        response = client.get('/api/questions/999/edit', headers=auth_headers)
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_get_question_for_edit_unauthorized(self, client):
        """Test loading without authentication"""
        response = client.get('/api/questions/1/edit')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_get_question_for_edit_forbidden_non_author(self, client, other_auth_headers):
        """Test non-author cannot edit question"""
        response = client.get('/api/questions/1/edit', headers=other_auth_headers)
        
        assert response.status_code == 403
        data = json.loads(response.data)
        assert 'permission' in data['error'].lower()
    
    
    def test_get_question_for_edit_within_grace_period(self, client, auth_headers, app):
        """Test editing within 10-minute grace period"""
        # Question was just created, so within grace period
        response = client.get('/api/questions/1/edit', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['requires_review'] is False
        assert data['edit_window_expired'] is False
    
    def test_get_question_for_edit_after_grace_period(self, client, auth_headers, app):
        """Test editing after 10-minute grace period"""
        # Set question created_at to 15 minutes ago
        with app.app_context():
            question = Question.query.get(1)
            question.created_at = datetime.utcnow() - timedelta(minutes=15)
            db.session.commit()
        
        response = client.get('/api/questions/1/edit', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['requires_review'] is True
        assert data['edit_window_expired'] is True
    
    # ============================================================
    # Tests for PUT /api/questions/<id>
    # ============================================================
    
    def test_update_question_success(self, client, auth_headers, app):
        """Test successfully updating a question"""
        update_data = {
            'title': 'Updated Test Question',
            'body': 'This is the updated body with enough content to meet requirements.',
            'tag_ids': [1, 2]
        }
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Question updated successfully'
        assert data['question']['title'] == 'Updated Test Question'
        assert data['question']['edit_count'] == 1
        assert data['question']['is_edited'] is True
        
        # Verify updated_at was updated
        with app.app_context():
            question = Question.query.get(1)
            assert question.updated_at is not None
    
    def test_update_question_not_found(self, client, auth_headers):
        """Test updating non-existent question"""
        update_data = {'title': 'Updated Title'}
        
        response = client.put(
            '/api/questions/999',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 404
    
    def test_update_question_unauthorized(self, client):
        """Test updating without authentication"""
        update_data = {'title': 'Updated Title'}
        
        response = client.put(
            '/api/questions/1',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 401
    
    def test_update_question_forbidden_non_author(self, client, other_auth_headers):
        """Test non-author cannot update question"""
        update_data = {'title': 'Hacked Title'}
        
        response = client.put(
            '/api/questions/1',
            headers={**other_auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 403
    
        
        response = client.put(
            '/api/questions/1',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
    
    def test_update_question_validation_title_required(self, client, auth_headers):
        """Test validation: title cannot be empty"""
        update_data = {'title': ''}
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'title' in data['errors']
    
    def test_update_question_validation_title_max_length(self, client, auth_headers):
        """Test validation: title max 120 characters"""
        update_data = {'title': 'a' * 121}
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'title' in data['errors']
    
    def test_update_question_validation_body_min_length(self, client, auth_headers):
        """Test validation: body min 20 characters"""
        update_data = {'body': 'Short'}
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'body' in data['errors']
    
    def test_update_question_validation_tags_min_one(self, client, auth_headers):
        """Test validation: at least one tag required"""
        update_data = {'tag_ids': []}
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'tags' in data['errors']
    
    def test_update_question_validation_tags_max_five(self, client, auth_headers):
        """Test validation: maximum 5 tags"""
        update_data = {'tag_ids': [1, 2, 1, 2, 1, 2]}
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'tags' in data['errors']
    
    def test_update_question_validation_no_duplicate_tags(self, client, auth_headers):
        """Test validation: no duplicate tags"""
        update_data = {'tag_ids': [1, 1, 2]}
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'tags' in data['errors']
    
    def test_update_question_increments_edit_count(self, client, auth_headers, app):
        """Test that edit_count increments with each edit"""
        # First edit
        update_data = {'title': 'First Edit'}
        client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Second edit
        update_data['title'] = 'Second Edit'
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        data = json.loads(response.data)
        assert data['question']['edit_count'] == 2
    
    def test_update_question_updates_timestamp(self, client, auth_headers, app):
        """Test that updated_at is updated on edit"""
        # Get original updated_at
        with app.app_context():
            question = Question.query.get(1)
            original_updated = question.updated_at
        
        # Wait a bit and update
        import time
        time.sleep(0.1)
        
        update_data = {'title': 'New Title'}
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        
        # Verify updated_at changed
        with app.app_context():
            question = Question.query.get(1)
            assert question.updated_at > original_updated
    
    def test_update_question_concurrency_check(self, client, auth_headers, app):
        """Test concurrent edit detection using updated_at"""
        # Get current updated_at
        with app.app_context():
            question = Question.query.get(1)
            old_timestamp = question.updated_at.isoformat()
        
        # Update question (simulating another user's edit)
        with app.app_context():
            question = Question.query.get(1)
            question.title = "Changed by someone else"
            question.edit_count += 1
            db.session.commit()
        
        # Try to update with stale timestamp
        update_data = {
            'title': 'My Edit',
            'last_known_update': old_timestamp
        }
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'concurrent_edit' in data or 'modified' in data['error'].lower()
    
    def test_update_question_no_changes_no_increment(self, client, auth_headers, app):
        """Test that edit_count doesn't increment if nothing changed"""
        # Update with same values
        update_data = {
            'title': 'Test Question',
            'body': 'This is a test question with enough content to meet requirements.'
        }
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        
        # edit_count should still be 0
        with app.app_context():
            question = Question.query.get(1)
            assert question.edit_count == 0
    
    def test_update_question_partial_update(self, client, auth_headers):
        """Test updating only title"""
        update_data = {'title': 'Only Title Changed'}
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['question']['title'] == 'Only Title Changed'
        assert 'test question' in data['question']['body'].lower()  # Body unchanged
    
    def test_update_question_with_tags(self, client, auth_headers, app):
        """Test updating tags"""
        update_data = {'tag_ids': [1, 2]}
        
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        assert response.status_code == 200
        
        # Verify tags were updated
        with app.app_context():
            question = Question.query.get(1)
            tag_ids = [tag.id for tag in question.tags.all()]
            assert set(tag_ids) == {1, 2}


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])