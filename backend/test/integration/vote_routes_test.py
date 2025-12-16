"""
Description: Integration tests for vote routes API endpoints.
Author: Bryan Vela
Created: 2025-11-17
Last Modified: 
    2025-11-17 - Endpoint tests.
"""
import unittest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from test.test_base import DatabaseTestCase, TestDataCreation
from database import db

class VoteRoutesTestCase(DatabaseTestCase, TestDataCreation):
    """Integration tests for vote routes"""

    def setUp(self):
        super().setUp()
        self.user = self.create_test_user()
        self.question = self.create_test_question(user_id=self.user.id)
        self.answer = self.create_test_answer(question_id=self.question.id, user_id=self.user.id)

    def test_post_vote_question(self):
        """Test POST /api/votes creates a vote for a question"""
        payload = {
            'target_id': self.question.id,
            'user_id': self.user.id,
            'vote_type': 'upvote',
            'target_type': 'question'
        }
        response = self.client.post('/api/votes', json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('vote', data)
        self.assertEqual(data['vote']['target_id'], self.question.id)
        self.assertEqual(data['vote']['user_id'], self.user.id)
        self.assertEqual(data['vote']['vote_type'], 'upvote')
        self.assertEqual(data['vote']['target_type'], 'question')

    def test_post_vote_answer(self):
        """Test POST /api/votes creates a vote for an answer"""
        payload = {
            'target_id': self.answer.id,
            'user_id': self.user.id,
            'vote_type': 'downvote',
            'target_type': 'answer'
        }
        response = self.client.post('/api/votes', json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('vote', data)
        self.assertEqual(data['vote']['target_id'], self.answer.id)
        self.assertEqual(data['vote']['user_id'], self.user.id)
        self.assertEqual(data['vote']['vote_type'], 'downvote')
        self.assertEqual(data['vote']['target_type'], 'answer')

    def test_get_votes(self):
        """Test GET /api/votes returns all votes"""
        vote1 = self.create_test_vote(target_id=self.question.id, user_id=self.user.id, vote_type='upvote', target_type='question')
        vote2 = self.create_test_vote(target_id=self.answer.id, user_id=self.user.id, vote_type='downvote', target_type='answer')
        db.session.commit()

        response = self.client.get('/api/votes')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('votes', data)
        self.assertTrue(any(v['id'] == vote1.id for v in data['votes']))
        self.assertTrue(any(v['id'] == vote2.id for v in data['votes']))

    def test_get_vote_count_for_ques(self):
        """Test GET /api/votes/question/<target_id> returns vote count for a question"""
        self.create_test_vote(target_id=self.question.id, user_id=self.user.id, vote_type='upvote', target_type='question')
        self.create_test_vote(target_id=self.question.id, user_id=self.user.id, vote_type='downvote', target_type='question')
        db.session.commit()

        response = self.client.get(f'/api/votes/question/{self.question.id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('vote_count', data)
        # upvote (+1) + downvote (-1) = 0
        self.assertEqual(data['vote_count'], 0)

    def test_get_vote_count_for_ans(self):
        """Test GET /api/votes/answer/<target_id> returns vote count for an answer"""
        self.create_test_vote(target_id=self.answer.id, user_id=self.user.id, vote_type='upvote', target_type='answer')
        db.session.commit()

        response = self.client.get(f'/api/votes/answer/{self.answer.id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('vote_count', data)
        self.assertEqual(data['vote_count'], 1)

    def test_patch_vote_switch_type(self):
        """Test PATCH /api/votes/<vote_id> switches vote_type"""
        # Create an upvote for a question
        vote = self.create_test_vote(
            target_id=self.question.id,
            user_id=self.user.id,
            vote_type='upvote',
            target_type='question'
        )
        db.session.commit()

        # Switch to downvote
        patch_payload = {'vote_type': 'downvote'}
        response = self.client.patch(f'/api/votes/{vote.id}', json=patch_payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('vote', data)
        self.assertEqual(data['vote']['vote_type'], 'downvote')
        self.assertEqual(data['vote']['id'], vote.id)

    def test_delete_vote(self):
        """Test DELETE /api/votes/<vote_id> deletes a vote"""
        # Create an upvote for a question
        vote = self.create_test_vote(
            target_id=self.question.id,
            user_id=self.user.id,
            vote_type='upvote',
            target_type='question'
        )
        db.session.commit()

        # Delete the vote
        response = self.client.delete(f'/api/votes/{vote.id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'Vote deleted successfully')

        # Verify vote is deleted
        from models.vote import Vote
        deleted_vote = Vote.query.get(vote.id)
        self.assertIsNone(deleted_vote)

    def test_del_vote_not_found(self):
        """Test DELETE /api/votes/<vote_id> returns 404 when vote doesn't exist"""
        response = self.client.delete('/api/votes/9999')
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Vote not found')
        
    def test_get_user_votes(self):
        """Test GET /api/votes/user returns all votes for a user"""
        # Creation of votes
        vote1 = self.create_test_vote(target_id=self.question.id, user_id=self.user.id, vote_type='upvote', target_type='question')
        vote2 = self.create_test_vote(target_id=self.answer.id, user_id=self.user.id, vote_type='downvote', target_type='answer')
        # Creation of a vote for another user
        other_user = self.create_test_user(username="other", email="other@dal.ca")
        self.create_test_vote(target_id=self.question.id, user_id=other_user.id, vote_type='upvote', target_type='question')
        db.session.commit()

        response = self.client.get(f'/api/votes/user?user_id={self.user.id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('votes', data)
        vote_ids = [v['id'] for v in data['votes']]
        self.assertIn(vote1.id, vote_ids)
        self.assertIn(vote2.id, vote_ids)
        #  not include votes from other users
        self.assertEqual(len(data['votes']), 2)
if __name__ == '__main__':
    unittest.main()