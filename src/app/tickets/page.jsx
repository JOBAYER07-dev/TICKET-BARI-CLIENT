import { Suspense } from 'react';
import AllTicketsContent from './AllTicketsContent';

export default function AllTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AllTicketsContent />
    </Suspense>
  );
}
