import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchMarketNews } from '../api';

export default function MarketCommentary() {
  const [newsData, setNewsData] = useState({ trending: [], industry_focus: [] });

  useEffect(() => {
    fetchMarketNews()
      .then(data => setNewsData(data))
      .catch(err => console.error("Could not fetch market news:", err));
  }, []);

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Market Commentary</h1>
        <p className="text-xs font-bold uppercase text-[#65655f] mt-2 tracking-widest flex items-center gap-2">
          <Newspaper size={14} /> Breaking News & Analysis
        </p>
      </div>

      {/* Volatility Alert */}
      <div className="bg-[#be2d06] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] mb-8 text-white flex items-center justify-between flex-wrap gap-4" style={{ transform: 'rotate(-0.5deg)' }}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <h3 className="font-black uppercase text-lg leading-tight">Market Volatility Alert</h3>
            <p className="text-sm font-bold opacity-90 uppercase">VIX +12.4% In Last 2 Hours</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trending Now */}
        <div>
          <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Trending Now
          </h2>
          <div className="space-y-4">
            {newsData.trending.map((news) => (
              <div key={news.id} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer">
                <h3 className="font-black text-lg uppercase leading-tight mb-2 text-[#b6353a]">{news.headline}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#65655f] tracking-widest">
                  <span>{news.timestamp}</span>
                  <span>•</span>
                  <span>{news.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Focus */}
        <div>
          <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
            <Newspaper size={20} /> Industry Focus
          </h2>
          <div className="space-y-4">
            {newsData.industry_focus.map((item) => {
              const pos = item.change_percent > 0;
              return (
                <div key={item.id} className="bg-[#fefcf4] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-black uppercase text-sm leading-snug flex-1">{item.headline}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-[#fad538] border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">{item.ticker}</span>
                    <span className={`font-black text-xs ${pos ? 'text-green-700' : 'text-[#be2d06]'}`}>
                      {pos ? '+' : ''}{item.change_percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
