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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchTicketDetails = async () => {
      try {
        const data = await apiRequest(`/tickets/${ticketId}`);
        setTicket(data);
      } catch (err) {
        setError(err.message || 'Failed to load ticket configurations.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  const handleConfirmBooking = async () => {
    if (!user) {
      alert('Please login first to book tickets!');
      router.push('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingPayload = {
        ticketId: ticket._id || ticket.id,
        company: ticket.company,
        route: `${ticket.from} ➔ ${ticket.to}`,
        type: ticket.type,
        price: ticket.price,
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
        alert('Ticket booked successfully! Redirecting to dashboard...');
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

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-12 flex justify-center items-center">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Side: Ticket Overview */}
        <Card className="md:col-span-3 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
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
                    {ticket.time || '00:00 AM'}
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Available Seats
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
                Total Payable Fare
              </span>
              <span className="text-2xl font-black text-emerald-400">
                ৳ {ticket.price}
              </span>
            </div>
          </div>
        </Card>

        {/* Right Side: Passenger Profile Wrapper */}
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
                {/* Fixed native layouts with wrapper divs instead of unknown props */}
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
            onClick={handleConfirmBooking}
            isLoading={bookingLoading}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm tracking-wide mt-6 shadow-lg shadow-emerald-900/20"
          >
            Confirm Reservation
          </Button>
        </Card>
      </div>
    </div>
  );
}
