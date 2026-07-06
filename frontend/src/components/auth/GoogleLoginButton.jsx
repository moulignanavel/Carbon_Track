import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Google Login Button Component
 * Handles Google OAuth authentication
 */
export default function GoogleLoginButton() {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Sign-In Script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.onload = () => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        google.accounts.id.renderButton(
          document.getElementById('google-login-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
          }
        );
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  /**
   * Handle Google Sign-In response
   */
  const handleCredentialResponse = async (response) => {
    try {
      const { credential } = response;

      // Send JWT to backend
      const result = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/google/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: credential,
          }),
        }
      );

      if (!result.ok) {
        throw new Error('Google authentication failed');
      }

      const data = await result.json();

      // Store token and user info
      localStorage.setItem('carbontrack_token', data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        role: data.role,
      }));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Failed to sign in with Google');
    }
  };

  return (
    <div className="w-full">
      <div id="google-login-button" className="flex justify-center"></div>
    </div>
  );
}
