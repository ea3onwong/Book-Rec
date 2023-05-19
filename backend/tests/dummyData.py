"""
users {
    _id: ObjectID
    email_address: str
    username: str
    first_name: str
    last_name: str
    password: bytes
    salt: bytes
    main_collection: []
    collection_list: [collection]
    bio: str
    moderator: boolean
    exp: DateTime
    reading_goal : {
        "timeframe": str ('week', 'month' or 'year')
        "start_date": DateTime (str)
        "end_date": DateTime (str)
        "achieve_date": None / DateTime (str)
        "num_books": int
        "books_read": int
        "goal_met": boolean
    } 
}

collection {
    name: str
    book_list: []
    description: str
}

reviews {
    _id: ObjectID
    book_id: str
    user_id: ObjectID
    rating_included: boolean
    review_date: DateTime (str)
    rating: double
    review_text: str
}

books {
    _id: ObjectID
    book_id: str
    title: str
    authors: str
    summary: str
    publisher: str
    publication_date: str
    categories: str?
    average_rating: str/double
    image_link: str
    isbn: string
    is_free: boolean 
}

books_read {
    book_id: str 
    user_id: str 
    date_read: DateTime (str)
}

"""
import pymongo
import bcrypt
import os
import datetime


def gen_users(users, username=None):
    users.delete_many({})

    user0_salt = bcrypt.gensalt()
    user0 = {
        "email_address": "sample@email.com",
        "username": "edelgard",
        "first_name": "Edelgard",
        "last_name": "von Hresvelg",
        "password": bcrypt.hashpw("totallySecurePassword".encode("utf-8"), user0_salt),
        "salt": user0_salt,
        "main_collection": [],
        "collection_list": [],
        "bio": "",
        "moderator": False,
        "recently_added": [],
        "reading_goal": {},
    }

    user1_salt = bcrypt.gensalt()
    user1 = {
        "email_address": "sample1@email.com",
        "username": "dimitri",
        "first_name": "Dimitri Alexandre",
        "last_name": "Blaiddyd",
        "password": bcrypt.hashpw("hunter2".encode("utf-8"), user1_salt),
        "salt": user1_salt,
        "main_collection": [],
        "collection_list": [{"name": "faves", "book_list": [], "description": ""}],
        "bio": "",
        "moderator": True,
        "recently_added": [],
        "reading_goal": {},
    }

    user2_salt = bcrypt.gensalt()
    user2 = {
        "email_address": "sample2@email.com",
        "username": "claude",
        "first_name": "Claude",
        "last_name": "von Riegan",
        "password": bcrypt.hashpw("actua11y$ecur3P4ssw0rd".encode("utf-8"), user2_salt),
        "salt": user2_salt,
        "main_collection": [],
        "collection_list": [],
        "bio": "",
        "moderator": False,
        "recently_added": [],
        "reading_goal": {},
    }

    user3_salt = bcrypt.gensalt()
    user3 = {
        "email_address": "sa2122@email.com",
        "username": "clade",
        "first_name": "Clade",
        "last_name": "van rian",
        "password": bcrypt.hashpw(
            "actua11y$ecur3P4ssw0rd2".encode("utf-8"), user2_salt
        ),
        "salt": user3_salt,
        "main_collection": [],
        "collection_list": [],
        "bio": "",
        "moderator": False,
        "recently_added": [],
        "reading_goal": {},
    }

    user_list = [user0, user1, user2, user3]
    if username is None:
        users.insert_many(user_list)
    else:
        user = next(usr for usr in user_list if usr["username"] == username)
        if user is None:
            print("Bad user")
        else:
            users.insert_one(user)


def gen_books(books):
    books.delete_many({})
    book0 = {
        "title": "The Skull Beneath the Skin",
        "book_id": "1",
        "authors": "You now who",
        "summary": "A mystery story full of intrigue and twists that will surely rattle your bones",
        "publisher": "Biomedical industries",
        "publication_date": "2000 B.C",
        "categories": "Mystery",
        "average_rating": 0,
        "image_link": "https://tinyurl.com/22puwfh2",
    }
    book1 = {
        "title": "Lord of the Flies",
        "book_id": "2",
        "authors": "Beelzebub",
        "summary": "A story about family and community",
        "publisher": "Penguin",
        "publication_date": "today",
        "categories": "Survival, Kid friendly",
        "average_rating": 5,
        "image_link": "https://tinyurl.com/22puwfh2",
        "isbn": "No ISBN",
    }
    book2 = {
        "title": "Lessons in Chemistry",
        "book_id": "3",
        "authors": "me",
        "publisher": "also me",
        "publication_date": "2077",
        "categories": "Fiction",
        "average_rating": 3,
        "image_link": "https://tinyurl.com/22puwfh2",
        "isbn": "038554734X",
    }
    book3 = {
        "title": "Poor Richard's Almanack",
        "book_id": "4",
        "authors": "Benjamin Franklin",
        "publisher": "idk",
        "publication_date": "17 something",
        "categories": "Non Fiction",
        "average_rating": 4,
        "image_link": "https://tinyurl.com/22puwfh2",
        "isbn": "0880889187",
    }
    books.insert_many([book0, book1, book2, book3])


def gen_reviews(reviews, users, books):
    reviews.delete_many({})
    user_id = users.find_one({"username": "edelgard"})["_id"]
    book_id = books.find_one({"title": "Lord of the Flies"})["book_id"]
    review = {
        "book_id": book_id,
        "user_id": user_id,
        "rating_included": True,
        "review_date": "2000-01-01",
        "rating": 5,
        "review_text": "Really good book. 10/10 would recommend",
    }
    reviews.insert_one(review)


ran_once = False


def gen_data(db, username, client):
    """
    Generates dummy data and adds it to the database for testing.
    Upon being called deletes any existing data in the database
    """

    global ran_once

    users = client[db]["users"]
    reviews = client[db]["reviews"]
    books = client[db]["books"]
    books_read = client[db]["books_read"]

    ## INITIALISING BOOKS
    if not ran_once:
        gen_books(books)
        gen_users(users)

        ran_once = True

    else:
        gen_users(users, username)

    ## INITIALISING REVIEWS
    gen_reviews(reviews, users, books)

    ## INITIALISING BOOKS_READ
    books_read.delete_many({})
