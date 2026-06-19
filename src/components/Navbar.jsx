'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { Bus, Sun, Moon, User, LogOut, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Tickets', href: '/tickets' },
    ...(user ? [{ name: 'Dashboard', href: '/dashboard' }] : []),
  ];

  const isDark = resolvedTheme === 'dark';

  return (
    <nav className="w-full h-16 bg-[#1a1a1a]/90 dark:bg-[#1a1a1a]/90 light:bg-white/90 backdrop-blur-md border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200 fixed top-0 left-0 z-50 px-6 flex items-center justify-between text-white">
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
        {/* Dark/Light Toggle — only render after mount to avoid hydration mismatch */}
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
          <div className="hidden md:flex items-center gap-3 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center border border-emerald-500/20">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="w-7 h-7 rounded-lg object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight text-neutral-200">
                {user.name}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="ml-2 p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 text-left flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout ({user.name})
            </button>
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
