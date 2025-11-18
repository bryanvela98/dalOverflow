"""
Description: Integration tests for vote routes API endpoints.
Author: Bryan Vela
Created: 2025-11-17
"""
import unittest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) )

from test.test_base import DatabaseTestCase, TestDataCreation
from database import db

class VoteRoutesTestCase(DatabaseTestCase, TestDataCreation):
	"""Integration tests for vote routes"""

	def setUp(self):
		super().setUp()
		self.user = self.create_test_user()
		self.question = self.create_test_question(user_id=self.user.id)

	def test_post_vote(self):
		"""Test POST /api/votes creates a vote"""
		payload = {
			'question_id': self.question.id,
			'user_id': self.user.id,
			'vote_type': 'upvote',
			'target_type': 'question'
		}
		response = self.client.post('/api/votes', json=payload)
		self.assertEqual(response.status_code, 201)
		data = response.get_json()
		self.assertIn('vote', data)
		self.assertEqual(data['vote']['question_id'], self.question.id)
		self.assertEqual(data['vote']['user_id'], self.user.id)
		self.assertEqual(data['vote']['vote_type'], 'upvote')
		self.assertEqual(data['vote']['target_type'], 'question')

	def test_get_votes(self):
		"""Test GET /api/votes returns all votes"""
		# Create two votes
		vote1 = self.create_test_vote(question_id=self.question.id, user_id=self.user.id, vote_type='upvote', target_type='question')
		vote2 = self.create_test_vote(question_id=self.question.id, user_id=self.user.id, vote_type='downvote', target_type='question')
		db.session.commit()

		response = self.client.get('/api/votes')
		self.assertEqual(response.status_code, 200)
		data = response.get_json()
		self.assertIn('votes', data)
		self.assertTrue(any(v['id'] == vote1.id for v in data['votes']))
		self.assertTrue(any(v['id'] == vote2.id for v in data['votes']))

if __name__ == '__main__':
	unittest.main()
