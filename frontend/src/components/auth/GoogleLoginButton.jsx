import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@/config/axiosConfig';
import { useAuth } from '@/context/AuthContext';

/**
 * Google Login Button Component
 * Uses official Google Identity Services (GIS) ID token credential authentication
 */
export default function GoogleLoginButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { applyAuth } = useAuth();
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleCredentialResponse = async (response) => {
      if (response && response.credential) {
        try {
          const res = await axiosInstance.post('/auth/google/verify', {
            token: response.credential,
          });

          const data = res.data;
          applyAuth(data, true);
          const destination = data.role === 'ORG_ADMIN'
            ? '/organisation/dashboard'
            : data.role === 'ADMIN' ? '/admin' : '/dashboard';
          navigate(destination);
        } catch (error) {
          console.error('Google Sign-In Error:', error);
          const msg = error.response?.data?.message || error.response?.data?.username || error.message || 'Failed to sign in with Google';
          alert(msg);
        }
      }
    };

    const initGsi = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        if (clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'outline',
              size: 'large',
              width: '320',
              text: 'continue_with',
              shape: 'pill',
            });
          }
        }
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    } else {
      initGsi();
    }
  }, [applyAuth, navigate]);

  return (
    <div className="w-full flex justify-center items-center my-2 min-h-[50px]">
      <div ref={googleBtnContainerRef} className="flex justify-center w-full min-h-[44px]" />
    </div>
  );
}
