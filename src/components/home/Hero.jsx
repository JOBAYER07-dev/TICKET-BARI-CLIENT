'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { MapPin, Navigation, Bus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

export default function Hero() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    type: 'All Types',
  });

  const handleSearch = e => {
    e.preventDefault();
    // Dynamically synchronize metrics over the challenge query route layer
    const queryParams = new URLSearchParams();
    if (searchData.from) queryParams.append('from', searchData.from);
    if (searchData.to) queryParams.append('to', searchData.to);
    if (searchData.type && searchData.type !== 'All Types')
      queryParams.append('type', searchData.type);

    router.push(`/tickets?${queryParams.toString()}`);
  };

  const slides = [
    {
      title: 'Book Your Journey Today',
      subtitle: 'Bus, Train, Launch & Plane tickets all in one hub',
      gradient: 'from-emerald-600 via-emerald-700 to-emerald-950',
    },
    {
      title: 'Premium Fleet Network',
      subtitle: 'Experience luxury transits across popular terminal routes',
      gradient: 'from-neutral-900 via-emerald-950 to-neutral-950',
    },
  ];

  return (
    <section className="w-full relative h-[540px] md:h-[480px] overflow-hidden bg-neutral-950">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect={'fade'}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="w-full h-full absolute inset-0 z-0"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="w-full h-full">
            <div
              className={`w-full h-full bg-gradient-to-b ${slide.gradient} flex flex-col pt-12 items-center text-center px-6`}
            >
              <div className="max-w-2xl mx-auto space-y-3 mt-4">
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  {slide.title}
                </h1>
                <p className="text-emerald-100/80 text-sm font-medium">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute w-full bottom-8 left-0 z-10 px-6">
        <form
          onSubmit={handleSearch}
          className="w-full max-w-3xl mx-auto bg-[#1e1e1e]/90 p-5 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1.5">
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
                className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl pl-9 text-white text-xs"
              />
            </div>
          </div>
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1.5">
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
                className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl pl-9 text-white text-xs"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1.5">
              Transport
            </label>
            <select
              value={searchData.type}
              onChange={e =>
                setSearchData({ ...searchData, type: e.target.value })
              }
              className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-white text-xs cursor-pointer"
            >
              <option value="All Types">All Transports</option>
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
              <option value="Plane">Plane</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <Button
              type="submit"
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-w-0 flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
