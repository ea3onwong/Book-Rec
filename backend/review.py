from flask import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import pymongo
import user_auth
import datetime

REVIEW = Blueprint("review", __name__)

"""
Params: token, book_id
Maybe Params: review_text, rating
Return: True boolean on success
Errors:
    - 401: invalid token
    - 402: invalid book_id
    - 403: review for book_id by this user has already been made
    - 405: must enter either review_text or rating
"""


@REVIEW.route("/review/add", methods=["POST"])
def review_add():
    # extracting parameters
    token = request.get_json().get("token")
    book_id = request.get_json().get("book_id")
    review_text = request.get_json().get("review_text")
    rating = request.get_json().get("rating")

    # validate token
    token_data = user_auth.token_val(token)
    if token_data is None:
        return jsonify({"message": "invalid token", "token": token}), 401
    user_id = token_data["_id"]

    # check if book_id is valid
    if current_app.config["DATABASE"]["books"].find_one({"book_id": book_id}) == None:
        return jsonify({"message": "invalid book_id"}), 402

    # check if user has already created a review for this book
    reviews_db = current_app.config["DATABASE"]["reviews"]
    if reviews_db.find_one({"book_id": book_id, "user_id": ObjectId(user_id)}):
        return (
            jsonify({"message": "user has already created a review for this book"}),
            403,
        )

    # check if at least one of review_text or rating are filled out
    if review_text is None and rating is None:
        return jsonify({"message": "must enter either review_text or rating"}), 405

    # check if this includes a rating
    rating_included = True
    review_date = datetime.date.today().isoformat()
    if review_text is None:
        review_text = ""
    if rating is None:
        rating = 0
        rating_included = False

    # putting entry into database
    review = {
        "book_id": book_id,
        "user_id": ObjectId(user_id),
        "rating_included": rating_included,
        "review_date": review_date,
        "rating": rating,
        "review_text": review_text,
    }
    reviews_db.insert_one(review)
    update_book_rating(book_id)
    return jsonify(True), 200


"""
Params: token, review_id
Maybe Params: review_text, rating
Return: True boolean on success
Errors:
    - 401: invalid token
    - 402: invalid review_id
    - 403: moderator does not have permission to update rating
    - 405: user does not have permission to edit this review
"""


@REVIEW.route("/review/edit_review", methods=["POST"])
def review_edit_review():
    # extracting parameters
    token = request.get_json().get("token")
    review_id = request.get_json().get("review_id")
    review_text = request.get_json().get("review_text")
    rating = request.get_json().get("rating")

    # validate token
    token_data = user_auth.token_val(token)
    if token_data is None:
        return jsonify({"message": "invalid token", "token": token}), 401

    # check if review exists in the review database
    review_data = current_app.config["DATABASE"]["reviews"].find_one(
        {"_id": ObjectId(review_id)}
    )
    if review_data == None:
        return jsonify({"message": "invalid review_id"}), 402

    # creating update dictionary
    update_dict = {}
    if review_text is not None:
        update_dict["review_text"] = review_text
    if rating is not None:
        update_dict["rating"] = rating
        update_dict["rating_included"] = True

    # if user is updating their own review
    if review_data["user_id"] == ObjectId(token_data["_id"]):
        current_app.config["DATABASE"]["reviews"].update_one(
            {"_id": ObjectId(review_id)}, {"$set": update_dict}
        )

    # if user is moderator
    elif token_data["moderator"]:
        return (
            jsonify({"message": "moderator does not have permission to update rating"}),
            403,
        )

    # else, user does not have permission to edit this review
    else:
        return (
            jsonify({"message": "user does not have permission to edit this review"}),
            405,
        )

    update_book_rating(review_data["book_id"])
    return jsonify(True), 200


"""
Params: token, review_id
Return: True boolean on success
Errors:
    - 401: invalid token
    - 402: invalid review_id
    - 403: user does not have permission to delete review
"""


@REVIEW.route("/review/delete_review", methods=["POST"])
def review_delete_review():
    # extracting parameters
    token = request.get_json().get("token")
    review_id = request.get_json().get("review_id")

    # validate token
    token_data = user_auth.token_val(token)
    if token_data is None:
        return jsonify({"message": "invalid token", "token": token}), 401

    # check if review exists in the review database
    review_data = current_app.config["DATABASE"]["reviews"].find_one(
        {"_id": ObjectId(review_id)}
    )
    if review_data == None:
        return jsonify({"message": "invalid review_id"}), 402

    # check if user has permissions to delete review
    if (
        review_data["user_id"] != ObjectId(token_data["_id"])
        and not token_data["moderator"]
    ):
        return (
            jsonify({"message": "user does not have permission to delete this review"}),
            403,
        )

    current_app.config["DATABASE"]["reviews"].delete_one({"_id": ObjectId(review_id)})
    update_book_rating(review_data["book_id"])
    return jsonify(True), 200


