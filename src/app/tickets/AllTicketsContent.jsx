'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@heroui/react';
import {
  Search,
  Bus,
  Train,
  Plane,
  MapPin,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
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
    return <Bus className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-8">
      {/* Search Bar */}
      <div className="max-w-6xl mx-auto mb-8 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <h2 className="text-lg font-bold mb-4 text-neutral-200">
          Search Active Routes
        </h2>
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              From
            </label>
            <input
              placeholder="e.g. Dhaka"
              value={searchFrom}
              onChange={e => setSearchFrom(e.target.value)}
              className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              To
            </label>
            <input
              placeholder="e.g. Chittagong"
              value={searchTo}
              onChange={e => setSearchTo(e.target.value)}
              className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Search
          </Button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-5 bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800 h-fit">
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
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
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
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Default">Default</option>
              <option value="Price: Low to High">Low → High</option>
              <option value="Price: High to Low">High → Low</option>
            </select>
          </div>
        </div>

        {/* Ticket List */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-400 text-center py-10">{error}</p>
          ) : tickets.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500">
              No approved tickets matched your search.
            </div>
          ) : (
            tickets.map(ticket => (
              <div
                key={ticket._id || ticket.id}
                className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl shadow-lg hover:border-neutral-700 transition-colors"
              >
                <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                      {transportIcon(ticket.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {ticket.company || ticket.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        <span>
                          {ticket.from} → {ticket.to}
                        </span>
                      </div>
                      {ticket.date && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {ticket.date} · {ticket.time}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 justify-end">
                    <div className="text-right">
                      <div className="text-xs text-neutral-500 uppercase">
                        Fare
                      </div>
                      <div className="text-xl font-black text-emerald-400">
                        BDT {ticket.price}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {ticket.seats} seats left
                      </div>
                    </div>
                    <Link href={`/tickets/${ticket._id || ticket.id}`}>
                      <Button className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 rounded-xl text-xs px-5 h-10 text-white">
                        See Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
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
                        ? 'bg-emerald-600 text-white shadow-lg'
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
            <p className="text-center text-xs text-neutral-500">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
