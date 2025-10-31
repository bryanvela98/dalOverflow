import datetime
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from models.user import User

from database import db


class UserRegistrationService:
    def __init__(self):
        #instance otp used in send_otp needs to be initialized
        self.instance_otp = None

    def user_exists(self, email):
        user = User.query.filter_by(email=email).first()
        print(user)
        return user is not None

    def create_user(self, email, password):
        if (self.user_exists(email)):
            return False
        else:
            #add verification of dal id functionality here
            if(self.validate_email(email)):
                #send otp to the email for verification
                self.send_otp(email)
          
                return True
            return False

    def validate_email(self, email):
        if "dal.ca" in email:
            return True
        return False

    def verify_and_create_user(self, otp):
        if self.check_otp(otp):
            display_name = None
            profile_picture_url = None
            reputation = 0
            registration_date = datetime.now()
            username = self.pending_email.split('@')[0]
            university = "Dalhousie University"

            new_user = User(
                username=username,
                email=self.pending_email,    #so that the user isn't created without verification
                password=self.pending_password,    #so that the user isn't created without verification
                display_name=display_name,
                profile_picture_url=profile_picture_url,
                reputation=reputation,
                registration_date=registration_date,
                university=university
            )
            db.session.add(new_user)
            db.session.commit()
            return True
        return False

    def send_otp(self, email):
        sender = "daloverflow@gmail.com"
        app_password = "oaif xgfq wowp tqyx"
        receiver = email
        #generate an OTP to send
        self.instance_otp = self.generate_otp()

        msg = MIMEMultipart()
        msg["From"] = sender
        msg["To"] = receiver
        msg["Subject"] = "Email verification for DalOverflow Registration"

        body = f"Your OTP is {str(self.instance_otp)}"
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, app_password)
            server.send_message(msg)

    def generate_otp(self):
        return random.randint(100000, 999999)

    def check_otp(self, user_otp):
        return self.instance_otp == user_otp
