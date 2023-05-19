import json
import requests
import pymongo
import os
import sys

sys.path.insert(0, "..")
import user_auth
import pytest
from data_init import data_init

baseURL = "http://127.0.0.1:5000"


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_book_get_data(data_init):
    token = data_init[0]
    book = data_init[3]

    response = requests.get(
        baseURL + "/book/get_data", params={"bookid": book["book_id"]}
    )
    assert response.status_code == 200
    assert response.json()["book_id"] == book["book_id"]
    assert response.json()["title"] == book["title"]


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_book_get_data_invalid_bookid(data_init):
    token = data_init[0]
    book = data_init[3]

    response = requests.get(baseURL + "/book/get_data", params={"bookid": "12"})
    assert response.status_code == 400


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_read_book(data_init):
    token = data_init[0]
    user = data_init[1]
    book = data_init[3]

    response = requests.post(
        baseURL + "/book/read_book", json={"token": token, "book_id": book["book_id"]}
    )
    assert response.status_code == 200

    response1 = requests.get(
        baseURL + "/book/get_num_readers", params={"book_id": book["book_id"]}
    )
    assert response1.status_code == 200 and response1.json() == 1

    response2 = requests.get(
        baseURL + "/book/get_num_books_read", params={"user_id": user["_id"]}
    )
    assert response2.status_code == 200 and response2.json() == 1


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_get_free_book_valid(data_init):
    # add this book to book database (free version)
    query = "The Poetical Works of Sir David Lyndsay of the Mount"
    search_response = requests.get(baseURL + "/search/books", params={"query": query})

    assert search_response.json() != [] and search_response.status_code == 200

    response = requests.get(baseURL + "/book/get_free_books")
    assert response.json() != [] and response.status_code == 200
    assert response.json()[0]["is_free"] == True
