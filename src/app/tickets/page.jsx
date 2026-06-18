'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { Bus, Train, Plane, Ship, Calendar, User } from 'lucide-react';
import Link from 'next/link';

// 🎯 ডামি টিকিট ডেটা (সার্ভার সাইড তৈরি করার আগ পর্যন্ত ফ্রন্টএন্ড নিখুঁতভাবে টেস্ট করার জন্য)
const allApprovedTickets = [
  {
    id: 1,
    type: 'Bus',
    icon: Bus,
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    price: 550,
    from: 'Dhaka',
    to: 'Chittagong',
    date: 'June 25, 8:00 AM',
    seats: 30,
  },
  {
    id: 2,
    type: 'Train',
    icon: Train,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    price: 320,
    from: 'Dhaka',
    to: 'Sylhet',
    date: 'June 26, 6:30 AM',
    seats: 50,
  },
  {
    id: 3,
    type: 'Plane',
    icon: Plane,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    price: 4200,
    from: 'Dhaka',
    to: "Cox's Bazar",
    date: 'June 27, 10:00 AM',
    seats: 12,
  },
  {
    id: 4,
    type: 'Launch',
    icon: Ship,
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    price: 280,
    from: 'Dhaka',
    to: 'Barisal',
    date: 'June 28, 9:00 PM',
    seats: 80,
  },
  {
    id: 5,
    type: 'Bus',
    icon: Bus,
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    price: 420,
    from: 'Dhaka',
    to: 'Rajshahi',
    date: 'June 29, 7:00 AM',
    seats: 45,
  },
  {
    id: 6,
    type: 'Train',
    icon: Train,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    price: 480,
    from: 'Dhaka',
    to: 'Khulna',
    date: 'June 30, 5:30 AM',
    seats: 60,
  },
  {
    id: 7,
    type: 'Bus',
    icon: Bus,
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    price: 600,
    from: 'Dhaka',
    to: 'Sylhet',
    date: 'July 01, 11:00 PM',
    seats: 20,
  },
  {
    id: 8,
    type: 'Launch',
    icon: Ship,
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    price: 350,
    from: 'Dhaka',
    to: 'Chandpur',
    date: 'July 02, 4:00 PM',
    seats: 100,
  },
];

export default function TicketsPage() {
  // সার্চ, ফিল্টার এবং সর্ট স্টেট
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [transportType, setType] = useState('All Types');
  const [sortBy, setSortBy] = useState('Default sort');

  // ফিল্টারড ও ফাইনাল ডিসপ্লে ডেটা স্টেট
  const [filteredTickets, setFilteredTickets] = useState(allApprovedTickets);

  // পেজিনেশন স্টেট (চ্যালেঞ্জ রিকোয়ারমেন্ট ৪: প্রতি পেজে ৬টি করে টিকিট দেখাবে)
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 6;

  // 🔍 ফিল্টারিং এবং সর্টিং হ্যান্ডলার লজিক (চ্যালেঞ্জ রিকোয়ারমেন্ট ১ ও ২)
  const applyFilters = e => {
    if (e) e.preventDefault();

    let tempTickets = [...allApprovedTickets];

    // From Location ফিল্টার
    if (from.trim() !== '') {
      tempTickets = tempTickets.filter(t =>
        t.from.toLowerCase().includes(from.toLowerCase()),
      );
    }

    // To Location ফিল্টার
    if (to.trim() !== '') {
      tempTickets = tempTickets.filter(t =>
        t.to.toLowerCase().includes(to.toLowerCase()),
      );
    }

    // Transport Type ফিল্টার
    if (transportType !== 'All Types') {
      tempTickets = tempTickets.filter(t => t.type === transportType);
    }

    // Price সর্টিং (Low to High / High to Low)
    if (sortBy === 'Price: Low to High') {
      tempTickets.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      tempTickets.sort((a, b) => b.price - a.price);
    }

    setFilteredTickets(tempTickets);
    setCurrentPage(1); // সার্চ বা ফিল্টার করলে পেজিনেশন ১ নম্বর পেজে ব্যাক করবে
  };

  // পেজিনেশন ক্যালকুলেশন লজিক
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentDisplayedTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket,
  );
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  return (
    <div className="min-h-screen bg-[#121212] text-white py-12 px-6">
      <div className="max-w-[1280px] mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">All Tickets</h1>

        {/* 🛠️ সার্চ, ফিল্টার এবং সর্ট বার লেআউট (স্ক্রিনশট ম্যাচিং) */}
        <form
          onSubmit={applyFilters}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-[#1e1e1e] p-4 rounded-xl border border-neutral-800 mb-10 items-end"
        >
          <div>
            <input
              type="text"
              placeholder="From"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="To"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <select
              value={transportType}
              onChange={e => setType(e.target.value)}
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
              <option value="Launch">Launch</option>
              <option value="Plane">Plane</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Default sort">Default sort</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
          <div>
            <Button
              type="submit"
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg text-sm h-10 flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
            >
              Filter
            </Button>
          </div>
        </form>

        {/* 🎟️ টিকিট কাস্টম কার্ড গ্রিড */}
        {currentDisplayedTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {currentDisplayedTickets.map(ticket => {
              const IconComponent = ticket.icon;
              return (
                <div
                  key={ticket.id}
                  className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between h-[360px] hover:border-neutral-700 transition-all shadow-lg"
                >
                  <div
                    className={`h-36 flex items-center justify-center relative overflow-hidden ${ticket.color.split(' ')[0]}`}
                  >
                    <IconComponent className="w-12 h-12 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent z-0"></div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${ticket.color}`}
                        >
                          {ticket.type}
                        </span>
                        <span className="text-emerald-400 font-bold text-lg">
                          ৳ {ticket.price}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-lg tracking-tight mb-3">
                        {ticket.from} ➔ {ticket.to}
                      </h3>

                      <div className="flex flex-col gap-1.5 text-xs text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{ticket.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{ticket.seats} seats left</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="w-full mt-4 block"
                    >
                      <Button
                        variant="bordered"
                        className="w-full border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 font-medium rounded-xl text-sm"
                      >
                        See Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#1e1e1e] rounded-2xl border border-neutral-800 text-neutral-500">
            No tickets found matching your filter criteria.
          </div>
        )}

        {/* 🔢 পেজিনেশন বার লেআউট */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 h-9 border border-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent text-neutral-300 transition-colors"
            >
              &lt; Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                type="button"
                onClick={() => setCurrentPage(index + 1)}
                className={`w-9 h-9 border rounded-lg text-sm font-medium transition-colors ${
                  currentPage === index + 1
                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                    : 'border-neutral-800 hover:bg-neutral-800 text-neutral-400'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 h-9 border border-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent text-neutral-300 transition-colors"
            >
              Next &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
