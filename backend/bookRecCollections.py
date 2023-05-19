from flask import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import pymongo
import os
import user_auth
import datetime

COLLECTIONS = Blueprint("collections", __name__)

"""
Params: token, name
Maybe Params: description
Return: True boolean on success
Errors:
    - 401: invalid token
    - 402: invalid parameter: name
    - 403: collection name is already in use
"""


@COLLECTIONS.route("/collections/create", methods=["POST"])
def collections_create():
    # extracting parameters
    token = request.get_json().get("token")
    name = request.get_json().get("name")
    description = request.get_json().get("description")
    if description is None:
        description = ""

    # validate token
    token_data = user_auth.token_val(token)
    if token_data is None:
        return jsonify({"message": "invalid token", "token": token}), 401

    # error checking
    if name == None or name == "":
        return jsonify({"message": "invalid parameter: name"}), 402

    # adding new collection to the user's entry in the database
    user_id = token_data["_id"]
    new_collection = {"name": name, "book_list": [], "description": description}

    # checking if collection name is unique
    users = current_app.config["DATABASE"]["users"]
    user_entry = users.find_one({"_id": ObjectId(user_id)})
    if any(u.get("name") == name for u in user_entry.get("collection_list")):
        return jsonify({"message": "collection name is already in use"}), 403

    users.update_one(
        {"_id": ObjectId(user_id)}, {"$push": {"collection_list": new_collection}}
    )
    return jsonify(True), 200


"""
Params: token, userid
Return: int
Errors:
    - 401: invalid token
    - 402: userid is not in the database
"""


@COLLECTIONS.route("/collections/num_collections", methods=["GET"])
def collections_num_collections():
    # extracting parameters
    token = request.args.get("token")
    user_id = request.args.get("userid")

    # validate token
    token_data = user_auth.token_val(token)
    if token_data is None:
        return jsonify({"message": "invalid token", "token": token}), 401

    # error checking
    users = current_app.config["DATABASE"]["users"]
    if not users.count_documents({"_id": ObjectId(user_id)}, limit=1):
        return jsonify({"message": "userid not present in database"}), 402

    # getting number of collections for userid
    user = users.find_one({"_id": ObjectId(user_id)})
    return jsonify(len(user["collection_list"]) + 1), 200


"""
Params: token, userid
Return: json of collection data (does not include main)
Errors:
    - 401: invalid token
    - 402: userid is not in the database
"""


@COLLECTIONS.route("/collections/get_collections", methods=["GET"])
def collections_get_collections():
    # extracting parameters
    token = request.args.get("token")
    user_id = request.args.get("userid")

    # validate token
    token_data = user_auth.token_val(token)
    if token_data is None:
        return jsonify({"message": "invalid token", "token": token}), 401

    # error checking
    users = current_app.config["DATABASE"]["users"]
    if not users.count_documents({"_id": ObjectId(user_id)}, limit=1):
        return jsonify({"message": "userid not present in database"}), 402

    # getting collections for userid
    user_db = users.find_one({"_id": ObjectId(user_id)})
    return jsonify(user_db["collection_list"]), 200


"""
Params: token, userid
Return: list of main collection (last 10 books)
Errors:
    - 401: invalid token
    - 402: userid is not in the database
"""


@COLLECTIONS.route("/collections/get_main", methods=["GET"])
def collections_get_main():
    # extracting parameters
    token = request.args.get("token")
    user_id = request.args.get("userid")

    # validate token
    token_data = user_auth.token_val(token)
    if token_data is None:
        return jsonify({"message": "invalid token", "token": token}), 401

    # error checking
    users = current_app.config["DATABASE"]["users"]
    if not users.count_documents({"_id": ObjectId(user_id)}, limit=1):
        return jsonify({"message": "userid not present in database"}), 402

    # getting collections for userid
    user = users.find_one({"_id": ObjectId(user_id)})
    return jsonify(user["main_collection"]), 200


