import json
import os
from typing import Optional

DB_FILE = "./users_db.json"

def load_db() -> dict:
    if not os.path.exists(DB_FILE):
        return {"users": {}}
    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_db(db: dict):
    with open(DB_FILE, "w") as f:
        json.dump(db, f, indent=2)

def get_user(username: str) -> Optional[dict]:
    db = load_db()
    return db["users"].get(username)

def create_user(username: str, hashed_password: str) -> bool:
    db = load_db()
    if username in db["users"]:
        return False
    db["users"][username] = {
        "username": username,
        "password": hashed_password,
        "docs": []
    }
    save_db(db)
    return True

def add_doc_to_user(username: str, doc_id: str, filename: str):
    db = load_db()
    if username in db["users"]:
        db["users"][username]["docs"].append({
            "doc_id": doc_id,
            "filename": filename
        })
        save_db(db)

def get_user_docs(username: str) -> list:
    db = load_db()
    user = db["users"].get(username)
    return user["docs"] if user else []