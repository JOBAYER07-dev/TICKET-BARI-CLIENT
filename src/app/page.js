import ExtraSections from "@/components/home/ExtraSections";
import Hero from "@/components/home/Hero";
import TicketSections from "@/components/home/TicketSections";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] w-full">
      <Hero />
      <TicketSections />
      <ExtraSections/>
    </div>
  );
}
