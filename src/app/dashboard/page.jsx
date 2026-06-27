'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@heroui/react';
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  TrendingUp,
  Ticket,
  DollarSign,
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

// ── Countdown Timer ──────────────────────────────────────────────
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

// ── Status Badge ─────────────────────────────────────────────────
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

// ── Constants ────────────────────────────────────────────────────
const PERKS_OPTIONS = [
  'AC',
  'WiFi',
  'Breakfast',
  'Snacks',
  'Charging Port',
  'Blanket',
  'Water Bottle',
];
const TRANSPORT_TYPES = ['Bus', 'Train', 'Plane', 'Launch'];

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

// ── imgbb Upload ─────────────────────────────────────────────────
async function uploadToImgbb(file, setImageUploading) {
  setImageUploading(true);
  try {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`,
      { method: 'POST', body: formData },
    );
    const data = await res.json();
    if (data.success) return data.data.url;
    throw new Error('Upload failed');
  } finally {
    setImageUploading(false);
  }
}

// ── isDeparturePassed helper ──────────────────────────────────────
function isDeparturePassed(date, time) {
  if (!date) return false;
  return Date.now() > new Date(`${date}T${time || '00:00'}`).getTime();
}

// ════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [vendorTickets, setVendorTickets] = useState([]);
  const [requestedBookings, setRequestedBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);

  // Ticket form
  const [newTicket, setNewTicket] = useState(EMPTY_TICKET);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // ── Sidebar ────────────────────────────────────────────────────
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
        { key: 'add-ticket', label: editingId ? 'Edit Ticket' : 'Add Ticket' },
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

  // ── Fetch Data ─────────────────────────────────────────────────
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
      toast.error(e.message || 'Data failed to load.');
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

  // Revenue stats fetch
  useEffect(() => {
    if (activeTab === 'revenue' && user?.role === 'vendor') {
      apiRequest('/revenue/stats')
        .then(data => setRevenueStats(data))
        .catch(() => toast.error('Revenue data load failed.'));
    }
  }, [activeTab, user]);

  // ── Ticket CRUD ────────────────────────────────────────────────
  const handleCreateOrUpdateTicket = async e => {
    e.preventDefault();
    setSubmitting(true);
    const id = toast.loading(
      editingId ? 'Updating ticket...' : 'Adding ticket...',
    );
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
        toast.update(id, {
          render: 'Ticket updated! ✅',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await apiRequest('/tickets', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.update(id, {
          render: 'Ticket submitted for admin approval! 🚀',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      }
      setNewTicket(EMPTY_TICKET);
      setEditingId(null);
      fetchData(user);
      setActiveTab('my-tickets');
    } catch (err) {
      toast.update(id, {
        render: err.message || 'Operation failed.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSelect = t => {
    setEditingId(t._id);
    setNewTicket({
      title: t.company || t.title,
      type: t.type || 'Bus',
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
    toast.info('Ticket loaded into editor.');
  };

  const handleDeleteTicket = async id => {
    if (!confirm('Delete this ticket?')) return;
    try {
      await apiRequest(`/tickets/${id}`, { method: 'DELETE' });
      toast.success('Ticket deleted.');
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
      toast.success(`Booking ${status}.`);
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
      toast.success(`Ticket ${status}.`);
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdvertiseToggle = async (id, current) => {
    const advertisedCount = allTickets.filter(t => t.advertised).length;
    if (!current && advertisedCount >= 6) {
      toast.error('Max 6 tickets can be advertised at a time!');
      return;
    }
    try {
      await apiRequest(`/tickets/${id}/advertise`, {
        method: 'PATCH',
        body: JSON.stringify({ advertised: !current }),
      });
      toast.success('Advertisement updated.');
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      const data = await apiRequest(`/users/role/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const targetUser = allUsers.find(u => u._id === userId);
      if (targetUser?.email === currentUser?.email && data.newToken) {
        localStorage.setItem('token', data.newToken);
        localStorage.setItem('user', JSON.stringify({ ...currentUser, role }));
      }

      toast.success(`User promoted to ${role}.`);
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkAsFraud = async userId => {
    if (
      !confirm('Flag this vendor as fraud? All their tickets will be hidden.')
    )
      return;
    try {
      await apiRequest(`/users/fraud/${userId}`, { method: 'PATCH' });
      toast.warn('Vendor flagged as fraud.');
      fetchData(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ Stripe Checkout — Hosted Payment Page
  const executeCheckout = async booking => {
    const toastId = toast.loading('Redirecting to Stripe...');
    try {
      const data = await apiRequest('/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          price: booking.price,
          ticketTitle: booking.company || booking.title,
          quantity: booking.quantity,
          bookingId: booking._id,
          ticketId: booking.ticketId,
        }),
      });
      toast.update(toastId, {
        render: 'Redirecting to payment... 🔄',
        type: 'success',
        isLoading: false,
        autoClose: 1000,
      });
      window.location.href = data.url;
    } catch (err) {
      toast.update(toastId, {
        render: err.message || 'Payment failed.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const togglePerk = perk => {
    setNewTicket(prev => ({
      ...prev,
      perks: prev.perks.includes(perk)
        ? prev.perks.filter(p => p !== perk)
        : [...prev.perks, perk],
    }));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  const advertisedCount = allTickets.filter(t => t.advertised).length;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row">
      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-[#1a1a1a] border-r border-neutral-800 p-6 flex flex-col justify-between md:min-h-screen shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-800">
            <LayoutDashboard className="w-5 h-5 text-emerald-500" />
            <span className="font-bold tracking-wide">Workspace</span>
          </div>
          <nav className="flex flex-col gap-1.5">
            {sidebarItems().map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.key
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
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

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-xs text-neutral-500 mt-1">
              <span className="font-mono text-neutral-300">{user?.email}</span>
            </p>
          </div>
          <Badge status={user?.role} />
        </div>
        {/* ── PROFILE ─────────────────────────────────── */}
        {activeTab === 'profile' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold mb-6">Account Overview</h3>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 shrink-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-emerald-400">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{user?.name}</h4>
                <p className="text-xs text-neutral-500 font-mono">
                  {user?.email}
                </p>
                <Badge status={user?.role} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email Address', value: user?.email },
                { label: 'Role', value: user?.role },
                { label: 'Status', value: 'Active', green: true },
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

        {/* ── MY BOOKED TICKETS (USER) ─────────────────── */}
        {activeTab === 'booked' && user?.role === 'user' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">My Booked Tickets</h3>
            {bookings.length === 0 ? (
              <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500">
                No bookings yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {bookings.map(b => {
                  const departed = isDeparturePassed(b.date, b.time);
                  return (
                    <Card
                      key={b._id}
                      className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-lg"
                    >
                      {/* Image */}
                      {b.image && (
                        <img
                          src={b.image}
                          alt={b.company || b.title}
                          className="w-full h-32 object-cover"
                        />
                      )}

                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {b.company || b.title}
                            </h4>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {b.route}
                            </p>
                          </div>
                          <Badge status={b.status} />
                        </div>

                        <div className="text-xs text-neutral-500 border-t border-neutral-900/40 pt-3 space-y-1">
                          <p>
                            Quantity:{' '}
                            <span className="text-white font-bold">
                              {b.quantity}
                            </span>
                          </p>
                          <p>
                            Total:{' '}
                            <span className="text-emerald-400 font-bold">
                              BDT {b.price}
                            </span>
                          </p>
                          <p>
                            Departure:{' '}
                            <span className="text-neutral-300">
                              {b.date} {b.time}
                            </span>
                          </p>
                        </div>

                        {/* Countdown */}
                        {b.status !== 'rejected' && (
                          <div className="flex items-center gap-1.5 bg-neutral-900 rounded-xl px-3 py-2 text-xs">
                            <span className="text-neutral-500">
                              Departs in:
                            </span>
                            <CountdownTimer date={b.date} time={b.time} />
                          </div>
                        )}

                        {/* ✅ Pay Now → Stripe Checkout */}
                        {b.status === 'accepted' &&
                          (departed ? (
                            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
                              Payment closed — departure time passed
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => executeCheckout(b)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs w-full mt-auto"
                            >
                              <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay
                              Now
                            </Button>
                          ))}
                        {b.status === 'pending' && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onClick={async () => {
                              if (!confirm('Cancel this booking?')) return;
                              try {
                                await apiRequest(`/bookings/${b._id}`, {
                                  method: 'DELETE',
                                });
                                toast.success('Booking cancelled.');
                                fetchData(user);
                              } catch (err) {
                                toast.error(err.message);
                              }
                            }}
                            className="text-xs font-bold rounded-xl w-full mt-1"
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TRANSACTIONS (USER) ──────────────────────── */}
        {activeTab === 'transactions' && user?.role === 'user' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Transaction History</h3>
            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
              {transactions.length === 0 ? (
                <p className="text-neutral-500 text-center py-10">
                  No transactions yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase font-mono">
                    <tr>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Ticket Title</th>
                      <th className="p-4">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr
                        key={tx._id}
                        className="border-b border-neutral-900/40"
                      >
                        <td className="p-4 font-mono text-xs text-neutral-400">
                          {tx.transactionId || tx._id}
                        </td>
                        <td className="p-4 font-black text-emerald-400">
                          BDT {tx.amount}
                        </td>
                        <td className="p-4 text-xs">{tx.ticketTitle}</td>
                        <td className="p-4 text-xs text-neutral-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        )}

        {/* ── ADD TICKET (VENDOR) ──────────────────────── */}
        {activeTab === 'add-ticket' && user?.role === 'vendor' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              {editingId ? 'Edit Ticket' : 'Add New Ticket'}
            </h2>
            <form onSubmit={handleCreateOrUpdateTicket} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Ticket Title
                </label>
                <input
                  required
                  placeholder="e.g. Green Line Express"
                  value={newTicket.title}
                  onChange={e =>
                    setNewTicket({ ...newTicket, title: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Transport Type
                </label>
                <select
                  required
                  value={newTicket.type}
                  onChange={e =>
                    setNewTicket({ ...newTicket, type: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {TRANSPORT_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    From
                  </label>
                  <input
                    required
                    placeholder="e.g. Dhaka"
                    value={newTicket.from}
                    onChange={e =>
                      setNewTicket({ ...newTicket, from: e.target.value })
                    }
                    className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    To
                  </label>
                  <input
                    required
                    placeholder="e.g. Chittagong"
                    value={newTicket.to}
                    onChange={e =>
                      setNewTicket({ ...newTicket, to: e.target.value })
                    }
                    className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Price (BDT)
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 500"
                    value={newTicket.price}
                    onChange={e =>
                      setNewTicket({ ...newTicket, price: e.target.value })
                    }
                    className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Total Seats
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 40"
                    value={newTicket.seats}
                    onChange={e =>
                      setNewTicket({ ...newTicket, seats: e.target.value })
                    }
                    className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Departure Date
                  </label>
                  <input
                    required
                    type="date"
                    value={newTicket.date}
                    onChange={e =>
                      setNewTicket({ ...newTicket, date: e.target.value })
                    }
                    className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Departure Time
                  </label>
                  <input
                    required
                    type="time"
                    value={newTicket.time}
                    onChange={e =>
                      setNewTicket({ ...newTicket, time: e.target.value })
                    }
                    className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Perks
                </label>
                <div className="flex flex-wrap gap-2">
                  {PERKS_OPTIONS.map(perk => (
                    <button
                      key={perk}
                      type="button"
                      onClick={() => togglePerk(perk)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                        newTicket.perks.includes(perk)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-emerald-500 hover:text-emerald-400'
                      }`}
                    >
                      {perk}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Ticket Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const toastId = toast.loading('Uploading image...');
                      try {
                        const url = await uploadToImgbb(
                          file,
                          setImageUploading,
                        );
                        setNewTicket(prev => ({ ...prev, image: url }));
                        toast.update(toastId, {
                          render: 'Image uploaded! ✅',
                          type: 'success',
                          isLoading: false,
                          autoClose: 2000,
                        });
                      } catch {
                        toast.update(toastId, {
                          render: 'Image upload failed.',
                          type: 'error',
                          isLoading: false,
                          autoClose: 2000,
                        });
                      }
                    }}
                    className="flex-1 text-sm text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:text-xs file:font-bold file:cursor-pointer cursor-pointer"
                  />
                  {imageUploading && (
                    <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  )}
                </div>
                {newTicket.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={newTicket.image}
                      alt="preview"
                      className="w-16 h-10 object-cover rounded-lg border border-neutral-700"
                    />
                    <span className="text-xs text-emerald-400">
                      Image ready ✓
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Vendor Name
                  </label>
                  <input
                    value={user?.name || ''}
                    disabled
                    className="w-full h-11 bg-neutral-800/40 border border-neutral-800 rounded-xl px-4 text-sm text-neutral-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Vendor Email
                  </label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full h-11 bg-neutral-800/40 border border-neutral-800 rounded-xl px-4 text-sm text-neutral-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={submitting || imageUploading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl mt-2"
              >
                {editingId ? 'Update Ticket' : 'Add Ticket'}
              </Button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setNewTicket(EMPTY_TICKET);
                  }}
                  className="w-full h-10 text-sm text-neutral-500 hover:text-white border border-neutral-800 rounded-xl"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </Card>
        )}

        {/* ── MY ADDED TICKETS (VENDOR) ────────────────── */}
        {activeTab === 'my-tickets' && user?.role === 'vendor' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">My Added Tickets</h3>
            {vendorTickets.length === 0 ? (
              <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500">
                No tickets added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {vendorTickets.map(t => (
                  <Card
                    key={t._id}
                    className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-lg"
                  >
                    {t.image && (
                      <img
                        src={t.image}
                        alt={t.title}
                        className="w-full h-28 object-cover"
                      />
                    )}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm truncate">
                          {t.company || t.title}
                        </h4>
                        <Badge status={t.status || 'pending'} />
                      </div>
                      <p className="text-xs text-neutral-400">
                        {t.from} → {t.to}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {t.type} · BDT {t.price} · {t.seats} seats
                      </p>
                      {t.perks?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {t.perks.slice(0, 3).map(p => (
                            <span
                              key={p}
                              className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                            >
                              ✓ {p}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-auto pt-2 border-t border-neutral-900/40">
                        <Button
                          size="sm"
                          onClick={() => handleEditSelect(t)}
                          disabled={t.status === 'rejected'}
                          className={`flex-1 rounded-xl transition-all ${
                            t.status === 'rejected'
                              ? 'bg-neutral-800/40 text-neutral-600 cursor-not-allowed opacity-50'
                              : 'bg-neutral-800 text-white hover:bg-neutral-700'
                          }`}
                        >
                          Update
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onClick={() => handleDeleteTicket(t._id)}
                          disabled={t.status === 'rejected'}
                          className={`flex-1 rounded-xl ${t.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REQUESTED BOOKINGS (VENDOR) ──────────────── */}
        {activeTab === 'requested-bookings' && user?.role === 'vendor' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <h3 className="text-lg font-bold mb-4">Requested Bookings</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-900 text-xs text-neutral-400 uppercase">
                  <th className="p-4">User</th>
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Qty</th>
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
                    <td className="p-4 text-xs">{b.company || b.title}</td>
                    <td className="p-4 text-xs font-bold">{b.quantity}</td>
                    <td className="p-4 font-bold text-emerald-400">
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

        {/* ── REVENUE OVERVIEW (VENDOR) ────────────────── */}
        {activeTab === 'revenue' && user?.role === 'vendor' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Revenue Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Ticket className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-mono">
                    Total Tickets Added
                  </p>
                  <p className="text-2xl font-black text-white">
                    {revenueStats?.totalTickets ?? '—'}
                  </p>
                </div>
              </div>
              <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-mono">
                    Total Tickets Sold
                  </p>
                  <p className="text-2xl font-black text-white">
                    {revenueStats?.totalSold ?? '—'}
                  </p>
                </div>
              </div>
              <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-mono">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-black text-emerald-400">
                    BDT {revenueStats?.totalRevenue ?? '—'}
                  </p>
                </div>
              </div>
            </div>
            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
              <h4 className="text-sm font-bold mb-4 text-neutral-300">
                Revenue by Transport Type
              </h4>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueStats?.byType || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111',
                        borderColor: '#333',
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#10b981"
                      name="Revenue (BDT)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="tickets"
                      fill="#3b82f6"
                      name="Tickets"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ── MANAGE TICKETS (ADMIN) ───────────────────── */}
        {activeTab === 'manage-tickets' && user?.role === 'admin' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <h3 className="text-lg font-bold mb-4">Manage Tickets</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-900 text-xs text-neutral-400 uppercase">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allTickets.map(t => (
                  <tr key={t._id} className="border-b border-neutral-900/40">
                    <td className="p-4 font-bold text-white">
                      {t.company || t.title}
                    </td>
                    <td className="p-4 text-xs">
                      {t.from} → {t.to}
                    </td>
                    <td className="p-4 text-xs text-neutral-400">
                      {t.vendorEmail}
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

        {/* ── MANAGE USERS (ADMIN) ─────────────────────── */}
        {activeTab === 'manage-users' && user?.role === 'admin' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <h3 className="text-lg font-bold mb-4">Manage Users</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-900 text-xs text-neutral-400 uppercase">
                  <th className="p-4">Name / Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Actions</th>
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
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          color="secondary"
                          variant="flat"
                          onClick={() => handleUpdateRole(u._id, 'admin')}
                          disabled={u.role === 'admin'}
                          className="text-xs font-bold rounded-xl h-8"
                        >
                          Make Admin
                        </Button>
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          onClick={() => handleUpdateRole(u._id, 'vendor')}
                          disabled={u.role === 'vendor'}
                          className="text-xs font-bold rounded-xl h-8"
                        >
                          Make Vendor
                        </Button>
                        {u.role === 'vendor' && (
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleMarkAsFraud(u._id)}
                            className="text-xs font-bold rounded-xl h-8"
                          >
                            Mark as Fraud
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ── ADVERTISE TICKETS (ADMIN) ────────────────── */}
        {activeTab === 'advertise-tickets' && user?.role === 'admin' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Advertise Tickets</h3>
              <span
                className={`text-xs font-mono px-3 py-1 rounded-full border ${advertisedCount >= 6 ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}
              >
                {advertisedCount} / 6 Active
              </span>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-900 text-xs text-neutral-400">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Toggle</th>
                </tr>
              </thead>
              <tbody>
                {allTickets
                  .filter(t => t.status === 'approved')
                  .map(t => {
                    const cantActivate = !t.advertised && advertisedCount >= 6;
                    return (
                      <tr
                        key={t._id}
                        className="border-b border-neutral-900/40"
                      >
                        <td className="p-4 font-bold text-white">
                          {t.company || t.title}
                        </td>
                        <td className="p-4 text-xs text-neutral-400">
                          {t.from} → {t.to}
                        </td>
                        <td className="p-4 font-bold text-xs">
                          {t.advertised ? (
                            <span className="text-emerald-400">Active</span>
                          ) : (
                            <span className="text-neutral-500">Inactive</span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() =>
                              handleAdvertiseToggle(t._id, t.advertised)
                            }
                            disabled={cantActivate}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                              cantActivate
                                ? 'bg-neutral-800 text-neutral-600 border-neutral-700 cursor-not-allowed'
                                : t.advertised
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                          >
                            {t.advertised
                              ? 'Remove'
                              : cantActivate
                                ? 'Limit Reached'
                                : 'Advertise'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
