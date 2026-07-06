# Google OAuth 2.0 Setup Guide

**Status**: ✅ Implemented and Ready to Configure

This guide walks you through setting up Google OAuth 2.0 authentication for CarbonTrack.

---

## 🎯 What's Implemented

### Backend
- ✅ Google OAuth 2.0 client support
- ✅ OAuth2 Security Configuration
- ✅ Google Auth Controller
- ✅ Automatic user creation from Google login
- ✅ JWT token generation for Google users

### Frontend
- ✅ Google Sign-In button component
- ✅ OAuth callback handling
- ✅ User session management
- ✅ Responsive design integration

---

## 📋 Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**

### Step 2: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Choose **External** (unless using G Suite)
3. Fill in:
   - **App name**: CarbonTrack
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Add scopes:
   - `userinfo.profile`
   - `userinfo.email`
5. Add test users (your Google account)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **Credentials** → **+ Create Credentials**
2. Select **OAuth 2.0 Client ID** → **Web application**
3. Configure:
   - **Name**: CarbonTrack Web App
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:3000
     https://yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:8080/login/oauth2/code/google
     http://localhost:8080/api/auth/google/callback
     https://yourdomain.com/login/oauth2/code/google
     ```
4. Click **Create**
5. Copy the **Client ID** and **Client Secret**

### Step 4: Configure Backend

Update `backend/src/main/resources/application.properties`:

```properties
# Google OAuth 2.0 Configuration
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID_HERE
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET_HERE
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.provider.google.user-name-attribute=sub

# OAuth2 Login Configuration
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/google
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://accounts.google.com
```

### Step 5: Configure Frontend

Update `frontend/.env`:

```env
# Google OAuth 2.0 Configuration
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
VITE_GOOGLE_API_KEY=YOUR_API_KEY_HERE
```

### Step 6: Update Backend Google Controller

Replace placeholder redirect in `GoogleAuthController.java`:

```java
// Already configured - no changes needed
// Uses application.properties values
```

---

## 🔑 Getting Your Credentials

### Find Your Client ID and Secret

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **Credentials**
2. Find your OAuth 2.0 Client ID (Web application)
3. Click it to view details:
   - **Client ID**: Copy this
   - **Client secret**: Copy this
4. Store these securely:
   - Never commit to git
   - Use environment variables in production

---

## 🧪 Testing Google OAuth

### Local Testing

1. **Ensure backend is running**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Ensure frontend is running**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit login page**:
   - Go to `http://localhost:5173`
   - Click "Sign in with Google"
   - Authenticate with your Google account

4. **Check console for**:
   - Successful authentication message
   - JWT token generation
   - Redirect to dashboard

### Expected Flow

1. User clicks "Sign in with Google"
2. Google consent screen appears
3. User approves access
4. Frontend receives Google token
5. Token sent to backend
6. Backend verifies and creates/updates user
7. JWT token generated
8. User redirected to dashboard
9. Authenticated session established

---

## 📊 Architecture

```
Frontend (React)
    ↓
Google Sign-In Button
    ↓
User authenticates with Google
    ↓
Google OAuth Token received
    ↓
Backend API Call
    ↓
GoogleAuthController
    ↓
Verify Google Token
    ↓
Create/Update User (if new)
    ↓
Generate JWT Token
    ↓
Return Auth Response
    ↓
Frontend stores JWT
    ↓
Authenticated requests to API
```

---

## 🔐 Security Considerations

### Best Practices

1. **Never commit credentials**:
   ```bash
   # Add to .gitignore
   .env.local
   .env.production.local
   ```

2. **Use environment variables** in production:
   ```bash
   export SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=xxx
   export SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=xxx
   ```

3. **Secure redirect URIs**:
   - Only allow https in production
   - Use exact domains only
   - Update when domains change

4. **Token storage**:
   - Frontend: localStorage (default)
   - Send via Authorization header
   - Include HttpOnly flag if possible

5. **CORS configuration**:
   - Already configured in `GoogleOAuth2Config.java`
   - Restricts to localhost in dev
   - Update for production domains

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Solution**: Ensure redirect URI exactly matches:
```
http://localhost:8080/login/oauth2/code/google
```

Check:
- Protocol (http vs https)
- Domain (localhost:8080)
- Path (exactly /login/oauth2/code/google)

### Error: "Invalid client"

**Solution**: Verify Client ID and Secret:
- Copy exact values (no extra spaces)
- Correct format: `xxx-yyy.apps.googleusercontent.com`
- Check it's the "Web application" credentials

### Error: "CORS error"

**Solution**: Check CORS configuration:
```java
// In GoogleOAuth2Config.java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173"
));
```

### Google Sign-In button not showing

**Solution**: 
- Check `VITE_GOOGLE_CLIENT_ID` in .env
- Verify Google SDK loaded: `window.google` in console
- Check browser console for errors

---

## 📱 Features

### What Users Can Do

1. **Sign in with Google**:
   - One-click authentication
   - No password needed
   - Auto-fill email and name

2. **Seamless Onboarding**:
   - First-time users auto-created
   - Existing users logged in
   - No manual registration needed

3. **Session Management**:
   - JWT token stored locally
   - Automatic logout on token expiration
   - "Remember me" still available

---

## 🔄 API Endpoints

### Google OAuth Endpoints

#### POST `/api/auth/google/verify`
Verify Google token and get JWT

**Request**:
```json
{
  "token": "google_id_token_here"
}
```

**Response**:
```json
{
  "accessToken": "jwt_token_here",
  "tokenType": "Bearer",
  "userId": 1,
  "username": "user@example.com",
  "role": "USER"
}
```

#### GET `/api/auth/google/callback`
OAuth2 callback endpoint (handled by Spring Security)

#### GET `/api/auth/google/user`
Get current authenticated user

---

## 🚀 Production Deployment

### Environment Variables

Set these before running:

```bash
# Backend
export SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID="prod-client-id"
export SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET="prod-secret"
export VITE_API_BASE_URL="https://api.yourdomain.com"

# Frontend
export VITE_GOOGLE_CLIENT_ID="prod-client-id"
export VITE_API_BASE_URL="https://api.yourdomain.com"
```

### Google Cloud Configuration

1. Update redirect URIs to production domain
2. Update OAuth consent screen with production info
3. Enable production mode (non-testing)
4. Set up domain verification

---

## 📚 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [Spring Security OAuth2](https://spring.io/projects/spring-security-oauth2)

---

## ✅ Checklist

- [ ] Google Cloud Project created
- [ ] OAuth 2.0 credentials generated
- [ ] Client ID added to frontend .env
- [ ] Client Secret added to backend application.properties
- [ ] Redirect URIs configured in Google Console
- [ ] OAuth consent screen configured
- [ ] Backend running with OAuth config
- [ ] Frontend running with Google SDK
- [ ] Google Sign-In button visible on login page
- [ ] Test login with Google account works
- [ ] JWT token generated and stored
- [ ] User session created and persisted
- [ ] Dashboard accessible after login

---

**Status**: ✅ Ready for Configuration

Get your Google OAuth credentials and follow the setup steps above to enable Google Sign-In!
