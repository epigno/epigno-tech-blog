---
title: Testing with flask
description: Ramblings about testing with flask
# img: /img/flask/logo.svg
# alt: Flask logo
author:
  name: Malik Olivier Boussejra
  slug: olivier
  bio: CTO at Epigno
  img: /img/authors/pic-malik-olivier-boussejra.jpg
createdAt: 2018-08-01
updatedAt: 2018-08-01
tags:
  - python
  - web development
---

Having used Rails (and Django) in the past, and after reading The Rails 5
Way, I got a bit used to the ruling principles of Rails: opinionated and
convention over configuration. Whether you like it or not, there is a way to
do things, and you'll have to follow the rules (or leave).

In a way, this is a real time and energy saver.
No need to argue with anyone about the pros and the cons of whatever the
possible toolkits to do whatever common task associated with web development.
No need to argue about other trivialities such as the most appropriate directory
structure to save the codes for your models.

When you inherit a Rails project, either you know Rails and you know where you
can expect to find stuff, or you don't know Rails and you first read The Rails Way.

I've been spoon-fed by Rails. Having done a few projects using Node, I knew about
the other *way* to build a server: the way in which you can afford (the cost?)
to choose the most appropriate solution for your problem, or roll up your own,
the *way* for which there was no easy one-Google-search-away solution.

That's when I met with Flask. God, did the world change.

How should I do *X*? Well who knows? Is there any best practice?
Well not really. Maybe something alike best practice specific to Flask
exists somewhere. I would like to be proven wrong.

So I wanted to test a flask application.
I could not find much resources.

After choosing a test framework (pytest), I went on. Here is what I learned.
Though RSpec was complex, all the "plumbing" was basically already done for you.
In flask, nothing of the sort is available.

## Writing tests with flask

### Client setup

We will assume you have a `your_app.py` file defined in the root of your working
directory. This files instantiate your app. It could be as simple as the following
snippet:

```py
from flask import Flask

app = Flask(__name__)
# ...
# Load config
# Register blueprints / extension
```

Let's write a test:

```py
class TestLogin:
    def test_login_page(self, client):
        response = client.get("/login")
        assert response.status_code == 200
```

