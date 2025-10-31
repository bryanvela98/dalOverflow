import unittest
from unittest.mock import MagicMock
from models.user import User

#I need a class UserRegistration that handles all these functionalities
from services.user_registration import UserRegistrationService

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

    def test_create_user_exists(self):
        registration = UserRegistrationService()
        #mock user_exists to return true, i.e. user already exists
        registration.user_exists = MagicMock(return_value=True)

        result = registration.create_user("test@dal.ca", "testpass")

        #should return false because user should not be created if already exists
        assert result is False

    def test_create_user_not_exists(self):
        registration = UserRegistrationService()
        registration.user_exists = MagicMock(return_value=False)

        result = registration.create_user("test@dal.ca", "testpass")

        #should return true as user should be created
        assert result is True

    def test_validate_email_contains(self):
        registration = UserRegistrationService()
        result = registration.validate_email("test@dal.ca")
        assert result is True

    def test_validate_email_not_contains(self):
        registration = UserRegistrationService()
        result = registration.validate_email("test@gmail.com")
        #this test should return false since dal.ca is not present in the email id
        assert result is False

    def test_verify_and_create_user_correct_otp(self):
        registration = UserRegistrationService()
        #user entered correct otp
        registration.check_otp = MagicMock(return_value=True)

        result = registration.verify_and_create_user("123456")
        #since user entered correct otp, this should return true
        assert result is True

    def test_verify_and_create_user_incorrect_otp(self):
        registration = UserRegistrationService()
        #user entered incorrect otp
        registration.check_otp = MagicMock(return_value=False)

        result = registration.verify_and_create_user("123456")
        #since user entered incorrect otp, this should return false
        assert result is False


