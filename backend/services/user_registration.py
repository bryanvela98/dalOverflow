from models.user import User

class UserRegistrationService:
    def user_exists(self, email):
        user = User.query.filter_by(email=email).first()
        print(user)
        return user is not None