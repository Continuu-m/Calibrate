# Google OAuth in Docker Setup Guide

## Overview

The Google Calendar integration now works seamlessly in both **localhost development** and **dockerized environments**.

## How It Works

### Redirect URI Configuration

The system automatically computes the Google OAuth redirect URI based on your deployment environment:

```
GOOGLE_REDIRECT_URI = {BACKEND_URL}/auth/google/callback
```

**Priority order:**
1. Explicit `GOOGLE_REDIRECT_URI` environment variable (if set)
2. Derived from `BACKEND_URL` environment variable
3. Fallback: `http://localhost:8000/auth/google/callback`

---

## Running with Docker Compose

### Prerequisites

1. **Google Cloud OAuth Credentials:**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - Register redirect URI in Google Cloud Console:
     - For localhost Docker: `http://localhost:8000/auth/google/callback`
     - For production: `https://yourdomain.com/auth/google/callback`

2. **Update `.env` file:**
   ```bash
   # backend/.env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   # GOOGLE_REDIRECT_URI is auto-computed from BACKEND_URL
   FRONTEND_URL=http://localhost:5173
   ```

### Start Docker Compose

```bash
docker-compose up --build
```

This automatically sets:
- `BACKEND_URL=http://localhost:8000` (in docker-compose.yml)
- Computed `GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback`

### Test OAuth Flow

1. Open frontend: http://localhost
2. Navigate to Settings
3. Click "Connect Google Calendar"
4. Approve permissions in Google consent screen
5. Should redirect back to settings with success

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `BACKEND_URL` | Base URL for redirect URI | `http://localhost:8000` |
| `GOOGLE_CLIENT_ID` | OAuth App ID | `1234567890.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth App Secret | `GOCSPX-xxxxx` |
| `GOOGLE_REDIRECT_URI` | (Optional) Explicit override | `http://localhost:8000/auth/google/callback` |
| `FRONTEND_URL` | Frontend URL for OAuth redirects | `http://localhost:5173` |
| `OAUTHLIB_INSECURE_TRANSPORT` | Dev-only flag for HTTP OAuth | `1` |

---

## Production Deployment

For production deployments on a custom domain:

### docker-compose.yml

```yaml
backend:
  environment:
    BACKEND_URL: https://yourdomain.com
```

### Update Google Cloud Console

Register the production redirect URI:
```
https://yourdomain.com/auth/google/callback
```

### .env for Production

```
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
FRONTEND_URL=https://yourdomain.com
# OAUTHLIB_INSECURE_TRANSPORT should NOT be set in production
```

---

## Troubleshooting

### "Invalid redirect_uri" Error

**Cause:** Mismatch between registered URI in Google Cloud Console and configured URI

**Solution:**
1. Check Google Cloud Console OAuth credentials
2. Verify `BACKEND_URL` is set correctly
3. Ensure redirect URI is registered in Google: `https://console.cloud.google.com/apis/credentials`

### OAuth Fails in Docker

**Check:**
- Frontend can connect to backend: `curl http://localhost:8000/auth/me`
- `BACKEND_URL` environment variable is set in docker-compose.yml
- Google credentials are correct

**View logs:**
```bash
docker-compose logs -f backend  # Check backend oauth errors
```

---

## How It Works Under the Hood

### Localhost Development (docker-compose)

```
Browser → Frontend (localhost:80)
         ↓
Browser → Backend (localhost:8000)
         ↓ 
Backend generates: http://localhost:8000/auth/google/callback
         ↓
Browser → Google OAuth Consent
         ↓
Google → Browser → Backend (http://localhost:8000/auth/google/callback)
         ↓
Backend exchanges code for tokens
         ↓
Backend → Browser → Frontend (localhost/settings?google_connected=true)
```

### Production (Custom Domain)

Same flow, but with `https://yourdomain.com` instead of `http://localhost:8000`

---

## Files Modified

- `backend/app/integrations/google_calendar.py` - Added `_get_redirect_uri()` helper
- `docker-compose.yml` - Added `BACKEND_URL` environment variable
- `backend/.env` - Removed hardcoded redirect URI
- `backend/.example.env` - Added detailed comments

---

## See Also

- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/auth)
- [OAuth 2.0 Redirect URI](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-13#section-4.1.3)
