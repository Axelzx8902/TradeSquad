import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, AlertTriangle, ExternalLink, Clock, ImageOff } from 'lucide-react';
import { fetchMarketNews } from '../api';

export default function MarketCommentary() {
  const [newsData, setNewsData] = useState({ trending: [], industry_focus: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchMarketNews()
      .then(data => {
        setNewsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Could not fetch market news:", err);
        setError(err.response?.data?.detail || "Failed to load news");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen flex items-center justify-center">
        <div className="bg-[#fad538] border-[6px] border-black p-10 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center">
          <div className="w-12 h-12 border-[6px] border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black uppercase text-lg">Loading Market Intel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen flex items-center justify-center">
        <div className="bg-[#be2d06] border-[6px] border-black p-10 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center text-white">
          <AlertTriangle size={48} className="mb-4" />
          <p className="font-black uppercase text-lg mb-2">News Feed Down</p>
          <p className="font-bold text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Market Commentary</h1>
        <p className="text-xs font-bold uppercase text-[#65655f] mt-2 tracking-widest flex items-center gap-2">
          <Newspaper size={14} /> Powered by Finnhub • Live Financial News
        </p>
      </div>

      {/* ── TRENDING NOW ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-[#be2d06] text-white border-4 border-black p-2 shadow-[3px_3px_0px_0px_#000]" style={{ transform: 'rotate(-2deg)' }}>
            <TrendingUp size={20} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Trending Now</h2>
        </div>

        {/* Featured card — first article large */}
        {newsData.trending.length > 0 && (
          <a
            href={newsData.trending[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-5 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
            style={{ transform: 'rotate(-0.3deg)' }}
          >
            <div className="flex flex-col md:flex-row">
              {newsData.trending[0].image && (
                <div className="md:w-80 h-48 md:h-auto bg-[#e9e9de] border-b-4 md:border-b-0 md:border-r-4 border-black overflow-hidden shrink-0">
                  <img
                    src={newsData.trending[0].image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#be2d06] text-white text-[9px] font-black uppercase px-2 py-0.5 border-2 border-black tracking-widest">Breaking</span>
                  {newsData.trending[0].source && (
                    <span className="text-[10px] font-black uppercase text-[#65655f] tracking-widest">{newsData.trending[0].source}</span>
                  )}
                </div>
                <h3 className="font-black text-xl uppercase leading-tight mb-3">{newsData.trending[0].headline}</h3>
                {newsData.trending[0].summary && (
                  <p className="text-sm font-medium text-[#65655f] leading-relaxed mb-3 line-clamp-2">{newsData.trending[0].summary}</p>
                )}
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#bab9b2] tracking-widest">
                  <Clock size={10} />
                  <span>{newsData.trending[0].timestamp}</span>
                  <ExternalLink size={10} className="ml-auto" />
                </div>
              </div>
            </div>
          </a>
        )}

        {/* Rest of trending cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {newsData.trending.slice(1).map((news) => (
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              key={news.id}
              className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#fad538] text-black text-[9px] font-black uppercase px-2 py-0.5 border-2 border-black tracking-widest">Trending</span>
                {news.source && (
                  <span className="text-[10px] font-black uppercase text-[#65655f] tracking-widest">{news.source}</span>
                )}
              </div>
              <h3 className="font-black text-sm uppercase leading-tight mb-3 flex-1">{news.headline}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#bab9b2] tracking-widest">
                  <Clock size={10} />
                  <span>{news.timestamp}</span>
                </div>
                <ExternalLink size={12} className="text-[#bab9b2]" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── INDUSTRY FOCUS ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-[#c3b4fc] text-[#3d306f] border-4 border-black p-2 shadow-[3px_3px_0px_0px_#000]" style={{ transform: 'rotate(1.5deg)' }}>
            <Newspaper size={20} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Industry Focus</h2>
        </div>

        <div className="space-y-4">
          {newsData.industry_focus.map((item) => (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              key={item.id}
              className="block bg-[#fefcf4] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex gap-4">
                {item.image && (
                  <div className="w-20 h-20 bg-[#e9e9de] border-3 border-black overflow-hidden shrink-0 hidden sm:block">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {item.sector_badge && (
                      <span className="bg-[#fad538] border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">{item.sector_badge}</span>
                    )}
                    {item.source && (
                      <span className="text-[10px] font-black uppercase text-[#65655f] tracking-widest">{item.source}</span>
                    )}
                  </div>
                  <h3 className="font-black uppercase text-sm leading-snug mb-2">{item.headline}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#bab9b2] tracking-widest">
                    <Clock size={10} />
                    <span>{item.timestamp}</span>
                    <ExternalLink size={10} className="ml-auto" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
