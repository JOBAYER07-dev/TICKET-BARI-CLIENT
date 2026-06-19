'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { Mail, Lock, Bus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // ── Email/Password Login ─────────────────────
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
        toast.success('Login successful! Redirecting...');
        router.push('/dashboard');
      }
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth Login (postMessage flow) ────
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!GOOGLE_CLIENT_ID) throw new Error('OAuth Client ID missing.');

      // ✅ redirect_uri → /auth/callback (dedicated callback page)
      const redirectUri = encodeURIComponent(
        window.location.origin + '/auth/callback',
      );

      const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=token` +
        `&scope=email%20profile` +
        `&prompt=select_account`;

      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        googleAuthUrl,
        'Google SignIn',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
      );

      if (!popup) {
        throw new Error('Popup blocked! Please allow popups for this site.');
      }

      toast.info('Opening Google sign-in window...');

      // ✅ Listen for postMessage from /auth/callback page
      const handleMessage = async event => {
        // Security: only accept messages from our own origin
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== 'GOOGLE_AUTH_SUCCESS') return;

        // Clean up immediately
        window.removeEventListener('message', handleMessage);
        clearInterval(closedChecker);

        try {
          const hash = event.data.hash.replace('#', '?');
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');

          if (!accessToken) {
            throw new Error('No access token received from Google.');
          }

          toast.loading('Verifying your Google account...');

          // Fetch user profile from Google
          const profileRes = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
          );
          const googleUser = await profileRes.json();

          if (!googleUser.email) {
            throw new Error('Could not retrieve email from Google account.');
          }

          // Sync with MongoDB via our server
          const data = await apiRequest('/auth/social-sync', {
            method: 'POST',
            body: JSON.stringify({
              name: googleUser.name || 'Google User',
              email: googleUser.email,
              photoURL: googleUser.picture || '',
            }),
          });

          toast.dismiss();

          if (data.success && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success(
              `Welcome, ${data.user.name}! Logged in successfully.`,
            );
            router.push('/dashboard');
          }
        } catch (err) {
          toast.dismiss();
          const msg = err.message || 'Google login failed.';
          setError(msg);
          toast.error(msg);
        } finally {
          setGoogleLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // Fallback: if user closes popup without completing auth
      const closedChecker = setInterval(() => {
        if (popup.closed) {
          clearInterval(closedChecker);
          window.removeEventListener('message', handleMessage);
          setGoogleLoading(false);
        }
      }, 1000);
    } catch (err) {
      toast.dismiss();
      const msg = err.message || 'Google login failed. Please try again.';
      setError(msg);
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#1e1e1e]/90 p-8 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md">
        {/* Logo */}
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
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
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
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
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm mt-2 shadow-lg shadow-emerald-900/20"
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute w-full border-t border-neutral-800" />
          <span className="relative bg-[#1e1e1e] px-3 text-xs text-neutral-500 uppercase font-medium">
            Or log in with
          </span>
        </div>

        {/* Google Login Button */}
        <Button
          onClick={handleGoogleLogin}
          isLoading={googleLoading}
          variant="bordered"
          className="w-full h-11 border-neutral-800 hover:bg-neutral-800 text-neutral-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.26 1.48 15.53 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Register Link */}
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
