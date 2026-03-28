import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cookgpt.settings')
django.setup()

from application.services import AuthService
from infrastructure.models import CustomUser

def create_admin_user():
    auth_service = AuthService()
    email = "admin@cookgpt.com"
    
    # Check if user exists first
    if not CustomUser.objects.filter(email=email).exists():
        try:
            user = auth_service.register({
                "email": email, 
                "password": "password123", 
                "first_name": "Chef", 
                "last_name": "Gordon", 
                "username": "adminchef", 
                "phone_number": "1234567890"
            })
            print("Successfully created mock account.")
        except Exception as e:
            print("Failed to register:", e)
    else:
        print("Mock account already exists.")

    # Elevate role
    usr = CustomUser.objects.get(email=email)
    usr.role = "kitchen_admin"
    usr.save()
    print(f"User {usr.email} has been promoted to: {usr.role}")

if __name__ == '__main__':
    create_admin_user()
