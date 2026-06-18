'use client';

import { useState, useEffect, use } from 'react'; // React থেকে use ইম্পোর্ট করলাম প্রমিস আনর্যাপ করার জন্য
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import {
  Bus,
  Train,
  Plane,
  Ship,
  Calendar,
  User,
  Clock,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

// টেস্ট করার জন্য টিকিট ডেটাবেজ ম্যাপ
const ticketDatabase = {
  1: {
    type: 'Bus',
    icon: Bus,
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    price: 550,
    from: 'Dhaka',
    to: 'Chittagong',
    date: 'June 25, 2026',
    time: '8:00 AM',
    seats: 30,
    company: 'Green Line Paribahan',
  },
  2: {
    type: 'Train',
    icon: Train,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    price: 320,
    from: 'Dhaka',
    to: 'Sylhet',
    date: 'June 26, 2026',
    time: '6:30 AM',
    seats: 50,
    company: 'Suborna Express',
  },
  3: {
    type: 'Plane',
    icon: Plane,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    price: 4200,
    from: 'Dhaka',
    to: "Cox's Bazar",
    date: 'June 27, 2026',
    time: '10:00 AM',
    seats: 12,
    company: 'Biman Bangladesh',
  },
  4: {
    type: 'Launch',
    icon: Ship,
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    price: 280,
    from: 'Dhaka',
    to: 'Barisal',
    date: 'June 28, 2026',
    time: '9:00 PM',
    seats: 80,
    company: 'Surovi 9',
  },
  5: {
    type: 'Bus',
    icon: Bus,
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    price: 420,
    from: 'Dhaka',
    to: 'Rajshahi',
    date: 'June 29, 2026',
    time: '7:00 AM',
    seats: 45,
    company: 'Hanif Enterprise',
  },
  6: {
    type: 'Train',
    icon: Train,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    price: 480,
    from: 'Dhaka',
    to: 'Khulna',
    date: 'June 30, 2026',
    time: '5:30 AM',
    seats: 60,
    company: 'Chitra Express',
  },
  7: {
    type: 'Bus',
    icon: Bus,
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    price: 600,
    from: 'Dhaka',
    to: 'Sylhet',
    date: 'July 01, 2026',
    time: '11:00 PM',
    seats: 20,
    company: 'Ena Transport',
  },
  8: {
    type: 'Launch',
    icon: Ship,
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    price: 350,
    from: 'Dhaka',
    to: 'Chandpur',
    date: 'July 02, 2026',
    time: '4:00 PM',
    seats: 100,
    company: 'MV Mitali',
  },
};

export default function TicketDetailsPage() {
  // 🎯 Next.js অ্যাপ রাউটারের রুলস অনুযায়ী useParams() থেকে আসা আইডি-টিকে সঠিকভাবে এক্সট্র্যাক্ট করলাম
  const params = useParams();
  const id = params?.id;

  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  // 🎯 এখানে আইডি ট্র্যাকিংকে ডাইনামিক নাম্বার চেক করা হলো
  const ticket = ticketDatabase[Number(id)] || ticketDatabase[1];

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBooking = () => {
    alert('Proceeding to Stripe Payment Gateway...');
  };

  const IconComponent = ticket.icon;

  return (
    <div className="min-h-screen bg-[#121212] text-white py-12 px-6">
      <div className="max-w-[800px] mx-auto">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to All Tickets
        </Link>

        <div
          className={`w-full p-4 rounded-xl border mb-8 flex items-center justify-between shadow-lg transition-all ${
            isExpired
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {isExpired ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5 animate-pulse" />
            )}
            <span className="text-sm font-medium">
              {isExpired
                ? 'Session expired! Please refresh to restart booking.'
                : 'Hold your seat! Complete booking within:'}
            </span>
          </div>
          <span className="font-mono text-xl font-bold tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          <div
            className={`h-40 flex items-center justify-center relative overflow-hidden ${ticket.color.split(' ')[0]}`}
          >
            <IconComponent className="w-16 h-16 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent z-0"></div>
          </div>

          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-6">
              <div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border uppercase tracking-wider ${ticket.color}`}
                >
                  {ticket.type} Ticket
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
                  {ticket.company}
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-widest">
                  Ticket Price
                </p>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  ৳ {ticket.price}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    Route
                  </span>
                  <span className="text-lg font-bold text-neutral-200 mt-0.5">
                    {ticket.from} ➔ {ticket.to}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span>
                    {ticket.date} at {ticket.time}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    Availability
                  </span>
                  <span className="text-lg font-bold text-emerald-400 mt-0.5">
                    {ticket.seats} Seats Remaining
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <User className="w-4 h-4 text-neutral-500" />
                  <span>Standard Class Layout</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleBooking}
              disabled={isExpired}
              className={`w-full h-12 font-bold rounded-xl tracking-wide text-sm transition-all shadow-lg ${
                isExpired
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
              }`}
            >
              {isExpired ? 'Booking Disabled' : 'Confirm & Proceed to Payment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
