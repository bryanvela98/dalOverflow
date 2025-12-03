import unittest
from unittest.mock import MagicMock, patch
from models.user import User
from services.user_login import UserLoginServices

class TestUserLogin(unittest.TestCase):
    def setUp(self):
        self.mock_db = MagicMock()

    @patch('services.user_login.bcrypt.checkpw')
    def test_verify_credentials_success(self, mock_checkpw):
        mock_user = MagicMock()
        mock_user.email = "test@dal.ca"
        mock_user.password = "$2b$12$hashedpassword123456789"  # Mock bcrypt hash
        
        # Mock bcrypt.checkpw to return True for correct password
        mock_checkpw.return_value = True

        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by.return_value.first = MagicMock(return_value=mock_user)

        login = UserLoginServices()
        result = login.verify_credentials("test@dal.ca", "testpassword")

        assert result is True
        mock_checkpw.assert_called_once()

    @patch('services.user_login.bcrypt.checkpw')
    def test_verify_credentials_wrong_password(self, mock_checkpw):
        mock_user = MagicMock()
        mock_user.email = "test@dal.ca"
        mock_user.password = "$2b$12$hashedpassword123456789"  # Mock bcrypt hash
        
        # Mock bcrypt.checkpw to return False for wrong password
        mock_checkpw.return_value = False

        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by.return_value.first = MagicMock(return_value=mock_user)

        login = UserLoginServices()
        result = login.verify_credentials("test@dal.ca", "wrongpassword")

        assert result is False
        mock_checkpw.assert_called_once()

    def test_verify_credentials_user_not_exists(self):
        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by.return_value.first = MagicMock(return_value=None)

        login = UserLoginServices()
        result = login.verify_credentials("nonexistent@dal.ca",
                                          "anypassword")

        assert result is False