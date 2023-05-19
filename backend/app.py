from flask import Flask
from flask_mail import Mail, Message
from auth import AUTH
from user import USER
from bookRecCollections import COLLECTIONS
from book import BOOK
from flask_cors import CORS
from review import REVIEW
from search import SEARCH
from recommender import RECOMMENDER
from nyt import NYT
import os
import requests
import pymongo


app = Flask(__name__)
CORS(app)

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USR")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PWD")
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True

mail = Mail(app)

app.register_blueprint(AUTH)
app.register_blueprint(USER)
app.register_blueprint(COLLECTIONS)
app.register_blueprint(BOOK)
app.register_blueprint(REVIEW)
app.register_blueprint(SEARCH)
app.register_blueprint(RECOMMENDER)
app.register_blueprint(NYT)

if __name__ == "__main__":
    myclient = pymongo.MongoClient(
        "mongodb+srv://"
        + os.getenv("DB_USR")
        + ":"
        + os.getenv("DB_PWD")
        + "@group1-db.muxufih.mongodb.net/?retryWrites=true&w=majority"
    )
    app.config["DATABASE"] = myclient["db"]
    app.run(host="127.0.0.1", port=5000, debug=True)
