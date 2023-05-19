from flask import Blueprint, request, current_app
from flask import jsonify
import bcrypt
import pymongo
from bson.objectid import ObjectId
import re
from user_auth import token_val
from datetime import datetime, date
import bson
import pandas as pd
import numpy as np
from sklearn.feature_extraction import text
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import stopwords
import nltk
from rake_nltk import Rake
from search import search_books


RECOMMENDER = Blueprint("rec", __name__)


def get_book_info(book):
    resp = book["title"]
    if book["summary"] != "No summary available":
        resp += " " + book["summary"]
    if book["categories"] != "No category available":
        resp += " " + book["categories"]
    if book["authors"] != "No author available":
        resp += " " + book["authors"]
    return resp


"""
Params: token
Func: Uses the most recent book that was marked as read to recommend a similar book. Weights the user's rating of said book and uses the books description, title and genre to generate recommendations
Return: List of 10 recommendations

Main recommendation logic taken from: https://thecleverprogrammer.com/2022/07/19/book-recommendation-system-using-python/

"""


@RECOMMENDER.route("/rec/", methods=["GET"])
def gen_recomm():
    token = request.args.get("token")

    # Validate users token
    data = token_val(token)
    if data is None:
        return jsonify({"message": "Invalid token"}), 400

    # Find user in database
    user_id = data["_id"]
    users = current_app.config["DATABASE"]["users"]
    user = users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        return jsonify({"message": "user id not present in database"}), 402

    # Get users most recently read book
    recent_read = user["main_collection"]
    if len(recent_read) == 0:
        return jsonify({"message": "No books read so far!"}), 400

    recent_read = user["main_collection"][0]
    recent_read = current_app.config["DATABASE"]["books"].find_one(
        {"book_id": recent_read["book_id"]}
    )

    # use rake-nltk to extract keywords from book info
    r = Rake()

    if recent_read["summary"] == "No summary available":
        info = recent_read["title"]
    else:
        info = recent_read["summary"]

    r.extract_keywords_from_text(info)
    main_word = r.get_ranked_phrases()[0]

    # Search for relevant books in both the cache and googlebooks
    potential_recs, status_code = search_books(
        main_word, current_app.config["DATABASE"]["books"]
    )

    # Remove already read books from list and books with identical titles

    books_read_itr = current_app.config["DATABASE"]["books_read"].find(
        {"user_id": user_id}, {"_id": 0, "book_id": 1}
    )
    books_read = []
    for book in books_read_itr:
        books_read.append(book["book_id"])

    tmp = []
    print(potential_recs)

    for book1 in potential_recs:
        removed = False

        # Remove books marked as read by checking to see if their book id or their titles match
        for ids in books_read:
            if book1["book_id"] == ids:
                removed = True
                break

        # Removes books that have identical ids
        count = 0
        for book2 in potential_recs:
            if book1["book_id"] == book2["book_id"]:
                count += 1

        if count >= 2:
            removed = True

        if not removed:
            tmp.append(book1)

    potential_recs = tmp

    # Add most recently read book to rec in order to calculate similarity of other books to it
    potential_recs.append(recent_read)

    # Create "info" field for each book
    for book in potential_recs:
        book["info"] = get_book_info(book)

    # Calculate similarity ranking between all books
    data = pd.DataFrame.from_dict(potential_recs)
    data = data[["title", "info", "book_id"]]
    # data = data.dropna()

    feature = data["info"].tolist()
    tfidf = text.TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(feature)

    similarity = cosine_similarity(tfidf_matrix, tfidf_matrix)

    indices = pd.Series(data.index, index=data["book_id"]).drop_duplicates()

    # Perform recommendation logic
    # A book will be recommended based on the books title, genre, authors and description
    index = indices[recent_read["book_id"]]
    sim_scores = list(enumerate(similarity[index]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:11]
    book_indices = [i[0] for i in sim_scores]

    recs = data["book_id"].iloc[book_indices]

    resp = []
    for rec in recs:
        for book in potential_recs:
            if book["book_id"] == rec:
                resp.append(book)
                break

    return jsonify({"rec": resp}), 200


# Problem the list of books thats being returned has way too many of the same book!!!
# Have to remove books that have the same title as an already read book!
