"""
app/integrations/google_calendar.py - Google Calendar OAuth 2.0 Helpers
"""

import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]


def _build_flow() -> Flow:
    """Build a Flow from env vars with error handling."""
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI")

    if not client_id or not client_secret:
        raise ValueError("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set in environment")

    try:
        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri],
            }
        }
        return Flow.from_client_config(
            
            client_config,
            scopes=SCOPES,
            redirect_uri=redirect_uri,
        )
    except Exception as e:
        print(f"Error building Google OAuth flow: {e}")
        raise ValueError(f"Failed to initialize Google OAuth flow: {str(e)}")


def get_google_auth_url(state: str) -> str:
    """
    Generate the Google OAuth consent screen URL.
    `state` carries the user's JWT so we can identify them in the callback.
    """
    try:
        flow = _build_flow()
        # Disable PKCE (code verifier) because our API is stateless and we 
        # do not persist the flow instance across requests. PKCE is optional 
        # for confidential server-side clients anyway.
        flow.autogenerate_code_verifier = False
        
        authorization_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
            state=state
        )
        return authorization_url
    except Exception as e:
        print(f"Error generating Google Auth URL: {e}")
        raise ValueError("Could not generate Google authorization URL.")


def exchange_code_for_tokens(code: str) -> dict:
    """Exchange an authorization code → access + refresh tokens."""
    try:
        flow = _build_flow()
        flow.fetch_token(code=code)
        creds = flow.credentials
        return {
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
        }
    except Exception as e:
        print(f"Error exchanging Google code for tokens: {e}")
        raise ValueError("Failed to exchange authorization code for tokens.")


def get_calendar_service(access_token: str, refresh_token: str):
    """Build a refreshable Google Calendar API client."""
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise ValueError("Google Client credentials missing")

    try:
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
            scopes=SCOPES,
        )
        return build("calendar", "v3", credentials=creds)
    except Exception as e:
        print(f"Error building Google Calendar service: {e}")
        raise ValueError("Could not initialize Google Calendar service.")
