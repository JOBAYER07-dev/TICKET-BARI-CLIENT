'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@heroui/react';
import {
  Activity,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldAlert,
  Clock,
  User,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Star,
} from 'lucide-react';
import { apiRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function CountdownTimer({ date, time }) {
  const [text, setText] = useState('');
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (!date) return;
    const target = new Date(`${date}T${time || '00:00'}`).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setText('DEPARTED');
        setPassed(true);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date, time]);

  return (
    <span
      className={`text-xs font-mono font-bold ${passed ? 'text-red-400' : 'text-amber-400'}`}
    >
      {text || 'Calculating...'}
    </span>
  );
}

function Badge({ status }) {
  const map = {
    pending: 'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10    text-red-400    border-red-500/20',
    paid: 'bg-blue-500/10   text-blue-400   border-blue-500/20',
    admin: 'bg-purple-500/10  text-purple-400  border-purple-500/20',
    vendor: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
  };
  return (
    <span
      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase ${map[status] || 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}
    >
      {status}
    </span>
  );
}

const PERKS = [
  'AC',
  'WiFi',
  'Breakfast',
  'Snacks',
  'Charging Port',
  'Blanket',
  'Water Bottle',
];
const EMPTY_TICKET = {
  title: '',
  type: 'Bus',
  from: '',
  to: '',
  price: '',
  seats: '',
  date: '',
  time: '',
  perks: [],
  image: '',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Storage Layers
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [vendorTickets, setVendorTickets] = useState([]);
  const [requestedBookings, setRequestedBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  // Modal payment structures
  const [payTarget, setPayTarget] = useState(null);
  const [stripeForm, setStripeForm] = useState({
    card: '4242 •••• •••• 4242',
    holder: '',
  });
  const [payLoading, setPayLoading] = useState(false);

  // Form entries
  const [newTicket, setNewTicket] = useState(EMPTY_TICKET);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchData = async u => {
    try {
      if (u.role === 'admin') {
        const [users, tickets] = await Promise.all([
          apiRequest('/users'),
          apiRequest('/tickets/all'),
        ]);
        setAllUsers(users || []);
        setAllTickets(tickets || []);
      } else if (u.role === 'vendor') {
        const [vt, rb] = await Promise.all([
          apiRequest(`/tickets/vendor?email=${u.email}`),
          apiRequest('/bookings/vendor'),
        ]);
        setVendorTickets(vt || []);
        setRequestedBookings(rb || []);
      } else {
        const [bk, tx] = await Promise.all([
          apiRequest(`/bookings?email=${u.email}`),
          apiRequest(`/transactions?email=${u.email}`).catch(() => []),
        ]);
        setBookings(bk || []);
        setTransactions(tx || []);
      }
    } catch (e) {
      setError(e.message || 'Error processing network requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    fetchData(parsed);
  }, []);

  const handleCreateOrUpdateTicket = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...newTicket,
        price: Number(newTicket.price),
        seats: Number(newTicket.seats),
        company: newTicket.title,
        vendorName: user.name,
        vendorEmail: user.email,
      };

      if (editingId) {
        await apiRequest(`/tickets/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Ticket layout modified successfully.');
      } else {
        await apiRequest('/tickets', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Ticket submitted successfully to Admin Panel queue!');
      }

      setNewTicket(EMPTY_TICKET);
      setEditingId(null);
      fetchData(user);
      setActiveTab('my-tickets');
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSelect = t => {
    setEditingId(t._id);
    setNewTicket({
      title: t.company || t.title,
      type: t.type,
      from: t.from,
      to: t.to,
      price: t.price,
      seats: t.seats,
      date: t.date || '',
      time: t.time || '',
      perks: t.perks || [],
      image: t.image || '',
    });
    setActiveTab('add-ticket');
  };

  const handleDeleteTicket = async id => {
    if (!confirm('Delete this travel ticket permanently?')) return;
    try {
      await apiRequest(`/tickets/${id}`, { method: 'DELETE' });
      toast.success('Ticket deleted successfully.');
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBookingAction = async (id, status) => {
    try {
      await apiRequest(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Booking request marked as ${status}.`);
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTicketStatus = async (id, status) => {
    try {
      await apiRequest(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Ticket operation successfully ${status}.`);
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdvertiseToggle = async (id, current) => {
    try {
      await apiRequest(`/tickets/${id}/advertise`, {
        method: 'PATCH',
        body: JSON.stringify({ advertised: !current }),
      });
      toast.success('Advertisement parameter updated.');
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await apiRequest(`/users/role/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      toast.success(`User access role changed to ${role}.`);
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkAsFraud = async userId => {
    if (!confirm('Flag this vendor as fraud? This hides all active fleets.'))
      return;
    try {
      await apiRequest(`/users/fraud/${userId}`, { method: 'PATCH' });
      toast.success('Vendor isolated and banned.');
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const executeStripePayment = async e => {
    e.preventDefault();
    setPayLoading(true);
    try {
      await apiRequest('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: payTarget._id,
          transactionId: 'ch_' + Math.random().toString(36).substr(2, 9),
          ticketId: payTarget.ticketId,
          finalPrice: payTarget.price,
          ticketTitle: payTarget.company || payTarget.title,
          userEmail: user.email,
          quantity: payTarget.quantity,
        }),
      });
      toast.success(
        'Stripe Secure Gateway approved charge! Token synchronized.',
      );
      setPayTarget(null);
      fetchData(user);
    } catch (err) {
      toast.error('Payment gateway rejected transaction authorization.');
    } finally {
      setPayLoading(false);
    }
  };

  const sidebarItems = () => {
    const base = [{ key: 'profile', label: 'My Profile' }];
    if (user?.role === 'user')
      return [
        ...base,
        { key: 'booked', label: 'My Booked Tickets' },
        { key: 'transactions', label: 'Transaction History' },
      ];
    if (user?.role === 'vendor')
      return [
        ...base,
        { key: 'add-ticket', label: editingId ? 'Modify Fleet' : 'Add Ticket' },
        { key: 'my-tickets', label: 'My Added Tickets' },
        { key: 'requested-bookings', label: 'Requested Bookings' },
        { key: 'revenue', label: 'Revenue Overview' },
      ];
    if (user?.role === 'admin')
      return [
        ...base,
        { key: 'manage-tickets', label: 'Manage Tickets' },
        { key: 'manage-users', label: 'Manage Users' },
        { key: 'advertise-tickets', label: 'Advertise Tickets' },
      ];
    return base;
  };

  const chartData = ['Bus', 'Train', 'Plane', 'Launch'].map(t => ({
    name: t,
    tickets: vendorTickets.filter(v => v.type === t).length,
  }));

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#1a1a1a] border-r border-neutral-800 p-6 flex flex-col justify-between md:min-h-screen shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-800">
            <LayoutDashboard className="w-5 h-5 text-emerald-500" />
            <span className="font-bold tracking-wide">Workspace Panel</span>
          </div>
          <nav className="flex flex-col gap-1.5">
            {sidebarItems().map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.key ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            router.push('/login');
          }}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-400 transition-colors mt-8 px-4 py-2.5 rounded-xl hover:bg-red-500/5"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Identity Access Logged As:{' '}
              <span className="font-mono text-neutral-300">{user?.email}</span>
            </p>
          </div>
          <Badge status={user?.role} />
        </div>

        {activeTab === 'profile' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold mb-6">Authorized User Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'User Full Name', value: user?.name },
                { label: 'Secure Email Reference', value: user?.email },
                { label: 'Clearance Context', value: user?.role },
                {
                  label: 'Database Ledger Status',
                  value: 'Active Operational',
                  green: true,
                },
              ].map(item => (
                <div
                  key={item.label}
                  className="bg-neutral-900 p-4 rounded-xl border border-neutral-800"
                >
                  <span className="text-neutral-500 block text-xs uppercase font-mono mb-1">
                    {item.label}
                  </span>
                  <span
                    className={`font-bold capitalize ${item.green ? 'text-emerald-400' : 'text-white'}`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'booked' && user?.role === 'user' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">My Booked Tickets Ledger</h3>
            {bookings.length === 0 ? (
              <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500">
                No active ticket claims recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {bookings.map(b => (
                  <Card
                    key={b._id}
                    className="bg-[#1e1e1e] border border-neutral-800 p-5 rounded-2xl flex flex-col gap-3 shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {b.company || b.title || 'Fleet Transit'}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {b.route}
                        </p>
                      </div>
                      <Badge status={b.status} />
                    </div>
                    <div className="text-xs text-neutral-500 border-t border-neutral-900/60 pt-3 space-y-1">
                      <p>
                        Quantity:{' '}
                        <span className="text-white font-bold">
                          {b.quantity}
                        </span>
                      </p>
                      <p>
                        Total Charge:{' '}
                        <span className="text-emerald-400 font-bold">
                          BDT {b.price}
                        </span>
                      </p>
                    </div>
                    {b.status === 'accepted' && (
                      <Button
                        size="sm"
                        onClick={() => setPayTarget(b)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs w-full mt-2"
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay Now —
                        BDT {b.price}
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-ticket' && user?.role === 'vendor' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-emerald-500" />{' '}
              {editingId
                ? 'Modify Fleet Route Structure'
                : 'Publish New Travel Operation'}
            </h2>
            <form onSubmit={handleCreateOrUpdateTicket} className="space-y-4">
              <input
                required
                placeholder="Ticket Carrier Title (e.g. SilkLine Express)"
                value={newTicket.title}
                onChange={e =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white focus:border-emerald-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="From Station"
                  value={newTicket.from}
                  onChange={e =>
                    setNewTicket({ ...newTicket, from: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white"
                />
                <input
                  required
                  placeholder="To Destination"
                  value={newTicket.to}
                  onChange={e =>
                    setNewTicket({ ...newTicket, to: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white"
                />
                <input
                  required
                  type="number"
                  placeholder="Fare Rate (BDT)"
                  value={newTicket.price}
                  onChange={e =>
                    setNewTicket({ ...newTicket, price: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white"
                />
                <input
                  required
                  type="number"
                  placeholder="Total Seat Inventory"
                  value={newTicket.seats}
                  onChange={e =>
                    setNewTicket({ ...newTicket, seats: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white"
                />
                <input
                  required
                  type="date"
                  value={newTicket.date}
                  onChange={e =>
                    setNewTicket({ ...newTicket, date: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white"
                />
                <input
                  required
                  type="time"
                  value={newTicket.time}
                  onChange={e =>
                    setNewTicket({ ...newTicket, time: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white"
                />
              </div>
              <Button
                type="submit"
                isLoading={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl mt-4"
              >
                {editingId ? 'Save Route Changes' : 'Dispatch Ticket Request'}
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'my-tickets' && user?.role === 'vendor' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {vendorTickets.map(t => (
              <Card
                key={t._id}
                className="bg-[#1e1e1e] border border-neutral-800 p-5 rounded-2xl flex flex-col gap-3 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm truncate">
                    {t.company || t.title}
                  </h4>
                  <Badge status={t.status || 'pending'} />
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  {t.from} → {t.to}
                </p>
                <div className="flex gap-2 mt-4 pt-2 border-t border-neutral-900/60">
                  <Button
                    size="sm"
                    onClick={() => handleEditSelect(t)}
                    disabled={t.status === 'rejected'}
                    className="flex-1 bg-neutral-800 text-white rounded-xl"
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onClick={() => handleDeleteTicket(t._id)}
                    disabled={t.status === 'rejected'}
                    className="flex-1 rounded-xl"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'requested-bookings' && user?.role === 'vendor' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-900 text-xs text-neutral-400 uppercase">
                  <th className="p-4">Passenger</th>
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requestedBookings.map(b => (
                  <tr key={b._id} className="border-b border-neutral-900/40">
                    <td className="p-4 text-xs font-bold text-white">
                      {b.userName}
                      <p className="text-[10px] text-neutral-500 font-mono font-normal">
                        {b.userEmail}
                      </p>
                    </td>
                    <td className="p-4 text-xs">
                      {b.company || b.title}{' '}
                      <span className="text-neutral-500">(x{b.quantity})</span>
                    </td>
                    <td className="p-4 text-emerald-400 font-bold">
                      BDT {b.price}
                    </td>
                    <td className="p-4">
                      <Badge status={b.status} />
                    </td>
                    <td className="p-4">
                      {b.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="success"
                            onClick={() =>
                              handleBookingAction(b._id, 'accepted')
                            }
                            className="text-white text-xs font-bold rounded-xl h-8"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onClick={() =>
                              handleBookingAction(b._id, 'rejected')
                            }
                            className="text-xs font-bold rounded-xl h-8"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'manage-tickets' && user?.role === 'admin' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-900 text-xs text-neutral-400 uppercase">
                  <th className="p-4">Operator</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allTickets.map(t => (
                  <tr key={t._id} className="border-b border-neutral-900/40">
                    <td className="p-4 font-bold text-white">
                      {t.company || t.title}
                      <p className="text-[10px] text-neutral-500 font-mono font-normal">
                        {t.vendorEmail}
                      </p>
                    </td>
                    <td className="p-4 text-xs">
                      {t.from} → {t.to}
                    </td>
                    <td className="p-4">
                      <Badge status={t.status || 'pending'} />
                    </td>
                    <td className="p-4 flex gap-2">
                      {t.status !== 'approved' && (
                        <Button
                          size="sm"
                          color="success"
                          onClick={() => handleTicketStatus(t._id, 'approved')}
                          className="text-white text-xs font-bold h-8 rounded-xl"
                        >
                          Approve
                        </Button>
                      )}
                      {t.status !== 'rejected' && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onClick={() => handleTicketStatus(t._id, 'rejected')}
                          className="text-xs font-bold h-8 rounded-xl"
                        >
                          Reject
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'manage-users' && user?.role === 'admin' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-900 text-xs text-neutral-400 uppercase">
                  <th className="p-4">User Identity</th>
                  <th className="p-4">Role Context</th>
                  <th className="p-4">Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u._id} className="border-b border-neutral-900/40">
                    <td className="p-4 font-bold text-white">
                      {u.name}
                      <p className="text-xs text-neutral-500 font-mono font-normal">
                        {u.email}
                      </p>
                    </td>
                    <td className="p-4">
                      <Badge status={u.role} />
                    </td>
                    <td className="p-4 flex gap-2">
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        onClick={() => handleUpdateRole(u._id, 'vendor')}
                        disabled={u.role === 'vendor'}
                      >
                        Make Vendor
                      </Button>
                      {u.role === 'vendor' && (
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleMarkAsFraud(u._id)}
                        >
                          Flag Fraud
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'advertise-tickets' && user?.role === 'admin' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Advertisement Manager</h3>
              <span className="text-xs text-amber-400 font-mono">
                {allTickets.filter(t => t.advertised).length} / 6 Active
              </span>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-900 text-xs text-neutral-400">
                  <th className="p-4">Transit Option</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Toggle Context</th>
                </tr>
              </thead>
              <tbody>
                {allTickets
                  .filter(t => t.status === 'approved')
                  .map(t => (
                    <tr key={t._id} className="border-b border-neutral-900/40">
                      <td className="p-4 font-bold text-white">
                        {t.company || t.title}
                        <p className="text-xs text-neutral-500 font-mono">
                          {t.from} → {t.to}
                        </p>
                      </td>
                      <td className="p-4 font-bold text-xs">
                        {t.advertised ? (
                          <span className="text-emerald-400">Active Ad</span>
                        ) : (
                          <span className="text-neutral-500">Off</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() =>
                            handleAdvertiseToggle(t._id, t.advertised)
                          }
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${t.advertised ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                        >
                          {t.advertised
                            ? 'Unadvertise'
                            : 'Activate Advertisement'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>

      {/* STRIPE SECURE PAYMENT GATEWAY CARD MODAL INTERFACE */}
      {payTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-2xl space-y-5 animate-appearance-in">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" /> Stripe
                Payment Gateway
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Complete transit clearance for{' '}
                {payTarget.company || payTarget.title}
              </p>
            </div>
            <form onSubmit={executeStripePayment} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                  Card Credentials (Stripe Sandbox)
                </label>
                <input
                  disabled
                  value={stripeForm.card}
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-xl px-4 text-sm font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                  Card Holder Name
                </label>
                <input
                  required
                  placeholder="e.g. REEZ"
                  value={stripeForm.holder}
                  onChange={e =>
                    setStripeForm({ ...stripeForm, holder: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 text-sm outline-none focus:border-emerald-500 font-bold"
                />
              </div>
              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-900 flex justify-between items-center text-xs">
                <span className="text-neutral-400">Total Charged Amount:</span>
                <span className="text-emerald-400 font-black text-base">
                  BDT {payTarget.price}
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="flat"
                  onClick={() => setPayTarget(null)}
                  className="flex-1 bg-neutral-900 text-neutral-400 font-bold h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={payLoading}
                  className="flex-1 bg-emerald-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-950/40"
                >
                  Authorize Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
