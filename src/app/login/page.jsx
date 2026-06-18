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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
        // Save token and user details in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert('Login successful!');
        // Redirect directly to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#1e1e1e]/90 p-8 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center mb-8">
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
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
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
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Password
              </label>
              <a
                href="#"
                className="text-xs text-neutral-500 hover:text-emerald-500 hover:underline"
              >
                Forgot password?
              </a>
            </div>
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
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm tracking-wide mt-4 shadow-lg shadow-emerald-900/20"
          >
            Sign In
          </Button>
        </form>

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
