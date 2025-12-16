from datetime import datetime
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from database import db
from models.user import User
import bcrypt


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
                self.pending_email = email  #so that the user isn't created without verification
                # self.pending_password = password  #so that the user isn't created without verification
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                self.pending_password = hashed_password.decode('utf-8')
                return True
            return False

    def verify_and_create_user(self, otp):
        if self.check_otp(otp):
            display_name = None
            profile_picture_url = None
            reputation = 0
            registration_date = datetime.now()
            username = self.pending_email.split('@')[0]   #generate username from email for now
            university = "Dalhousie University"

            new_user = User(
                username=username,
                email=self.pending_email,
                password=self.pending_password,
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

    def validate_email(self, email):
        if "@dal.ca" in email:
            return True
        return False

    def send_otp(self, email):
        sender = "daloverflow@gmail.com"
        app_password = "oaif xgfq wowp tqyx"
        receiver = email
        #generate an OTP to send
        self.instance_otp = self.generate_otp()

        msg = MIMEMultipart("alternative")
        msg["From"] = sender
        msg["To"] = receiver
        msg["Subject"] = "Email verification for DalOverflow Registration"

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #fffacd 0%, #ffd700 100%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: #333; margin: 0; font-size: 28px;">DalOverflow</h1>
                        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Welcome to our community!</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Verify Your Email</h2>
                        <p style="color: #666; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                            Thank you for registering with DalOverflow! To complete your account setup, please use the verification code below:
                        </p>
                        
                        <!-- OTP Box -->
                        <div style="background-color: #f9f9f9; border: 2px solid #ffd700; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                            <p style="color: #999; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                            <p style="color: #ffd700; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 3px; font-family: 'Courier New', monospace;">{str(self.instance_otp)}</p>
                        </div>
                        
                        <p style="color: #666; margin: 20px 0; font-size: 14px;">
                            This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; margin: 0; font-size: 12px;">
                            If you have any questions, please contact our support team.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #999; margin: 0; font-size: 12px;">
                            &copy; 2024 DalOverflow. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, app_password)
            server.send_message(msg)
            
    def reset_otp(self, email):
        sender = "daloverflow@gmail.com"
        app_password = "oaif xgfq wowp tqyx"
        receiver = email
        #generate an OTP to send
        self.instance_otp = self.generate_otp()

        msg = MIMEMultipart("alternative")
        msg["From"] = sender
        msg["To"] = receiver
        msg["Subject"] = "Password Reset - DalOverflow"

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #fffacd 0%, #ffd700 100%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: #333; margin: 0; font-size: 28px;">DalOverflow</h1>
                        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Password Reset Request</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Reset Your Password</h2>
                        <p style="color: #666; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                            We received a request to reset your password. Use the code below to proceed:
                        </p>
                        
                        <!-- OTP Box -->
                        <div style="background-color: #f9f9f9; border: 2px solid #ffd700; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                            <p style="color: #999; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your Reset Code</p>
                            <p style="color: #ffd700; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 3px; font-family: 'Courier New', monospace;">{str(self.instance_otp)}</p>
                        </div>
                        
                        <p style="color: #666; margin: 20px 0; font-size: 14px;">
                            This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email and your account will remain secure.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; margin: 0; font-size: 12px;">
                            For security reasons, never share this code with anyone.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #999; margin: 0; font-size: 12px;">
                            &copy; 2024 DalOverflow. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, app_password)
            server.send_message(msg)
            
    def reset_password(self, email, otp, new_password):
        if not self.check_otp(otp):
            return False
        
        user = User.query.filter_by(email=email).first()
        if user:
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            user.password = hashed_password.decode('utf-8')
            db.session.commit()
            return True
        return False
        

    def generate_otp(self):
        return random.randint(100000, 999999)

    def check_otp(self, user_otp):
        return str(self.instance_otp) == user_otp
    
    
