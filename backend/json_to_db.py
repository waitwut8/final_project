from sqlmodel import Session
from database import engine
from models import UserTable, Role
from utils import hash_password
def read_json_file(file_path: str):
    import json
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data



def auto_import_json(file_path: str):
    data = read_json_file(file_path)
    for model in data:
        with Session(engine) as session:
            # Check if the model is a UserTable instance
            if isinstance(model, dict) and 'username' in model:
                model['first_name'] = model.pop('firstName', None)
                model['last_name'] = model.pop('lastName', None)
                model.pop('id', None)
                model['role'] = Role.USER
                model['active'] = model.get('active', True)
                model['password'] = hash_password(model.get('password', 'default_password'))
                user = UserTable(**model)

                session.add(user)
                session.commit()
                print(f"Added user: {user}")
            else:
                print("Unknown model type or missing username field. Skipping...")
    

# Just call this with any json and let it vibe
auto_import_json("carts.json")  # or posts.json or users.json — it’ll figure it out like a good intern
