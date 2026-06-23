'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { MapPin, Navigation, Bus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/effect-fade';

export default function Hero() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    type: 'All Types',
  });

  const handleSearch = e => {
    e.preventDefault();
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
      badge: '🚌 50+ Routes Available',
    },
    {
      title: 'Premium Fleet Network',
      subtitle: 'Experience luxury transits across popular terminal routes',
      gradient: 'from-neutral-900 via-emerald-950 to-neutral-950',
      badge: '✈️ Air · Train · Launch · Bus',
    },
  ];

  return (
    <section className="w-full relative h-[560px] md:h-[500px] overflow-hidden bg-neutral-950">
      {/* Swiper Background */}
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        onSlideChange={s => setActiveIndex(s.realIndex)}
        className="w-full h-full absolute inset-0 z-0"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="w-full h-full">
            <div
              className={`w-full h-full bg-gradient-to-b ${slide.gradient}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Animated grid overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Slide Text Content */}
      <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center text-center px-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-2xl mx-auto space-y-4"
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-block text-xs font-bold bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-full backdrop-blur-sm mb-2"
            >
              {slides[activeIndex]?.badge}
            </motion.span>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-6xl font-black !text-white leading-tight tracking-tight"
            >
              {slides[activeIndex]?.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-emerald-100/80 text-sm md:text-base font-medium"
            >
              {slides[activeIndex]?.subtitle}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Slide Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-2 mt-6"
        >
          {slides.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all duration-500 ${
                i === activeIndex
                  ? 'w-6 h-2 bg-emerald-400'
                  : 'w-2 h-2 bg-white/30'
              }`}
            />
          ))}
        </motion.div>
      </div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
        className="absolute w-full bottom-6 left-0 z-10 px-6"
      >
        <form
          onSubmit={handleSearch}
          className="w-full max-w-3xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-white/70 uppercase block mb-1.5 tracking-wider">
              From Station
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-white/50 absolute left-3 z-10" />
              <input
                type="text"
                placeholder="e.g. Dhaka"
                value={searchData.from}
                onChange={e =>
                  setSearchData({ ...searchData, from: e.target.value })
                }
                className="w-full h-10 bg-white/10 border border-white/20 rounded-xl pl-9 text-white text-xs placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-white/70 uppercase block mb-1.5 tracking-wider">
              To Destination
            </label>
            <div className="relative flex items-center">
              <Navigation className="w-4 h-4 text-white/50 absolute left-3 z-10" />
              <input
                type="text"
                placeholder="e.g. Chittagong"
                value={searchData.to}
                onChange={e =>
                  setSearchData({ ...searchData, to: e.target.value })
                }
                className="w-full h-10 bg-white/10 border border-white/20 rounded-xl pl-9 text-white text-xs placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-[10px] font-bold text-white/70 uppercase block mb-1.5 tracking-wider">
              Transport
            </label>
            <select
              value={searchData.type}
              onChange={e =>
                setSearchData({ ...searchData, type: e.target.value })
              }
              className="w-full h-10 bg-white/10 border border-white/20 rounded-xl px-3 text-white text-xs cursor-pointer focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all"
            >
              <option className="bg-neutral-900" value="All Types">
                All Transports
              </option>
              <option className="bg-neutral-900" value="Bus">
                🚌 Bus
              </option>
              <option className="bg-neutral-900" value="Train">
                🚂 Train
              </option>
              <option className="bg-neutral-900" value="Plane">
                ✈️ Plane
              </option>
              <option className="bg-neutral-900" value="Launch">
                🚢 Launch
              </option>
            </select>
          </div>

          <div className="md:col-span-1">
            <Button
              type="submit"
              className="w-full h-10 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl min-w-0 flex items-center justify-center shadow-lg shadow-emerald-900/40 transition-all"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
