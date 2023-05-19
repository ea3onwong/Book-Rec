from dummyData import gen_data
import pymongo
import user_auth
import os
import pytest
import get_client

# Get connection to db
client = get_client.get_client()


@pytest.fixture
def data_init(request):
    """
    Wrapper for test funcitons that sets up some of the required things for testing.\n
    In order to use test functions should accept a token, user_info from database and a connection to the database
    """

    db = request.param[0]
    username = request.param[1]
    reset_username = None

    if len(request.param) >= 3:
        reset_username = request.param[2]

    # Empty database and populate it with dummy data
    gen_data(db, reset_username, client)

    # Get user info by username and generate token for user
    users = client[db]["users"]
    user = users.find_one({"username": username})
    token = user_auth.get_token_id(user["_id"])

    # Get two book info (for review_test)
    books = client[db]["books"]
    book0 = books.find_one({"title": "The Skull Beneath the Skin"})
    book1 = books.find_one({"title": "Lord of the Flies"})

    # TODO: change to dictionary
    return [token, user, users, book0, book1, user["_id"]]
