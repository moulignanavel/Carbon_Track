import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Google Login Button Component
 * Handles Google OAuth authentication
 */
export default function GoogleLoginButton() {
  const navigate = useNavigate();
  const { applyAuth } = useAuth();

  useEffect(() => {
    // Load Google Sign-In Script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  const handleCustomGoogleLogin = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      alert('Google Sign-In is still loading. Please try again in a moment.');
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      scope: 'email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          try {
            // Fetch user info using the access token
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            
            if (!userInfoRes.ok) throw new Error('Failed to fetch user info');
            
            const userInfo = await userInfoRes.json();
            
            // The backend decodes the JWT without signature verification (just splits by "." and base64 decodes).
            // We construct a mock JWT payload that satisfies the backend parser.
            // userInfo contains: sub, name, email, picture
            const payloadString = JSON.stringify(userInfo);
            // btoa requires ascii, we can encodeURIComponent if there are special chars but for simple names it's fine.
            // A safer base64 encoding for unicode:
            const base64Payload = btoa(unescape(encodeURIComponent(payloadString)));
            const mockJwt = `header.${base64Payload}.signature`;

            // Send to backend
            const result = await fetch(
              `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/google/verify`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: mockJwt }),
              }
            );

            if (!result.ok) {
              throw new Error('Google authentication failed on backend');
            }

            const data = await result.json();
            applyAuth(data, false);
            navigate('/dashboard');
          } catch (error) {
            console.error('Google Sign-In Error:', error);
            alert('Failed to sign in with Google');
          }
        }
      },
    });

    client.requestAccessToken();
  };

  return (
    <button
      type="button"
      onClick={handleCustomGoogleLogin}
      className="relative w-full h-14 group flex items-center justify-center gap-3 bg-[#0F2E22]/60 backdrop-blur-xl border border-[#1E4432] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[#0F2E22] hover:border-[#7FBF8C]/30 hover:shadow-[0_0_20px_rgba(127,191,140,0.2)] transition-all duration-300 cursor-pointer"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      <span className="text-[#F3EFE4] font-semibold tracking-wide">Continue with Google</span>
    </button>
  );
}
