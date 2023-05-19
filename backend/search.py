from flask import Blueprint, current_app, jsonify, request
from googleapiclient.discovery import build
import pymongo
import os

SEARCH = Blueprint("search", __name__)
API_KEY = os.getenv("API_KEY")


def search_books(query, db):
    res = []
    books_db = db

    try:
        query = query
        start_index = int(request.args.get("startIndex", 0))
        service = build("books", "v1", developerKey=API_KEY)
        book_request = service.volumes().list(
            q=query, startIndex=start_index, maxResults=40
        )
        book_response = book_request.execute()

        for book in book_response["items"]:
            book_id = str(book["id"])
            title = book["volumeInfo"].get("title", "No title available")
            authors = ", ".join(
                book["volumeInfo"].get("authors", ["No author available"])
            )
            summary = book["volumeInfo"].get("description", "No summary available")
            publisher = book["volumeInfo"].get("publisher", "No publisher available")
            publication_date = book["volumeInfo"].get(
                "publishedDate", "No publication date available"
            )
            categories = ", ".join(
                book["volumeInfo"].get("categories", ["No category available"])
            )
            average_rating = "No rating available"
            image_link = (
                book["volumeInfo"]
                .get("imageLinks", {})
                .get("thumbnail", "No image available")
            )
            industry_identifiers = book["volumeInfo"].get("industryIdentifiers", [])
            industry_identifiers = list(
                filter(
                    lambda x: x["type"] in ["ISBN_10", "ISBN_13"], industry_identifiers
                )
            )
            if len(industry_identifiers) == 0:
                isbn = "No ISBN"
            else:
                isbn = industry_identifiers[0].get("identifier", "No ISBN")

            sale_info = book.get("saleInfo", {})
            is_free = sale_info.get("saleability", "") == "FREE"

            book_info = {
                "book_id": book_id,
                "title": title,
                "authors": authors,
                "summary": summary,
                "publisher": publisher,
                "publication_date": publication_date,
                "categories": categories,
                "average_rating": average_rating,
                "image_link": image_link,
                "isbn": isbn,
                "is_free": is_free,
            }

            entry = books_db.find_one({"book_id": book_id})
            if entry == None:
                books_db.insert_one(book_info)
                entry = books_db.find_one({"book_id": book_id})
            entry["_id"] = str(entry["_id"])

            res.append(entry)

        return res, 200

    except Exception as err:
        return {f"message": {str(err)}}, 400


"""
SPRINT 2
Params: query
Return: json of results where the query matches the book name or author or error message 
"""


@SEARCH.route("/search/books", methods=["GET"])
def search_books_helper():
    result, status = search_books(
        request.args.get("query"), current_app.config["DATABASE"]["books"]
    )
    return jsonify(result), status


"""
SPRINT 2
Params: query
Return: json of results where the query matches the username or firstname or lastname
"""


@SEARCH.route("/search/users", methods=["GET"])
def search_users():
    query = request.args.get("query")
    users = current_app.config["DATABASE"]["users"]

    pipeline = [
        {
            "$project": {
                "username": 1,
                "first_name": 1,
                "last_name": 1,
                "_id": {"$toString": "$_id"},
                "firstname_lastname": {"$concat": ["$first_name", " ", "$last_name"]},
                "lastname_firstname": {"$concat": ["$last_name", " ", "$first_name"]},
                "username_firstname_lastname": {
                    "$concat": ["$username", " ", "$first_name", " ", "$last_name"]
                },
                "firstname_lastname_username": {
                    "$concat": ["$first_name", " ", "$last_name", " ", "$username"]
                },
                "username_lastname_firstname": {
                    "$concat": ["$username", " ", "$last_name", " ", "$first_name"]
                },
                "lastname_firstname_username": {
                    "$concat": ["$last_name", " ", "$first_name", " ", "$username"]
                },
            }
        },
        {
            "$match": {
                "$or": [
                    {"username": {"$regex": query, "$options": "i"}},
                    {"firstname_lastname": {"$regex": query, "$options": "i"}},
                    {"lastname_firstname": {"$regex": query, "$options": "i"}},
                    {"username_firstname_lastname": {"$regex": query, "$options": "i"}},
                    {"firstname_lastname_username": {"$regex": query, "$options": "i"}},
                    {"username_lastname_firstname": {"$regex": query, "$options": "i"}},
                    {"lastname_firstname_username": {"$regex": query, "$options": "i"}},
                ]
            }
        },
        {"$project": {"_id": 1, "username": 1, "first_name": 1, "last_name": 1}},
    ]

    results = list(users.aggregate(pipeline))

    return jsonify(results), 200
