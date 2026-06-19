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
  FileText,
  DollarSign,
  Star,
} from 'lucide-react';
import { apiRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

// ─────────────────────────────────────────────
// Per-booking countdown timer
// ─────────────────────────────────────────────
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

  if (!date) return null;
  return (
    <span
      className={`text-xs font-mono font-bold ${passed ? 'text-red-400' : 'text-amber-400'}`}
    >
      {text || 'Calculating...'}
    </span>
  );
}

// ─────────────────────────────────────────────
// Status badge helper
// ─────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    pending: 'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10    text-red-400    border-red-500/20',
    paid: 'bg-blue-500/10   text-blue-400   border-blue-500/20',
    admin: 'bg-purple-500/10  text-purple-400  border-purple-500/20',
    vendor: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
    user: 'bg-neutral-800   text-neutral-400 border-neutral-700',
  };
  return (
    <span
      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase ${map[status] || map.user}`}
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

// ─────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User data
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Vendor data
  const [vendorTickets, setVendorTickets] = useState([]);
  const [requestedBookings, setRequestedBookings] = useState([]);

  // Admin data
  const [allUsers, setAllUsers] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  // Vendor form
  const [newTicket, setNewTicket] = useState(EMPTY_TICKET);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ──────────────────────────────────
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
          apiRequest(`/bookings/vendor?email=${u.email}`),
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
      setError(e.message || 'Failed to load data.');
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

  // ── imgbb upload ───────────────────────────
  const uploadImage = async file => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`,
      { method: 'POST', body: form },
    );
    const json = await res.json();
    if (!json.success) throw new Error('Image upload failed');
    return json.data.url;
  };

  // ── Handlers ──────────────────────────────

  // Vendor: create ticket
  const handleCreateTicket = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const payload = {
        ...newTicket,
        price: Number(newTicket.price),
        seats: Number(newTicket.seats),
        image: imageUrl,
        company: newTicket.title, // backend compat
        vendorName: user.name,
        vendorEmail: user.email,
        status: 'pending',
      };
      const data = await apiRequest('/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.success) {
        alert('Ticket submitted! Awaiting admin approval.');
        setNewTicket(EMPTY_TICKET);
        setImageFile(null);
        fetchData(user);
        setActiveTab('my-tickets');
      }
    } catch (err) {
      alert(err.message || 'Failed to add ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  // Vendor: delete ticket
  const handleDeleteTicket = async id => {
    if (!confirm('Delete this ticket permanently?')) return;
    try {
      await apiRequest(`/tickets/${id}`, { method: 'DELETE' });
      fetchData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  // Vendor: accept / reject booking
  const handleBookingAction = async (id, status) => {
    try {
      await apiRequest(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  // Admin: approve / reject ticket
  const handleTicketStatus = async (id, status) => {
    try {
      await apiRequest(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  // Admin: advertise toggle (max 6)
  const handleAdvertiseToggle = async (id, current) => {
    const advertisedCount = allTickets.filter(t => t.advertised).length;
    if (!current && advertisedCount >= 6) {
      alert('Maximum 6 tickets can be advertised at a time.');
      return;
    }
    try {
      await apiRequest(`/tickets/${id}/advertise`, {
        method: 'PATCH',
        body: JSON.stringify({ advertised: !current }),
      });
      fetchData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  // Admin: update user role
  const handleUpdateRole = async (userId, role) => {
    try {
      await apiRequest(`/users/role/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      alert(`Role updated to ${role}.`);
      fetchData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  // Admin: mark fraud
  const handleMarkAsFraud = async userId => {
    if (!confirm('Mark as fraud? Their tickets will be hidden.')) return;
    try {
      await apiRequest(`/users/fraud/${userId}`, { method: 'PATCH' });
      alert('Vendor marked as fraud.');
      fetchData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  // User: stripe payment
  const handlePay = async (id, price) => {
    if (!confirm(`Pay BDT ${price} via Stripe?`)) return;
    try {
      await apiRequest(`/bookings/${id}/pay`, { method: 'PATCH' });
      alert('Payment successful!');
      fetchData(user);
    } catch (err) {
      alert(err.message || 'Payment failed.');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // ── Sidebar items ─────────────────────────
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
        { key: 'add-ticket', label: 'Add Ticket' },
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

  // Revenue chart data
  const chartData = ['Bus', 'Train', 'Plane', 'Launch'].map(t => ({
    name: t,
    tickets: vendorTickets.filter(v => v.type === t).length,
  }));

  // ── Loading / Error ────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  // ── Render ────────────────────────────────
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row">
      {/* ── SIDEBAR ─────────────────────────── */}
      <aside className="w-full md:w-64 bg-[#1a1a1a] border-r border-neutral-800 p-6 flex flex-col justify-between md:min-h-screen shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-800">
            <LayoutDashboard className="w-5 h-5 text-emerald-500" />
            <span className="font-bold tracking-wide">Dashboard</span>
          </div>
          <nav className="flex flex-col gap-1.5">
            {sidebarItems().map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.key
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-400 transition-colors mt-8 px-4 py-2.5 rounded-xl hover:bg-red-500/5"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* ── MAIN ────────────────────────────── */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 shadow-xl">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Logged in as:{' '}
              <span className="font-mono text-neutral-300">{user?.email}</span>
            </p>
          </div>
          <Badge status={user?.role} />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ═══════════════════════════════════
            PROFILE
        ═══════════════════════════════════ */}
        {activeTab === 'profile' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold mb-6">Account Overview</h3>
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 overflow-hidden">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-9 h-9 text-emerald-500" />
                )}
              </div>
              <h4 className="font-bold text-lg">{user?.name}</h4>
              <Badge status={user?.role} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email', value: user?.email },
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

        {/* ═══════════════════════════════════
            USER — BOOKED TICKETS
        ═══════════════════════════════════ */}
        {activeTab === 'booked' && user?.role === 'user' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">My Booked Tickets</h3>
            {bookings.length === 0 ? (
              <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500">
                No bookings yet. Go browse tickets!
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
                          {b.company || b.title}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {b.route}
                        </p>
                      </div>
                      <Badge status={b.status} />
                    </div>

                    <div className="text-xs text-neutral-500 space-y-1 border-t border-neutral-900 pt-3">
                      <p>
                        Qty:{' '}
                        <span className="text-white font-semibold">
                          {b.quantity}
                        </span>
                      </p>
                      <p>
                        Total:{' '}
                        <span className="text-emerald-400 font-bold">
                          BDT {b.price}
                        </span>
                      </p>
                      {b.time && (
                        <p>
                          Dep:{' '}
                          <span className="text-neutral-300">
                            {b.date} · {b.time}
                          </span>
                        </p>
                      )}
                    </div>

                    {b.status !== 'rejected' && b.date && (
                      <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <CountdownTimer date={b.date} time={b.time} />
                      </div>
                    )}

                    {b.status === 'accepted' && (
                      <Button
                        size="sm"
                        onClick={() => handlePay(b._id, b.price)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs w-full"
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay Now —
                        BDT {b.price}
                      </Button>
                    )}

                    {b.status === 'rejected' && (
                      <p className="text-xs text-red-400">
                        Rejected by vendor.
                      </p>
                    )}

                    {b.status === 'paid' && (
                      <p className="text-xs text-blue-400 font-semibold">
                        ✓ Payment confirmed
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════
            USER — TRANSACTION HISTORY
        ═══════════════════════════════════ */}
        {activeTab === 'transactions' && user?.role === 'user' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Transaction History</h3>
            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
              {transactions.length === 0 ? (
                <p className="text-neutral-500 text-center py-10">
                  No transactions yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Ticket</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/60">
                    {transactions.map(tx => (
                      <tr key={tx._id} className="hover:bg-neutral-900/40">
                        <td className="p-4 font-mono text-xs text-neutral-400">
                          {tx._id}
                        </td>
                        <td className="p-4 font-bold text-emerald-400">
                          BDT {tx.amount}
                        </td>
                        <td className="p-4">{tx.ticketTitle}</td>
                        <td className="p-4 text-xs">
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

        {/* ═══════════════════════════════════
            VENDOR — ADD TICKET
        ═══════════════════════════════════ */}
        {activeTab === 'add-ticket' && user?.role === 'vendor' && (
          <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-emerald-500" /> Add New Ticket
            </h2>
            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="label-style">Ticket Title</label>
                  <input
                    required
                    placeholder="e.g. Green Line Express"
                    value={newTicket.title}
                    onChange={e =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    className="input-style"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="label-style">Transport Type</label>
                  <select
                    value={newTicket.type}
                    onChange={e =>
                      setNewTicket({ ...newTicket, type: e.target.value })
                    }
                    className="input-style"
                  >
                    <option value="Bus">Bus</option>
                    <option value="Train">Train</option>
                    <option value="Plane">Plane</option>
                    <option value="Launch">Launch</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="label-style">Price (per unit) BDT</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 550"
                    value={newTicket.price}
                    onChange={e =>
                      setNewTicket({ ...newTicket, price: e.target.value })
                    }
                    className="input-style"
                  />
                </div>

                {/* From */}
                <div>
                  <label className="label-style">From Location</label>
                  <input
                    required
                    placeholder="e.g. Dhaka"
                    value={newTicket.from}
                    onChange={e =>
                      setNewTicket({ ...newTicket, from: e.target.value })
                    }
                    className="input-style"
                  />
                </div>

                {/* To */}
                <div>
                  <label className="label-style">To Destination</label>
                  <input
                    required
                    placeholder="e.g. Chittagong"
                    value={newTicket.to}
                    onChange={e =>
                      setNewTicket({ ...newTicket, to: e.target.value })
                    }
                    className="input-style"
                  />
                </div>

                {/* Seats */}
                <div>
                  <label className="label-style">Total Seats</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 40"
                    value={newTicket.seats}
                    onChange={e =>
                      setNewTicket({ ...newTicket, seats: e.target.value })
                    }
                    className="input-style"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="label-style">Departure Date</label>
                  <input
                    required
                    type="date"
                    value={newTicket.date}
                    onChange={e =>
                      setNewTicket({ ...newTicket, date: e.target.value })
                    }
                    className="input-style"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="label-style">Departure Time</label>
                  <input
                    required
                    type="time"
                    value={newTicket.time}
                    onChange={e =>
                      setNewTicket({ ...newTicket, time: e.target.value })
                    }
                    className="input-style"
                  />
                </div>
              </div>

              {/* Perks */}
              <div>
                <label className="label-style mb-2">Perks</label>
                <div className="flex flex-wrap gap-3">
                  {PERKS.map(perk => (
                    <label
                      key={perk}
                      className="flex items-center gap-2 cursor-pointer bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl hover:border-emerald-500/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={newTicket.perks.includes(perk)}
                        onChange={e => {
                          setNewTicket({
                            ...newTicket,
                            perks: e.target.checked
                              ? [...newTicket.perks, perk]
                              : newTicket.perks.filter(p => p !== perk),
                          });
                        }}
                        className="accent-emerald-500"
                      />
                      <span className="text-sm text-neutral-300">{perk}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="label-style">Ticket Image (imgbb)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-400 focus:outline-none file:bg-emerald-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:mr-3 file:cursor-pointer"
                />
                {imageFile && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ {imageFile.name}
                  </p>
                )}
              </div>

              {/* Readonly vendor fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-style">Vendor Name (readonly)</label>
                  <input
                    value={user?.name || ''}
                    disabled
                    className="input-style opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="label-style">Vendor Email (readonly)</label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="input-style opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
              >
                Add Ticket
              </Button>
            </form>
          </Card>
        )}

        {/* ═══════════════════════════════════
            VENDOR — MY ADDED TICKETS
        ═══════════════════════════════════ */}
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
                    className="bg-[#1e1e1e] border border-neutral-800 p-5 rounded-2xl flex flex-col gap-3 shadow-lg"
                  >
                    {t.image && (
                      <img
                        src={t.image}
                        alt={t.title}
                        className="w-full h-28 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">
                          {t.title || t.company}
                        </h4>
                        <p className="text-xs text-neutral-400">
                          {t.from} → {t.to}
                        </p>
                      </div>
                      <Badge status={t.status || 'pending'} />
                    </div>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>
                        Type: <span className="text-neutral-300">{t.type}</span>
                      </p>
                      <p>
                        Price:{' '}
                        <span className="text-emerald-400 font-bold">
                          BDT {t.price}
                        </span>
                      </p>
                      <p>
                        Seats:{' '}
                        <span className="text-neutral-300">{t.seats}</span>
                      </p>
                      <p>
                        Departure:{' '}
                        <span className="text-neutral-300">
                          {t.date} · {t.time}
                        </span>
                      </p>
                    </div>
                    {t.perks?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.perks.map(p => (
                          <span
                            key={p}
                            className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-auto pt-2 border-t border-neutral-900">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        disabled={t.status === 'rejected'}
                        onClick={() =>
                          alert(
                            'Edit modal — implement with a form similar to Add Ticket',
                          )
                        }
                        className="flex-1 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Update
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        disabled={t.status === 'rejected'}
                        onClick={() => handleDeleteTicket(t._id)}
                        className="flex-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════
            VENDOR — REQUESTED BOOKINGS
        ═══════════════════════════════════ */}
        {activeTab === 'requested-bookings' && user?.role === 'vendor' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Requested Bookings</h3>
            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
              {requestedBookings.length === 0 ? (
                <p className="text-neutral-500 text-center py-10">
                  No booking requests yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Passenger</th>
                      <th className="p-4">Ticket</th>
                      <th className="p-4">Qty</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/60">
                    {requestedBookings.map(b => (
                      <tr key={b._id} className="hover:bg-neutral-900/40">
                        <td className="p-4">
                          <p className="font-bold text-white text-xs">
                            {b.userName}
                          </p>
                          <p className="text-neutral-500 font-mono text-[10px]">
                            {b.userEmail}
                          </p>
                        </td>
                        <td className="p-4 text-xs">{b.company || b.title}</td>
                        <td className="p-4 font-bold">{b.quantity}</td>
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
                                className="text-xs text-white h-8"
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
                                className="text-xs h-8"
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
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════
            VENDOR — REVENUE OVERVIEW
        ═══════════════════════════════════ */}
        {activeTab === 'revenue' && user?.role === 'vendor' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Revenue Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Total Tickets',
                  value: vendorTickets.length,
                  color: 'text-white',
                },
                {
                  label: 'Approved',
                  value: vendorTickets.filter(t => t.status === 'approved')
                    .length,
                  color: 'text-emerald-400',
                },
                {
                  label: 'Pending',
                  value: vendorTickets.filter(t => t.status === 'pending')
                    .length,
                  color: 'text-yellow-400',
                },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="bg-[#1e1e1e] border border-neutral-800 p-5 rounded-2xl"
                >
                  <p className="text-xs text-neutral-500 uppercase font-mono mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-black ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl">
              <h4 className="text-sm font-bold mb-4 text-neutral-300">
                Tickets by Transport Type
              </h4>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="name" stroke="#525252" />
                    <YAxis stroke="#525252" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1f1f',
                        borderColor: '#404040',
                        color: '#fff',
                      }}
                    />
                    <Bar
                      dataKey="tickets"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════
            ADMIN — MANAGE TICKETS
        ═══════════════════════════════════ */}
        {activeTab === 'manage-tickets' && user?.role === 'admin' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Manage Tickets</h3>
            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
              {allTickets.length === 0 ? (
                <p className="text-neutral-500 text-center py-10">
                  No tickets submitted yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Ticket</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Route</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/60">
                    {allTickets.map(t => (
                      <tr key={t._id} className="hover:bg-neutral-900/40">
                        <td className="p-4 font-bold text-white">
                          {t.title || t.company}
                        </td>
                        <td className="p-4 text-xs font-mono text-neutral-400">
                          {t.vendorEmail}
                        </td>
                        <td className="p-4 text-xs">
                          {t.from} → {t.to}
                        </td>
                        <td className="p-4 font-bold text-emerald-400">
                          BDT {t.price}
                        </td>
                        <td className="p-4">
                          <Badge status={t.status || 'pending'} />
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {t.status !== 'approved' && (
                              <Button
                                size="sm"
                                color="success"
                                onClick={() =>
                                  handleTicketStatus(t._id, 'approved')
                                }
                                className="text-xs text-white h-8"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />{' '}
                                Approve
                              </Button>
                            )}
                            {t.status !== 'rejected' && (
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onClick={() =>
                                  handleTicketStatus(t._id, 'rejected')
                                }
                                className="text-xs h-8"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════
            ADMIN — MANAGE USERS
        ═══════════════════════════════════ */}
        {activeTab === 'manage-users' && user?.role === 'admin' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Manage Users</h3>
            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/60">
                  {allUsers.map(u => (
                    <tr key={u._id} className="hover:bg-neutral-900/40">
                      <td className="p-4 font-bold text-white">{u.name}</td>
                      <td className="p-4 text-xs font-mono">{u.email}</td>
                      <td className="p-4">
                        <Badge status={u.role} />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            disabled={u.role === 'admin'}
                            onClick={() => handleUpdateRole(u._id, 'admin')}
                            className="text-xs h-8"
                          >
                            Make Admin
                          </Button>
                          <Button
                            size="sm"
                            color="warning"
                            variant="flat"
                            disabled={u.role === 'vendor'}
                            onClick={() => handleUpdateRole(u._id, 'vendor')}
                            className="text-xs h-8"
                          >
                            Make Vendor
                          </Button>
                          {u.role === 'vendor' && (
                            <Button
                              size="sm"
                              color="danger"
                              variant="ghost"
                              onClick={() => handleMarkAsFraud(u._id)}
                              className="text-xs h-8"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Fraud
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════
            ADMIN — ADVERTISE TICKETS
        ═══════════════════════════════════ */}
        {activeTab === 'advertise-tickets' && user?.role === 'admin' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Advertise Tickets</h3>
              <span className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                <Star className="w-3 h-3 inline mr-1 text-amber-400" />
                {allTickets.filter(t => t.advertised).length} / 6 advertised
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Only approved tickets appear here. Max 6 can be advertised at
              once.
            </p>
            <Card className="bg-[#1e1e1e] border border-neutral-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
              {allTickets.filter(t => t.status === 'approved').length === 0 ? (
                <p className="text-neutral-500 text-center py-10">
                  No approved tickets yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Ticket</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Route</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Advertised</th>
                      <th className="p-4">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/60">
                    {allTickets
                      .filter(t => t.status === 'approved')
                      .map(t => (
                        <tr key={t._id} className="hover:bg-neutral-900/40">
                          <td className="p-4 font-bold text-white">
                            {t.title || t.company}
                          </td>
                          <td className="p-4 text-xs font-mono text-neutral-400">
                            {t.vendorEmail}
                          </td>
                          <td className="p-4 text-xs">
                            {t.from} → {t.to}
                          </td>
                          <td className="p-4 font-bold text-emerald-400">
                            BDT {t.price}
                          </td>
                          <td className="p-4">
                            <span
                              className={
                                t.advertised
                                  ? 'text-emerald-400 font-bold'
                                  : 'text-neutral-500'
                              }
                            >
                              {t.advertised ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() =>
                                handleAdvertiseToggle(t._id, t.advertised)
                              }
                              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                                t.advertised
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              }`}
                            >
                              {t.advertised ? (
                                <>
                                  <ToggleRight className="w-4 h-4" />{' '}
                                  Unadvertise
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4" /> Advertise
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
