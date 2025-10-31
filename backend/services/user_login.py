from models.user import User
from database import db

class UserLoginServices:
    def __init__(self):
        self.current_user = None

    def verify_credentials(self, email, password):
        # Check if user exists with the given email
        user = User.query.filter_by(email=email).first()

        if user:
            # Verify the password matches
            if user.password == password:  #need to hash password
                self.current_user = user
                return True
        return False