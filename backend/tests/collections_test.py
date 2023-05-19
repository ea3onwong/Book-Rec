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
def test_collections_get_main(data_init):
    token = data_init[0]
    user = data_init[1]
    response = requests.get(
        baseURL + "/collections/get_main",
        params={"token": token, "userid": user["_id"]},
    )
    assert response.status_code == 200 and response.json() == []


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_num_collections(data_init):
    token = data_init[0]
    user = data_init[1]
    response = requests.get(
        baseURL + "/collections/num_collections",
        params={"token": token, "userid": user["_id"]},
    )
    assert response.status_code == 200 and response.json() == 1


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_get_collections(data_init):
    token = data_init[0]
    user = data_init[1]
    response = requests.get(
        baseURL + "/collections/get_collections",
        params={"token": token, "userid": user["_id"]},
    )
    assert response.status_code == 200 and response.json() == []


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_collections_create_no_desc(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/collections/create", json={"token": token, "name": "2023"}
    )
    assert response.json() == True and response.status_code == 200


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_collections_create_desc(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/collections/create",
        json={"token": token, "name": "2022", "description": "i've read these"},
    )
    assert response.status_code == 200 and response.json() == True


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_collections_num_collections(data_init):
    token = data_init[0]
    user = data_init[1]
    requests.post(
        baseURL + "/collections/create", json={"token": token, "name": "2023"}
    )
    requests.post(
        baseURL + "/collections/create",
        json={"token": token, "name": "2022", "description": "i've read these"},
    )
    response = requests.get(
        baseURL + "/collections/num_collections",
        params={"token": token, "userid": user["_id"]},
    )
    assert response.status_code == 200 and response.json() == 3


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_collections_get_collections(data_init):
    token = data_init[0]
    user = data_init[1]
    requests.post(
        baseURL + "/collections/create", json={"token": token, "name": "2023"}
    )
    requests.post(
        baseURL + "/collections/create",
        json={"token": token, "name": "2022", "description": "i've read these"},
    )
    response = requests.get(
        baseURL + "/collections/get_collections",
        params={"token": token, "userid": user["_id"]},
    )
    assert response.status_code == 200 and response.json() == [
        {"name": "2023", "book_list": [], "description": ""},
        {"name": "2022", "book_list": [], "description": "i've read these"},
    ]


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_collections_add_book(data_init):
    token = data_init[0]
    user = data_init[1]
    book = data_init[3]

    # Create collection for user
    requests.post(
        baseURL + "/collections/create", json={"token": token, "name": "2023"}
    )

    # Test adding book
    response = requests.post(
        baseURL + "/collections/add_book",
        json={"token": token, "collection": "2023", "bookid": book["book_id"]},
    )

    assert response.status_code == 200


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_collections_add_book_invalid_token(data_init):
    token = data_init[0]
    user = data_init[1]
    book = data_init[3]

    # Create collection for user
    requests.post(
        baseURL + "/collections/create", json={"token": token, "name": "2023"}
    )

    # bad_token = token[:1] + "a" + token[2:]
    response = requests.post(
        baseURL + "/collections/add_book",
        json={"token": "bad_token", "collection": "2023", "bookid": book["book_id"]},
    )

    assert response.status_code == 400


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_collections_add_main(data_init):
    token = data_init[0]
    user = data_init[1]
    book = data_init[3]

    response = requests.post(
        baseURL + "/book/read_book", json={"token": token, "book_id": book["book_id"]}
    )

    assert response.status_code == 200


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_collections_remove_book(data_init):
    token = data_init[0]
    user = data_init[1]
    book = data_init[3]

    # Create collection
    requests.post(
        baseURL + "/collections/create", json={"token": token, "name": "2023"}
    )

    # Add book to collection
    requests.post(
        baseURL + "/collections/add_book",
        json={"token": token, "collection": "2023", "bookid": book["book_id"]},
    )

    # Remove book from collection
    response = requests.post(
        baseURL + "/collections/remove_book",
        json={"token": token, "collection": "2023", "bookid": book["book_id"]},
    )

    assert response.status_code == 200
