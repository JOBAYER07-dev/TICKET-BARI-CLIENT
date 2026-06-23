'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const ticketId = searchParams.get('ticketId');
    const amount = searchParams.get('amount');
    const sessionId = searchParams.get('session_id');

    if (!bookingId || done) return;

    const confirm = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await apiRequest('/payments/confirm', {
          method: 'POST',
          body: JSON.stringify({
            bookingId,
            transactionId: sessionId || 'cs_' + Date.now(),
            ticketId,
            finalPrice: amount,
            ticketTitle: 'Travel Ticket',
            userEmail: user.email,
            quantity: searchParams.get('quantity') || 1,
          }),
        });
        setDone(true);
      } catch (err) {
        console.error(err);
      }
    };

    confirm();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-white mb-3">
          Payment Successful!
        </h1>
        <p className="text-neutral-400 text-sm mb-8">
          Your booking is confirmed. Check your dashboard for details.
        </p>
        <Link
          href="/dashboard"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
