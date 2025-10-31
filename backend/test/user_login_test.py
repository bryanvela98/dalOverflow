import unittest
from unittest.mock import MagicMock
from models.user import User
from services.user_login import UserLoginServices

class TestUserLogin(unittest.TestCase):
    def setUp(self):
        self.mock_db = MagicMock()

    def test_verify_credentials_success(self):
        mock_user = MagicMock()
        mock_user.email = "test@dal.ca"
        mock_user.password = "testpassword"

        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by_email = MagicMock(return_value=mock_user)

        login = UserLoginServices()
        result = login.verify_credentials("test@dal.ca", "testpassword")

        assert result is True

    def test_verify_credentials_wrong_password(self):
        mock_user = MagicMock()
        mock_user.email = "test@dal.ca"
        mock_user.password = "wrongpassword"

        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by_email = MagicMock(return_value=mock_user)

        login = UserLoginServices()
        result = login.verify_credentials("test@dal.ca", "testpassword")

        assert result is False