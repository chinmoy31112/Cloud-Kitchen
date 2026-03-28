import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cookgpt.settings')
django.setup()

from application.services import AuthService
from infrastructure.models import CustomUser

def create_rider_user():
    auth_service = AuthService()
    email = "rider@cookgpt.com"
    
    # Check if user exists first
    if not CustomUser.objects.filter(email=email).exists():
        try:
            user = auth_service.register({
                "email": email, 
                "password": "password123", 
                "first_name": "Speedy", 
                "last_name": "Rider", 
                "username": "speedyrider", 
                "phone_number": "5556667777"
            })
            print("Successfully created mock rider account.")
        except Exception as e:
            print("Failed to register:", e)
    else:
        print("Mock rider account already exists.")

    # Elevate role
    usr = CustomUser.objects.get(email=email)
    usr.role = "delivery_agent"
    
    # Reset password proactively just in case the history is bloated
    usr.set_password("password123")
    usr.save()
    print(f"User {usr.email} is active and has been promoted to: {usr.role}")

if __name__ == '__main__':
    create_rider_user()
