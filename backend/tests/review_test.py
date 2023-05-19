import requests
import pymongo
from bson.objectid import ObjectId
import os
import sys

sys.path.insert(0, "..")
import datetime
import pytest
from data_init import data_init

baseURL = "http://127.0.0.1:5000"
myclient = pymongo.MongoClient(
    "mongodb+srv://"
    + os.getenv("DB_USR")
    + ":"
    + os.getenv("DB_PWD")
    + "@group1-db.muxufih.mongodb.net/?retryWrites=true&w=majority"
)

"""
TESTING /review/add
"""


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_add_invalid_token(data_init):
    book0 = data_init[3]
    response = requests.post(
        baseURL + "/review/add",
        json={"token": "token", "book_id": book0["book_id"], "rating": 1},
    )
    assert (
        response.json() == {"message": "invalid token", "token": "token"}
        and response.status_code == 401
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_add_invalid_book_id(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/review/add",
        json={"token": token, "book_id": "invalidID", "rating": 1},
    )
    assert (
        response.json() == {"message": "invalid book_id"}
        and response.status_code == 402
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_add_double_review(data_init):
    token = data_init[0]
    book1 = data_init[4]
    response = requests.post(
        baseURL + "/review/add",
        json={"token": token, "book_id": book1["book_id"], "rating": 1},
    )
    assert (
        response.json()
        == {"message": "user has already created a review for this book"}
        and response.status_code == 403
    )


# TODO: refactor
@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_add_no_review(data_init):
    token = data_init[0]
    book0 = data_init[3]
    response = requests.post(
        baseURL + "/review/add", json={"token": token, "book_id": book0["book_id"]}
    )
    assert (
        response.json() == {"message": "must enter either review_text or rating"}
        and response.status_code == 405
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_add_rating(data_init):
    token = data_init[0]
    book0 = data_init[3]
    response = requests.post(
        baseURL + "/review/add",
        json={"token": token, "book_id": book0["book_id"], "rating": 1},
    )
    assert response.json() == True and response.status_code == 200
    assert (
        myclient["db"]["books"].find_one({"book_id": book0["book_id"]})[
            "average_rating"
        ]
        == 1
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_add_text(data_init):
    token = data_init[0]
    book0 = data_init[3]
    response = requests.post(
        baseURL + "/review/add",
        json={
            "token": token,
            "book_id": book0["book_id"],
            "review_text": "terrible book",
        },
    )
    assert response.json() == True and response.status_code == 200
    assert (
        myclient["db"]["books"].find_one({"book_id": book0["book_id"]})[
            "average_rating"
        ]
        == 0
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_add_text_rating(data_init):
    token = data_init[0]
    book0 = data_init[3]
    response = requests.post(
        baseURL + "/review/add",
        json={
            "token": token,
            "book_id": book0["book_id"],
            "review_text": "terrible book",
            "rating": 1,
        },
    )
    assert response.json() == True and response.status_code == 200
    assert (
        myclient["db"]["books"].find_one({"book_id": book0["book_id"]})[
            "average_rating"
        ]
        == 1
    )


"""
TESTING /review/edit_review
"""


def test_review_edit_invalid_token():
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/edit_review",
        json={"token": "token", "review_id": str(review["_id"])},
    )
    assert (
        response.json() == {"message": "invalid token", "token": "token"}
        and response.status_code == 401
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_edit_invalid_review_id(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/review/edit_review",
        json={"token": token, "review_id": str(ObjectId())},
    )
    assert (
        response.json() == {"message": "invalid review_id"}
        and response.status_code == 402
    )


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_review_edit_moderator_rating(data_init):
    token = data_init[0]
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/edit_review",
        json={"token": token, "review_id": str(review["_id"]), "rating": 3},
    )
    assert (
        response.json()
        == {"message": "moderator does not have permission to update rating"}
        and response.status_code == 403
    )


@pytest.mark.parametrize("data_init", [["db", "claude"]], indirect=["data_init"])
def test_review_edit_no_permission(data_init):
    token = data_init[0]
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/edit_review",
        json={"token": token, "review_id": str(review["_id"])},
    )
    assert (
        response.json()
        == {"message": "user does not have permission to edit this review"}
        and response.status_code == 405
    )


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_review_edit_moderator_text(data_init):
    token = data_init[0]
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/edit_review",
        json={
            "token": token,
            "review_id": str(review["_id"]),
            "review_text": "this is a moderated review",
        },
    )
    assert (
        response.json()
        == {"message": "moderator does not have permission to update rating"}
        and response.status_code == 403
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_edit_user(data_init):
    token = data_init[0]
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/edit_review",
        json={
            "token": token,
            "review_id": str(review["_id"]),
            "review_text": "actually terrible",
            "rating": 1,
            "date_read": datetime.date.today().isoformat(),
        },
    )
    assert response.json() == True and response.status_code == 200
    assert (
        myclient["db"]["books"].find_one({"book_id": review["book_id"]})[
            "average_rating"
        ]
        == 1
    )


"""
TESTING /review/delete_review
"""


def test_review_delete_invalid_token():
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/delete_review",
        json={"token": "token", "review_id": str(review["_id"])},
    )
    assert (
        response.json() == {"message": "invalid token", "token": "token"}
        and response.status_code == 401
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_delete_invalid_review_id(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/review/delete_review",
        json={"token": token, "review_id": str(ObjectId())},
    )
    assert (
        response.json() == {"message": "invalid review_id"}
        and response.status_code == 402
    )


@pytest.mark.parametrize("data_init", [["db", "claude"]], indirect=["data_init"])
def test_review_delete_no_permission(data_init):
    token = data_init[0]
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/delete_review",
        json={"token": token, "review_id": str(review["_id"])},
    )
    assert (
        response.json()
        == {"message": "user does not have permission to delete this review"}
        and response.status_code == 403
    )


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_review_delete_moderator(data_init):
    token = data_init[0]
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/delete_review",
        json={"token": token, "review_id": str(review["_id"])},
    )
    assert response.json() == True and response.status_code == 200
    assert (
        myclient["db"]["books"].find_one({"book_id": review["book_id"]})[
            "average_rating"
        ]
        == 0
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_delete_user(data_init):
    token = data_init[0]
    review = myclient["db"]["reviews"].find_one()
    response = requests.post(
        baseURL + "/review/delete_review",
        json={"token": token, "review_id": str(review["_id"])},
    )
    assert response.json() == True and response.status_code == 200
    assert (
        myclient["db"]["books"].find_one({"book_id": review["book_id"]})[
            "average_rating"
        ]
        == 0
    )


"""
TESTING /review/get_book_full
"""


def test_review_get_book_full_invalid_book_id():
    response = requests.get(
        baseURL + "/review/get_book_full", params={"book_id": "invalidID"}
    )
    assert (
        response.json() == {"message": "invalid book_id"}
        and response.status_code == 402
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_get_book_full_empty(data_init):
    book0 = data_init[3]
    response = requests.get(
        baseURL + "/review/get_book_full", params={"book_id": book0["book_id"]}
    )
    assert response.json() == [] and response.status_code == 200


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_get_book_full_basic(data_init):
    user = data_init[1]
    book1 = data_init[4]

    review = myclient["db"]["reviews"].find_one()
    review["_id"] = str(review["_id"])
    review["user_id"] = str(review["user_id"])
    review["username"] = user["username"]

    response = requests.get(
        baseURL + "/review/get_book_full", params={"book_id": book1["book_id"]}
    )
    assert response.json() == [review] and response.status_code == 200


@pytest.mark.parametrize("data_init", [["db", "claude"]], indirect=["data_init"])
def test_review_get_book_full_add(data_init):
    token = data_init[0]
    book1 = data_init[4]
    requests.post(
        baseURL + "/review/add",
        json={
            "token": token,
            "book_id": book1["book_id"],
            "date_read": datetime.date.today().isoformat(),
            "review_text": "terrible book",
            "rating": 1,
        },
    )

    review1 = myclient["db"]["reviews"].find_one({"rating": 5})
    review1["username"] = myclient["db"]["users"].find_one(
        {"_id": review1["user_id"]}, {"username": 1}
    )["username"]
    review1["_id"] = str(review1["_id"])
    review1["user_id"] = str(review1["user_id"])

    review2 = myclient["db"]["reviews"].find_one({"rating": 1})
    review2["username"] = myclient["db"]["users"].find_one(
        {"_id": review2["user_id"]}, {"username": 1}
    )["username"]
    review2["_id"] = str(review2["_id"])
    review2["user_id"] = str(review2["user_id"])

    response = requests.get(
        baseURL + "/review/get_book_full", params={"book_id": book1["book_id"]}
    )
    assert response.json() == [review2, review1] and response.status_code == 200


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_get_book_full_edit(data_init):
    token = data_init[0]
    user = data_init[1]
    book1 = data_init[4]
    review = myclient["db"]["reviews"].find_one()

    requests.post(
        baseURL + "/review/edit_review",
        json={
            "token": token,
            "review_id": str(review["_id"]),
            "review_text": "actually terrible",
            "rating": 1,
            "date_read": datetime.date.today().isoformat(),
        },
    )
    response = requests.get(
        baseURL + "/review/get_book_full", params={"book_id": book1["book_id"]}
    )

    review = myclient["db"]["reviews"].find_one()
    review["_id"] = str(review["_id"])
    review["user_id"] = str(review["user_id"])
    review["username"] = user["username"]

    assert response.json() == [review] and response.status_code == 200


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_get_book_full_delete(data_init):
    token = data_init[0]
    book1 = data_init[4]
    review = myclient["db"]["reviews"].find_one()
    requests.post(
        baseURL + "/review/delete_review",
        json={"token": token, "review_id": str(review["_id"])},
    )

    response = requests.get(
        baseURL + "/review/get_book_full", params={"book_id": book1["book_id"]}
    )
    assert response.json() == [] and response.status_code == 200


"""
TESTING /review/get_book_short
"""


def test_review_get_book_short_invalid_book_id():
    response = requests.get(
        baseURL + "/review/get_book_short", params={"book_id": "invalidID"}
    )
    assert (
        response.json() == {"message": "invalid book_id"}
        and response.status_code == 402
    )


@pytest.mark.parametrize("data_init", [["db", "claude"]], indirect=["data_init"])
def test_review_get_book_short(data_init):
    token = data_init[0]
    book1 = data_init[4]
    requests.post(
        baseURL + "/review/add",
        json={
            "token": token,
            "book_id": book1["book_id"],
            "date_read": datetime.date.today().isoformat(),
            "review_text": "terrible book",
            "rating": 2,
        },
    )
    response = requests.get(
        baseURL + "/review/get_book_short", params={"book_id": book1["book_id"]}
    )
    assert (
        response.json() == {"number_of_reviews": 2, "average_rating": 3.5}
        and response.status_code == 200
    )


@pytest.mark.parametrize("data_init", [["db", "claude"]], indirect=["data_init"])
def test_review_get_book_short_no_review(data_init):
    book0 = data_init[3]
    response = requests.get(
        baseURL + "/review/get_book_short", params={"book_id": book0["book_id"]}
    )
    assert (
        response.json() == {"number_of_reviews": 0, "average_rating": 0}
        and response.status_code == 200
    )


"""
TESTING /review/get_user
"""


def test_review_get_user_invalid_user_id():
    response = requests.get(
        baseURL + "/review/get_user", params={"user_id": str(ObjectId())}
    )
    assert (
        response.json() == {"message": "user_id not present in database"}
        and response.status_code == 402
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_get_user(data_init):
    token = data_init[0]
    user = data_init[1]
    book0 = data_init[3]
    requests.post(
        baseURL + "/review/add",
        json={
            "token": token,
            "book_id": book0["book_id"],
            "date_read": datetime.date.today().isoformat(),
            "review_text": "terrible book",
            "rating": 1,
        },
    )
    response = requests.get(
        baseURL + "/review/get_user", params={"user_id": user["_id"]}
    )

    review1 = myclient["db"]["reviews"].find_one({"rating": 5})
    review1["_id"] = str(review1["_id"])
    review1["user_id"] = str(review1["user_id"])

    review2 = myclient["db"]["reviews"].find_one({"rating": 1})
    review2["_id"] = str(review2["_id"])
    review2["user_id"] = str(review2["user_id"])

    assert response.json() == [review2, review1] and response.status_code == 200


"""
TESTING /review/get_user_num_reviews
"""


def test_review_get_user_num_reviews_invalid_user_id():
    response = requests.get(
        baseURL + "/review/get_user_num_reviews", params={"user_id": str(ObjectId())}
    )
    assert (
        response.json() == {"message": "user_id not present in database"}
        and response.status_code == 402
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_review_get_user_num_reviews(data_init):
    token = data_init[0]
    user = data_init[1]
    book0 = data_init[3]
    requests.post(
        baseURL + "/review/add",
        json={
            "token": token,
            "book_id": book0["book_id"],
            "date_read": datetime.date.today().isoformat(),
            "review_text": "terrible book",
            "rating": 1,
        },
    )
    response = requests.get(
        baseURL + "/review/get_user_num_reviews", params={"user_id": user["_id"]}
    )
    assert response.json() == 2 and response.status_code == 200
