import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers'; // প্রোভাইডার ফাইলটি ইম্পোর্ট করলাম

export const metadata = {
  title: 'TicketBari - Online Ticket Booking Platform',
  description: 'Book bus, train, launch & flight tickets easily.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          {children}
          {/* এখানে ফুটার আসবে */}
        </Providers>
      </body>
    </html>
  );
}
