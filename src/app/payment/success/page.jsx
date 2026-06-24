'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/utils/api';
import { CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';

// ── PDF Ticket Design ──────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#111827',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  brand: { fontSize: 22, color: '#10b981', fontFamily: 'Helvetica-Bold' },
  brandSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  badge: {
    backgroundColor: '#064e3b',
    color: '#10b981',
    fontSize: 10,
    padding: '4 10',
    borderRadius: 99,
  },
  section: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  halfSection: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
  },
  totalSection: {
    backgroundColor: '#064e3b',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: { fontSize: 11, color: '#6ee7b7' },
  totalValue: { fontSize: 20, color: '#10b981', fontFamily: 'Helvetica-Bold' },
  footer: { marginTop: 20, textAlign: 'center' },
  footerText: { fontSize: 9, color: '#4b5563' },
  txId: {
    fontSize: 8,
    color: '#374151',
    fontFamily: 'Helvetica',
    marginTop: 4,
  },
});

function TicketPDF({
  ticketTitle,
  amount,
  quantity,
  sessionId,
  userEmail,
  paymentDate,
}) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>TicketBari</Text>
            <Text style={styles.brandSub}>Official E-Ticket</Text>
          </View>
          <Text style={styles.badge}>PAID</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ticket / Route</Text>
          <Text style={styles.sectionValue}>
            {ticketTitle || 'Travel Ticket'}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.halfSection}>
            <Text style={styles.sectionLabel}>Passenger Email</Text>
            <Text style={[styles.sectionValue, { fontSize: 11 }]}>
              {userEmail}
            </Text>
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.sectionLabel}>Seats Booked</Text>
            <Text style={styles.sectionValue}>{quantity}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfSection}>
            <Text style={styles.sectionLabel}>Payment Date</Text>
            <Text style={[styles.sectionValue, { fontSize: 11 }]}>
              {paymentDate}
            </Text>
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.sectionLabel}>Payment Method</Text>
            <Text style={styles.sectionValue}>Stripe</Text>
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>BDT {amount}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing TicketBari. Have a safe journey!
          </Text>
          <Text style={styles.txId}>Transaction ID: {sessionId}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ── Success Page ───────────────────────────────────
function SuccessContent() {
  const searchParams = useSearchParams();
  const [done, setDone] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [bookingInfo, setBookingInfo] = useState({
    ticketTitle: 'Travel Ticket',
    amount: 0,
    quantity: 1,
    sessionId: '',
    userEmail: '',
    paymentDate: '',
  });

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const ticketId = searchParams.get('ticketId');
    const amount = searchParams.get('amount');
    const sessionId = searchParams.get('session_id');
    const quantity = searchParams.get('quantity') || 1;

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
            quantity,
          }),
        });

        setBookingInfo({
          ticketTitle: 'Travel Ticket',
          amount,
          quantity,
          sessionId: sessionId || '',
          userEmail: user.email || '',
          paymentDate: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        });

        setDone(true);
        setTimeout(() => setPdfReady(true), 500);
      } catch (err) {
        console.error(err);
        setDone(true);
        setPdfReady(true);
      }
    };

    confirm();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
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

        <div className="flex flex-col gap-3">
          {pdfReady && (
            <PDFDownloadLink
              document={<TicketPDF {...bookingInfo} />}
              fileName={`ticketbari-ticket-${Date.now()}.pdf`}
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              {({ loading }) =>
                loading ? (
                  'Preparing PDF...'
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download E-Ticket (PDF)
                  </>
                )
              }
            </PDFDownloadLink>
          )}

          <Link
            href="/dashboard"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
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
