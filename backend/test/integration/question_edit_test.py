"""
Description: Tests for question edit and history routes
Last Modified By: Mahek
Created: 2025-12-02
Testing the GET /edit, PUT /update, and GET /history endpoints
"""
import pytest
import json
from datetime import datetime, timedelta
from flask import Flask
from models.question import Question
from models.question_edit_history import QuestionEditHistory
from models.user import User
from models.tag import Tag
from database import db
import jwt


class TestQuestionEditRoutes:
    """Test suite for question edit routes"""
    
    @pytest.fixture
    def app(self):
        """Create test Flask app"""
        from app import create_app
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            
            # Create test user
            test_user = User(
                id=1,
                username='testuser',
                email='test@example.com',
                is_moderator=False
            )
            db.session.add(test_user)
            
            # Create moderator user
            mod_user = User(
                id=2,
                username='moderator',
                email='mod@example.com',
                is_moderator=True
            )
            db.session.add(mod_user)
            
            # Create test tags
            tag1 = Tag(id=1, tag_name='python', tag_description='Python programming')
            tag2 = Tag(id=2, tag_name='javascript', tag_description='JavaScript programming')
            db.session.add(tag1)
            db.session.add(tag2)
            
            # Create test question
            question = Question(
                id=1,
                user_id=1,
                title='Test Question',
                body='This is a test question with enough content to meet the minimum requirement.',
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
    def mod_auth_headers(self, app):
        """Generate moderator auth headers"""
        with app.app_context():
            token = jwt.encode(
                {'username': 'moderator', 'user_id': 2, 'is_moderator': True},
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            return {'Authorization': f'Bearer {token}'}
    
    # ============================================================
    # Tests for GET /api/questions/<id>/edit
    # ============================================================
    
    def test_get_question_for_edit_success(self, client, auth_headers):
        """Test successfully loading question for editing"""
        # Act
        response = client.get(
            '/api/questions/1/edit',
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'question' in data
        assert data['question']['id'] == 1
        assert data['question']['title'] == 'Test Question'
        assert data['can_edit'] is True
        assert 'requires_review' in data
    
    def test_get_question_for_edit_not_found(self, client, auth_headers):
        """Test loading non-existent question for editing"""
        # Act
        response = client.get(
            '/api/questions/999/edit',
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_get_question_for_edit_unauthorized(self, client):
        """Test loading question without authentication"""
        # Act
        response = client.get('/api/questions/1/edit')
        
        # Assert
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_get_question_for_edit_forbidden_non_author(self, client, app):
        """Test non-author cannot edit question"""
        # Arrange - create token for different user
        with app.app_context():
            other_user = User(id=3, username='otheruser', email='other@example.com')
            db.session.add(other_user)
            db.session.commit()
            
            token = jwt.encode(
                {'username': 'otheruser', 'user_id': 3},
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            headers = {'Authorization': f'Bearer {token}'}
        
        # Act
        response = client.get('/api/questions/1/edit', headers=headers)
        
        # Assert
        assert response.status_code == 403
        data = json.loads(response.data)
        assert 'permission' in data['error'].lower()
    
    def test_get_question_for_edit_moderator_can_edit(self, client, mod_auth_headers):
        """Test moderator can edit any question"""
        # Act
        response = client.get(
            '/api/questions/1/edit',
            headers=mod_auth_headers
        )
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['can_edit'] is True
        assert data['requires_review'] is False  # Moderators don't need review
    
    def test_get_question_for_edit_within_time_window(self, client, auth_headers, app):
        """Test editing within 10-minute window"""
        # Arrange - question created 5 minutes ago
        with app.app_context():
            question = Question.query.get(1)
            question.created_at = datetime.utcnow() - timedelta(minutes=5)
            db.session.commit()
        
        # Act
        response = client.get('/api/questions/1/edit', headers=auth_headers)
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['requires_review'] is False
    
    def test_get_question_for_edit_after_time_window(self, client, auth_headers, app):
        """Test editing after 10-minute window requires review"""
        # Arrange - question created 15 minutes ago
        with app.app_context():
            question = Question.query.get(1)
            question.created_at = datetime.utcnow() - timedelta(minutes=15)
            db.session.commit()
        
        # Act
        response = client.get('/api/questions/1/edit', headers=auth_headers)
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['requires_review'] is True
    
    # ============================================================
    # Tests for PUT /api/questions/<id>
    # ============================================================
    
    def test_update_question_success(self, client, auth_headers):
        """Test successfully updating a question"""
        # Arrange
        update_data = {
            'title': 'Updated Test Question',
            'body': 'This is the updated body with enough content to meet requirements.',
            'tag_ids': [1, 2],
            'edit_reason': 'Fixed typo'
        }
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Question updated successfully'
        assert data['question']['title'] == 'Updated Test Question'
        assert data['question']['edit_count'] == 1
        assert data['question']['is_edited'] is True
    
    def test_update_question_not_found(self, client, auth_headers):
        """Test updating non-existent question"""
        # Arrange
        update_data = {'title': 'Updated Title'}
        
        # Act
        response = client.put(
            '/api/questions/999',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 404
    
    def test_update_question_unauthorized(self, client):
        """Test updating without authentication"""
        # Arrange
        update_data = {'title': 'Updated Title'}
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 401
    
    def test_update_question_validation_title_required(self, client, auth_headers):
        """Test validation: title cannot be empty"""
        # Arrange
        update_data = {'title': ''}
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'title' in data['errors']
    
    def test_update_question_validation_title_max_length(self, client, auth_headers):
        """Test validation: title max 120 characters"""
        # Arrange
        update_data = {'title': 'a' * 121}
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'title' in data['errors']
    
    def test_update_question_validation_body_min_length(self, client, auth_headers):
        """Test validation: body min 20 characters"""
        # Arrange
        update_data = {'body': 'Short'}
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'body' in data['errors']
    
    def test_update_question_validation_tags_min_one(self, client, auth_headers):
        """Test validation: at least one tag required"""
        # Arrange
        update_data = {'tag_ids': []}
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'tags' in data['errors']
    
    def test_update_question_validation_tags_max_five(self, client, auth_headers):
        """Test validation: maximum 5 tags"""
        # Arrange
        update_data = {'tag_ids': [1, 2, 1, 2, 1, 2]}  # 6 tags
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'tags' in data['errors']
    
    def test_update_question_validation_no_duplicate_tags(self, client, auth_headers):
        """Test validation: no duplicate tags"""
        # Arrange
        update_data = {'tag_ids': [1, 1, 2]}
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'tags' in data['errors']
    
    def test_update_question_forbidden_non_author(self, client, app):
        """Test non-author cannot update question"""
        # Arrange
        with app.app_context():
            token = jwt.encode(
                {'username': 'otheruser', 'user_id': 3},
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
        
        update_data = {'title': 'Hacked Title'}
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers=headers,
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 403
    
    def test_update_question_moderator_can_edit(self, client, mod_auth_headers):
        """Test moderator can update any question"""
        # Arrange
        update_data = {
            'title': 'Moderator Updated Title',
            'body': 'Moderator updated this question body with enough content.'
        }
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**mod_auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['question']['title'] == 'Moderator Updated Title'
    
    def test_update_question_creates_history(self, client, auth_headers, app):
        """Test that updating creates history record"""
        # Arrange
        update_data = {
            'title': 'New Title',
            'body': 'New body with enough content to meet requirements.',
            'edit_reason': 'Test edit'
        }
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 200
        
        with app.app_context():
            history = QuestionEditHistory.get_by_question_id(1)
            assert len(history) == 1
            assert history[0].previous_title == 'Test Question'
            assert history[0].new_title == 'New Title'
            assert history[0].edit_reason == 'Test edit'
    
    def test_update_question_increments_edit_count(self, client, auth_headers, app):
        """Test that edit count increments"""
        # Arrange
        update_data = {'title': 'First Edit'}
        
        # Act - First edit
        client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Act - Second edit
        update_data['title'] = 'Second Edit'
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        data = json.loads(response.data)
        assert data['question']['edit_count'] == 2
    
    def test_update_question_concurrency_check(self, client, auth_headers, app):
        """Test concurrent edit detection"""
        # Arrange - simulate stale timestamp
        old_timestamp = (datetime.utcnow() - timedelta(minutes=5)).isoformat()
        
        # Update question first
        with app.app_context():
            question = Question.query.get(1)
            question.last_edited_at = datetime.utcnow()
            db.session.commit()
        
        update_data = {
            'title': 'Concurrent Edit',
            'last_known_update': old_timestamp
        }
        
        # Act
        response = client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Assert
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'concurrent_edit' in data or 'modified' in data['error'].lower()
    
    # ============================================================
    # Tests for GET /api/questions/<id>/history
    # ============================================================
    
    def test_get_question_history_empty(self, client):
        """Test getting history for question with no edits"""
        # Act
        response = client.get('/api/questions/1/history')
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['question_id'] == 1
        assert data['edit_count'] == 0
        assert len(data['history']) == 0
    
    def test_get_question_history_with_edits(self, client, auth_headers, app):
        """Test getting history after making edits"""
        # Arrange - make some edits
        update_data = {'title': 'First Edit', 'edit_reason': 'Reason 1'}
        client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        update_data = {'title': 'Second Edit', 'edit_reason': 'Reason 2'}
        client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Act
        response = client.get('/api/questions/1/history')
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['edit_count'] == 2
        assert len(data['history']) == 2
        assert data['history'][0]['edit_reason'] == 'Reason 2'  # Most recent first
        assert data['history'][1]['edit_reason'] == 'Reason 1'
    
    def test_get_question_history_not_found(self, client):
        """Test getting history for non-existent question"""
        # Act
        response = client.get('/api/questions/999/history')
        
        # Assert
        assert response.status_code == 404
    
    def test_get_question_history_with_limit(self, client, auth_headers):
        """Test getting history with limit parameter"""
        # Arrange - make 3 edits
        for i in range(3):
            update_data = {'title': f'Edit {i+1}'}
            client.put(
                '/api/questions/1',
                headers={**auth_headers, 'Content-Type': 'application/json'},
                data=json.dumps(update_data)
            )
        
        # Act
        response = client.get('/api/questions/1/history?limit=2')
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['history']) == 2  # Limited to 2
        assert data['edit_count'] == 3  # But total count is 3
    
    def test_get_question_history_includes_metadata(self, client, auth_headers):
        """Test history includes all necessary metadata"""
        # Arrange - make an edit
        update_data = {
            'title': 'Updated Title',
            'body': 'Updated body content',
            'tag_ids': [1],
            'edit_reason': 'Test reason'
        }
        client.put(
            '/api/questions/1',
            headers={**auth_headers, 'Content-Type': 'application/json'},
            data=json.dumps(update_data)
        )
        
        # Act
        response = client.get('/api/questions/1/history')
        
        # Assert
        data = json.loads(response.data)
        history_item = data['history'][0]
        assert 'editor_id' in history_item
        assert 'created_at' in history_item
        assert 'edit_reason' in history_item
        assert history_item['title_changed'] is True
        assert history_item['body_changed'] is True


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])