import requests
import pymongo
import sys

sys.path.insert(0, "..")
import pytest
from data_init import data_init
import os

baseURL = "http://127.0.0.1:5000"
myclient = pymongo.MongoClient(
    "mongodb+srv://"
    + os.getenv("DB_USR")
    + ":"
    + os.getenv("DB_PWD")
    + "@group1-db.muxufih.mongodb.net/?retryWrites=true&w=majority"
)


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_nyt_data_invalid_book_id(data_init):
    response = requests.get(
        baseURL + "/nyt/get_data", params={"book_id": "invalid_book_id"}
    )
    assert (
        response.json() == {"message": "invalid book_id"}
        and response.status_code == 401
    )


def test_nyt_data_no_isbn_field():
    book = myclient["db"]["books"].find_one({"title": "The Skull Beneath the Skin"})
    response = requests.get(
        baseURL + "/nyt/get_data", params={"book_id": book["book_id"]}
    )
    assert (
        response.json()
        == {"message": "book does not have isbn: could not get NYT data"}
        and response.status_code == 402
    )


def test_nyt_data_no_isbn_google():
    book = myclient["db"]["books"].find_one({"title": "Lord of the Flies"})
    response = requests.get(
        baseURL + "/nyt/get_data", params={"book_id": book["book_id"]}
    )
    assert (
        response.json()
        == {"message": "book does not have isbn: could not get NYT data"}
        and response.status_code == 402
    )


def test_nyt_data_not_included():
    book = myclient["db"]["books"].find_one({"title": "Poor Richard's Almanack"})
    response = requests.get(
        baseURL + "/nyt/get_data", params={"book_id": book["book_id"]}
    )
    assert (
        response.json() == {"message": "book was not included in NYT bestsellers list"}
        and response.status_code == 403
    )


def test_nyt_data_included():
    book = myclient["db"]["books"].find_one({"title": "Lessons in Chemistry"})
    response = requests.get(
        baseURL + "/nyt/get_data", params={"book_id": book["book_id"]}
    )
    assert response.status_code == 200


def test_nyt_data_short_invalid_book_id():
    response = requests.get(
        baseURL + "/nyt/get_data_short", params={"book_id": "invalid_book_id"}
    )
    assert (
        response.json() == {"message": "invalid book_id"}
        and response.status_code == 401
    )


def test_nyt_data_short_no_isbn_field():
    book = myclient["db"]["books"].find_one({"title": "The Skull Beneath the Skin"})
    response = requests.get(
        baseURL + "/nyt/get_data_short", params={"book_id": book["book_id"]}
    )
    assert (
        response.json()
        == {"message": "book does not have isbn: could not get NYT data"}
        and response.status_code == 402
    )


def test_nyt_data_short_no_isbn_google():
    book = myclient["db"]["books"].find_one({"title": "Lord of the Flies"})
    response = requests.get(
        baseURL + "/nyt/get_data_short", params={"book_id": book["book_id"]}
    )
    assert (
        response.json()
        == {"message": "book does not have isbn: could not get NYT data"}
        and response.status_code == 402
    )


def test_nyt_data_short_not_included():
    book = myclient["db"]["books"].find_one({"title": "Poor Richard's Almanack"})
    response = requests.get(
        baseURL + "/nyt/get_data_short", params={"book_id": book["book_id"]}
    )
    assert (
        response.json() == {"message": "book was not included in NYT bestsellers list"}
        and response.status_code == 403
    )


def test_nyt_data_short_included():
    book = myclient["db"]["books"].find_one({"title": "Lessons in Chemistry"})
    response = requests.get(
        baseURL + "/nyt/get_data_short", params={"book_id": book["book_id"]}
    )
    assert response.status_code == 200


def test_nyt_recommendations_invalid_token():
    response = requests.get(
        baseURL + "/nyt/get_current_recommendations", params={"token": "token"}
    )
    assert (
        response.json() == {"message": "invalid token", "token": "token"}
        and response.status_code == 401
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_nyt_recommendations(data_init):
    token = data_init[0]
    requests.post(baseURL + "/book/read_book", json={"token": token, "book_id": "1"})
    requests.post(baseURL + "/book/read_book", json={"token": token, "book_id": "2"})
    requests.post(baseURL + "/book/read_book", json={"token": token, "book_id": "3"})
    requests.post(baseURL + "/book/read_book", json={"token": token, "book_id": "4"})
    response = requests.get(
        baseURL + "/nyt/get_current_recommendations", params={"token": token}
    )
    assert response.status_code == 200