But what is this "client" parameter?
This client parameter is a [pytest fixture](https://docs.pytest.org/en/latest/fixture.html).
Fixtures are automatically loaded a `conftest.py` in (or above) the directory
where the test is defined.

We'll have to starting from the Flask instance to make fixtures.
The first thing to understand is that the Flask instance is an object
like any other with which you an play around.
You can open an `ipython` session and simply import your app object and have fun
with it (this is a real debug advice)!


```py
import pytest

from your_app import app as _app

@pytest.fixture
def client(app):
    """Get a test client for your Flask app"""
    return app.test_client()

@pytest.fixture
def app():
    """Yield your app with its context set up and ready"""

    with _app.app_context():
        yield _app
```

As you can see, a pytest fixture can return or yield an object.
If an object is yielded, the part of the function after `yield` is run
after the test finish, during the tear-down process.

The `with` keyword above manages the context for us.
The `app` fixture could as well be written as follows:

```py
import pytest

from your_app import app as _app

@pytest.fixture
def app():
    """Yield your app with its context set up and ready"""
    # Set up: Establish an application context
    ctx = _app.app_context()
    ctx.push()

    yield _app

    # Tear down: run this after the tests are completed
    ctx.pop()
```


Going back to our test, it's still a bit ugly. We could write it as follows:

```py
from flask import url_for

class TestLogin:
    def test_login_page(self, client):
        # Use url_for to generate the URL for the endpoint directing the route "/login".
        # If you want to test the logic of user.login, there is no need to include
        # the route in the tests.
        response = client.get(url_for("user.login"))
        assert response.status_code == 200
```

### DB setup

Until now, it was easy! Now we need to set up the database.
The following code may be somewhat back-end specific. We will assume that you
are using SQL-Alchemy along with the `flask_sqlalchemy` extension, and that
you have only one database server as backend.

You will probably need to setup a test database besides a development---again something
that Rails does for you so seamlessly that you may not realize at first how it's
set up (I wonder if some Rails developer never realized that tests run on the test database haha).
You'll have to change the dev database to the test database. You'll need to update
the configuration of the app during tests. Let's go back to our app fixture.

```py
import pytest
from your_app import app as _app

@pytest.fixture
def app():
    # Append "_test" to the name of the DB used for tests
    db_uri = _app.config["SQLALCHEMY_DATABASE_URI"]
    test_db_uri = f"{db_uri}_test"
    _app.update(SQLALCHEMY_DATABASE_URI=test_db_uri)

    with _app.app_context():
        yield _app
```

Ok, so now our app is configure to run tests on a test database!
Let's set up a DB context. I will assume you defined your instance of `flask_sqlalchemy.SQLAlchemy` as `db` in `your_app.py`.
`your_app.py` may now look like this:

```py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
db = SQLAlchemy()
db.init_app(app)
# ...
```

Next, let's define our db fixture:

```py
import pytest
from your_app import db as _db

@pytest.fixture
def db(app):
    # Even though the "app" fixture is not used in this function, the context
    # of the app object need to be loaded for everything to work smoothly. Ugh...

    # We clean up the database before running each unit test
    _db.drop_all()
    _db.create_all()

    return _db
```


And then you can define the fixtures for your models!

```py
import pytest
from your_app import MyModel

@pytest.fixture
def my_model(db):
    # Set up
    model = MyModel(name="Foo Bar")
    db.session.add(model)
    db.session.commit()

    return model
```

### Fixtures a bit more in depth

I can hear you from here. **"But my tests are so zetta slow!!!"**

Well, if you want your tests to be faster and if you cannot afford to use an
in-memory SQLite DB for your tests, then the plumbing will have to get more
complex.

The `db` fixture above is called for every unit test. Basically, that means
you are dropping and creating the database for *every* test.

Personnaly, if I did not care about speed, I would stay in slow land, as
it really becomes messy to keep a coherent database accross tests.


We'll have to again change our `app` and `db` fixtures so that the same
object be used for all tests. Thus, pytest will not have to intantiate a new fixture for
each test and drop/create the DB for every function.
Thankfully, pytest supports test scopes. Let's use them.

```py
# When setting the scope to "session", the objects will be instantiated only once
@pytest.fixture(scope="session")
def app():
    db_uri = _app.config["SQLALCHEMY_DATABASE_URI"]
	test_db_uri = f"{db_uri}_test"
    _app.update(SQLALCHEMY_DATABASE_URI=test_db_uri)

    with _app.app_context():
        yield _app

@pytest.fixture(scope="session")
def db(app):
	_db.drop_all()
	_db.create_all()

    return _db
```

However, now we must pay attention to spill-over between tests. So we need to
apply a strict pattern for our fixtures.
In my opinion, most fixtures for your models should obey this following pattern:

1. Set up
2. Yield
3. Tear down

Here is the result:

```py
import pytest
from your_app import MyModel

@pytest.fixture
def my_model(db):
    # Set up
    model = MyModel(name="Foo Bar")
    db.session.add(model)
    db.session.commit()

    yield model

    # Tear down
    db.session.delete(model)
    db.session.commit()
```

Now we are deleting all the fixtures that are created in-between tests.
However, this will not delete the records that your tests may create.
That's why you may as well create a scoped session for your tests (if your DB
back-end supports it, e.g. PostgreSQL).

```py
import pytest

@pytest.fixture
def session(db):
	db.session.begin_nested()

	yield db.session

	db.session.rollback()
```
(Thanks to this [SO post](https://stackoverflow.com/questions/26555125/rollback-transactions-not-working-with-py-test-and-flask#26624146))

If you do use the "session" fixture though, you will have to thoroughly use the
session fixture in each of your tests that touch the DB. Beware of failures!
