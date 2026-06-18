'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

      queryParams.append('page', currentPage);
      queryParams.append('limit', 6);

      const data = await apiRequest(`/tickets?${queryParams.toString()}`);
      setTickets(data.tickets || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedType, sortBy, currentPage]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTickets();
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-8">
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

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
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
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-sm text-white focus:outline-none"
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
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-sm text-white focus:outline-none"
            >
              <option value="Default">Default View</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col justify-between h-full min-h-[400px]">
          <div className="space-y-4">
            {loading ? (
              <p className="text-neutral-500 text-center py-10">
                Fetching live schedules from server...
              </p>
            ) : tickets.length === 0 ? (
              <p className="text-neutral-500 text-center py-10">
                No approved schedules matched your parameters.
              </p>
            ) : (
              tickets.map(ticket => (
                <Card
                  key={ticket._id || ticket.id}
                  className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl shadow-lg"
                >
                  <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">
                          {ticket.company}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span>
                            {ticket.from} → {ticket.to}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-8">
                      <div className="text-right">
                        <div className="text-xs text-neutral-500 uppercase">
                          Starting Fare
                        </div>
                        <div className="text-xl font-black text-emerald-400">
                          BDT {ticket.price}
                        </div>
                      </div>
                      <Link href={`/tickets/${ticket._id || ticket.id}`}>
                        <Button className="bg-neutral-800 border border-neutral-700 rounded-xl text-xs px-5 h-10 text-white">
                          See Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
