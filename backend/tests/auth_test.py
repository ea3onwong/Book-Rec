import requests
import pymongo
import os
import sys
import jwt
from bson.objectid import ObjectId

sys.path.insert(0, "..")
import user_auth
import pytest
from data_init import data_init

baseURL = "http://127.0.0.1:5000"


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_register_valid(data_init):
    email_address = "z5289625@ad.unsw.edu.au"
    username = "AdamSmith123"
    first_name = "Adam"
    last_name = "Smith"
    password = "AdamSmith123aA!"

    user_params = {
        "email_address": email_address,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "password": password,
    }

    response = requests.post(baseURL + "/auth/register", json=user_params)

    assert response.status_code == 200


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_register_email_invalid(data_init):
    email_address = "z5289625@ad..unsw..edu.au"
    username = "AdamSmith123"
    first_name = "Adam"
    last_name = "Smith"
    password = "AdamSmith123aA!"

    user_params = {
        "email_address": email_address,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "password": password,
    }

    response = requests.post(baseURL + "/auth/register", json=user_params)

    assert response.status_code == 400 and response.json() == {
        "message": "Invalid email address format"
    }


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_register_username_invalid(data_init):
    email_address = "z5289625@ad.unsw.edu.au"
    username = "AdamSmit@!h123"
    first_name = "Adam"
    last_name = "Smith"
    password = "AdamSmith123aA!"

    user_params = {
        "email_address": email_address,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "password": password,
    }

    response = requests.post(baseURL + "/auth/register", json=user_params)

    assert response.status_code == 400 and response.json() == {
        "message": "Username can only contain alphanumeric characters and underscores"
    }


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_register_input_length_invalid(data_init):
    email_address = "z5289625@ad.unsw.edu.au"
    username = "AdamSmith123"
    first_name = "Adam"
    last_name = ""
    password = "AdamSmith123aA!"

    user_params = {
        "email_address": email_address,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "password": password,
    }

    response = requests.post(baseURL + "/auth/register", json=user_params)

    assert response.status_code == 400 and response.json() == {
        "message": "Please ensure all required fields are filled in with at least 1 alphanumeric character"
    }


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_get_token_id(data_init):
    token = data_init[0]
    print(token)
    assert token != None
    assert user_auth.token_val(token) != None


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_token_gen(data_init):
    token = data_init[0]
    user = data_init[1]
    test = user_auth.token_gen(
        user["_id"],
        user["username"],
        user["first_name"],
        user["last_name"],
        user["email_address"],
        user["moderator"],
    )
    data1 = user_auth.token_val(test)
    assert data1 != None

    data2 = user_auth.token_val(token)
    assert data2 != None

    assert data1["username"] == data2["username"]
    assert data1["_id"] == data2["_id"]
    assert data1["first_name"] == data2["first_name"]
    assert data1["last_name"] == data2["last_name"]
    assert data1["email_address"] == data2["email_address"]


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_auth_reset(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/auth/reset", json={"token": token, "password": "123422aB!"}
    )
    assert user_auth.token_val(token) != None
    print(response.text)
    assert response.status_code == 200


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_auth_recover(data_init):
    response = requests.post(
        baseURL + "/auth/recover", json={"email": "sample@email.com"}
    )
    print(response.text)
    assert response.status_code == 200
