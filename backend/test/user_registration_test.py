import unittest
from unittest.mock import MagicMock
from models.user import User

#I need a class UserRegistration that handles all these functionalities
from services.user_registration import UserRegistrationService;

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
        User.query.filter_by.return_value.first = MagicMock(return_value=mock_user)

        #try to fetch existing user by calling the service
        result = UserRegistrationService().user_exists("test@dal.ca")

        #check if the result is true
        assert result is True

    def test_user_not_exists(self):
        mock_user = MagicMock()
        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        #should return nothing
        User.query.filter_by.return_value.first = MagicMock(return_value=None)

        result = UserRegistrationService().user_exists("test@dal.ca")

        #the return value should be false since no user is returned
        assert result is False


