import Navbar from '@/components/Navbar';
import './globals.css';
import Footer from '@/components/Footer';
import { Providers } from './providers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'TicketBari - Book Bus, Train, Launch & Flight Tickets',
  description: 'Book travel tickets easily with TicketBari',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Providers>
          <ToastContainer theme="dark" position="top-right" autoClose={3000} />
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
