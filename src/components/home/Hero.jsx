'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { MapPin, Navigation, Bus, Search } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styling matrices
import 'swiper/css';
import 'swiper/css/effect-fade';

export default function Hero() {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    type: 'All Types',
  });

  const handleSearch = e => {
    e.preventDefault();
    console.log('Searching for tickets:', searchData);
  };

  // Dynamic slides containing context and distinct premium gradient tones
  const slides = [
    {
      title: 'Book Your Journey Today',
      subtitle: 'Bus, Train, Launch & Plane tickets — all in one unified hub',
      gradient: 'from-emerald-600 via-emerald-700 to-emerald-950',
    },
    {
      title: 'Premium Fleet Network',
      subtitle: 'Experience luxury transits across popular terminal routes',
      gradient: 'from-neutral-900 via-emerald-950 to-neutral-950',
    },
    {
      title: 'Encrypted Secure Checkouts',
      subtitle: 'Verified Stripe payment gateways guaranteeing fast clearance',
      gradient: 'from-emerald-800 via-neutral-900 to-emerald-900',
    },
  ];

  return (
    <section className="w-full relative h-[540px] md:h-[480px] overflow-hidden bg-neutral-950">
      {/* LAYER 1: Background Swiper Carousel Viewport */}
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect={'fade'}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full absolute inset-0 z-0"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="w-full h-full">
            <div
              className={`w-full h-full bg-gradient-to-b ${slide.gradient} flex flex-col pt-12 items-center text-center px-6 transition-all duration-1000`}
            >
              <div className="max-w-2xl mx-auto space-y-3 mt-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg transition-all animate-appearance-in">
                  {slide.title}
                </h1>
                <p className="text-emerald-100/80 text-sm md:text-base font-medium max-w-lg mx-auto drop-shadow">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* LAYER 2: Absolute Floating Search Form Console Layer (固定 Over Swiper) */}
      <div className="absolute w-full bottom-8 left-0 z-10 px-6">
        <form
          onSubmit={handleSearch}
          className="w-full max-w-3xl mx-auto bg-[#1e1e1e]/90 p-5 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              From Station
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                type="text"
                placeholder="e.g. Dhaka"
                value={searchData.from}
                onChange={e =>
                  setSearchData({ ...searchData, from: e.target.value })
                }
                className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                required
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              To Destination
            </label>
            <div className="relative flex items-center">
              <Navigation className="w-4 h-4 text-neutral-500 absolute left-3 z-10" />
              <input
                type="text"
                placeholder="e.g. Chittagong"
                value={searchData.to}
                onChange={e =>
                  setSearchData({ ...searchData, to: e.target.value })
                }
                className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                required
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Transport
            </label>
            <div className="relative flex items-center">
              <Bus className="w-4 h-4 text-neutral-500 absolute left-3 z-10 pointer-events-none" />
              <select
                value={searchData.type}
                onChange={e =>
                  setSearchData({ ...searchData, type: e.target.value })
                }
                className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 text-white focus:outline-none focus:border-emerald-500 text-xs transition-colors appearance-none cursor-pointer"
              >
                <option value="All Types">All Transports</option>
                <option value="Bus">Bus</option>
                <option value="Train">Train</option>
                <option value="Launch">Launch</option>
                <option value="Plane">Plane</option>
              </select>
              <div className="absolute right-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-500 w-0 h-0"></div>
            </div>
          </div>

          <div className="md:col-span-1">
            <Button
              type="submit"
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl min-w-0 p-0 flex items-center justify-center shadow-lg shadow-emerald-950/20"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
