'use client';

import Link from 'next/link';
import { Bus, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[#121212] border-t border-neutral-800 text-neutral-400 pt-12 pb-6 w-full">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-emerald-500"
          >
            <Bus className="w-6 h-6" />
            <span className="tracking-wide text-white">TicketBari</span>
          </Link>
          <p className="text-sm leading-relaxed max-w-[240px]">
            Book bus, train, launch & flight tickets easily.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-[15px] mb-4 tracking-wide">
            Quick Links
          </h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/tickets"
                className="hover:text-white transition-colors"
              >
                All Tickets
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-[15px] mb-4 tracking-wide">
            Contact Info
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500" />
              <a
                href="mailto:support@ticketbari.com"
                className="hover:text-white transition-colors"
              >
                support@ticketbari.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              <a
                href="tel:+8801861961550"
                className="hover:text-white transition-colors"
              >
                +8801861961550
              </a>
            </li>
            <li className="flex items-center gap-2 mt-1">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-4 h-4 fill-emerald-500"
              >
                <path d="M18.244 2.25h3.308l-7.227 7.75 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.285L1.254 2.25h6.636l4.722 6.241z"></path>
              </svg>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                Follow on <span className="font-bold text-white">X</span>
              </a>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 fill-emerald-500" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Facebook Page
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-[15px] mb-4 tracking-wide">
            Payment Channels
          </h4>
          <p className="text-xs mb-3 text-neutral-500 leading-relaxed">
            Powered by globally verified encrypted gateways.
          </p>

          {/* 🎯 ULTRA-STABLE ZERO-IMAGE STRIPE BRAND BADGE */}
          <div className="flex items-center justify-center bg-white/[0.03] border border-neutral-800/80 rounded-xl px-4 py-1.5 w-fit shadow-md select-none">
            <span className="text-xl font-black tracking-tight select-none bg-gradient-to-r from-[#635BFF] via-[#7a73ff] to-[#635BFF] bg-clip-text text-transparent font-sans">
              stripe
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-6 mt-12 pt-6 border-t border-neutral-900 text-center text-xs tracking-wide">
        <p>&copy; {currentYear} TicketBari. All rights reserved.</p>
      </div>
    </footer>
  );
}
