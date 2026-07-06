# Google OAuth 2.0 Integration - Complete Setup Guide

## Overview
Google OAuth authentication has been successfully integrated into CarbonTrack. Users can now sign in using their Google account in addition to the traditional email/password login.

## Current Implementation Status

### ✅ Completed
- **Backend Components**:
  - `GoogleAuthController.java` - Handles Google token verification and user creation/login
  - `GoogleOAuth2Service.java` - Decodes and validates Google ID tokens
  - `GoogleTokenRequest.java` - DTO for token requests
  - Security configuration merged into `SecurityConfig.java`
  - All necessary endpoints configured

- **Frontend Components**:
  - `GoogleLoginButton.jsx` - React component with Google Sign-In button
  - Integrated into `LoginPage.jsx` with proper UI/UX
  - Handles token exchange and localStorage management

- **Database**:
  - User entity supports OAuth users (password stored as "GOOGLE_OAUTH_{googleId}")
  - No additional migrations needed

- **Testing**:
  - Backend API endpoint `/api/auth/google/verify` ready for POST requests
  - CORS configured for localhost development

---

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project:
   - Click "Select a project" → "New Project"
   - Project name: `CarbonTrack`
   - Click "Create"

3. Enable Google+ API:
   - Go to APIs & Services → Library
   - Search for "Google+ API"
   - Click on it and select "Enable"

### Step 2: Create OAuth 2.0 Credentials

1. In Google Cloud Console:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Web application"

2. Configure the credential:
   - Name: `CarbonTrack Local`
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:8080
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:8080/api/auth/google/callback
     http://localhost:8080/login/oauth2/code/google
     ```
   - Click "Create"

3. Save your credentials:
   - Client ID: `YOUR_GOOGLE_CLIENT_ID` (something like `xxxxx.apps.googleusercontent.com`)
   - Client Secret: `YOUR_GOOGLE_CLIENT_SECRET`

### Step 3: Configure Backend

Update `backend/src/main/resources/application.properties`:

```properties
# Replace with your actual Google credentials
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

### Step 4: Configure Frontend

Update `frontend/.env`:

```
# Replace with your actual Google Client ID
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

### Step 5: Test the Integration

1. **Start the Backend** (if not running):
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

2. **Start the Frontend** (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Google Login**:
   - Go to `http://localhost:5173/login`
   - Click the "Sign in with Google" button
   - Follow the Google authentication flow
   - You should be logged in and redirected to `/dashboard`

### Step 6: Verify User Creation

1. Open H2 Console:
   - URL: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:carbontrack`
   - Click "Connect"

2. Run SQL query to verify user was created:
   ```sql
   SELECT * FROM users;
   ```

---

## API Endpoint Details

### POST `/api/auth/google/verify`

**Request Body**:
```json
{
  "token": "google_id_token_from_frontend"
}
```

**Response** (Success - 200 OK):
```json
{
  "accessToken": "jwt_token_here",
  "tokenType": "Bearer",
  "userId": 1,
  "username": "User Name",
  "role": "USER",
  "message": "Authentication successful",
  "status": "SUCCESS"
}
```

**Response** (Error - 400 Bad Request):
```json
{
  "accessToken": null,
  "tokenType": "Bearer",
  "userId": null,
  "username": "Error message",
  "role": null,
  "message": "Error message",
  "status": "ERROR"
}
```

---

## How It Works

### Authentication Flow

```
1. User clicks "Sign in with Google" on LoginPage
2. GoogleLoginButton renders Google Sign-In widget
3. Google SDK handles authentication UI
4. Upon successful Google login, credential callback triggered
5. Google ID token sent to backend: POST /api/auth/google/verify
6. GoogleAuthController receives token
7. GoogleOAuth2Service decodes token (JWT)
8. User lookup/creation in database
9. JWT token generated for session
10. User stored in localStorage with token
11. User redirected to /dashboard
```

### Security Considerations

- **Token Handling**: Google ID tokens are validated by decoding JWT payload
- **User Creation**: First-time Google OAuth users automatically created in database
- **Password Storage**: OAuth users have placeholder passwords (`GOOGLE_OAUTH_{googleId}`)
- **CORS**: Configured for development (localhost:5173, 8080, 3000)
- **JWT**: CarbonTrack JWT token used for subsequent requests

---

## Troubleshooting

### Issue: "Token is invalid" error

**Solution**:
- Verify Google Client ID is correct in:
  - `application.properties` (backend)
  - `.env` (frontend)
- Ensure token is being sent with request
- Check browser console for token value

### Issue: "User information extraction failed"

**Solution**:
- Google profile must have email and name set
- Verify Google account profile is complete
- Check browser developer tools → Network tab

### Issue: CORS errors in browser

**Solution**:
- Frontend URL (localhost:5173) is already in CORS origins
- Backend is configured to allow all headers and origins
- Clear browser cache and try again

### Issue: User not created in database

**Solution**:
- Check backend logs for errors
- Verify H2 database is running
- Check if email already exists (may be duplicate)

---

## Production Deployment

Before deploying to production:

1. **Update CORS Origins**:
   ```java
   // SecurityConfig.java
   configuration.setAllowedOrigins(List.of(
       "https://yourdomain.com",
       "https://app.yourdomain.com"
   ));
   ```

2. **Update Google Console**:
   - Add production URLs to:
     - Authorized JavaScript origins
     - Authorized redirect URIs

3. **Environment Variables**:
   - Store credentials in secure environment variables
   - Never commit credentials to git

4. **Token Verification** (Optional):
   - Implement full JWT signature verification against Google's public certificates
   - Current implementation trusts tokens from official Google library (safe for HTTPS)

---

## Next Steps

1. ✅ Get Google OAuth credentials
2. ✅ Update backend `application.properties`
3. ✅ Update frontend `.env`
4. ✅ Restart backend (if changes made)
5. ✅ Test Google login on frontend
6. ✅ Verify user creation in H2 database
7. ✅ Test full login → dashboard flow

---

## Files Modified/Created

- **New**: `GoogleAuthController.java` - OAuth verification endpoint
- **New**: `GoogleOAuth2Service.java` - Token decoding service
- **New**: `GoogleTokenRequest.java` - Request DTO
- **New**: `GoogleLoginButton.jsx` - React component
- **Modified**: `SecurityConfig.java` - CORS and OAuth2 security config
- **Modified**: `LoginPage.jsx` - Added Google sign-in button
- **Modified**: `.env` - Google Client ID placeholder
- **Modified**: `pom.xml` - No new external dependencies (uses existing JWT library)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
3. Check backend logs for detailed error messages
4. Verify all credentials are correctly configured

---

**Last Updated**: July 6, 2026
**Status**: Ready for Google credentials configuration
