import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.testing = True
    with app.test_client() as client:
        yield client

# def test_redirect_unlogged_user(client):
#
#     response = client.get("/api/questions", follow_redirects=False)
#
#     assert response.status_code == 302
#     assert "/login?next=" in response.location