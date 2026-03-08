"""
app/integrations/outlook_calendar.py - Outlook Calendar OAuth 2.0 Helpers
"""

import os
import msal
from typing import Dict, Any

# Scopes for Microsoft Graph API
SCOPES = ["https://graph.microsoft.com/Calendars.Read"]

def _build_msal_app() -> msal.ConfidentialClientApplication:
    """Build the MSAL app instance."""
    client_id = os.environ.get("OUTLOOK_CLIENT_ID")
    client_secret = os.environ.get("OUTLOOK_CLIENT_SECRET")
    authority = "https://login.microsoftonline.com/common"

    if not client_id or not client_secret:
        raise ValueError("OUTLOOK_CLIENT_ID or OUTLOOK_CLIENT_SECRET not set in environment")

    return msal.ConfidentialClientApplication(
        client_id,
        authority=authority,
        client_credential=client_secret
    )

def get_outlook_auth_url(state: str) -> str:
    """
    Generate the Microsoft OAuth consent screen URL.
    `state` carries the user's JWT so we can identify them in the callback.
    """
    client = _build_msal_app()
    redirect_uri = os.environ.get("OUTLOOK_REDIRECT_URI", "http://localhost:8000/auth/outlook/callback")
    
    auth_url = client.get_authorization_request_url(
        scopes=SCOPES,
        redirect_uri=redirect_uri,
        state=state
    )
    return auth_url

def exchange_code_for_outlook_tokens(code: str) -> Dict[str, Any]:
    """Exchange an authorization code for access and refresh tokens."""
    client = _build_msal_app()
    redirect_uri = os.environ.get("OUTLOOK_REDIRECT_URI", "http://localhost:8000/auth/outlook/callback")
    
    result = client.acquire_token_by_authorization_code(
        code,
        scopes=SCOPES,
        redirect_uri=redirect_uri
    )
    
    if "error" in result:
        raise ValueError(f"Failed to exchange Outlook code for tokens: {result.get('error_description')}")
        
    return {
        "access_token": result.get("access_token"),
        "refresh_token": result.get("refresh_token"),
    }

def refresh_outlook_token(refresh_token: str) -> Dict[str, Any]:
    """Refresh an Outlook access token using the refresh token."""
    client = _build_msal_app()
    result = client.acquire_token_by_refresh_token(
        refresh_token,
        scopes=SCOPES
    )
    
    if "error" in result:
        raise ValueError(f"Failed to refresh Outlook tokens: {result.get('error_description')}")
        
    return {
        "access_token": result.get("access_token"),
        "refresh_token": result.get("refresh_token"),
    }

def get_outlook_calendar_events(access_token: str, start_iso: str, end_iso: str) -> list:
    """
    Fetch calendar events from MS Graph API for the given time range.
    """
    import httpx
    
    # MS Graph endpoint for calendar view (handles recurring events expand)
    url = f"https://graph.microsoft.com/v1.0/me/calendarview"
    params = {
        "startDateTime": start_iso,
        "endDateTime": end_iso
    }
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Prefer": 'outlook.timezone="UTC"'
    }
    
    with httpx.Client() as client:
        response = client.get(url, params=params, headers=headers)
        if response.status_code != 200:
            print(f"Error fetching Outlook events: {response.text}")
            return []
            
        data = response.json()
        return data.get("value", [])
