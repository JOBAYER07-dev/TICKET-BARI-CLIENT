'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { Bus, Sun, Moon, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  // Sync user state from localStorage when component mounts or path changes
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [pathname]); // Pathname target ensures it syncs on redirect/navigation

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    alert('Logged out successfully!');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Tickets', href: '/tickets' },
    ...(user ? [{ name: 'Dashboard', href: '/dashboard' }] : []),
  ];

  return (
    <nav className="w-full h-16 bg-[#1a1a1a]/90 backdrop-blur-md border-b border-neutral-800 fixed top-0 left-0 z-50 px-6 flex items-center justify-between text-white">
      {/* Brand Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-xl text-emerald-500 hover:opacity-90 transition-opacity"
      >
        <Bus className="w-6 h-6" />
        <span className="tracking-wide text-white">TicketBari</span>
      </Link>

      {/* Nav Items */}
      <div className="flex items-center gap-6 text-sm font-medium">
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

      {/* Action Buttons / User Profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {user ? (
          /* Dynamic UI when User is Logged In */
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center border border-emerald-500/20">
              <User className="w-4 h-4" />
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
              title="Logout Account"
              className="ml-2 p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Default Authentication Links */
          <>
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
          </>
        )}
      </div>
    </nav>
  );
}
