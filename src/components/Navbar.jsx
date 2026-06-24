'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import {
  Bus,
  Sun,
  Moon,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [pathname]);

  // dropdown বাইরে click করলে বন্ধ হবে
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Tickets', href: '/tickets' },
    ...(user ? [{ name: 'Dashboard', href: '/dashboard' }] : []),
  ];

  const isDark = resolvedTheme === 'dark';

  return (
    <nav className="w-full h-16 bg-[#1a1a1a]/90 backdrop-blur-md border-b border-neutral-800 fixed top-0 left-0 z-50 px-6 flex items-center justify-between text-white">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-xl text-emerald-500 hover:opacity-90 transition-opacity"
      >
        <Bus className="w-6 h-6" />
        <span className="tracking-wide text-white">TicketBari</span>
      </Link>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navLinks.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors relative py-1 ${
                isActive
                  ? 'text-emerald-500 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        )}

        {user ? (
          // ── Avatar Dropdown ──────────────────────────
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl hover:border-neutral-700 transition-all"
            >
              {/* Avatar */}
              <div className="w-7 h-7 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center border border-emerald-500/20 overflow-hidden shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-xs font-black">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              {/* Name + Role */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight text-neutral-200">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500">
                  {user.role}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 flex flex-col gap-0.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button
                size="sm"
                variant="light"
                className="text-neutral-300 hover:text-white text-xs font-semibold px-4 h-9"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-4 h-9 shadow-lg shadow-emerald-900/20"
              >
                Register
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-neutral-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#1a1a1a] border-b border-neutral-800 flex flex-col gap-1 p-4 md:hidden z-50">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                pathname === link.href
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <User className="w-4 h-4" /> My Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout ({user.name})
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1"
              >
                <Button
                  size="sm"
                  variant="light"
                  className="w-full text-neutral-300 text-xs font-semibold h-9"
                >
                  Login
                </Button>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1"
              >
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 text-white text-xs font-bold rounded-xl h-9"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
