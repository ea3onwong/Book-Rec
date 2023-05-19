import sys
import pymongo
import requests

sys.path.insert(0, "..")
import pytest
from data_init import data_init

baseURL = "http://127.0.0.1:5000"


def test_search_books_not_empty():
    query = 'intitle:Harry Potter inauthor:"J. K. Rowling"'
    response = requests.get(baseURL + "/search/books", params={"query": query})
    assert response.json() != [] and response.status_code == 200


def test_search_books_correct_output():
    query = 'intitle:Harry Potter inauthor:"J. K. Rowling"'
    response = requests.get(
        baseURL + "/search/books", params={"query": query, "start_index": "2"}
    )
    res = response.json()
    assert len(res) > 0 and response.status_code == 200
    assert (
        "Harry Potter" in res[0]["title"]
        and "J. K. Rowling" in res[0]["authors"]
        and res[0]["book_id"] != ""
    )


def test_search_books_correct_fields():
    query = 'intitle:Harry Potter inauthor:"J. K. Rowling"'
    response = requests.get(baseURL + "/search/books", params={"query": query})
    res = response.json()
    assert len(res) > 0 and response.status_code == 200
    assert (
        "book_id" in res[0]
        and "title" in res[0]
        and "authors" in res[0]
        and "summary" in res[0]
        and "publisher" in res[0]
        and "publication_date" in res[0]
        and "categories" in res[0]
        and "average_rating" in res[0]
        and "image_link" in res[0]
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_search_users_not_empty(data_init):
    query = "edelgard"
    response = requests.get(baseURL + "/search/users", params={"query": query})
    assert response.json() != [] and response.status_code == 200


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_search_users_correct_fields(data_init):
    query = "claude"
    response = requests.get(baseURL + "/search/users", params={"query": query})
    res = response.json()
    assert len(res) > 0 and response.status_code == 200
    assert (
        "_id" in res[0]
        and "username" in res[0]
        and "first_name" in res[0]
        and "last_name" in res[0]
    )


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_search_users_partial_name(data_init):
    query = "diMi"
    response = requests.get(baseURL + "/search/users", params={"query": query})
    res = response.json()
    assert len(res) > 0 and response.status_code == 200


@pytest.mark.parametrize("data_init", [["db", "edelgard"]], indirect=["data_init"])
def test_search_users_full_name(data_init):
    query = "Edelgard vOn hrEsvelg"
    response = requests.get(baseURL + "/search/users", params={"query": query})
    res = response.json()
    assert len(res) > 0 and response.status_code == 200
