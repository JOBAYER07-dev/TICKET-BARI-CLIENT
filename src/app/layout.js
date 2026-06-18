import Navbar from '@/components/Navbar';
import './globals.css';
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#121212] min-h-screen text-white">
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
