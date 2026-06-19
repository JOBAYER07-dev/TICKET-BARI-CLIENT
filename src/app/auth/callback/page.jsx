'use client';

import { useEffect } from 'react';

// This page receives the Google OAuth redirect with access_token in the URL hash.
// It sends the token back to the parent (login) window via postMessage, then closes.
export default function AuthCallbackPage() {
  useEffect(() => {
    try {
      const hash = window.location.hash; // e.g. #access_token=xxx&token_type=Bearer...

      if (hash && hash.includes('access_token=') && window.opener) {
        // Send token to parent login window
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_SUCCESS', hash },
          window.location.origin,
        );
        window.close();
      } else if (window.opener) {
        // Something went wrong
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_ERROR', message: 'No access token received.' },
          window.location.origin,
        );
        window.close();
      }
    } catch (err) {
      console.error('Auth callback error:', err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-neutral-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
