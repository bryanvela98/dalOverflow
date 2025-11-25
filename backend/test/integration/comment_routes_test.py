"""
Description: Integration tests for comment routes API endpoints.
Author: Bryan Vela
Created: 2025-11-24
Last Modified: 
    2025-11-24 - Endpoint tests.
    2025-11-25 - Added patch comment tests and delete comment tests.
"""
import unittest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) # this is to ensure imports work correctly

from test.test_base import DatabaseTestCase, TestDataCreation
from database import db

class CommentRoutesTestCase(DatabaseTestCase, TestDataCreation):
    """Integration tests for comment routes"""

    def setUp(self):
        """Set up test data for each test"""
        super().setUp()
        
        try:
            # Create test user and questions
            self.test_user = self.create_test_user()
            
            # Create test user and question
            self.test_user = self.create_test_user()
            self.test_question = self.create_test_question(
                user_id=self.test_user.id,
                title="Test Question for Comments",
                body="This is a test question body that needs answers."
            )
            # Test answer
            self.answer = self.create_test_answer(
                user_id=self.test_user.id,
                question_id=self.test_question.id,
                body="This is a test answer."
            )
            # test comments
            self.comment1 = self.create_test_comment(
                answer_id=self.answer.id,
                user_id=self.test_user.id,
                content="First comment on answer."
            )
            self.comment2 = self.create_test_comment(
                answer_id=self.answer.id,
                user_id=self.test_user.id,
                content="Second comment on answer."
            )
            # Commit all test data
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

    def test_post_comment_success(self):
        """Test POST /api/comments creates a comment successfully"""
        payload = {
            'answer_id': self.answer.id,
            'user_id': self.test_user.id,
            'content': 'This is a new test comment'
        }
        
        response = self.client.post('/api/comments', json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('comment', data)
        self.assertEqual(data['comment']['answer_id'], self.answer.id)
        self.assertEqual(data['comment']['user_id'], self.test_user.id)
        self.assertEqual(data['comment']['content'], 'This is a new test comment')
        self.assertIn('message', data)

    def test_post_comment_missing_content(self):
        """Test POST /api/comments fails when content is missing"""
        payload = {
            'answer_id': self.answer.id,
            'user_id': self.test_user.id
            # Missing 'content'
        }
        
        response = self.client.post('/api/comments', json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertIn('content', data['error'].lower())

    # Patch comment tests
    def test_patch_comment_success(self):
        """Test PATCH /api/comments/<comment_id> updates a comment successfully"""
        patch_payload = {
            'content': 'This is an updated comment content'
        }
        
        response = self.client.patch(f'/api/comments/{self.comment1.id}', json=patch_payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('comment', data)
        self.assertEqual(data['comment']['content'], 'This is an updated comment content')
        self.assertEqual(data['comment']['id'], self.comment1.id)
        self.assertIn('message', data)
        
    def test_patch_comment_not_found(self):
        """Test PATCH /api/comments/<comment_id> fails when comment doesn't exist"""
        patch_payload = {'content': 'Updated content'}
        response = self.client.patch('/api/comments/99999', json=patch_payload)
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertIn('comment not found', data['error'].lower())

    def test_patch_comment_empty_content(self):
        """Test PATCH /api/comments/<comment_id> fails when content is empty"""
        patch_payload = {'content': ''}
        response = self.client.patch(f'/api/comments/{self.comment1.id}', json=patch_payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertIn('content', data['error'].lower())

    # Delete comment tests
    def test_delete_comment_success(self):
        """Test DELETE /api/comments/<comment_id> deletes a comment successfully"""
        comment_id = self.comment1.id
        
        response = self.client.delete(f'/api/comments/{comment_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('message', data)
        self.assertIn('deleted', data['message'].lower())

        # Verify comment is actually deleted
        from models.comment import Comment
        deleted_comment = Comment.query.get(comment_id)
        self.assertIsNone(deleted_comment)

    def test_delete_comment_not_found(self):
        """Test DELETE /api/comments/<comment_id> fails when comment doesn't exist"""
        response = self.client.delete('/api/comments/99999')
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertIn('comment not found', data['error'].lower())
        
if __name__ == '__main__':
    unittest.main()