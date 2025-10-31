import unittest
from unittest.mock import MagicMock
from models.user import User

#I need a class UserRegistration that handles all these functionalities
from services.user_registration import UserRegistration;

class TestUserRegistration(unittest.TestCase):
    def setUp(self):
        self.mock_db = MagicMock()

    def test_user_exists(self):
        mock_user = MagicMock()

        #will try to mock the User
        #call the query
        User.query = MagicMock()
        #filter by the email
        User.query.filter_by = MagicMock()
        #return the first result
        User.query.filter_by.return_value.first = MagicMock()

        #try to fetch existing user by calling the service
        result = UserRegistration().user_exists("test@dal.ca")

        #check if the result is true
        assert result is True


