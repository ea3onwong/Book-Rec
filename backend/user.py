from flask import Blueprint, request, current_app
from flask import jsonify
import bcrypt
import pymongo
from bson.objectid import ObjectId
import re
from user_auth import token_val, get_token_id
from datetime import datetime, date, timedelta
from validate_email import validate_email
from auth import validate_password, validate_username


USER = Blueprint("user", __name__)

"""
Params: token
Maybe Params: email_address, username, firstname, lastname, current_password + new_password, bio
Return: boolean (indicating success or error)
"""


@USER.route("/user/edit", methods=["POST"])
def user_edit():
    # extract parameters
    token = request.get_json()["token"]

    # TODO: remove
    # print(type(token))

    data = token_val(token)
    if data is None:
        return jsonify({"message": "Invalid token"}), 403

    email_address = request.get_json().get("email_address")
    username = request.get_json().get("username")
    firstname = request.get_json().get("firstname")
    lastname = request.get_json().get("lastname")
    current_password = request.get_json().get("current_password")
    new_password = request.get_json().get("new_password")
    bio = request.get_json().get("bio")

    user_id = data["_id"]
    users_db = current_app.config["DATABASE"]["users"]

    # update relevant fields in the user's entry in the databasedata["_id"]
    update_dict = {}
    if email_address is not None:
        # check if email address is correct using regex
        if not validate_email(email_address): 
            return jsonify({"message": "invalid email address."}), 400

        # check if email address is unique
        # TODO: TEST
        if users_db.count_documents({"email_address": email_address}, limit=1):
            return jsonify({"message": "email address is not unique"}), 400

        update_dict["email_address"] = email_address

    if username is not None:
        # check if username is correct using regex

        if not re.search("^[a-zA-Z0-9 '-]+$", username):
            return (
                jsonify(
                    {"message": "Invalid username. Use only letters and/or numbers"}
                ),
                400,
            )


        # check if username is unique
        # TODO: TEST
        if users_db.count_documents({"username": username}, limit=1):
            return jsonify({"message": "username is not unique"}), 400

        update_dict["username"] = username

    if firstname is not None:
        # check if firstname is correct using regex
        if not re.search("^[a-zA-Z0-9 '-]+$", firstname):
            return (
                jsonify(
                    {"message": "invalid firstname. Use only letters and/or numbers"}
                ),
                400,
            )
        update_dict["first_name"] = firstname

    if lastname is not None:
        # check if lastname is correct using regex
        if not re.search("^[a-zA-Z0-9 '-]+$", lastname):
            return (
                jsonify(
                    {"message": "invalid lastname. Use only letters and/or numbers"}
                ),
                400,
            )
        update_dict["last_name"] = lastname

    if bio is not None:
        update_dict["bio"] = bio

    if current_password is not None or new_password is not None:
        if new_password is None or current_password is None:
            return jsonify({"message": "must enter new_password"}), 400

        # Check to see if password is correct
        user_stuff = users_db.find_one({"_id": ObjectId(user_id)})
        
        # Checks to see if new password is in the right format
        if not validate_password(new_password): 
            return jsonify({'message': 'Invalid password format'}), 400
            
        salt = user_stuff["salt"]
        hashed = bcrypt.hashpw(current_password.encode("utf-8"), salt)

        if hashed != user_stuff["password"]:
            return jsonify({"message": "Incorrect password"}), 400

        # Hash and update new password
        update_dict["password"] = bcrypt.hashpw(new_password.encode("utf-8"), salt)

    users_db.update_one({"_id": ObjectId(user_id)}, {"$set": update_dict})
    # Generate new token. Not the best way since this involves another db query but should work
    new_token = get_token_id(ObjectId(user_id))
    return jsonify({"token": new_token}), 200


"""
Params: token, userid
Return: json of user data
Returns information about the user with user_id in order to populate their profile page
"""


@USER.route("/user/profile", methods=["GET"])
def user_get_data():
    user_id = request.args.get("userid")
    token = request.args.get("token")

    # Check if the token is valid
    data = token_val(token)
    if data is None:
        return jsonify({"message": "Invalid token"}), 400

    # Query database for user
    db = current_app.config["DATABASE"]["users"]
    try:
        user = db.find_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"message": "Improper user id"}), 400
    if user is None:
        return jsonify({"message": "No such user"}), 400

    # Prepare response with user info
    del user["password"]
    del user["salt"]
    del user["_id"]
    del user["email_address"]

    return jsonify(user), 200


"""
Params: token, num_books, timeframe
Return: reading_goal or error message 
"""


@USER.route("/user/set_read_goal", methods=["POST"])
def user_set_read_goal():
    token = request.get_json().get("token")
    num_books = request.get_json().get("num_books")
    timeframe = request.get_json().get(
        "timeframe"
    )  # timeframe = 'week', 'month' or 'year'
    timeframe = timeframe.lower()

    token_data = token_val(token)
    if not token_data:
        return jsonify({"message": "Invalid token"}), 400

    users = current_app.config["DATABASE"]["users"]
    user_id = ObjectId(token_data["_id"])
    user = users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"message": "Invalid token, user not found"}), 400

    today = date.today()
    if timeframe == "week":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
    elif timeframe == "month":
        start_date = date(today.year, today.month, 1)
        end_date = date(today.year, today.month + 1, 1) - timedelta(days=1)
    elif timeframe == "year":
        start_date = date(today.year, 1, 1)
        end_date = date(today.year, 12, 31)
    else:
        return jsonify({"message": "Invalid timeframe provided"}), 400

    reading_goal = {
        "timeframe": timeframe,
        "num_books": num_books,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "books_read": 0,
        "goal_met": False,
        "achieve_date": None,
    }
    users.update_one(
        {"_id": ObjectId(user_id)}, {"$set": {"reading_goal": reading_goal}}
    )

    return jsonify(reading_goal), 200


"""
Params: token
Return: reading goal progress or error message 
"""


@USER.route("/user/get_read_goal_progress", methods=["GET"])
def user_get_read_goal_progress():
    token = request.args.get("token")
    token_data = token_val(token)

    if not token_data:
        return jsonify({"message": "Invalid token"}), 400

    users = current_app.config["DATABASE"]["users"]
    user_id = ObjectId(token_data["_id"])
    user = users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"message": "Invalid token, user not found"}), 400

    if not "reading_goal" in user or user["reading_goal"] == {}:
        return jsonify({"message": "No reading goal found for the user"}), 400

    reading_goal = user["reading_goal"]
    num_books = reading_goal["num_books"]
    books_read = reading_goal["books_read"]

    # return the progress (e.g. 2 / 3)
    return jsonify(str(books_read) + " / " + str(num_books)), 200


"""
Params: token
Return: achieve date (either null or date) or error message 
"""


@USER.route("/user/get_read_goal_achieve_date", methods=["GET"])
def user_get_read_goal_achieve_date():
    token = request.args.get("token")
    token_data = token_val(token)

    if not token_data:
        return jsonify({"message": "Invalid token"}), 400

    users = current_app.config["DATABASE"]["users"]
    user_id = ObjectId(token_data["_id"])
    user = users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"message": "Invalid token, user not found"}), 400

    if not "reading_goal" in user or user["reading_goal"] == {}:
        return jsonify({"message": "No reading goal found for the user"}), 400

    reading_goal = user["reading_goal"]
    achieve_date = reading_goal["achieve_date"]

    return jsonify(achieve_date), 200
