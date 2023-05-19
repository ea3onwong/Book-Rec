import requests
import pymongo
import os
import sys

sys.path.insert(0, "..")
import pytest
from data_init import data_init

baseURL = "http://127.0.0.1:5000"


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_recommender(data_init):
    token = data_init[0]
    user = data_init[1]
    book = data_init[3]

    # Mark book as read
    requests.post(
        baseURL + "/book/read_book", json={"token": token, "book_id": book["book_id"]}
    )

    resp = requests.get(baseURL + "/rec/", params={"token": token})
    assert resp.status_code == 200


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_recommender_two_books(data_init):
    token = data_init[0]
    user = data_init[1]
    book1 = data_init[3]
    book2 = data_init[4]

    # Mark book as read
    requests.post(
        baseURL + "/book/read_book", json={"token": token, "book_id": book1["book_id"]}
    )
    requests.post(
        baseURL + "/book/read_book", json={"token": token, "book_id": book2["book_id"]}
    )

    resp = requests.get(baseURL + "/rec/", params={"token": token})
    assert resp.status_code == 200
