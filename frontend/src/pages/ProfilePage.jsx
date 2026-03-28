import React, { useState, useEffect } from 'react';
import { LogOut, PenLine, ShieldUser } from 'lucide-react';
import useUserStore from '../store/userStore';

export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [stadiumAudio, setStadiumAudio] = useState(true);
  const [liveDataMode, setLiveDataMode] = useState(() => {
    return localStorage.getItem('tradesquad_data_mode') === 'live';
  });

  const toggleLiveMode = () => {
    const next = !liveDataMode;
    setLiveDataMode(next);
    localStorage.setItem('tradesquad_data_mode', next ? 'live' : 'demo');
  };

  const { profile, isLoading, error, fetchProfile } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (error) {
    return (
      <div className="p-6 md:ml-64 min-h-screen bg-[#fefcf4] flex flex-col items-center justify-center font-sans">
        <h2 className="text-3xl font-black uppercase text-[#be2d06] mb-4">Umpire Disagrees</h2>
        <p className="text-xl font-bold">{error}</p>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="p-6 md:ml-64 min-h-screen bg-[#fefcf4] flex items-center justify-center font-sans">
        <h2 className="text-3xl font-black uppercase text-black animate-pulse">Scanning Profile ID...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen bg-[#fefcf4] max-w-6xl mx-auto flex flex-col items-start font-sans">
      
      {/* ── HEADER ── */}
      <div className="bg-[#c3b4fc] border-[6px] border-black px-8 py-3 shadow-[8px_8px_0px_0px_#000] inline-block mb-12 relative" style={{ transform: 'rotate(-2deg)' }}>
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#3d306f] leading-none">Profile</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-8 w-full lg:w-1/3">
          
          {/* User Card */}
          <div className="bg-white border-[6px] border-black shadow-[8px_8px_0px_0px_#000] p-6 flex flex-col items-center" style={{ transform: 'rotate(1deg)' }}>
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-[#2d4b5a] border-[4px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center overflow-hidden" style={{ transform: 'rotate(-2deg)' }}>
                {/* Mock Image Placeholder */}
                <div className="w-full h-full bg-[#1b3644] text-white flex items-end justify-center pb-2 text-6xl shadow-inner">
                  👤
                </div>
              </div>
              <div className="absolute -bottom-3 -right-2 bg-[#8b7300] border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase text-white shadow-[2px_2px_0px_0px_#000]" style={{ transform: 'rotate(-4deg)' }}>
                Captain Rank
              </div>
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tighter text-center">{profile.username}</h2>
            <div className="mt-2 border-[3px] border-black px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#65655f]">
              Member Since 2023
            </div>

            <div className="w-full mt-8 space-y-4 text-left">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8b7300] mb-2 px-1">Email Address</p>
                <div className="w-full border-[4px] border-black p-3 bg-white font-bold text-sm shadow-[3px_3px_0px_0px_#000]">
                  {profile.email}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8b7300] mb-2 px-1">User ID</p>
                <div className="w-full border-[4px] border-black p-3 bg-white font-bold text-sm shadow-[3px_3px_0px_0px_#000]">
                  {profile.user_id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-8 w-full lg:w-2/3">
          
          {/* Stats Row */}
          <div className="flex flex-col sm:flex-row gap-6 h-auto sm:h-48">
            {/* Lifetime P&L */}
            <div className="flex-1 bg-[#d4ebd8] border-[6px] border-black shadow-[8px_8px_0px_0px_#000] p-6 flex flex-col justify-center relative">
              <p className="font-black uppercase text-[10px] tracking-widest text-[#2a5d34] mb-2">Total Lifetime P&L</p>
              <p className="text-3xl md:text-5xl font-black text-[#2a5d34] leading-none mb-4"><span className="text-4xl">{profile.lifetime_pnl > 0 ? '+' : ''}</span><br/>₹{profile.lifetime_pnl.toLocaleString('en-IN')}</p>
              <div className="bg-white/60 border-2 border-transparent px-2 py-1 absolute bottom-4 left-6 text-[10px] font-black uppercase text-[#2a5d34] inline-block tracking-widest bg-[#edf7ee]">
                📈 12.4% This Month
              </div>
            </div>
            {/* Win Rate */}
            <div className="flex-1 bg-[#fad538] border-[6px] border-black shadow-[8px_8px_0px_0px_#000] p-6 flex flex-col justify-center relative">
              <p className="font-black uppercase text-[10px] tracking-widest text-[#5a4a00] mb-2">Win Rate</p>
              <p className="text-5xl md:text-6xl font-black text-black leading-none mb-4">{profile.win_rate}%</p>
              <div className="bg-white/60 border-2 border-transparent px-2 py-1 absolute bottom-4 left-6 text-[10px] font-black uppercase text-[#5a4a00] inline-block tracking-widest bg-[#fef5cc]">
                🏏 142 Matches Won
              </div>
            </div>
          </div>

          {/* Global Settings Box */}
          <div className="bg-[#e9e9de] border-[6px] border-black p-6 shadow-[8px_8px_0px_0px_#000]">
            <h3 className="font-black uppercase text-[#44443f] tracking-widest mb-6">Global Settings</h3>
            
            <div className="space-y-6">
              {/* Dark Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-black uppercase text-sm text-[#44443f]">Dark Mode</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#81817a]">Optimize for late night trading</p>
                </div>
                {/* Toggle implementation reflecting visual style */}
                <button onClick={() => setDarkMode(!darkMode)} className="w-16 h-8 flex border-[4px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0">
                  <div className={`flex-1 h-full \${darkMode ? 'bg-black' : 'bg-white'}`}></div>
                  <div className={`flex-1 h-full \${!darkMode ? 'bg-black' : 'bg-white'}`}></div>
                </button>
              </div>
              
              {/* Stadium Audio */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-black uppercase text-sm text-[#44443f]">Stadium Audio</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#81817a]">Immersive crowd noise on live trades</p>
                </div>
                <button onClick={() => setStadiumAudio(!stadiumAudio)} className="w-16 h-8 flex border-[4px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0">
                  <div className={`flex-1 h-full \${stadiumAudio ? 'bg-[#8b7300]' : 'bg-white'}`}></div>
                  <div className={`flex-1 h-full \${!stadiumAudio ? 'bg-black' : 'bg-white'}`}></div>
                </button>
              </div>

              {/* ─── Live Data Mode Toggle ─── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-black uppercase text-sm text-[#44443f]">Data Mode</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#81817a]">
                    {liveDataMode ? '🔴 LIVE — NSE via yfinance' : '🤖 DEMO — Weekend Simulator'}
                  </p>
                </div>
                <button
                  onClick={toggleLiveMode}
                  className={`w-16 h-8 flex border-[4px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0 transition-colors`}
                >
                  <div className={`flex-1 h-full ${liveDataMode ? 'bg-[#be2d06]' : 'bg-white'}`}></div>
                  <div className={`flex-1 h-full ${!liveDataMode ? 'bg-black' : 'bg-white'}`}></div>
                </button>
              </div>

              {/* Two-Factor Auth */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-black uppercase text-sm text-[#44443f]">Two-Factor Auth</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#be2d06]">Recommended for security</p>
                </div>
                <button className="bg-white border-[4px] border-black px-4 py-1 shadow-[2px_2px_0px_0px_#000] font-black text-[10px] uppercase tracking-widest hover:translate-y-0.5 hover:shadow-none transition-all">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-6">
            <button className="flex-1 border-[6px] border-black bg-black text-white px-6 py-4 font-black uppercase shadow-[6px_6px_0px_0px_#b6b6b6] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3">
              <PenLine size={18} /> Edit Details
            </button>
            <button className="flex-1 border-[6px] border-black bg-[#b6353a] text-white px-6 py-4 font-black uppercase shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3">
              <LogOut size={18} /> Sign Out
            </button>
          </div>

        </div>
      </div>

      {/* ── SQUAD BANNER BOTTOM ── */}
      <div className="w-full bg-white border-[6px] border-black shadow-[8px_8px_0px_0px_#000] p-6 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Background graphic */}
        <div className="absolute right-10 -bottom-10 opacity-10 pointer-events-none">
           <ShieldUser size={200} strokeWidth={1} />
        </div>
        
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
          <div className="w-16 h-16 bg-[#7c66c7] border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]" style={{ transform: 'rotate(-5deg)' }}>
            <ShieldUser size={24} color="white" />
          </div>
          <div>
            <h3 className="font-black text-xl uppercase tracking-tighter text-[#3d306f]">The Mumbai Mavericks</h3>
            <p className="text-[10px] font-black tracking-widest text-[#81817a] uppercase mt-1">Squad Position: Lead Trader</p>
          </div>
        </div>
        
        <button className="w-full md:w-auto bg-[#fad538] border-[4px] border-black px-6 py-3 font-black text-sm uppercase shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all z-10 text-center">
          View Squad Room
        </button>
      </div>

    </div>
  );
}
