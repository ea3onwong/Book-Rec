from flask import Blueprint, request, current_app
from flask import jsonify
import bcrypt
import pymongo
from bson.objectid import ObjectId
import re
from user_auth import token_val
from datetime import datetime, date
import bson

BOOK = Blueprint("book", __name__)

"""
Params: token, bookid
Return: json of book data
Return information about the book with book_id
"""


@BOOK.route("/book/get_data", methods=["GET"])
def book_get_data():
    book_id = request.args.get("bookid")

    # Access book db
    books = current_app.config["DATABASE"]["books"]

    # Find book
    book = books.find_one({"book_id": book_id})
    if book is None:
        return jsonify({"message": "No such book"}), 400

    # Prepare response
    del book["_id"]

    # Send response
    return jsonify(book), 200


"""
Params: token, book_id 
Return: success message or error message
"""


@BOOK.route("/book/read_book", methods=["POST"])
def read_book():
    # ===== Start of marking book as read ========
    token = request.get_json().get("token")
    book_id = request.get_json().get("book_id")
    date_read = datetime.today().strftime("%Y-%m-%d")
    users = current_app.config["DATABASE"]["users"]

    token_data = token_val(token)

    if token_data is None:
        return jsonify({"message": "invalid token"}), 400

    user_id = str(token_data["_id"])

    books_read = current_app.config["DATABASE"]["books_read"]

    query = {"book_id": book_id, "user_id": user_id}

    res = books_read.find_one(query)

    if res:
        books_read.update_one(query, {"$set": {"date_read": date_read}})
    else:
        books_read.insert_one(
            {"book_id": book_id, "user_id": user_id, "date_read": date_read}
        )

        user = users.find_one({"_id": ObjectId(token_data["_id"])})

        if user is None:
            return jsonify({"message": "No such user"}), 400

        if "reading_goal" in user and user["reading_goal"] != {}:
            reading_goal = user["reading_goal"]
            start_date = datetime.strptime(
                reading_goal["start_date"], "%Y-%m-%d"
            ).date()
            end_date = datetime.strptime(reading_goal["end_date"], "%Y-%m-%d").date()

            if start_date <= date.today() <= end_date:
                reading_goal["books_read"] += 1

            if (
                not reading_goal["goal_met"]
                and reading_goal["books_read"] >= reading_goal["num_books"]
            ):
                reading_goal["goal_met"] = True
                reading_goal["achieve_date"] = date_read

            users.update_one(
                {"_id": ObjectId(user_id)}, {"$set": {"reading_goal": reading_goal}}
            )

    # ====== End of marking book as read ========

    # ====== Start of adding book to main collection =========

    # Get user info
    user = users.find_one({"_id": ObjectId(token_data["_id"])})
    if user is None:
        return jsonify({"message": "No such user"}), 400

    # Query book db for book info
    books = current_app.config["DATABASE"]["books"]
    book = books.find_one({"book_id": book_id})
    if book is None:
        return jsonify({"message": "No such book"}), 400

    # Check that book is not in the collection already
    if any(dict(bk)["book_id"] == book_id for bk in user["main_collection"]):
        return jsonify({"message": "Book already in collection"}), 400

    # Prepare response
    resp = {}
    resp["book_id"] = book_id
    resp["title"] = book["title"]
    resp["authors"] = book["authors"]
    resp["publication_date"] = book["publication_date"]
    resp["image_link"] = book["image_link"]

    # Get current date in the format Day(suffix) Month, Year, e.g: 13th May, 2023
    cur_date = date.today()

    resp["date_added"] = cur_date.strftime("%Y-%m-%d")
    resp["publisher"] = book["publisher"]

    # Add book to main collection
    user["main_collection"].insert(0, resp)
    if len(user["main_collection"]) > 10:
        user["main_collection"].pop()

    # Update database
    try:
        users.update_one(
            {"_id": ObjectId(token_data["_id"])},
            {"$set": {"main_collection": user["main_collection"]}},
        )
    except:
        return jsonify({"message": "Error: could not update database"}), 500

    # ====== End of adding book to main collection =========

    return jsonify(success=True), 200


"""
Params: book_id
Return: number of readers or error message
"""


@BOOK.route("/book/get_num_readers", methods=["GET"])
def get_num_readers():
    book_id = request.args.get("book_id")
    books = current_app.config["DATABASE"]["books"]
    book = books.find_one({"book_id": book_id})
    if not book:
        return jsonify({"message": "invalid book id"}), 400

    books_read = current_app.config["DATABASE"]["books_read"]
    num_readers = books_read.count_documents({"book_id": book_id})
    return jsonify(num_readers), 200


"""
Params: user_id
Return: number of books read or erorr message
"""


@BOOK.route("/book/get_num_books_read", methods=["GET"])
def get_num_books_read():
    user_id = request.args.get("user_id")
    try:
        user_id = bson.ObjectId(user_id)
    except bson.errors.InvalidId:
        return jsonify({"message": "invalid user id"}), 400

    users = current_app.config["DATABASE"]["users"]
    user = users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"message": "invalid user id"}), 400

    books_read = current_app.config["DATABASE"]["books_read"]
    num_books_read = books_read.count_documents(
        {"user_id": str(user_id)}
    )  # user_id in books_read is string type
    return jsonify(num_books_read), 200


"""
Return: all free books info
"""


@BOOK.route("/book/get_free_books", methods=["GET"])
def get_free_books():
    books = current_app.config["DATABASE"]["books"]

    free_books = list(books.find({"is_free": True}))

    for book in free_books:
        book["_id"] = str(book["_id"])

    return jsonify(free_books), 200
