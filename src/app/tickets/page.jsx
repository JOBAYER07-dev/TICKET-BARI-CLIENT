'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@heroui/react';
import {
  Search,
  Bus,
  Train,
  Plane,
  MapPin,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';

export default function AllTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter & Pagination States
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [sortBy, setSortBy] = useState('Default');

  // Challenge Requirement 4 States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data from backend API
  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (searchFrom) queryParams.append('from', searchFrom);
      if (searchTo) queryParams.append('to', searchTo);
      if (selectedType && selectedType !== 'All Types')
        queryParams.append('type', selectedType);
      if (sortBy && sortBy !== 'Default') queryParams.append('sortBy', sortBy);

      // Pass pagination parameters to server
      queryParams.append('page', currentPage);
      queryParams.append('limit', 6); // 6 items per page as requested

      const data = await apiRequest(`/tickets?${queryParams.toString()}`);

      // FIXED: Reading arrays safely inside object boundary layer
      setTickets(data.tickets || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when dependency metrics shift states
  useEffect(() => {
    fetchTickets();
  }, [selectedType, sortBy, currentPage]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on fresh search trigger
    fetchTickets();
  };

  const transportIcons = {
    Bus: <Bus className="w-5 h-5" />,
    Train: <Train className="w-5 h-5" />,
    Plane: <Plane className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-8">
      {/* Search Header Wrapper */}
      <div className="max-w-6xl mx-auto mb-10 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-neutral-200">
          Search Active Routes
        </h2>
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <Input
            label="From"
            placeholder="e.g. Dhaka"
            value={searchFrom}
            onChange={e => setSearchFrom(e.target.value)}
            className="dark"
          />
          <Input
            label="To"
            placeholder="e.g. Chittagong"
            value={searchTo}
            onChange={e => setSearchTo(e.target.value)}
            className="dark"
          />
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-12 rounded-xl flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Search Fleet
          </Button>
        </form>
      </div>

      {/* Main Grid View */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Panel */}
        <div className="space-y-6 bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800 h-fit">
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
              <option value="Bus">Bus Fleet</option>
              <option value="Train">Railway Train</option>
              <option value="Plane">Air Flight</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Order Price By
            </label>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Default">Default View</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Right Active Tickets Listing */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full min-h-[400px]">
          <div className="space-y-4">
            {loading ? (
              <p className="text-neutral-500 text-sm text-center py-10">
                Fetching live schedules from server...
              </p>
            ) : error ? (
              <p className="text-red-400 text-sm text-center py-10">{error}</p>
            ) : tickets.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-10">
                No approved schedules matched your parameters.
              </p>
            ) : (
              tickets.map(ticket => (
                <Card
                  key={ticket._id || ticket.id}
                  className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl shadow-lg hover:border-neutral-700 transition-all"
                >
                  <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                        {transportIcons[ticket.type] || (
                          <Bus className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white leading-snug">
                          {ticket.company}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span>
                            {ticket.from} ➔ {ticket.to}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 pt-4 sm:pt-0 border-neutral-900">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-neutral-500 uppercase tracking-wider">
                          Starting Fare
                        </div>
                        <div className="text-xl font-black text-emerald-400 mt-0.5">
                          ৳ {ticket.price}
                        </div>
                      </div>
                      <Link href={`/tickets/${ticket._id || ticket.id}`}>
                        <Button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl text-xs px-5 h-10 border border-neutral-700">
                          See Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Challenge Requirement 4: Unified Pagination Control Panel UI */}
          {!loading && tickets.length > 0 && (
            <div className="flex justify-center items-center gap-4 pt-10 mt-auto">
              <Button
                size="sm"
                variant="flat"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="bg-neutral-900 border border-neutral-800 text-neutral-400 disabled:opacity-40 rounded-xl px-3"
              >
                <ArrowLeft className="w-4 h-4" /> Prev
              </Button>
              <span className="text-xs font-semibold font-mono text-neutral-500">
                Page{' '}
                <span className="text-emerald-500 font-bold">
                  {currentPage}
                </span>{' '}
                of {totalPages}
              </span>
              <Button
                size="sm"
                variant="flat"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                className="bg-neutral-900 border border-neutral-800 text-neutral-400 disabled:opacity-40 rounded-xl px-3"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