"""
Params: token, collection_id, book_id
Return: 200 upon successfully adding a book to the collection, 400 otherwise

Assumes that a valid book is such that an entry for it has been created in the books database
"""


@COLLECTIONS.route("/collections/add_book", methods=["POST"])
def collections_add_book():
    book_id = request.get_json().get("bookid")
    token = request.get_json().get("token")
    collection_id = request.get_json().get("collection")

    # Validate token
    data = user_auth.token_val(token)
    if data is None:
        return jsonify({"message": "Invalid token"}), 400

    # Find user in database
    users = current_app.config["DATABASE"]["users"]
    user = users.find_one({"_id": ObjectId(data["_id"])})
    if user is None:
        return jsonify({"message": "No such user"}), 400

    # Find collection to add book to
    collection = next(
        coll for coll in user["collection_list"] if coll["name"] == collection_id
    )
    if collection is None:
        return jsonify({"message": "No such collection"}), 400

    # Check that book is not in the collection already
    if any(dict(book)["book_id"] == book_id for book in collection["book_list"]):
        return jsonify({"message": "Book already in collection"}), 400

    # Query book db for book info
    books = current_app.config["DATABASE"]["books"]
    book = books.find_one({"book_id": book_id})
    if book is None:
        return jsonify({"message": "No such book"}), 400

    # Prepare response
    resp = {}
    resp["book_id"] = book_id
    resp["title"] = book["title"]
    resp["authors"] = book["authors"]
    resp["publication_date"] = book["publication_date"]
    resp["image_link"] = book["image_link"]

    # Get current date in the format Day(suffix) Month, Year, e.g: 13th May, 2023
    date = datetime.date.today()

    resp["date_added"] = date.strftime("%Y-%m-%d")
    resp["publisher"] = book["publisher"]

    # Add book to the collection
    collection["book_list"].append(resp)

    # Add book to top of list of recently added books and keep size at 10 (10 most recently added books)
    user["recently_added"].insert(0, resp)
    if len(user["recently_added"]) > 10:
        user["recently_added"].pop()

    # Update database
    try:
        users.update_one(
            {"_id": ObjectId(data["_id"])},
            {
                "$set": {
                    "collection_list": user["collection_list"],
                    "recently_added": user["recently_added"],
                }
            },
        )
    except:
        return jsonify({"message": "Error: could not update database"}), 500

    return jsonify({"message": "Book Added!"}), 200


"""
Params: token, collection_id, book_id
Return: 200 upon successfully adding a book to the collection, 400 otherwise

Assumes that a valid book is such that an entry for it has been created in the books database
"""


@COLLECTIONS.route("/collections/remove_book", methods=["POST"])
def collection_remove_book():
    book_id = request.get_json().get("bookid")
    token = request.get_json().get("token")
    collection_id = request.get_json().get("collection")

    # Validate token
    data = user_auth.token_val(token)
    if data is None:
        return jsonify({"message": "Invalid token"}), 400

    # Find user in database
    users = current_app.config["DATABASE"]["users"]
    user = users.find_one({"_id": ObjectId(data["_id"])})
    if user is None:
        return jsonify({"message": "No such user"}), 400

    # Find collection to remove book from
    collection = next(
        coll for coll in user["collection_list"] if coll["name"] == collection_id
    )
    if collection is None:
        return jsonify({"message": "No such collection"}), 400

    # Delete book from collection book_list
    collection["book_list"] = [
        book for book in collection["book_list"] if not (book["book_id"] == book_id)
    ]

    # Delete book from recently recently addes list
    user["recently_added"] = [
        book for book in user["recently_added"] if not (book["book_id"] == book_id)
    ]

    # Update database
    try:
        users.update_one(
            {"_id": ObjectId(data["_id"])},
            {
                "$set": {
                    "collection_list": user["collection_list"],
                    "recently_added": user["recently_added"],
                }
            },
        )
    except:
        return jsonify({"message": "Error: could not update database"}), 500

    return jsonify({"message": "Book Added!"}), 200
