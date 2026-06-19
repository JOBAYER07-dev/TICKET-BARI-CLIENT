'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { User, Mail, Lock, UserCheck, Bus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (data.success) {
        alert('Registration successful! Please login.');
        router.push('/login');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#1e1e1e]/90 p-8 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 font-bold text-2xl text-emerald-500 mb-2">
            <Bus className="w-7 h-7" />
            <span className="tracking-wide text-white">TicketBari</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-200">
            Create your account
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Join us to book or manage travel tickets easily
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Role — ✅ Admin option removed for security */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Register As
            </label>
            <div className="relative flex items-center">
              <UserCheck className="w-4 h-4 text-neutral-500 absolute left-3 z-10 pointer-events-none" />
              <select
                value={formData.role}
                onChange={e =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="user">General User (Ticket Buyer)</option>
                <option value="vendor">Transport Vendor (Ticket Seller)</option>
                {/* Admin role is NOT selectable — assigned manually or via admin panel */}
              </select>
              <div className="absolute right-4 pointer-events-none w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-500" />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm tracking-wide mt-2 shadow-lg shadow-emerald-900/20"
          >
            Sign Up
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-emerald-500 hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
