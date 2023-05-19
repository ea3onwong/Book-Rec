from flask import Blueprint, current_app, jsonify, request
from search import search_books
import requests
import user_auth
import os

NYT = Blueprint("nyt", __name__)
base_url = "https://api.nytimes.com/svc/books/v3"
NYT_API_KEY = os.getenv("NYT_API_KEY")

"""
Params: book_id
Return: list of dictionaries containing data related to the book's NYT bestseller's list history
Errors:
    - 401: invalid book_id
    - 402: book does not have isbn: could not get NYT data
    - 403: book was not included in NYT bestsellers list
"""


@NYT.route("/nyt/get_data", methods=["GET"])
def nyt_get_data():
    # extracting parameters
    book_id = request.args.get("book_id")

    # Query book db for book info
    book = current_app.config["DATABASE"]["books"].find_one({"book_id": book_id})
    if book is None:
        return jsonify({"message": "invalid book_id"}), 401

    # Check if book has ISBN
    isbn = book.get("isbn", None)
    if isbn == None or isbn == "No ISBN":
        return (
            jsonify({"message": "book does not have isbn: could not get NYT data"}),
            402,
        )

    # Make an API call to the NYT API
    nyt_response = requests.get(
        url=base_url + "/lists/best-sellers/history.json",
        params={"api-key": NYT_API_KEY, "isbn": isbn},
    )

    # Check if book was included in an NYT best sellers list
    results = nyt_response.json().get("results", [])
    if len(results) == 0:
        return (
            jsonify({"message": "book was not included in NYT bestsellers list"}),
            403,
        )

    response = results[0].get("ranks_history", None)
    if response is None:
        return (
            jsonify({"message": "book was not included in NYT bestsellers list"}),
            403,
        )
    return jsonify(response), 200


"""
Params: book_id
Return: json containing the book's peak rank and total number of weeks it was in the NYT bestsellers list
Note: total weeks is the maximum number of weeks the book was in any NYT bestsellers list
Errors:
    - 401: invalid book_id
    - 402: book does not have isbn: could not get NYT data
    - 403: book was not included in NYT bestsellers list
"""


@NYT.route("/nyt/get_data_short", methods=["GET"])
def nyt_get_data_short():
    # extracting parameters
    book_id = request.args.get("book_id")

    # Query book db for book info
    book = current_app.config["DATABASE"]["books"].find_one({"book_id": book_id})
    if book is None:
        return jsonify({"message": "invalid book_id"}), 401

    # Check if book has ISBN
    isbn = book.get("isbn", None)
    if isbn == None or isbn == "No ISBN":
        return (
            jsonify({"message": "book does not have isbn: could not get NYT data"}),
            402,
        )

    # Make an API call to the NYT API
    nyt_response = requests.get(
        url=base_url + "/lists/best-sellers/history.json",
        params={"api-key": NYT_API_KEY, "isbn": isbn},
    )

    # Check if book was included in an NYT best sellers list
    results = nyt_response.json().get("results", [])
    if len(results) == 0:
        return (
            jsonify({"message": "book was not included in NYT bestsellers list"}),
            403,
        )
    rankHistory = results[0].get("ranks_history", None)

    peakRank = min(rankHistory, key=lambda x: x["rank"])
    totalWeeks = max(rankHistory, key=lambda x: x["weeks_on_list"])

    response = {"peak_rank": peakRank, "total_weeks": totalWeeks}
    return jsonify(response), 200


"""
Params: token
Return: list of dictionaries containing books on the current NYT bestsellers list. Filters out the books already read by the user
Errors:
    - 401: invalid token
"""


@NYT.route("/nyt/get_current_recommendations", methods=["GET"])
def nyt_get_current_recommendations():
    # extracting parameters
    token = request.args.get("token")

    # validate token
    token_data = user_auth.token_val(token)
    if token_data is None:
        return jsonify({"message": "invalid token", "token": token}), 401
    user_id = token_data["_id"]

    # Make an API call to the NYT API
    nyt_response = requests.get(
        url=base_url + "/lists/full-overview.json", params={"api-key": NYT_API_KEY}
    )
    results = nyt_response.json().get("results", {}).get("lists", [])

    books_db = current_app.config["DATABASE"]["books"]
    results = [
        r
        for r in results
        if (
            r.get("list_name", "") == "Combined Print and E-Book Fiction"
            or r.get("list_name", "") == "Combined Print and E-Book Nonfiction"
        )
    ]
    for l in results:
        book_list = l.get("books", [])
        book_list = filter_Read_Books(book_list, user_id)
        book_list = get_Book_Data(book_list, books_db)
        l["books"] = book_list
    return jsonify(results)


def filter_Read_Books(bookList, uid):
    # get books read by user
    books_read = list(
        current_app.config["DATABASE"]["books_read"].find(
            {"user_id": str(uid)}, {"_id": 0, "book_id": 1}
        )
    )
    isbn_list = list(
        current_app.config["DATABASE"]["books"].find(
            {"book_id": {"$in": [d["book_id"] for d in books_read]}},
            {"_id": 0, "isbn": 1},
        )
    )
    isbn_list = list(filter(None, isbn_list))
    isbn_list = [d["isbn"] for d in isbn_list]

    # filter list
    filtered_list = list(
        filter(lambda d: d["primary_isbn10"] not in isbn_list, bookList)
    )
    filtered_list = list(
        filter(lambda d: d["primary_isbn13"] not in isbn_list, filtered_list)
    )
    return filtered_list


def get_Book_Data(book_list, books_db):
    ret_list = []
    for book in book_list:
        # check if book is already in database
        entry = books_db.find_one({"isbn": book["primary_isbn10"]})
        if entry is None:
            entry = books_db.find_one({"isbn": book["primary_isbn13"]})

            # if book is not in database, search google books for its entry
            if entry is None:
                query13 = "isbn:" + book["primary_isbn13"]
                response, status_code = search_books(query13, books_db)

                # if ISBN 10 number did not work, use book's ISBN13 number
                if isinstance(response, list):
                    if len(response) == 0:
                        query10 = "isbn:" + book["primary_isbn10"]
                        response, status_code = search_books(query10, books_db)
                    if len(response) > 0:
                        ret_list.append(response[0])

            else:
                entry["_id"] = str(entry["_id"])
                ret_list.append(entry)

        else:
            entry["_id"] = str(entry["_id"])
            ret_list.append(entry)
    return ret_list
