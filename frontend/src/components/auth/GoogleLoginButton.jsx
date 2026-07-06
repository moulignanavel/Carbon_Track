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
    const initializeGoogleButton = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
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

    // If script is already loaded/in head
    if (window.google) {
      initializeGoogleButton();
      return;
    }

    // Otherwise, load Google Sign-In Script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleButton;
    document.head.appendChild(script);

    return () => {
      // Clean up script only if it was added
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
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
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/google/verify`,
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

      // Store token and user info via AuthContext to sync context state
      applyAuth(data, false);

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
