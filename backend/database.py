import json
from typing import List, Dict, Optional

from .schemas import UserInDB

DATABASE_FILE = "./users.json"

def _read_users_from_file() -> List[Dict]:
    try:
        with open(DATABASE_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def _write_users_to_file(users: List[Dict]):
    with open(DATABASE_FILE, "w") as f:
        json.dump(users, f, indent=4)

def get_user(username: str) -> Optional[UserInDB]:
    users_data = _read_users_from_file()
    for user_data in users_data:
        if user_data["username"] == username:
            return UserInDB(**user_data)
    return None

def create_user(user: UserInDB) -> UserInDB:
    users_data = _read_users_from_file()
    users_data.append(user.dict())
    _write_users_to_file(users_data)
    return user

def update_user(username: str, updated_user: Dict) -> Optional[UserInDB]:
    users_data = _read_users_from_file()
    for i, user_data in enumerate(users_data):
        if user_data["username"] == username:
            users_data[i].update(updated_user)
            _write_users_to_file(users_data)
            return UserInDB(**users_data[i])
    return None
