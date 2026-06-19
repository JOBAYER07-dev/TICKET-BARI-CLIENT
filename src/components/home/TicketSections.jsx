'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import {
  Calendar,
  User,
  Bus,
  Train,
  Plane,
  Ship,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';

function TicketGrid({ title, subtitle, data, typeLabel }) {
  const transportIcons = {
    Bus: <Bus className="w-12 h-12 relative z-10" />,
    Train: <Train className="w-12 h-12 relative z-10" />,
    Plane: <Plane className="w-12 h-12 relative z-10" />,
    Launch: <Ship className="w-12 h-12 relative z-10" />,
  };

  const transportColors = {
    Bus: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Train: 'bg-blue-500/20   text-blue-400   border-blue-500/30',
    Plane: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Launch: 'bg-amber-500/20  text-amber-400  border-amber-500/30',
  };

  return (
    <div className="w-full mb-16">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-neutral-500 bg-[#1e1e1e] p-8 rounded-2xl border border-neutral-800 text-center">
          No active {typeLabel} schedules available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map(ticket => {
            const type = ticket.type || 'Bus';
            const colorClass = transportColors[type] || transportColors.Bus;
            const bgColor = colorClass.split(' ')[0];

            return (
              <div
                key={ticket._id || ticket.id}
                className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between h-[380px] hover:border-neutral-700 transition-all group shadow-lg"
              >
                {/* Image / Icon Block */}
                <div
                  className={`h-36 flex items-center justify-center border-b border-neutral-800/60 relative overflow-hidden ${bgColor}`}
                >
                  {ticket.image ? (
                    <img
                      src={ticket.image}
                      alt={ticket.title || ticket.company}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  ) : (
                    <>
                      <span
                        className={colorClass.split(' ').slice(1).join(' ')}
                      >
                        {transportIcons[type] || transportIcons.Bus}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent" />
                    </>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${colorClass}`}
                      >
                        {type}
                      </span>
                      <span className="text-emerald-400 font-bold text-lg">
                        ৳ {ticket.price}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-lg tracking-tight mb-1.5 line-clamp-1">
                      {ticket.company || ticket.title || 'Express Operator'}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      <span>
                        {ticket.from} ➔ {ticket.to}
                      </span>
                    </div>

                    {/* ✅ Fixed: removed 固定 typo from className */}
                    <div className="flex flex-col gap-1.5 text-xs text-neutral-400 border-t border-neutral-900/60 pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span>
                          {ticket.date
                            ? `${ticket.date} · ${ticket.time}`
                            : ticket.time || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{ticket.seats ?? 0} seats left</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/tickets/${ticket._id || ticket.id}`}
                    className="w-full mt-4 block"
                  >
                    <Button
                      variant="bordered"
                      className="w-full border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 font-medium rounded-xl text-sm h-10 flex items-center justify-center gap-1"
                    >
                      See Details{' '}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TicketSections() {
  const [advertisedTickets, setAdvertisedTickets] = useState([]);
  const [latestTickets, setLatestTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ads, recents] = await Promise.all([
          apiRequest('/tickets/advertised'),
          apiRequest('/tickets/latest'),
        ]);
        setAdvertisedTickets(ads || []);
        setLatestTickets(recents || []);
      } catch (err) {
        setError(err.message || 'Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  if (error)
    return <p className="text-center py-16 text-red-400 text-sm">{error}</p>;

  return (
    <section className="max-w-[1280px] mx-auto px-6 py-12">
      <TicketGrid
        title="Featured Advertisements"
        subtitle="Premium routes handpicked by our admin team"
        data={advertisedTickets}
        typeLabel="advertised"
      />
      <TicketGrid
        title="Latest Tickets"
        subtitle="Recently added travel schedules"
        data={latestTickets}
        typeLabel="latest"
      />
    </section>
  );
}
