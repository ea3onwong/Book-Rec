import uuid
import bcrypt
import os
import pymongo
import re
from flask import Blueprint, current_app, jsonify, request
from flask_mail import Mail, Message
from user_auth import token_gen, token_val, get_token_id
from bson.objectid import ObjectId
from validate_email import validate_email


AUTH = Blueprint("auth", __name__)

"""
Params: email_address, username, first_name, last_name, password
Return: token or error message
"""


@AUTH.route("/auth/register", methods=["POST"])
def auth_register():
    email_address = request.get_json().get("email_address")
    username = request.get_json().get("username")
    first_name = request.get_json().get("first_name")
    last_name = request.get_json().get("last_name")
    password = request.get_json().get("password")

    users = current_app.config["DATABASE"]["users"]

    if (
        len(email_address) < 1
        or len(username) < 1
        or len(first_name) < 1
        or len(last_name) < 1
        or len(password) < 1
    ):
        return (
            jsonify(
                {
                    "message": "Please ensure all required fields are filled in with at least 1 alphanumeric character"
                }
            ),
            400,
        )

    if not validate_username(username):
        return (
            jsonify(
                {
                    "message": "Username can only contain alphanumeric characters and underscores"
                }
            ),
            400,
        )

    if not validate_email(email_address):
        return jsonify({"message": "Invalid email address format"}), 400

    if not validate_password(password):
        return jsonify({"message": "Invalid password format"}), 400

    if users.find_one({"username": username}):
        return jsonify({"message": "Username already taken"}), 400

    if users.find_one({"email_address": email_address}):
        return jsonify({"message": "Email address already taken"}), 400

    # hash the password using bcrypt
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)

    user = {
        "email_address": email_address,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "password": hashed,
        "salt": salt,
        "main_collection": [],
        "collection_list": [],
        "recently_added": [],
        "bio": "",
        "moderator": False,
        "reading_goal": {},
    }

    new_user = users.insert_one(user)
    user_id = new_user.inserted_id
    token = get_token_id(user_id)

    return token


"""
Params: username
Return: boolean
"""


def validate_username(username):
    pattern = r"^[a-zA-Z0-9_]+$"

    if not re.match(pattern, username):
        return False

    return True


"""
Params: password
Return: boolean (indicating either valid or invalid)
"""


def validate_password(password):
    if len(password) < 8:
        return False

    if not re.search("[0-9]", password):
        return False

    if not re.search("[A-Z]", password):
        return False

    if not re.search("[a-z]", password):
        return False

    if not re.search("[^A-Za-z0-9]", password):
        return False

    return True


"""
Params: email_address or username, password
Return: token or error message
"""


@AUTH.route("/auth/login", methods=["POST"])
def auth_login():
    username = request.get_json().get("username")
    email_address = request.get_json().get("email_address")
    password = request.get_json().get("password")

    users = current_app.config["DATABASE"]["users"]

    # try to use username to login
    user = users.find_one({"username": username})

    # if it fails, then we try to use email to login
    if not user:
        user = users.find_one({"email_address": email_address})

    # if it still fails, then we return an error message
    if not user:
        return jsonify({"message": "User not registered"}), 400

    salt = user["salt"]
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)

    if hashed != user["password"]:
        return jsonify({"message": "Incorrect password"}), 400

    token = get_token_id(user["_id"])

    return token


"""
Params: token
Return: boolean (indicating success or error)
"""


@AUTH.route("/auth/logout", methods=["POST"])
def auth_logout():
    token = request.get_json().get("token")

    if token_val(token) == None:
        return False

    return True


"""
Params: email_address or username
Return: boolean (indicating success or error)
"""


@AUTH.route("/auth/recover", methods=["POST"])
def auth_recover():
    user_email = request.get_json()["email"]

    # Check if user_email is in the database
    db = current_app.config["DATABASE"]
    print(user_email)

    data = db["users"].find_one({"email_address": user_email})
    if data == None:
        return jsonify({"message": "Invalid user"}), 400

    # If they are then generate a token a
    token = token_gen(
        data["_id"],
        data["username"],
        data["first_name"],
        data["last_name"],
        data["email_address"],
        data["moderator"],
    )

    app_name = "127.0.0.1:3000"
    recover_url = "http://" + app_name + "/reset?token=" + token

    mail = Mail(current_app)
    msg = Message(
        "Recover password",
        sender=current_app.config["MAIL_USERNAME"],
        recipients=[user_email],
    )
    msg.html = f"<b> Hello {data['first_name']}\n</b> Please click on the following link in order to reset your password: <a href={recover_url}>{recover_url}</a>"

    try:
        mail.send(msg)
    except:
        return jsonify({"message": "Could not send mail"}), 500

    return jsonify({"message": "Mail sent"}), 200


@AUTH.route("/auth/reset", methods=["POST"])
def auth_forget_password():
    r = request.get_json()
    token = r["token"]
    pwd = r["password"]

    users_db = current_app.config["DATABASE"]["users"]

    user = users_db.find_one({"username": "edelgard"})

    data = token_val(token)

    if data == None:
        return jsonify({"message": "Invalid token"}), 400

    if not validate_password(pwd):
        return jsonify({"message": "Invalid password format"}), 400

    # Find user corresponding to the tokens
    # users = db['users']
    users = current_app.config["DATABASE"]["users"]

    user = users.find_one({"username": data["username"]})

    if user == None:
        return jsonify({"message": "Invalid token"}), 403

    # Reset the users password
    salt = user["salt"]
    hashed = bcrypt.hashpw(pwd.encode("utf-8"), salt)

    query = {"_id": ObjectId(data["_id"])}
    update = {"$set": {"password": hashed}}

    users.update_one(query, update)

    # Send confirmation message

    return jsonify({"message": "Password reset"}), 200
