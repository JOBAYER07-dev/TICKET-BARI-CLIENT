'use client';

import { useState, useEffect, use, useRef } from 'react';
import { Button, Card } from '@heroui/react';
import {
  Bus,
  Train,
  Plane,
  MapPin,
  ArrowRight,
  User,
  Mail,
  ShieldAlert,
  Clock,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';

export default function TicketDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const ticketId = unwrappedParams.id;

  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal & Booking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingQuantity, setBookingQuantity] = useState(1);

  // ── Countdown state ──────────────────────────
  const [countdownText, setCountdownText] = useState('Calculating...');
  const [isTimePassed, setIsTimePassed] = useState(false);
  const intervalRef = useRef(null); // keep ref so we can clear it

  // ── Build & start countdown from real departure date+time ──
  const startCountdown = (date, time) => {
    // Clear any existing interval first
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!date) {
      setCountdownText('Date N/A');
      return;
    }

    // Combine date (YYYY-MM-DD) + time (HH:MM or HH:MM AM/PM)
    const target = new Date(
      `${date}T${convertTo24h(time || '08:00 AM')}`,
    ).getTime();

    const tick = () => {
      const diff = target - Date.now();

      if (diff <= 0) {
        clearInterval(intervalRef.current);
        setCountdownText('DEPARTED');
        setIsTimePassed(true);
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setCountdownText(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };

    tick(); // run immediately
    intervalRef.current = setInterval(tick, 1000);
  };

  // Helper: convert "08:30 AM" → "08:30" for Date parsing
  const convertTo24h = timeStr => {
    // If already 24h format (HH:MM), return as-is
    if (!timeStr.includes('AM') && !timeStr.includes('PM')) return timeStr;

    const [timePart, modifier] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'AM' && hours === 12) hours = 0;
    if (modifier === 'PM' && hours !== 12) hours += 12;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchTicket = async () => {
      try {
        const data = await apiRequest(`/tickets/${ticketId}`);
        setTicket(data);
        // ✅ Use real departure date & time from the ticket
        startCountdown(data.date, data.time);
      } catch (err) {
        setError(err.message || 'Failed to load ticket.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();

    // ✅ Cleanup on unmount — no memory leak
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ticketId]);

  // ── Book Now ─────────────────────────────────
  const handleConfirmBooking = async e => {
    e.preventDefault();
    if (!user) {
      alert('Please login first!');
      router.push('/login');
      return;
    }

    if (Number(bookingQuantity) > Number(ticket.seats)) {
      alert("Booking quantity can't be greater than available seats!");
      return;
    }
    if (Number(bookingQuantity) <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        ticketId: ticket._id || ticket.id,
        company: ticket.company || ticket.title,
        title: ticket.title || ticket.company,
        route: `${ticket.from} ➔ ${ticket.to}`,
        type: ticket.type,
        quantity: Number(bookingQuantity),
        price: Number(ticket.price) * Number(bookingQuantity),
        date: ticket.date,
        time: ticket.time,
        userName: user.name,
        userEmail: user.email,
        status: 'pending',
      };

      const data = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.success) {
        alert('Booking saved! Check your dashboard.');
        setIsModalOpen(false);
        router.push('/dashboard');
      }
    } catch (err) {
      alert(err.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const transportIcons = {
    Bus: <Bus className="w-6 h-6" />,
    Train: <Train className="w-6 h-6" />,
    Plane: <Plane className="w-6 h-6" />,
  };

  // ── Disabled rules ───────────────────────────
  const isButtonDisabled = !ticket || ticket.seats === 0 || isTimePassed;

  // ── States ───────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  if (error)
    return <p className="text-center py-20 text-red-400 text-sm">{error}</p>;
  if (!ticket)
    return (
      <p className="text-center py-20 text-neutral-500 text-sm">
        Ticket not found.
      </p>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-12 flex justify-center items-start relative">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* ── Left card ────────────────────────── */}
        <Card className="md:col-span-3 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                  {transportIcons[ticket.type] || <Bus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {ticket.company || ticket.title}
                  </h2>
                  <span className="text-xs bg-neutral-900 px-2.5 py-1 rounded-md text-emerald-500 border border-neutral-800 uppercase font-mono tracking-wider mt-1 inline-block">
                    {ticket.type} Fleet
                  </span>
                </div>
              </div>

              {/* Countdown — real departure-based */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
                  isTimePassed
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{countdownText}</span>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-4 border-t border-neutral-900 pt-6">
              <div className="flex items-center justify-between bg-neutral-900/50 p-4 rounded-xl border border-neutral-900">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    From
                  </span>
                  <span className="text-base font-bold text-neutral-200 mt-0.5">
                    {ticket.from}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500" />
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    To
                  </span>
                  <span className="text-base font-bold text-neutral-200 mt-0.5">
                    {ticket.to}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Departure Date
                  </span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">
                    {ticket.date || 'N/A'}
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Departure Time
                  </span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">
                    {ticket.time || 'N/A'}
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Available Seats
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">
                    {ticket.seats} left
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Transport
                  </span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">
                    {ticket.type}
                  </span>
                </div>
              </div>

              {/* Perks */}
              {ticket.perks?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-2">
                    Perks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.perks.map(p => (
                      <span
                        key={p}
                        className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-neutral-900 pt-6 mt-6">
            <span className="text-xs text-neutral-500 block">Unit Fare</span>
            <span className="text-2xl font-black text-emerald-400">
              ৳ {ticket.price}
            </span>
          </div>
        </Card>

        {/* ── Right card ───────────────────────── */}
        <Card className="md:col-span-2 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-neutral-200 mb-1">
              Passenger Info
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Your profile will be used for this booking.
            </p>

            {user ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3" />
                    <input
                      value={user.name}
                      disabled
                      className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-neutral-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3" />
                    <input
                      value={user.email}
                      disabled
                      className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-neutral-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
                <ShieldAlert className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-xs text-amber-400 leading-relaxed">
                  Login required to book a ticket.
                </p>
              </div>
            )}

            {isTimePassed && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
                Departure time has passed. Booking is closed.
              </div>
            )}
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={isButtonDisabled}
            className={`w-full h-12 text-white font-bold rounded-xl text-sm tracking-wide mt-6 shadow-lg ${
              isButtonDisabled
                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'
            }`}
          >
            {ticket.seats === 0
              ? 'Sold Out'
              : isTimePassed
                ? 'Booking Closed'
                : 'Book Now'}
          </Button>
        </Card>
      </div>

      {/* ── Booking Modal ─────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" /> Specify Quantity
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {ticket.company || ticket.title} · {ticket.from} → {ticket.to}
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                  Quantity (Max: {ticket.seats})
                </label>
                <input
                  type="number"
                  min="1"
                  max={ticket.seats}
                  required
                  value={bookingQuantity}
                  onChange={e => setBookingQuantity(e.target.value)}
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-900/80 flex justify-between items-center text-xs">
                <span className="text-neutral-400">Total Price:</span>
                <span className="text-emerald-400 font-black text-base">
                  ৳ {Number(ticket.price) * Number(bookingQuantity || 0)}
                </span>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="flat"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-neutral-900 text-neutral-400 font-bold h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={bookingLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
                >
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
