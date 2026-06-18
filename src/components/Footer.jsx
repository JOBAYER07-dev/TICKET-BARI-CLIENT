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
            Contact
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
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-[15px] mb-4 tracking-wide">
            Payment
          </h4>
          <p className="text-sm mb-2">
            Powered by <span className="text-white font-semibold">Stripe</span>
          </p>
          <div className="w-16 h-7 bg-neutral-900 rounded flex items-center justify-center text-[11px] text-white font-bold tracking-widest uppercase border border-neutral-800 select-none shadow-sm">
            Stripe
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 mt-12 pt-6 border-t border-neutral-950 text-center text-xs tracking-wide">
        <p>© {currentYear} TicketBari. All rights reserved.</p>
      </div>
    </footer>
  );
}
