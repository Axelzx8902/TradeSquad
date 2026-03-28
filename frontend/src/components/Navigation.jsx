import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, BookOpen, Swords, Newspaper,
  LogOut, HelpCircle, ListOrdered, User, Wallet, Bell
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const sidebarLinks = [
  { path: '/', name: 'The Pavilion', icon: LayoutDashboard },
  { path: '/scout', name: 'The Scout', icon: Search },
  { path: '/dugout', name: 'The Dugout', icon: BookOpen },
  { path: '/challenge', name: 'Challenge Rooms', icon: Swords },
  { path: '/points-table', name: 'Points Table', icon: ListOrdered },
  { path: '/news', name: 'Commentary', icon: Newspaper },
];

const mobileLinks = [
  { path: '/', name: 'Pavilion', icon: LayoutDashboard },
  { path: '/scout', name: 'Scout', icon: Search },
  { path: '/dugout', name: 'Dugout', icon: BookOpen },
  { path: '/challenge', name: 'Rooms', icon: Swords },
  { path: '/points-table', name: 'Points', icon: ListOrdered },
];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('sb-auth-token');
    navigate('/auth');
  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#fefcf4] border-r-4 border-black h-screen fixed top-0 left-0 z-40">
        {/* Logo + top-right icon strip */}
        <div className="p-5 border-b-4 border-black">
          {/* Icon strip */}
          <div className="flex justify-end gap-2 mb-4">
            <button
              title="Notifications"
              className="relative bg-[#fefcf4] border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000] hover:bg-[#fad538] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer"
            >
              <Bell size={16} />
              {/* Unread badge */}
              <span className="absolute -top-1.5 -right-1.5 bg-[#be2d06] border-2 border-black text-white text-[9px] font-black w-4 h-4 flex items-center justify-center">3</span>
            </button>
            <button
              title="Wallet / Ledger"
              onClick={() => navigate('/ledger')}
              className={`bg-[#fefcf4] border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000] hover:bg-[#c3b4fc] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer ${location.pathname === '/ledger' ? 'bg-[#c3b4fc]' : ''}`}
            >
              <Wallet size={16} />
            </button>
            <button
              title="Profile"
              onClick={() => navigate('/profile')}
              className={`bg-[#fefcf4] border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000] hover:bg-[#b6353a] hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer ${location.pathname === '/profile' ? 'bg-[#b6353a] text-white' : ''}`}
            >
              <User size={16} />
            </button>
          </div>

          {/* Logo */}
          <div className="bg-[#fad538] border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
            <h1 className="text-xl font-black uppercase tracking-tight">TradeSquad</h1>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold uppercase bg-[#c3b4fc] border-2 border-black px-2 py-1">Rank: Pro</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 border-4 border-black font-bold uppercase text-sm transition-all ${
                  isActive
                    ? 'bg-[#b6353a] text-white shadow-[4px_4px_0px_0px_#000] translate-x-1'
                    : 'bg-white hover:bg-[#f5f4eb] hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-[2px]'
                }`}
              >
                <link.icon size={18} />
                <span>{link.name}</span>
                {link.name === 'Points Table' && (
                  <span className="ml-auto text-[9px] font-black bg-[#fad538] border border-black px-1 text-black">NEW</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="p-4 border-t-4 border-black space-y-2">
          <NavLink to="/help" className="flex items-center gap-3 px-4 py-2 font-bold uppercase text-xs text-[#65655f] hover:text-black transition-colors">
            <HelpCircle size={16} /> Help
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 font-bold uppercase text-xs text-[#be2d06] hover:text-black transition-colors w-full text-left cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-black">
          <p className="text-[10px] font-bold uppercase text-[#81817a] leading-relaxed">
            © 2024 TRADESQUAD<br />THE COMMENTARY BOX
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-[9px] font-bold uppercase text-[#81817a] hover:text-black cursor-pointer">Privacy Policy</span>
            <span className="text-[9px] font-bold uppercase text-[#81817a]">•</span>
            <span className="text-[9px] font-bold uppercase text-[#81817a] hover:text-black cursor-pointer">Terms of Play</span>
            <span className="text-[9px] font-bold uppercase text-[#81817a]">•</span>
            <span className="text-[9px] font-bold uppercase text-[#81817a] hover:text-black cursor-pointer">Rules</span>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: TOP HEADER BAR with icons ── */}
      <header className="md:hidden fixed top-0 left-0 w-full bg-[#fefcf4] border-b-4 border-black z-40 flex items-center justify-between px-4 py-3">
        <div className="bg-[#fad538] border-4 border-black px-3 py-1 shadow-[3px_3px_0px_0px_#000]">
          <span className="text-base font-black uppercase tracking-tight">TradeSquad</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative bg-[#fefcf4] border-4 border-black p-2 shadow-[3px_3px_0px_0px_#000] cursor-pointer">
            <Bell size={16} />
            <span className="absolute -top-1.5 -right-1.5 bg-[#be2d06] border-2 border-black text-white text-[9px] font-black w-4 h-4 flex items-center justify-center">3</span>
          </button>
          <button
            onClick={() => navigate('/ledger')}
            className={`border-4 border-black p-2 shadow-[3px_3px_0px_0px_#000] cursor-pointer ${location.pathname === '/ledger' ? 'bg-[#c3b4fc]' : 'bg-[#fefcf4]'}`}
          >
            <Wallet size={16} />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className={`border-4 border-black p-2 shadow-[3px_3px_0px_0px_#000] cursor-pointer ${location.pathname === '/profile' ? 'bg-[#b6353a] text-white' : 'bg-[#fefcf4]'}`}
          >
            <User size={16} />
          </button>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="bg-[#fefcf4] border-4 border-black p-2 shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:bg-[#be2d06] hover:text-white transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#e9e9de] border-t-4 border-black flex justify-around py-2 z-40">
        {mobileLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center px-2 py-1 transition-all ${
                isActive ? 'text-[#b6353a] scale-110 font-black' : 'text-[#65655f]'
              }`}
            >
              <link.icon size={20} />
              <span className="text-[9px] uppercase font-bold mt-0.5">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
