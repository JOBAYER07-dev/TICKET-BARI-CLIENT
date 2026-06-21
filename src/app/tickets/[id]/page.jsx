'use client';

import { useState, useEffect, use, useRef } from 'react';
import { Button, Card } from '@heroui/react';
import {
  Bus,
  Train,
  Plane,
  Ship,
  MapPin,
  ArrowRight,
  User,
  Mail,
  Clock,
  Layers,
  Calendar,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';
import { toast } from 'react-toastify';

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

  // Countdown
  const [countdownText, setCountdownText] = useState('Calculating...');
  const [isTimePassed, setIsTimePassed] = useState(false);
  const intervalRef = useRef(null);

  // ── Convert AM/PM → 24h ──────────────────────
  const convertTo24h = timeStr => {
    if (!timeStr) return '00:00';
    if (!timeStr.includes('AM') && !timeStr.includes('PM')) return timeStr;
    const [timePart, modifier] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'AM' && hours === 12) hours = 0;
    if (modifier === 'PM' && hours !== 12) hours += 12;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // ── Start Countdown ───────────────────────────
  const startCountdown = (date, time) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!date) {
      setCountdownText('Date N/A');
      return;
    }

    const target = new Date(
      `${date}T${convertTo24h(time || '08:00')}`,
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

    tick();
    intervalRef.current = setInterval(tick, 1000);
  };

  useEffect(() => {
    // ✅ PROTECTED ROUTE: login না থাকলে /login-এ redirect
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast.info('Please login to view ticket details.');
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchTicket = async () => {
      try {
        const data = await apiRequest(`/tickets/${ticketId}`);
        setTicket(data);
        startCountdown(data.date, data.time);
      } catch (err) {
        setError(err.message || 'Failed to load ticket.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ticketId]);

  // ── Confirm Booking ───────────────────────────
  const handleConfirmBooking = async e => {
    e.preventDefault();

    if (!user) {
      toast.warn('Please login first!');
      router.push('/login');
      return;
    }
    if (Number(bookingQuantity) > Number(ticket.seats)) {
      toast.error("Booking quantity can't exceed available seats!");
      return;
    }
    if (Number(bookingQuantity) <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    setBookingLoading(true);
    const toastId = toast.loading('Saving your booking...');
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
        image: ticket.image || '',
        userName: user.name,
        userEmail: user.email,
        status: 'pending',
      };

      const data = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.success) {
        toast.update(toastId, {
          render: 'Booking confirmed! Redirecting to dashboard... 🎉',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
        setIsModalOpen(false);
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err) {
      toast.update(toastId, {
        render: err.message || 'Booking failed.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Transport Icon + Color ────────────────────
  const transportIcons = {
    Bus: <Bus className="w-6 h-6" />,
    Train: <Train className="w-6 h-6" />,
    Plane: <Plane className="w-6 h-6" />,
    Launch: <Ship className="w-6 h-6" />,
  };

  const typeColor = {
    Bus: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Train: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Plane: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Launch: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const isButtonDisabled = !ticket || ticket.seats === 0 || isTimePassed;

  // ── Loading / Error states ────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-xs text-neutral-400 hover:text-white underline"
          >
            Go back
          </button>
        </div>
      </div>
    );

  if (!ticket)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <p className="text-neutral-500 text-sm">Ticket not found.</p>
      </div>
    );

  const ticketColorClass = typeColor[ticket.type] || typeColor.Bus;

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-12 flex justify-center items-start">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* ── LEFT: Ticket Details ─────────────── */}
        <Card className="md:col-span-3 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${ticketColorClass}`}>
                  {transportIcons[ticket.type] || <Bus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {ticket.company || ticket.title}
                  </h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider mt-1 inline-block ${ticketColorClass}`}
                  >
                    {ticket.type}
                  </span>
                </div>
              </div>

              {/* Countdown */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border shrink-0 ${
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
            <div className="space-y-4 border-t border-neutral-800 pt-6">
              <div className="flex items-center justify-between bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    From
                  </span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    {ticket.from}
                  </span>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    To
                  </span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    {ticket.to}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Departure Date
                  </span>
                  <span className="text-sm font-semibold text-white block">
                    {ticket.date || 'N/A'}
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" /> Departure Time
                  </span>
                  <span className="text-sm font-semibold text-white block">
                    {ticket.time || 'N/A'}
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3" /> Available Seats
                  </span>
                  <span
                    className={`text-sm font-semibold block ${ticket.seats > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {ticket.seats > 0
                      ? `${ticket.seats} seats left`
                      : 'Sold Out'}
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> Transport Type
                  </span>
                  <span className="text-sm font-semibold text-white block">
                    {ticket.type}
                  </span>
                </div>
              </div>

              {/* ✅ Perks */}
              {ticket.perks?.length > 0 && (
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800">
                  <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-3">
                    Perks & Amenities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.perks.map(p => (
                      <span
                        key={p}
                        className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-neutral-800 pt-5 mt-5 flex justify-between items-end">
            <div>
              <span className="text-xs text-neutral-500 block mb-0.5">
                Price per seat
              </span>
              <span className="text-3xl font-black text-emerald-400">
                ৳ {ticket.price}
              </span>
            </div>
            {ticket.vendorName && (
              <div className="text-right">
                <span className="text-xs text-neutral-600 block">
                  Operated by
                </span>
                <span className="text-xs text-neutral-400 font-semibold">
                  {ticket.vendorName}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* ── RIGHT: Booking Panel ──────────────── */}
        <Card className="md:col-span-2 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Passenger Info
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Your profile will be used for this booking.
            </p>

            {/* User Info (readonly) */}
            {user ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                    Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3" />
                    <input
                      value={user.name}
                      disabled
                      className="w-full h-11 bg-neutral-900/60 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-neutral-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3" />
                    <input
                      value={user.email}
                      disabled
                      className="w-full h-11 bg-neutral-900/60 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-neutral-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
                <p className="text-xs text-amber-400 leading-relaxed">
                  Please login to book this ticket.
                </p>
              </div>
            )}

            {/* Departed notice */}
            {isTimePassed && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
                ⏰ Departure time has passed. Booking is closed.
              </div>
            )}

            {/* Sold out notice */}
            {!isTimePassed && ticket.seats === 0 && (
              <div className="mt-4 p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-neutral-400 text-center">
                This ticket is sold out.
              </div>
            )}
          </div>

          {/* Book Now Button */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={() => {
                if (!user) {
                  toast.warn('Please login to book a ticket.');
                  router.push('/login');
                  return;
                }
                setIsModalOpen(true);
              }}
              disabled={isButtonDisabled}
              className={`w-full h-12 text-white font-bold rounded-xl text-sm tracking-wide shadow-lg transition-all ${
                isButtonDisabled
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 hover:shadow-emerald-900/40'
              }`}
            >
              {ticket.seats === 0
                ? 'Sold Out'
                : isTimePassed
                  ? 'Booking Closed'
                  : '🎟️ Book Now'}
            </Button>

            <p className="text-center text-[10px] text-neutral-600">
              Booking is instantly saved with "Pending" status
            </p>
          </div>
        </Card>
      </div>

      {/* ── Booking Modal ─────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" /> Confirm Booking
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {ticket.company || ticket.title} · {ticket.from} → {ticket.to}
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                  Number of Seats (Max: {ticket.seats})
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

              {/* Price Preview */}
              <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Price per seat:</span>
                  <span className="text-white font-semibold">
                    ৳ {ticket.price}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Seats:</span>
                  <span className="text-white font-semibold">
                    × {bookingQuantity || 0}
                  </span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between">
                  <span className="text-sm text-neutral-400 font-semibold">
                    Total Price:
                  </span>
                  <span className="text-emerald-400 font-black text-lg">
                    ৳ {Number(ticket.price) * Number(bookingQuantity || 0)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="flat"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-neutral-900 text-neutral-400 font-bold h-11 rounded-xl border border-neutral-800 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={bookingLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-900/20"
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
