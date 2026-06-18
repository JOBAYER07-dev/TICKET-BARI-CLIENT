'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { MapPin, Navigation, Bus, Search } from 'lucide-react';

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

  return (
    <section className="w-full bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 text-white py-20 px-6">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          Book Your Journey Today
        </h1>
        <p className="text-emerald-100 text-lg md:text-xl font-medium mb-10 max-w-xl">
          Bus, Train, Launch & Plane tickets — all in one place
        </p>

        <form
          onSubmit={handleSearch}
          className="w-full max-w-3xl bg-[#1e1e1e]/90 p-6 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md flex flex-col gap-4 text-left"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                From
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-5 h-5 text-neutral-500 absolute left-3 z-10" />
                <input
                  type="text"
                  placeholder="e.g. Dhaka"
                  value={searchData.from}
                  onChange={e =>
                    setSearchData({ ...searchData, from: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 text-[15px] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                To
              </label>
              <div className="relative flex items-center">
                <Navigation className="w-5 h-5 text-neutral-500 absolute left-3 z-10" />
                <input
                  type="text"
                  placeholder="e.g. Chittagong"
                  value={searchData.to}
                  onChange={e =>
                    setSearchData({ ...searchData, to: e.target.value })
                  }
                  className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 text-[15px] transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Transport Type
            </label>
            <div className="relative flex items-center">
              <Bus className="w-5 h-5 text-neutral-500 absolute left-3 z-10 pointer-events-none" />
              <select
                value={searchData.type}
                onChange={e =>
                  setSearchData({ ...searchData, type: e.target.value })
                }
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-10 text-white focus:outline-none focus:border-emerald-500 text-[15px] transition-colors appearance-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Bus">Bus</option>
                <option value="Train">Train</option>
                <option value="Launch">Launch</option>
                <option value="Plane">Plane</option>
              </select>
              <div className="absolute right-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-500 w-0 h-0"></div>
            </div>
          </div>

          <div className="mt-2">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm tracking-wide px-6 h-10 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
