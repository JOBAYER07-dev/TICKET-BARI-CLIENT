'use client';

import { Button } from '@heroui/react';
import { Calendar, User, Bus, Train, Plane, Ship } from 'lucide-react';
import Link from 'next/link';

// ডামি ডেটা যা আপনার স্ক্রিনশটের ডিজাইনের সাথে হুবহু মিলবে
const adminHandpicked = [
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
];

const latestTickets = [
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
];

function TicketGrid({ title, subtitle, data }) {
  return (
    <div className="w-full mb-16">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>

      {/* ৩টি কলামের সমান হাইট-উইডথ গ্রিড (রিকোয়ারমেন্ট রুলস) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(ticket => {
          const IconComponent = ticket.icon;
          return (
            <div
              key={ticket.id}
              className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between h-[360px] hover:border-neutral-700 transition-all group shadow-lg"
            >
              {/* ক্যাটাগরি ভিত্তিক গ্লসি আইকন পার্ট */}
              <div
                className={`h-36 flex items-center justify-center border-b border-neutral-800/60 relative overflow-hidden ${ticket.color.split(' ')[0]}`}
              >
                <IconComponent className="w-12 h-12 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent z-0"></div>
              </div>

              {/* টিকিট বডি ডেটা */}
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

                {/* ফুল উইডথ সি ডিটেইলস বাটন */}
                <Button
                  as={Link}
                  href={`/tickets/${ticket.id}`}
                  variant="bordered"
                  className="w-full mt-4 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 font-medium rounded-xl text-sm"
                >
                  See Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TicketSections() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-12">
      <TicketGrid
        title="Handpicked by admin"
        subtitle="Featured travel routes premium deals"
        data={adminHandpicked}
      />
      <TicketGrid
        title="Latest Tickets"
        subtitle="Recently added travel schedules"
        data={latestTickets}
      />
    </section>
  );
}
