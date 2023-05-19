import requests
import pymongo
from bson.objectid import ObjectId
import os
import sys

sys.path.insert(0, "..")
import pytest
from data_init import data_init

baseURL = "http://127.0.0.1:5000"
"""
/collections/create
"""


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_create_name_not_unique(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/collections/create", json={"token": token, "name": "faves"}
    )
    assert (
        response.json() == {"message": "collection name is already in use"}
        and response.status_code == 403
    )


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_create_invalid_name1(data_init):
    token = data_init[0]
    response = requests.post(baseURL + "/collections/create", json={"token": token})
    assert (
        response.json() == {"message": "invalid parameter: name"}
        and response.status_code == 402
    )


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_create_invalid_name2(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/collections/create", json={"token": token, "name": ""}
    )
    assert (
        response.json() == {"message": "invalid parameter: name"}
        and response.status_code == 402
    )


def test_collections_create_invalid_token():
    response = requests.post(
        baseURL + "/collections/create", json={"token": "token", "name": "faves"}
    )
    assert (
        response.json() == {"message": "invalid token", "token": "token"}
        and response.status_code == 401
    )


"""
/collections/num_collections
"""


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_num_collections_invalid_token(data_init):
    user = data_init[1]
    response = requests.get(
        baseURL + "/collections/num_collections",
        params={"token": "token", "userid": user["_id"]},
    )
    assert (
        response.json() == {"message": "invalid token", "token": "token"}
        and response.status_code == 401
    )


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_num_collections_invalid_userid(data_init):
    token = data_init[0]
    response = requests.get(
        baseURL + "/collections/num_collections",
        params={"token": token, "userid": ObjectId()},
    )
    assert (
        response.json() == {"message": "userid not present in database"}
        and response.status_code == 402
    )


"""
/collections/get_collections
"""


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_get_collections_invalid_token(data_init):
    user = data_init[1]
    response = requests.get(
        baseURL + "/collections/get_collections",
        params={"token": "token", "userid": user["_id"]},
    )
    assert (
        response.json() == {"message": "invalid token", "token": "token"}
        and response.status_code == 401
    )


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_get_collections_invalid_userid(data_init):
    token = data_init[0]
    response = requests.get(
        baseURL + "/collections/get_collections",
        params={"token": token, "userid": ObjectId()},
    )
    assert (
        response.json() == {"message": "userid not present in database"}
        and response.status_code == 402
    )


"""
/collections/get_main
"""


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_get_main_invalid_token(data_init):
    user = data_init[1]
    response = requests.get(
        baseURL + "/collections/get_main",
        params={"token": "token", "userid": user["_id"]},
    )
    assert (
        response.json() == {"message": "invalid token", "token": "token"}
        and response.status_code == 401
    )


@pytest.mark.parametrize("data_init", [["db", "dimitri"]], indirect=["data_init"])
def test_collections_get_main_invalid_userid(data_init):
    token = data_init[0]
    response = requests.get(
        baseURL + "/collections/get_main", params={"token": token, "userid": ObjectId()}
    )
    assert (
        response.json() == {"message": "userid not present in database"}
        and response.status_code == 402
    )
