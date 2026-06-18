'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@heroui/react';
import {
  Ticket,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Get logged-in user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Access denied! Please sign in first.');
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 2. Fetch bookings specific to this user from backend
    const fetchUserBookings = async () => {
      try {
        const data = await apiRequest(`/bookings?email=${parsedUser.email}`);
        setBookings(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [router]);

  // Calculate dynamic stats metrics
  const totalBooked = bookings.length;
  const totalSpent = bookings.reduce(
    (sum, booking) => sum + Number(booking.price || 0),
    0,
  );

  const statusColors = {
    Confirmed: 'success',
    Pending: 'warning',
    Canceled: 'danger',
  };

  if (loading)
    return (
      <p className="text-center py-20 text-neutral-500 text-sm">
        Synchronizing dashboard viewport...
      </p>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Welcome, {user?.name}!
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Manage your active transit bookings and travel expenditure
              profiles
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Account Role: {user?.role}</span>
          </div>
        </div>

        {/* Analytics Counter Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-lg flex flex-row items-center gap-5">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Total Booked
              </span>
              <h3 className="text-3xl font-black text-white mt-1">
                {totalBooked} Tickets
              </h3>
            </div>
          </Card>

          <Card className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-lg flex flex-row items-center gap-5">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Total Spent
              </span>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">
                ৳ {totalSpent}
              </h3>
            </div>
          </Card>
        </div>

        {/* Live Bookings Ledger Data Table */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-neutral-200">
              Recent Booking Ledger
            </h2>
          </div>

          {error ? (
            <p className="text-xs text-red-400 py-6 text-center">{error}</p>
          ) : bookings.length === 0 ? (
            <p className="text-xs text-neutral-500 py-10 text-center">
              No active travel bookings recorded for this profile account.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-neutral-900">
              <table className="w-full text-left text-sm text-neutral-300 border-collapse">
                <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-900">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Operator & Fleet</th>
                    <th className="p-4">Transit Route</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Fare</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/60 bg-neutral-900/10">
                  {bookings.map(booking => (
                    <tr
                      key={booking._id}
                      className="hover:bg-neutral-900/40 transition-colors"
                    >
                      <td className="p-4 font-mono text-xs text-neutral-500">
                        {booking._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {booking.company}
                      </td>
                      <td className="p-4 text-xs text-neutral-400">
                        {booking.route}
                      </td>
                      <td className="p-4 text-xs font-medium text-neutral-400">
                        {booking.time}
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        ৳ {booking.price}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider border ${
                            booking.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
