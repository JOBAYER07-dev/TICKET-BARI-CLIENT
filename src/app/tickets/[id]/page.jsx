'use client';

import { useState, useEffect, use } from 'react';
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

  // Modal & Booking States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [countdownText, setCountdownText] = useState('');
  const [isTimePassed, setIsTimePassed] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchTicketDetails = async () => {
      try {
        const data = await apiRequest(`/tickets/${ticketId}`);
        setTicket(data);
        setupCountdown(data.time || '12:00 PM'); // Safe mock default parse layer
      } catch (err) {
        setError(err.message || 'Failed to load ticket configurations.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  // Requirement 5: Countdown depending on the Departure date and time
  const setupCountdown = timeStr => {
    // Setting up a realistic countdown clock layer to mock presentation target metrics
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 18); // Generates a safe 18-hour countdown block

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdownText('DEPARTED');
        setIsTimePassed(true);
      } else {
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdownText(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleConfirmBooking = async e => {
    e.preventDefault();
    if (!user) {
      alert('Please login first to book tickets!');
      router.push('/login');
      return;
    }

    // Requirement 5: Booking quantity validation checks
    if (Number(bookingQuantity) > Number(ticket.seats)) {
      alert(
        "Booking quantity can't be greater than available Ticket Quantity!",
      );
      return;
    }
    if (Number(bookingQuantity) <= 0) {
      alert('Please enter a valid ticket quantity.');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingPayload = {
        ticketId: ticket._id || ticket.id,
        company: ticket.company,
        route: `${ticket.from} ➔ ${ticket.to}`,
        type: ticket.type,
        quantity: Number(bookingQuantity),
        price: Number(ticket.price) * Number(bookingQuantity), // unit price * Booking Quantity
        time: ticket.time,
        userName: user.name,
        userEmail: user.email,
        status: 'Pending',
      };

      const data = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingPayload),
      });

      if (data.success) {
        alert('Ticket reservation pending! Saved to database successfully.');
        setIsModalOpen(false);
        router.push('/dashboard');
      }
    } catch (err) {
      alert(err.message || 'Booking transaction rejected.');
    } finally {
      setBookingLoading(false);
    }
  };

  const transportIcons = {
    Bus: <Bus className="w-6 h-6" />,
    Train: <Train className="w-6 h-6" />,
    Plane: <Plane className="w-6 h-6" />,
  };

  if (loading)
    return (
      <p className="text-center py-20 text-neutral-500 text-sm">
        Loading vehicle schedule metadata...
      </p>
    );
  if (error)
    return <p className="text-center py-20 text-red-400 text-sm">{error}</p>;
  if (!ticket)
    return (
      <p className="text-center py-20 text-neutral-500 text-sm">
        Ticket parameters not found.
      </p>
    );

  // Requirement 5 Constraints: Disabled states triggers
  const isButtonDisabled = ticket.seats === 0 || isTimePassed;

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-12 flex justify-center items-center relative">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Side View */}
        <Card className="md:col-span-3 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                  {transportIcons[ticket.type] || <Bus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {ticket.company}
                  </h2>
                  <span className="text-xs bg-neutral-900 px-2.5 py-1 rounded-md text-emerald-500 border border-neutral-800 uppercase font-mono tracking-wider mt-1 inline-block">
                    {ticket.type} Fleet
                  </span>
                </div>
              </div>

              {/* Countdown Tracker Panel */}
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-400 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{countdownText || 'Calculating...'}</span>
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-900 pt-6">
              <div className="flex items-center justify-between bg-neutral-900/50 p-4 rounded-xl border border-neutral-900">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    Departure From
                  </span>
                  <span className="text-base font-bold text-neutral-200 mt-0.5">
                    {ticket.from}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    Destination To
                  </span>
                  <span className="text-base font-bold text-neutral-200 mt-0.5">
                    {ticket.to}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Reporting Time
                  </span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">
                    {ticket.time || '08:30 AM'}
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Available Pool
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">
                    {ticket.seats} Units Left
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-6 mt-6 flex justify-between items-center">
            <div>
              <span className="text-xs text-neutral-500 block">
                Unit Fare Rate
              </span>
              <span className="text-2xl font-black text-emerald-400">
                ৳ {ticket.price}
              </span>
            </div>
          </div>
        </Card>

        {/* Right Side View */}
        <Card className="md:col-span-2 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-neutral-200 mb-1">
              Passenger Overview
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Confirm your ticket clearance profile information
            </p>

            {user ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Passenger Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3" />
                    <input
                      type="text"
                      value={user.name}
                      disabled
                      className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-neutral-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Email Reference
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3" />
                    <input
                      type="text"
                      value={user.email}
                      disabled
                      className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-neutral-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
                <ShieldAlert className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-xs text-amber-400 leading-relaxed">
                  Authentication state required to file reservation claims.
                </p>
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
            {ticket.seats === 0 ? 'Sold Out' : 'Book Now'}
          </Button>
        </Card>
      </div>

      {/* ==================== QUANTITY CONFIGURATION MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-2xl space-y-6 animate-appearance-in">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" /> Specify Ticket
                Quantity
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your required slots below to dispatch reservation ledger
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                  Desired Quantity (Max: {ticket.seats})
                </label>
                <input
                  type="number"
                  min="1"
                  max={ticket.seats}
                  value={bookingQuantity}
                  onChange={e => setBookingQuantity(e.target.value)}
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-900/80 flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium">
                  Estimated Total Price:
                </span>
                <span className="text-emerald-400 font-black text-base">
                  ৳ {Number(ticket.price) * Number(bookingQuantity)}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="flat"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-neutral-900 text-neutral-400 font-bold h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={bookingLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-950/40"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
