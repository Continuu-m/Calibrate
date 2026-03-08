import pytest
from fastapi import status
from unittest.mock import patch, MagicMock

def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_login_user(client):
    # First, register
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "password123",
            "full_name": "Login User"
        }
    )
    
    # Then login
    response = client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    response = client.post(
        "/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

# ─── OAuth Tests ──────────────────────────────────────────────────────────────

@patch("app.integrations.google_calendar.os.environ.get")
@patch("app.integrations.google_calendar.Flow.from_client_config")
def test_google_connect_redirect(mock_flow_config, mock_env_get, auth_client):
    """Test that /auth/google/connect redirects to Google."""
    # Setup mocks
    mock_env_get.side_effect = lambda k, default=None: {
        "GOOGLE_CLIENT_ID": "fake_id",
        "GOOGLE_CLIENT_SECRET": "fake_secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:8000/auth/google/callback"
    }.get(k, default)
    
    mock_flow = MagicMock()
    mock_flow.authorization_url.return_value = ("https://accounts.google.com/o/oauth2/auth?fake=true", "state")
    mock_flow_config.return_value = mock_flow

    response = auth_client.get("/auth/google/connect", follow_redirects=False)
    
    assert response.status_code == status.HTTP_307_TEMPORARY_REDIRECT
    assert "accounts.google.com" in response.headers["location"]

@patch("app.integrations.outlook_calendar.os.environ.get")
@patch("app.integrations.outlook_calendar.msal.ConfidentialClientApplication")
def test_outlook_connect_redirect(mock_msal_app, mock_env_get, auth_client):
    """Test that /auth/outlook/connect redirects to Microsoft."""
    # Setup mocks
    mock_env_get.side_effect = lambda k, default=None: {
        "OUTLOOK_CLIENT_ID": "fake_id",
        "OUTLOOK_CLIENT_SECRET": "fake_secret",
        "OUTLOOK_REDIRECT_URI": "http://localhost:8000/auth/outlook/callback"
    }.get(k, default)
    
    mock_app_instance = MagicMock()
    mock_app_instance.get_authorization_request_url.return_value = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?fake=true"
    mock_msal_app.return_value = mock_app_instance

    response = auth_client.get("/auth/outlook/connect", follow_redirects=False)
    
    assert response.status_code == status.HTTP_307_TEMPORARY_REDIRECT
    assert "login.microsoftonline.com" in response.headers["location"]

