'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import {
  Bus,
  Train,
  Plane,
  Ship,
  User,
  ShieldAlert,
  CheckCircle,
  Plus,
  History,
  BarChart3,
  Settings,
  DollarSign,
  Ticket,
  Users,
} from 'lucide-react';

// 🎯 ডামি ডাটা ভেন্ডর এবং ইউজারের টিকিট হিস্ট্রির জন্য
const userBookings = [
  {
    id: 'TB-1024',
    type: 'Bus',
    route: 'Dhaka ➔ Chittagong',
    date: 'June 25, 2026',
    price: 550,
    status: 'Confirmed',
  },
  {
    id: 'TB-1089',
    type: 'Train',
    route: 'Dhaka ➔ Sylhet',
    date: 'June 26, 2026',
    price: 320,
    status: 'Pending',
  },
];

const vendorTickets = [
  {
    id: 1,
    type: 'Bus',
    company: 'Green Line Paribahan',
    route: 'Dhaka ➔ Chittagong',
    price: 550,
    seats: 30,
  },
  {
    id: 2,
    type: 'Train',
    company: 'Suborna Express',
    route: 'Dhaka ➔ Sylhet',
    price: 320,
    seats: 50,
  },
];

const pendingAdminApprovals = [
  {
    id: 3,
    type: 'Plane',
    company: 'Biman Bangladesh',
    route: "Dhaka ➔ Cox's Bazar",
    price: 4200,
    status: 'Pending Approval',
  },
  {
    id: 4,
    type: 'Launch',
    company: 'Surovi 9',
    route: 'Dhaka ➔ Barisal',
    price: 280,
    status: 'Pending Approval',
  },
];

