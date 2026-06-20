import Link from 'next/link';
import { Bus, Home, Search } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Bus className="w-12 h-12 text-emerald-500" />
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-black text-neutral-800 mb-2 select-none">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          The route you are looking for doesn't exist or may have been removed.
          Let's get you back on track!
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/tickets"
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-sm px-5 py-2.5 rounded-xl border border-neutral-700 transition-colors"
          >
            <Search className="w-4 h-4" /> Browse Tickets
          </Link>
        </div>

        {/* Bottom text */}
        <p className="text-xs text-neutral-600 mt-8">
          © {new Date().getFullYear()} TicketBari. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default NotFound;
