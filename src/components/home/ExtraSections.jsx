'use client';

import { ShieldCheck, Clock, Smartphone } from 'lucide-react';

const popularRoutes = [
  { from: 'Dhaka', to: 'Chittagong', count: '2,840 booked' },
  { from: 'Dhaka', to: 'Sylhet', count: '1,920 booked' },
  { from: 'Dhaka', to: "Cox's Bazar", count: '1,650 booked' },
  { from: 'Dhaka', to: 'Rajshahi', count: '1,100 booked' },
];

export default function ExtraSections() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-white font-bold text-lg mb-4 tracking-tight">
          Popular Routes
        </h3>
        <div className="flex flex-col">
          {popularRoutes.map((route, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3.5 border-b border-neutral-900 last:border-0"
            >
              <span className="text-neutral-200 font-semibold text-sm">
                {route.from} ➔ {route.to}
              </span>
              <span className="text-emerald-500 font-medium text-xs bg-emerald-500/10 px-2.5 py-1 rounded-full">
                {route.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center gap-6">
        <h3 className="text-white font-bold text-lg tracking-tight mb-1">
          Why Choose TicketBari?
        </h3>

        <div className="flex gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl h-11 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[15px] mb-0.5">
              Secure Payments
            </h4>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Stripe-powered, 100% safe transaction channels.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl h-11 flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[15px] mb-0.5">
              Real-time Availability
            </h4>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Live seat counts updated instantly with zero delay.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl h-11 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[15px] mb-0.5">
              Mobile Friendly
            </h4>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Book from any device, tablet, or smartphone anywhere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
