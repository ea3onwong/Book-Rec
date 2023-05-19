import jwt
import pymongo
import os
import datetime
import pathlib
from flask import jsonify
from bson.objectid import ObjectId


"""
Function creates a jwt token using the information given and the RSA algorithm
"""


def token_gen(id, username, firstname, lastname, email, moderator):
    # Check to see if id is in ObjectId form or if it is string
    # Important as we can't run jwt encode with an ObjectId

    if type(id) == ObjectId:
        id = str(id)

    data = {
        "_id": id,
        "username": username,
        "first_name": firstname,
        "last_name": lastname,
        "email_address": email,
        "exp": datetime.datetime.now(tz=datetime.timezone.utc)
        + datetime.timedelta(seconds=3000),
        "moderator": moderator,
    }

    path_ssh = os.path.join(os.path.dirname(__file__))
    path_ssh = os.path.join(path_ssh, ".ssh")

    with open(os.path.join(path_ssh, "jwt"), "rb") as f:
        priv = f.read()
        compact_jws = jwt.encode(data, priv, algorithm="RS256")
        return compact_jws


"""
Function to validate the token by trying to decode it using the apps public key
If it fails returns None
"""


def token_val(token):
    path_ssh = os.path.join(os.path.dirname(__file__))
    path_ssh = os.path.join(path_ssh, ".ssh")

    with open(os.path.join(path_ssh, "jwt.pub"), "rb") as f:
        pub = f.read()
        try:
            data = jwt.decode(token, pub, algorithms=["RS256"])
            return data
        except jwt.ExpiredSignatureError:
            # Error due to expired token
            print("Expired")
            return None
        except:
            # Error due to invalid token
            print("NO")
            return None


"""
Function generates a token for an already existing user in the database by querying their id
Return None if id provdided does not exist
"""


def get_token_id(id):
    # Query database for user info
    myclient = pymongo.MongoClient(
        "mongodb+srv://"
        + os.getenv("DB_USR")
        + ":"
        + os.getenv("DB_PWD")
        + "@group1-db.muxufih.mongodb.net/?retryWrites=true&w=majority"
    )
    db = myclient["db"]

    if isinstance(id, str):
        id = ObjectId(id)

    query = db["users"].find_one(
        {"_id": id},
        {
            "_id": 1,
            "username": 1,
            "first_name": 1,
            "last_name": 1,
            "email_address": 1,
            "moderator": 1,
        },
    )
    if query == None:
        return None

    query["_id"] = str(query["_id"])
    query["exp"] = datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(
        seconds=3000
    )

    path_ssh = os.path.join(os.path.dirname(__file__))
    path_ssh = os.path.join(path_ssh, ".ssh")
    with open(os.path.join(path_ssh, "jwt"), "rb") as f:
        priv = f.read()
        compact_jws = jwt.encode(query, priv, algorithm="RS256")
        return compact_jws


if __name__ == "__main__":
    token = token_gen(5, "silverhand", "John", "Silver", "user@yahoo.com", False)
    print(token_val(token))
