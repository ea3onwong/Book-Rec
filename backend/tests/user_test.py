import requests
import pymongo
import os
import sys

sys.path.insert(0, "..")
import user_auth
import pytest
from data_init import data_init
from datetime import datetime


baseURL = "http://127.0.0.1:5000"

@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_edit_username(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/user/edit", json={"token": token, "username": "Billy Bob"}
    )
    assert response.status_code == 200
    data = user_auth.token_val(response.json()["token"])
    assert data != None
    assert data["username"] == "Billy Bob"


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_edit_repeat_username(data_init):
    token = data_init[0]
    response = requests.post(
        baseURL + "/user/edit", json={"token": token, "username": "edelgard"}
    )
    assert response.status_code == 400
    
@pytest.mark.parametrize('data_init', [["db", 'edelgard', 'edelgard']], indirect=['data_init'])
def test_user_invalid_email(data_init):
     token = data_init[0]
     response = requests.post(baseURL + "/user/edit", json={'token': token, "email_address": 'thisisnotavalidemaillol'})
     assert response.status_code == 400

@pytest.mark.parametrize('data_init', [["db", 'edelgard', 'edelgard']], indirect=['data_init'])
def test_user_repeat_email(data_init):
     token = data_init[0]
     user_params = {'email_address': 'z5289625@ad.unsw.edu.au', 
              'username': 'AdamSmith123', 
              'first_name': 'Adam', 
              'last_name': 'Smith', 
              'password': 'AdamSmith123aA!'}
     response = requests.post(baseURL + "/auth/register", json=user_params)
     response = requests.post(baseURL + "/user/edit", json={'token': token, "email_address": 'z5289625@ad.unsw.edu.au'})
     assert response.status_code == 400

@pytest.mark.parametrize('data_init', [["db", 'edelgard', 'edelgard']], indirect=['data_init'])
def test_user_edit_username(data_init):
     token = data_init[0]
     response = requests.post(baseURL + "/user/edit", json={'token': token, 'username': 'Billy_Bob'})
     assert response.status_code == 200
     data = user_auth.token_val(response.json()["token"])
     assert data != None
     assert data["username"] == "Billy_Bob"

@pytest.mark.parametrize('data_init', [["db", 'edelgard', 'edelgard']], indirect=['data_init'])
def test_user_edit_repeat_username(data_init):
     token = data_init[0]
     response = requests.post(baseURL + "/user/edit", json={'token': token, 'username': 'edelgard'})
     assert response.status_code == 400

@pytest.mark.parametrize('data_init', [["db", 'edelgard', 'edelgard']], indirect=['data_init'])
def test_user_invalid_username(data_init):
     token = data_init[0]
     response = requests.post(baseURL + "/user/edit", json={'token': token, 'username': 'Edelgard von Hresvelg'})
     assert response.status_code == 400

@pytest.mark.parametrize('data_init', [["db", 'edelgard', 'edelgard']], indirect=['data_init'])
def test_user_invalid_password(data_init):
     token = data_init[0]
     response = requests.post(baseURL + "/user/edit", json={'token': token, 'current_password': "totallySecurePassword", 'new_password': 'a'})
     assert response.status_code == 400


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_profile(data_init):
    token = data_init[0]
    response = requests.get(
        baseURL + "/user/profile", params={"token": token, "userid": data_init[5]}
    )
    assert response.status_code == 200
    assert response.json()["first_name"] == "Edelgard"


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_profile_wrong_user(data_init):
    token = data_init[0]
    response = requests.get(
        baseURL + "/user/profile", params={"token": token, "userid": "Bleh"}
    )
    assert response.status_code == 400


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_profile_invalid_token_simple(data_init):
    token = data_init[0]
    response = requests.get(
        baseURL + "/user/profile", params={"token": "bleh", "userid": data_init[5]}
    )
    assert response.status_code == 400


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_profile_invalid_token_proper(data_init):
    token = data_init[0]
    # bad_token = token[:1] + "a" + token[2:]
    response = requests.get(
        baseURL + "/user/profile", params={"token": "bad_token", "userid": data_init[5]}
    )
    assert response.status_code == 400


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_profile_2(data_init):
    token = data_init[0]
    response = requests.get(
        baseURL + "/user/profile", params={"token": token, "userid": data_init[5]}
    )
    print(response.text)
    assert response.status_code == 200


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_read_goal_in_progress(data_init):
    token = data_init[0]
    book = data_init[3]

    response = requests.post(
        baseURL + "/user/set_read_goal",
        json={"token": token, "num_books": 2, "timeframe": "Week"},
    )
    assert response.status_code == 200 and response.json() != {}

    response1 = requests.post(
        baseURL + "/book/read_book", json={"token": token, "book_id": book["book_id"]}
    )
    assert response1.status_code == 200

    response2 = requests.get(
        baseURL + "/user/get_read_goal_progress", params={"token": token}
    )
    assert response2.json() == "1 / 2"

    response3 = requests.get(
        baseURL + "/user/get_read_goal_achieve_date", params={"token": token}
    )
    assert response3.json() == None


@pytest.mark.parametrize(
    "data_init", [["db", "edelgard", "edelgard"]], indirect=["data_init"]
)
def test_user_read_goal_achieve(data_init):
    token = data_init[0]
    book = data_init[3]

    response = requests.post(
        baseURL + "/user/set_read_goal",
        json={"token": token, "num_books": 1, "timeframe": "Week"},
    )
    assert response.status_code == 200 and response.json() != {}

    response1 = requests.post(
        baseURL + "/book/read_book", json={"token": token, "book_id": book["book_id"]}
    )
    assert response1.status_code == 200

    response2 = requests.get(
        baseURL + "/user/get_read_goal_progress", params={"token": token}
    )
    assert response2.json() == "1 / 1"

    response3 = requests.get(
        baseURL + "/user/get_read_goal_achieve_date", params={"token": token}
    )
    assert response3.json() == datetime.today().strftime("%Y-%m-%d")
