'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@heroui/react';
import { Bus, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // 🎯 এখানে ডিফল্টভাবে null করে দেওয়া হলো, যাতে প্রথমে Login/Register দেখায়।
  // টেস্ট করার জন্য null কেটে দিয়ে নিচের কমেন্ট করা অবজেক্টটি বসিয়ে চেক করতে পারেন।
  const [user, setUser] = useState(null);

  /* // কোড টেস্টিং এর জন্য ইউজার অবজেক্টের নমুনা:
  const [user, setUser] = useState({
    name: 'John D.',
    email: 'john@example.com',
    avatar: '',
    role: 'user', 
  });
  */

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'All Tickets', path: '/tickets' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <nav className="bg-[#121212]/90 border-b border-neutral-800 text-white backdrop-blur-md sticky top-0 z-50 w-full">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* মোবাইল মেনু বাটন ও ব্র্যান্ড লোগো */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="sm:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-emerald-500"
          >
            <Bus className="w-6 h-6" />
            <span className="tracking-wide">TicketBari</span>
          </Link>
        </div>

        {/* ডেস্কটপ নেভিগেশন লিংকস */}
        <div className="hidden sm:flex items-center gap-8">
          {menuItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`font-medium transition-colors text-[15px] ${
                  isActive
                    ? 'text-emerald-500 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* রাইট সাইড কন্ট্রোল */}
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            className="text-neutral-400 hover:text-white min-w-9 w-9 h-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {user ? (
            /* ইউজার লগইন থাকলে এই প্রোফাইল ড্রপডাউনটি শো করবে */
            <Dropdown
              placement="bottom-end"
              className="bg-[#1e1e1e] border border-neutral-800 text-white"
            >
              <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer select-none">
                  <Avatar
                    className="transition-transform w-8 h-8 text-sm font-semibold bg-emerald-100 text-emerald-800"
                    name={user.name.split(' ')[0]}
                    size="sm"
                  />
                  <span className="text-sm font-medium hidden md:inline text-neutral-200 hover:text-white">
                    {user.name}
                  </span>
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem
                  key="profile"
                  className="h-14 gap-2 text-neutral-300"
                >
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold text-emerald-400">{user.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="my-profile"
                  as={Link}
                  href="/dashboard"
                  className="text-neutral-300 hover:text-white"
                >
                  My Profile
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={() => setUser(null)}
                  className="text-danger"
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            /* ইউজার লগআউট বা ডিফল্ট অবস্থায় এই বাটন দুটি শো করবে */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="border border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-800 text-sm font-medium rounded-lg px-4 h-9 flex items-center justify-center transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg px-4 h-9 flex items-center justify-center transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* mobile menu layout */}
      {isMenuOpen && (
        <div className="sm:hidden bg-[#121212]/95 border-t border-neutral-900 px-6 py-4 flex flex-col gap-4 absolute w-full left-0 top-16 z-40 backdrop-blur-lg">
          {menuItems.map(item => (
            <Link
              key={item.name}
              className={`w-full text-lg block py-2 ${
                pathname === item.path
                  ? 'text-emerald-500 font-semibold'
                  : 'text-neutral-400'
              }`}
              href={item.path}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
