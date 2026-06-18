'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@heroui/react';
import {
  Ticket,
  DollarSign,
  Clock,
  ShieldCheck,
  Users,
  PlusCircle,
  FileText,
  Activity,
  UserMinus,
  ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // For System Admin View
  const [globalBookings, setGlobalBookings] = useState([]); // For Master Ledger Overview
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Transport Vendor Add Ticket State Form
  const [newTicket, setNewTicket] = useState({
    company: '',
    type: 'Bus',
    from: '',
    to: '',
    price: '',
    seats: '',
    time: '',
  });

  // Core function to pull dynamic data layers based on the authenticated user role
  const fetchDashboardData = async currentUser => {
    try {
      if (currentUser.role === 'admin') {
        // Core Admin Operations: Pull registry records & master logs
        const usersData = await apiRequest('/users');
        setAllUsers(usersData);

        const allBookingsData = await apiRequest('/bookings');
        setGlobalBookings(allBookingsData || []);
      } else {
        // General Users / Vendors filter operational flows specific to their credentials
        const bookingsData = await apiRequest(
          `/bookings?email=${currentUser.email}`,
        );
        setBookings(bookingsData);
      }
    } catch (err) {
      setError(err.message || 'Failed to sync management control metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Access denied! Private route constraint. Please login.');
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchDashboardData(parsedUser);
  }, [router]);

  // Operational Action 1: Admin updates structural clearance role (Requirement 8c)
  const handleUpdateRole = async (userId, targetRole) => {
    try {
      await apiRequest(`/users/role/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: targetRole }),
      });
      alert(`Account updated to ${targetRole} status successfully!`);
      fetchDashboardData(user);
    } catch (err) {
      alert(err.message || 'Role modification rejected.');
    }
  };

  // Operational Action 2: Admin flags malicious Vendor and hides all associated fleets (Requirement 8c)
  const handleMarkAsFraud = async userId => {
    if (
      !confirm(
        'CRITICAL WARNING: Are you sure you want to mark this vendor as FRAUD? This will permanently hide all their active tickets from the platform.',
      )
    )
      return;
    try {
      const data = await apiRequest(`/users/fraud/${userId}`, {
        method: 'PATCH',
      });
      if (data.success) {
        alert('Vendor flagged as FRAUD. Fleet schedules hidden safely.');
        fetchDashboardData(user);
      }
    } catch (err) {
      alert(err.message || 'Fraud processing operation failed.');
    }
  };

  // Operational Action 3: Cancel reservation transaction records
  const handleCancelBooking = async bookingId => {
    if (
      !confirm('Are you sure you want to cancel this booking registration log?')
    )
      return;
    try {
      await apiRequest(`/bookings/${bookingId}`, { method: 'DELETE' });
      alert('Booking canceled successfully!');
      fetchDashboardData(user);
    } catch (err) {
      alert(err.message || 'Cancellation pipeline aborted.');
    }
  };

  // Operational Action 4: Vendor creates new fleet schedule entry
  const handleCreateTicket = async e => {
    e.preventDefault();
    try {
      const data = await apiRequest('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          ...newTicket,
          vendorName: user.name,
          vendorEmail: user.email,
        }),
      });
      if (data.success) {
        alert('Ticket listed successfully with Pending Verification state!');
        setNewTicket({
          company: '',
          type: 'Bus',
          from: '',
          to: '',
          price: '',
          seats: '',
          time: '',
        });
      }
    } catch (err) {
      alert(err.message || 'Action restricted.');
    }
  };

  if (loading)
    return (
      <p className="text-center py-20 text-neutral-500 text-sm">
        Synchronizing live workspace matrices...
      </p>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Unified Top Profile Control Panel Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Welcome, {user?.name}!
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Authorized Profile Reference Desk:{' '}
              <span className="text-neutral-400 font-mono font-bold">
                {user?.email}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operational Context: {user?.role}</span>
          </div>
        </div>

        {/* ==================== SCREEN LAYER 1: GENERAL USER HUB ==================== */}
        {user?.role === 'user' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-row items-center gap-5 shadow-lg">
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Total Booked
                  </span>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {bookings.length} Tickets
                  </h3>
                </div>
              </Card>
              <Card className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-row items-center gap-5 shadow-lg">
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Total Spent
                  </span>
                  <h3 className="text-3xl font-black text-emerald-400 mt-1">
                    ৳ {bookings.reduce((s, b) => s + Number(b.price || 0), 0)}
                  </h3>
                </div>
              </Card>
            </div>

            <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" /> Your Booking
                Ledger
              </h2>
              {bookings.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">
                  No reservations reported for this profile.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-neutral-300">
                    <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Route</th>
                        <th className="p-4">Fleet Operator</th>
                        <th className="p-4">Fare Breakdown</th>
                        <th className="p-4 text-center">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900/60">
                      {bookings.map(b => (
                        <tr key={b._id} className="hover:bg-neutral-900/40">
                          <td className="p-4 text-xs font-semibold">
                            {b.route}
                          </td>
                          <td className="p-4 font-bold text-white">
                            {b.company}
                          </td>
                          <td className="p-4 text-emerald-400 font-bold">
                            ৳ {b.price}
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 uppercase tracking-wider">
                              {b.status}
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
        )}

        {/* ==================== SCREEN LAYER 2: TRANSPORT VENDOR CONSOLE ==================== */}
        {user?.role === 'vendor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5 text-emerald-500" /> Dispatch New
                Fleet Listing
              </h2>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <Input
                  label="Company Operator"
                  placeholder="e.g. Green Line Paribahan"
                  value={newTicket.company}
                  onChange={e =>
                    setNewTicket({ ...newTicket, company: e.target.value })
                  }
                  className="dark"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="From Terminal"
                    placeholder="Dhaka"
                    value={newTicket.from}
                    onChange={e =>
                      setNewTicket({ ...newTicket, from: e.target.value })
                    }
                    className="dark"
                    required
                  />
                  <Input
                    label="To Destination"
                    placeholder="Chittagong"
                    value={newTicket.to}
                    onChange={e =>
                      setNewTicket({ ...newTicket, to: e.target.value })
                    }
                    className="dark"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Fare Rate (৳)"
                    type="number"
                    placeholder="550"
                    value={newTicket.price}
                    onChange={e =>
                      setNewTicket({ ...newTicket, price: e.target.value })
                    }
                    className="dark"
                    required
                  />
                  <Input
                    label="Total Fleet Capacity"
                    type="number"
                    placeholder="32"
                    value={newTicket.seats}
                    onChange={e =>
                      setNewTicket({ ...newTicket, seats: e.target.value })
                    }
                    className="dark"
                    required
                  />
                  <Input
                    label="Departure Schedule"
                    placeholder="08:30 AM"
                    value={newTicket.time}
                    onChange={e =>
                      setNewTicket({ ...newTicket, time: e.target.value })
                    }
                    className="dark"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Transit Category
                  </label>
                  <select
                    value={newTicket.type}
                    onChange={e =>
                      setNewTicket({ ...newTicket, type: e.target.value })
                    }
                    className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-sm text-white focus:outline-none"
                  >
                    <option value="Bus">Bus</option>
                    <option value="Train">Train</option>
                    <option value="Plane">Plane</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
                >
                  Publish Schedule Request
                </Button>
              </form>
            </Card>

            <Card className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-neutral-300 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neutral-500" /> Vendor
                  Metrics
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Track fleet operational efficiency profiles.
                </p>
              </div>
              <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-900 text-center py-8">
                <span className="text-xs text-neutral-500 block">
                  Active Operating Logs
                </span>
                <span className="text-4xl font-black text-emerald-500 mt-1 block">
                  {bookings.length} Bookings
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== SCREEN LAYER 3: MASTER SYSTEM ADMIN POWER DESK ==================== */}
        {user?.role === 'admin' && (
          <div className="space-y-8">
            {/* System Performance Status Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-row items-center gap-5 shadow-lg">
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Total Registered Accounts
                  </span>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {allUsers.length} Users
                  </h3>
                </div>
              </Card>
              <Card className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 flex flex-row items-center gap-5 shadow-lg">
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Global System Ledger Entries
                  </span>
                  <h3 className="text-3xl font-black text-emerald-400 mt-1">
                    {globalBookings.length} Transaction Logs
                  </h3>
                </div>
              </Card>
            </div>

            {/* Core Requirement 8c: Manage Users Table Interface */}
            <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" /> Core System
                Accounts Registry
              </h2>
              <div className="overflow-x-auto rounded-xl border border-neutral-900">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Active Role</th>
                      <th className="p-4 text-center">
                        System Clearance Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/60">
                    {allUsers.map(u => (
                      <tr
                        key={u._id}
                        className={`hover:bg-neutral-900/40 ${u.isFraud ? 'bg-red-950/20 opacity-60' : ''}`}
                      >
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          {u.name}
                          {u.isFraud && (
                            <span className="text-[9px] bg-red-600/20 border border-red-500/40 text-red-400 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest font-bold">
                              Fraud
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-neutral-400">
                          {u.email}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono rounded uppercase ${
                              u.role === 'admin'
                                ? 'text-red-400 bg-red-500/10'
                                : u.role === 'vendor'
                                  ? 'text-amber-400 bg-amber-500/10'
                                  : 'text-blue-400 bg-blue-500/10'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="warning"
                            onClick={() => handleUpdateRole(u._id, 'vendor')}
                            disabled={u.role === 'vendor' || u.isFraud}
                            className="text-[10px] font-bold h-7 min-w-0 px-2 rounded-lg"
                          >
                            Make Vendor
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="secondary"
                            onClick={() => handleUpdateRole(u._id, 'admin')}
                            disabled={u.role === 'admin' || u.isFraud}
                            className="text-[10px] font-bold h-7 min-w-0 px-2 rounded-lg"
                          >
                            Make Admin
                          </Button>
                          {u.role === 'vendor' && !u.isFraud && (
                            <Button
                              size="sm"
                              variant="ghost"
                              color="danger"
                              onClick={() => handleMarkAsFraud(u._id)}
                              className="text-[10px] font-bold h-7 min-w-0 px-2 rounded-lg border-red-500/30 flex items-center gap-1"
                            >
                              <ShieldAlert className="w-3 h-3" /> Mark Fraud
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System-Wide Master Booking Ledger Tracker */}
            <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" /> System-Wide
                Master Booking Ledger
              </h2>
              <div className="overflow-x-auto rounded-xl border border-neutral-900">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Operator Fleet</th>
                      <th className="p-4">Transit Route</th>
                      <th className="p-4">Passenger Reference</th>
                      <th className="p-4">Fare Rate</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">
                        Administrative Override
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/60">
                    {globalBookings.map(booking => (
                      <tr key={booking._id} className="hover:bg-neutral-900/40">
                        <td className="p-4 font-bold text-white">
                          {booking.company}
                        </td>
                        <td className="p-4 text-xs text-neutral-400">
                          {booking.route}
                        </td>
                        <td className="p-4 text-xs font-mono text-neutral-400">
                          {booking.userEmail}
                        </td>
                        <td className="p-4 font-bold text-emerald-400">
                          ৳ {booking.price}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              booking.status === 'Confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              alert('Booking instance approved manually')
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-md transition-colors uppercase"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white font-bold text-[10px] rounded-md transition-all uppercase"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
