import pymongo
import os

ran_once = False
client = None


def get_client():
    global client
    global ran_once
    if not ran_once:
        client = pymongo.MongoClient(
            "mongodb+srv://"
            + os.getenv("DB_USR")
            + ":"
            + os.getenv("DB_PWD")
            + "@group1-db.muxufih.mongodb.net/?retryWrites=true&w=majority"
        )
        ran_once = True

    return client
