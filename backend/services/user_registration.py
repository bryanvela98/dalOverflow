from models.user import User

class UserRegistrationService:
    def user_exists(self, email):
        user = User.query.filter_by(email=email).first()
        print(user)
        return user is not None

    def create_user(self, email, password):
        if (self.user_exists(email)):
            return False
        else:
            #we need to add verification of dal id functionality here
            return True