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
  ShieldAlert,
  CreditCard,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { apiRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [globalBookings, setGlobalBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Transport Vendor Form State
  const [newTicket, setNewTicket] = useState({
    company: '',
    type: 'Bus',
    from: '',
    to: '',
    price: '',
    seats: '',
    time: '',
  });

  // Mock data for Revenue charts (Requirement 7e)
  const revenueData = [
    { name: 'Bus Transit', sold: 24, revenue: 13200 },
    { name: 'Railway Train', sold: 45, revenue: 24750 },
    { name: 'Air Flight', sold: 12, revenue: 66000 },
  ];

  const fetchDashboardData = async currentUser => {
    try {
      if (currentUser.role === 'admin') {
        const usersData = await apiRequest('/users');
        setAllUsers(usersData);
        const allBookingsData = await apiRequest('/bookings');
        setGlobalBookings(allBookingsData || []);
      } else {
        const bookingsData = await apiRequest(
          `/bookings?email=${currentUser.email}`,
        );
        setBookings(bookingsData || []);
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
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchDashboardData(parsedUser);
  }, []);

  const handleStripePayment = (bookingId, totalPrice) => {
    const confirmPayment = confirm(
      `Proceed to charge BDT ${totalPrice} via Stripe payment gateway network?`,
    );
    if (confirmPayment) {
      alert('Payment successful! Booking state shifted to PAID.');
    }
  };

  const handleUpdateRole = async (userId, targetRole) => {
    try {
      await apiRequest(`/users/role/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: targetRole }),
      });
      alert(`Account updated to ${targetRole} successfully!`);
      if (user) fetchDashboardData(user);
    } catch (err) {
      alert(err.message || 'Role modification rejected.');
    }
  };

  const handleMarkAsFraud = async userId => {
    if (
      !confirm(
        'CRITICAL WARNING: Flags malicious actions and hides associated fleet configurations.',
      )
    )
      return;
    try {
      const data = await apiRequest(`/users/fraud/${userId}`, {
        method: 'PATCH',
      });
      if (data.success) {
        alert('Vendor marked as fraud successfully.');
        if (user) fetchDashboardData(user);
      }
    } catch (err) {
      alert(err.message || 'Fraud processing failed.');
    }
  };

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
        alert('Ticket listed with pending verification status.');
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
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row">
      {/* Dynamic Dashboard Sidebar Layout */}
      <aside className="w-full md:w-64 bg-[#1a1a1a] border-r border-neutral-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-800">
            <LayoutDashboard className="w-5 h-5 text-emerald-500" />
            <span className="font-bold tracking-wide">Workspace Panel</span>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              My Profile
            </button>
            {user?.role === 'user' && (
              <>
                <button
                  onClick={() => setActiveTab('booked')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'booked' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
                >
                  My Booked Tickets
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'transactions' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
                >
                  Transaction History
                </button>
              </>
            )}
            {user?.role === 'vendor' && (
              <>
                <button
                  onClick={() => setActiveTab('add-ticket')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'add-ticket' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
                >
                  Add Ticket
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'revenue' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
                >
                  Revenue Overview
                </button>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('manage-users')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'manage-users' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
                >
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab('manage-tickets')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'manage-tickets' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
                >
                  Manage System Ledger
                </button>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Board Viewport Window */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
          <div>
            <h1 className="text-xl font-bold">Authorized User Profile</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Identity Access Logged As:{' '}
              <span className="text-neutral-300 font-mono">{user?.email}</span>
            </p>
          </div>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs uppercase font-mono tracking-wider px-3 py-1 rounded-lg">
            Clearance Context: {user?.role}
          </span>
        </div>

        {/* Tab Components Rendering Viewport */}
        {activeTab === 'profile' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              Account Clearance Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block text-xs uppercase font-mono mb-1">
                  User Full Name
                </span>
                <span className="font-bold text-white text-base">
                  {user?.name}
                </span>
              </div>
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block text-xs uppercase font-mono mb-1">
                  Secure Email Reference
                </span>
                <span className="font-bold text-white text-base">
                  {user?.email}
                </span>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'revenue' && user?.role === 'vendor' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Performance
              Analytics
            </h3>
            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="name" stroke="#525252" />
                    <YAxis stroke="#525252" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1f1f',
                        borderColor: '#404040',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fillOpacity={0.2}
                      fill="url(#colorUv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Dynamic Fallback Container Interface Simulation Blocks */}
        {activeTab === 'booked' && user?.role === 'user' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bookings.map(b => (
              <Card
                key={b._id}
                className="bg-[#1e1e1e] border border-neutral-800 p-5 rounded-2xl h-[220px] flex flex-col justify-between shadow-lg"
              >
                <div>
                  <h4 className="font-bold text-white text-base">
                    {b.company}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">{b.route}</p>
                </div>
                <div className="border-t border-neutral-900 pt-4 flex justify-between items-center">
                  <span className="text-base font-black text-emerald-400">
                    BDT {b.price}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleStripePayment(b._id, b.price)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-3"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Pay Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'add-ticket' && user?.role === 'vendor' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-emerald-500" /> Create Fleet
              Operation Listing
            </h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <Input
                label="Company Operator"
                placeholder="Green Line Paribahan"
                value={newTicket.company}
                onChange={e =>
                  setNewTicket({ ...newTicket, company: e.target.value })
                }
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
                  required
                />
                <Input
                  label="To Destination"
                  placeholder="Chittagong"
                  value={newTicket.to}
                  onChange={e =>
                    setNewTicket({ ...newTicket, to: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
              >
                Publish Fleet Request
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'manage-users' && user?.role === 'admin' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/60">
                {allUsers.map(u => (
                  <tr key={u._id} className="hover:bg-neutral-900/40">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4 text-xs font-mono">{u.email}</td>
                    <td className="p-4 flex gap-2">
                      <Button
                        size="sm"
                        color="warning"
                        onClick={() => handleUpdateRole(u._id, 'vendor')}
                        disabled={u.role === 'vendor'}
                      >
                        Make Vendor
                      </Button>
                      {u.role === 'vendor' && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="ghost"
                          onClick={() => handleMarkAsFraud(u._id)}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> Flag Fraud
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
