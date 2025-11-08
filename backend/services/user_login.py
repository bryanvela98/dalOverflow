from models.user import User
from database import db
import bcrypt
class UserLoginServices:
    def __init__(self):
        self.current_user = None

    def verify_credentials(self, email, password):
        # Check if user exists with the given email
        user = User.query.filter_by(email=email).first()

        if user:
            # Verify the password matches
            # if user.password == password:  #need to hash password #hashed
            if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                self.current_user = user
                return True
        return False

    def get_user_info(self):
        #if user exists
        if self.current_user:
            return {
                'user_id': self.current_user.id,
                'username': self.current_user.username,
                'email': self.current_user.email,
                'display_name': self.current_user.display_name,
                'reputation': self.current_user.reputation,
                'university': self.current_user.university
            }
        return None