"""
Params: book_id
Return: json containing full review data for book_id, sorted by most recent
Errors:
    - 402: invalid book_id
"""


@REVIEW.route("/review/get_book_full", methods=["GET"])
def review_get_book_full():
    # extracting parameters
    book_id = request.args.get("book_id")

    # check if book_id is valid
    if current_app.config["DATABASE"]["books"].find_one({"book_id": book_id}) == None:
        return jsonify({"message": "invalid book_id"}), 402

    # get all reviews for book_id
    reviews_cursor = current_app.config["DATABASE"]["reviews"].find(
        {"book_id": book_id}
    )
    reviews_full = list(reviews_cursor)
    for r in reviews_full:
        r["username"] = current_app.config["DATABASE"]["users"].find_one(
            {"_id": r["user_id"]}, {"username": 1}
        )["username"]
        r["_id"] = str(r["_id"])
        r["user_id"] = str(r["user_id"])
    reviews_full.sort(key=lambda k: k["review_date"], reverse=True)
    return jsonify(reviews_full), 200


"""
Params: book_id
Return: json containing average rating and number of reviews for book_id
Errors:
    - 402: invalid book_id
"""


@REVIEW.route("/review/get_book_short", methods=["GET"])
def review_get_book_short():
    # extracting parameters
    book_id = request.args.get("book_id")

    # check if book_id is valid
    if current_app.config["DATABASE"]["books"].find_one({"book_id": book_id}) == None:
        return jsonify({"message": "invalid book_id"}), 402

    # calculate number of reviews and average rating for book
    reviews_list = list(
        current_app.config["DATABASE"]["reviews"].find(
            {"book_id": book_id, "rating_included": True}
        )
    )
    num_reviews = len(reviews_list)
    if num_reviews == 0:
        avg_rating = 0
    else:
        avg_rating = sum(rev.get("rating", 0) for rev in reviews_list) / num_reviews

    return_dict = {"number_of_reviews": num_reviews, "average_rating": avg_rating}
    return jsonify(return_dict), 200


"""
Params: user_id
Return: json containing full review data for user_id, sorted by most recent
Errors:
    - 402: user_id not present in database
"""


@REVIEW.route("/review/get_user", methods=["GET"])
def review_get_user():
    # extracting parameters
    user_id = request.args.get("user_id")

    # check if user_id is valid
    if not current_app.config["DATABASE"]["users"].count_documents(
        {"_id": ObjectId(user_id)}, limit=1
    ):
        return jsonify({"message": "user_id not present in database"}), 402

    # get all reviews for user_id
    reviews_cursor = current_app.config["DATABASE"]["reviews"].find(
        {"user_id": ObjectId(user_id)}
    )
    reviews_full = list(reviews_cursor)
    for r in reviews_full:
        r["_id"] = str(r["_id"])
        r["user_id"] = str(r["user_id"])
    reviews_full.sort(key=lambda k: k["review_date"], reverse=True)
    return jsonify(reviews_full), 200


"""
Params: user_id
Return: int
Errors:
    - 402: user_id not present in database
"""


@REVIEW.route("/review/get_user_num_reviews", methods=["GET"])
def review_get_user_num_reviews():
    # extracting parameters
    user_id = request.args.get("user_id")

    # check if user_id is valid
    if not current_app.config["DATABASE"]["users"].count_documents(
        {"_id": ObjectId(user_id)}, limit=1
    ):
        return jsonify({"message": "user_id not present in database"}), 402

    # get all reviews for user_id
    num_reviews = len(
        list(
            current_app.config["DATABASE"]["reviews"].find(
                {"user_id": ObjectId(user_id)}
            )
        )
    )
    return jsonify(num_reviews), 200


def update_book_rating(book_id):
    reviews_list = list(
        current_app.config["DATABASE"]["reviews"].find(
            {"book_id": book_id, "rating_included": True}
        )
    )
    if len(reviews_list) == 0:
        avg_rating = 0
    else:
        avg_rating = sum(rev.get("rating", 0) for rev in reviews_list) / len(
            reviews_list
        )
    update_dict = {"average_rating": avg_rating}
    current_app.config["DATABASE"]["books"].update_one(
        {"book_id": book_id}, {"$set": update_dict}
    )