export default function DashboardPage() {
  // 🎯 ফ্রন্টএন্ড টেস্ট করার জন্য রোল স্টেট (user | vendor | admin)
  const [currentRole, setCurrentRole] = useState('user');
  const [activeTab, setActiveTab] = useState('overview');

  // ১. 👤 GENERAL USER PANELS
  const renderUserDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-500">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              Total Booked
            </p>
            <h3 className="text-2xl font-bold mt-1">2 Tickets</h3>
          </div>
        </div>
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-neutral-800 flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-xl text-blue-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              Total Spent
            </p>
            <h3 className="text-2xl font-bold mt-1">৳ 870</h3>
          </div>
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-500" /> Recent Bookings
        </h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm text-neutral-300">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase font-semibold">
                <th className="pb-3">Booking ID</th>
                <th className="pb-3">Route</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {userBookings.map(booking => (
                <tr
                  key={booking.id}
                  className="hover:bg-neutral-900/50 transition-colors"
                >
                  <td className="py-3.5 font-mono text-neutral-400">
                    {booking.id}
                  </td>
                  <td className="py-3.5 font-medium text-white">
                    {booking.route}
                  </td>
                  <td className="py-3.5 text-neutral-400">{booking.date}</td>
                  <td className="py-3.5 text-emerald-400 font-semibold">
                    ৳ {booking.price}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
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
      </div>
    </div>
  );

  // ২. 🚛 TRANSPORT VENDOR PANEL
  const renderVendorDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Vendor Console</h2>
          <p className="text-xs text-neutral-500">
            Manage your active fleets and transport listings
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm h-10 flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Active Routes
          </p>
          <h3 className="text-2xl font-black mt-1 text-white">2</h3>
        </div>
        <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Tickets Sold
          </p>
          <h3 className="text-2xl font-black mt-1 text-blue-400">140</h3>
        </div>
        <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Total Revenue
          </p>
          <h3 className="text-2xl font-black mt-1 text-emerald-400">
            ৳ 64,500
          </h3>
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Your Active Tickets</h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm text-neutral-300">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase font-semibold">
                <th className="pb-3">Type</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Route</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Seats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {vendorTickets.map(ticket => (
                <tr
                  key={ticket.id}
                  className="hover:bg-neutral-900/50 transition-colors"
                >
                  <td className="py-3.5">
                    <span className="text-xs bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-md">
                      {ticket.type}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-white">
                    {ticket.company}
                  </td>
                  <td className="py-3.5 text-neutral-400">{ticket.route}</td>
                  <td className="py-3.5 text-emerald-400 font-semibold">
                    ৳ {ticket.price}
                  </td>
                  <td className="py-3.5 text-neutral-400">
                    {ticket.seats} Left
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ৩. 🛡️ SYSTEM ADMIN PANEL
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" /> Admin Control Center
        </h2>
        <p className="text-xs text-neutral-500">
          Approve or reject ticket request arrays globally
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Total Users
          </p>
          <h3 className="text-2xl font-black mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-400" /> 1,240
          </h3>
        </div>
        <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Total Vendors
          </p>
          <h3 className="text-2xl font-black mt-1 flex items-center gap-2">
            <Bus className="w-5 h-5 text-neutral-400" /> 45
          </h3>
        </div>
        <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Pending Approvals
          </p>
          <h3 className="text-2xl font-black mt-1 text-amber-500">
            2 Requests
          </h3>
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-md font-bold mb-4 text-neutral-400 uppercase tracking-wider">
          Pending Ticket Approvals
        </h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm text-neutral-300">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase font-semibold">
                <th className="pb-3">Company Name</th>
                <th className="pb-3">Route Info</th>
                <th className="pb-3">Price</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {pendingAdminApprovals.map(req => (
                <tr
                  key={req.id}
                  className="hover:bg-neutral-900/50 transition-colors"
                >
                  <td className="py-3.5 font-bold text-white">
                    {req.company}{' '}
                    <span className="text-[10px] ml-1.5 font-normal bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded uppercase">
                      {req.type}
                    </span>
                  </td>
                  <td className="py-3.5 text-neutral-400">{req.route}</td>
                  <td className="py-3.5 text-emerald-400 font-semibold">
                    ৳ {req.price}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg px-3 h-8 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="bordered"
                        className="border-neutral-800 text-red-400 hover:bg-red-500/10 font-medium text-xs rounded-lg px-3 h-8"
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row w-full">
      {/* 📁 বাম পাশের সাইডবার প্যানেল (Sidebar Layout) */}
      <aside className="w-full md:w-64 bg-[#1a1a1a] border-b md:border-b-0 md:border-r border-neutral-800 p-6 flex flex-col justify-between gap-6">
        <div className="space-y-6">
          {/* 🎯 টেস্ট করার জন্য কাস্টম রোল সুইচার ড্রপডাউন */}
          <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
              Simulate View As:
            </label>
            <select
              value={currentRole}
              onChange={e => {
                setCurrentRole(e.target.value);
                setActiveTab('overview');
              }}
              className="w-full bg-transparent text-sm font-semibold text-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="user" className="bg-[#1a1a1a] text-white">
                General User
              </option>
              <option value="vendor" className="bg-[#1a1a1a] text-white">
                Transport Vendor
              </option>
              <option value="admin" className="bg-[#1a1a1a] text-white">
                System Admin
              </option>
            </select>
          </div>

          {/* সাইডবার মেনু বাটনসমূহ */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Settings className="w-4 h-4" /> Account Settings
            </button>
          </nav>
        </div>

        <div className="text-xs text-neutral-600 tracking-wide pt-4 border-t border-neutral-900 hidden md:block">
          Logged in as{' '}
          <span className="text-neutral-400 font-medium capitalize">
            {currentRole}
          </span>
        </div>
      </aside>

      {/* 📄 ডান পাশের মূল কনটেন্ট এরিয়া (Main Content Body) */}
      <main className="flex-1 p-6 md:p-10">
        {activeTab === 'overview' ? (
          <>
            {currentRole === 'user' && renderUserDashboard()}
            {currentRole === 'vendor' && renderVendorDashboard()}
            {currentRole === 'admin' && renderAdminDashboard()}
          </>
        ) : (
          /* সেটিংস ট্যাব ভিউ */
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 max-w-xl">
            <h3 className="text-lg font-bold mb-2">Profile & Settings</h3>
            <p className="text-xs text-neutral-500 mb-6">
              Manage your ticket account configurations easily.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                  Account Role
                </label>
                <input
                  type="text"
                  value={currentRole.toUpperCase()}
                  disabled
                  className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-lg px-3 text-sm text-neutral-500 capitalize font-mono select-none"
                />
              </div>
              <Button className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold rounded-xl text-sm px-5 h-10">
                Save Configurations
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
