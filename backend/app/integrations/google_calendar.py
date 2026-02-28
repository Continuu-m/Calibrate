"""
app/integrations/google_calendar.py - Google Calendar OAuth 2.0 Helpers
"""

import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]


def _build_flow() -> Flow:
    """Build a Flow from env vars."""
    client_config = {
        "web": {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET", ""),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")],
        }
    }
    return Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback"),
    )


def get_google_auth_url(state: str) -> str:
    """
    Generate the Google OAuth consent screen URL.
    `state` carries the user's JWT so we can identify them in the callback.
    """
    flow = _build_flow()
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state
    )
    return authorization_url


def exchange_code_for_tokens(code: str) -> dict:
    """Exchange an authorization code → access + refresh tokens."""
    flow = _build_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    return {
        "access_token": creds.token,
        "refresh_token": creds.refresh_token,
    }


def get_calendar_service(access_token: str, refresh_token: str):
    """Build a refreshable Google Calendar API client."""
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID", ""),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET", ""),
        scopes=SCOPES,
    )
    return build("calendar", "v3", credentials=creds)
