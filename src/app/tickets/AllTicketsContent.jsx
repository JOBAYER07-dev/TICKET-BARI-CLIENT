'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@heroui/react';
import {
  Search,
  Bus,
  Train,
  Plane,
  Ship,
  MapPin,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Calendar,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';

export default function AllTicketsContent() {
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchFrom, setSearchFrom] = useState(searchParams.get('from') || '');
  const [searchTo, setSearchTo] = useState(searchParams.get('to') || '');
  const [selectedType, setSelectedType] = useState(
    searchParams.get('type') || 'All Types',
  );
  const [sortBy, setSortBy] = useState('Default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const q = new URLSearchParams();
      if (searchFrom) q.append('from', searchFrom);
      if (searchTo) q.append('to', searchTo);
      if (selectedType && selectedType !== 'All Types')
        q.append('type', selectedType);
      if (sortBy && sortBy !== 'Default') q.append('sortBy', sortBy);
      q.append('page', page);
      q.append('limit', 6);

      const data = await apiRequest(`/tickets?${q.toString()}`);
      setTickets(data.tickets || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(currentPage);
  }, [selectedType, sortBy, currentPage]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTickets(1);
  };

  const goTo = page => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const transportIcon = type => {
    if (type === 'Train') return <Train className="w-5 h-5" />;
    if (type === 'Plane') return <Plane className="w-5 h-5" />;
    if (type === 'Launch') return <Ship className="w-5 h-5" />;
    return <Bus className="w-5 h-5" />;
  };

  const typeColor = type => {
    if (type === 'Train')
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (type === 'Plane')
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (type === 'Launch')
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-8">
      {/* ── Page Title ── */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-black text-white">All Tickets</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Browse all approved travel tickets
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div className="max-w-6xl mx-auto mb-8 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <h2 className="text-sm font-bold mb-4 text-neutral-400 uppercase tracking-wider">
          Search Routes
        </h2>
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              From
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                placeholder="e.g. Dhaka"
                value={searchFrom}
                onChange={e => setSearchFrom(e.target.value)}
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              To
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                placeholder="e.g. Chittagong"
                value={searchTo}
                onChange={e => setSearchTo(e.target.value)}
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" /> Search
          </Button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── Filters Sidebar ── */}
        <div className="space-y-5 bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800 h-fit sticky top-20">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold">Filters</span>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Transport Type
            </label>
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All Types">All Transports</option>
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
              <option value="Plane">Plane</option>
              <option value="Launch">Launch</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Sort by Price
            </label>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Default">Default</option>
              <option value="Price: Low to High">Low → High</option>
              <option value="Price: High to Low">High → Low</option>
            </select>
          </div>

          {/* Active filters indicator */}
          {(searchFrom ||
            searchTo ||
            selectedType !== 'All Types' ||
            sortBy !== 'Default') && (
            <button
              onClick={() => {
                setSearchFrom('');
                setSearchTo('');
                setSelectedType('All Types');
                setSortBy('Default');
                setCurrentPage(1);
              }}
              className="w-full text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 rounded-xl py-2 font-semibold transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* ── Ticket List ── */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-12 text-center">
              <Search className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">
                No approved tickets matched your search.
              </p>
              <p className="text-neutral-600 text-xs mt-1">
                Try different locations or transport type.
              </p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div
                key={ticket._id || ticket.id}
                className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl shadow-lg hover:border-neutral-700 hover:shadow-xl transition-all group overflow-hidden"
              >
                {/* ✅ Ticket Image */}
                {ticket.image && (
                  <img
                    src={ticket.image}
                    alt={ticket.title || ticket.company}
                    className="w-full h-40 object-cover"
                  />
                )}

                <div className="p-5 flex flex-col gap-4">
                  {/* ── Top Row: Icon + Info + Price + Button ── */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    {/* Left: Transport icon + title + route */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl shrink-0 border ${typeColor(ticket.type)}`}
                      >
                        {transportIcon(ticket.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-white leading-tight">
                            {ticket.company || ticket.title}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${typeColor(ticket.type)}`}
                          >
                            {ticket.type}
                          </span>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span className="font-semibold">{ticket.from}</span>
                          <ArrowRight className="w-3 h-3 text-neutral-600" />
                          <span className="font-semibold">{ticket.to}</span>
                        </div>

                        {/* Date & Time */}
                        {ticket.date && (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {ticket.date} · {ticket.time}
                            </span>
                          </div>
                        )}

                        {/* Seats */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {ticket.seats > 0 ? (
                              <span className="text-emerald-400 font-semibold">
                                {ticket.seats} seats left
                              </span>
                            ) : (
                              <span className="text-red-400 font-semibold">
                                Sold Out
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price + Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-neutral-500 uppercase font-mono">
                          Fare / seat
                        </div>
                        <div className="text-2xl font-black text-emerald-400">
                          BDT {ticket.price}
                        </div>
                      </div>
                      <Link href={`/tickets/${ticket._id || ticket.id}`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs px-5 h-10 text-white font-bold transition-colors shadow-lg shadow-emerald-900/20">
                          See Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* ✅ Perks Row */}
                  {ticket.perks?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-neutral-800/60">
                      {ticket.perks.map(perk => (
                        <span
                          key={perk}
                          className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-neutral-900 text-neutral-400 border border-neutral-700"
                        >
                          ✓ {perk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => goTo(currentPage - 1)}
                className="flex items-center gap-1.5 px-4 h-10 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      p === currentPage
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => goTo(currentPage + 1)}
                className="flex items-center gap-1.5 px-4 h-10 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {!loading && tickets.length > 0 && (
            <p className="text-center text-xs text-neutral-600">
              Page {currentPage} of {totalPages} · {tickets.length} results
              shown
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
