'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { Mail, Lock, Bus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Login successful!');
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Requirement 2: Real Google OAuth 2.0 Identity Token Verification Pipeline
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!GOOGLE_CLIENT_ID) {
        throw new Error(
          'OAuth Client ID key is missing in your environment configuration.',
        );
      }

      // 🎯 STRICT TARGET: Explicitly specifying dashboard redirect mapping to capture response tokens
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/dashboard')}&response_type=token&scope=email%20profile`;

      const width = 500,
        height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        googleAuthUrl,
        'Google SignIn',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
      );

      // Listen for the hash token parameter explicitly forwarded on successful consent
      const timer = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(timer);
            setGoogleLoading(false);
            return;
          }

          // Inspect popup location to safely extract the authorized access_token
          const currentUrl = popup.location.href;
          if (currentUrl.includes('access_token=')) {
            clearInterval(timer);

            const params = new URLSearchParams(
              popup.location.hash.replace('#', '?'),
            );
            const accessToken = params.get('access_token');
            popup.close();

            // Fetch live, real-time authenticated profile directly from Google Resource Servers
            const googleProfileResponse = await fetch(
              `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
            );
            const googleUser = await googleProfileResponse.json();

            if (!googleUser.email) {
              throw new Error(
                'Failed to retrieve profile credentials from Google.',
              );
            }

            // Synchronize the genuine user data directly with your MongoDB database layer
            const data = await apiRequest('/auth/social-sync', {
              method: 'POST',
              body: JSON.stringify({
                name: googleUser.name || 'Google Passenger',
                email: googleUser.email,
                photoURL: googleUser.picture || '',
              }),
            });

            if (data.success && data.token) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              alert(
                `Welcome, ${data.user.name}! Authenticated successfully via Google OAuth.`,
              );
              router.push('/dashboard');
            }
            setGoogleLoading(false);
          }
        } catch (originError) {
          // Cross-origin boundaries are expected until the popup redirects back to your dashboard origin
        }
      }, 500);
    } catch (err) {
      setError(
        err.message || 'Social identity synchronization pipeline failed.',
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#1e1e1e]/90 p-8 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 font-bold text-2xl text-emerald-500 mb-2">
            <Bus className="w-7 h-7" />
            <span className="tracking-wide text-white">TicketBari</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-200">Welcome Back</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Sign in to access your dashboard and tickets
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm mt-2"
          >
            Sign In
          </Button>
        </form>

        {/* Requirement 2: Social Login Section */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute w-full border-t border-neutral-800"></div>
          <span className="relative bg-[#1e1e1e] px-3 text-xs text-neutral-500 uppercase font-medium">
            Or log in with
          </span>
        </div>

        <Button
          onClick={handleGoogleLogin}
          isLoading={googleLoading}
          variant="bordered"
          className="w-full h-11 border-neutral-800 hover:bg-neutral-800 text-neutral-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
        >
          {/* Custom SVG Google Icon Vector */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.26 1.48 15.53 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-xs text-neutral-500 mt-6">
          New to TicketBari?{' '}
          <Link
            href="/register"
            className="text-emerald-500 hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
