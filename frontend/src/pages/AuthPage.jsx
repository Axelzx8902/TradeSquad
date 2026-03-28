import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // MVP: Skip auth, go to dashboard
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#fefcf4] flex items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(rgba(186,185,178,0.15) 2px, transparent 2px)', backgroundSize: '32px 32px' }}>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 bg-[#fad538] border-4 border-black w-20 h-20 shadow-[8px_8px_0px_0px_#000]" style={{ transform: 'rotate(12deg)' }} />
      <div className="absolute bottom-20 right-16 bg-[#c3b4fc] border-4 border-black w-16 h-16 shadow-[6px_6px_0px_0px_#000]" style={{ transform: 'rotate(-8deg)' }} />
      <div className="absolute top-1/4 right-10 bg-[#ff7574] border-4 border-black w-12 h-12 shadow-[4px_4px_0px_0px_#000]" style={{ transform: 'rotate(25deg)' }} />

      <div className="w-full max-w-md relative">
        {/* Title sticker */}
        <div className="bg-[#b6353a] border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000] mb-8 text-center" style={{ transform: 'rotate(-1deg)' }}>
          <h1 className="text-4xl font-black uppercase text-white tracking-tight">TradeSquad</h1>
          <p className="text-sm font-bold uppercase text-white/80 mt-1">Join the Arena</p>
        </div>

        {/* Main Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8" style={{ transform: 'rotate(0.5deg)' }}>
          <h2 className="text-3xl font-black uppercase mb-2">
            {isLogin ? 'Join The Squad' : 'Create Account'}
          </h2>
          <p className="font-bold text-[#65655f] uppercase text-xs mb-8">No rules. Only gains.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">Username</label>
                <input type="text" placeholder="Captain_Jack" className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors" />
              </div>
            )}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="trader@arena.com" className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors" />
            </div>

            {isLogin && (
              <button type="button" className="text-xs font-bold uppercase text-[#b6353a] hover:underline">Forgot?</button>
            )}

            <button type="submit" className="w-full bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 text-lg shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:shadow-none active:translate-y-1 active:translate-x-1 transition-all cursor-pointer mt-6">
              {isLogin ? 'Enter The Arena' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold text-[#65655f] uppercase">
              {isLogin ? 'New Player?' : 'Already a Player?'}
            </p>
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-black uppercase text-[#b6353a] hover:underline mt-1 cursor-pointer">
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold uppercase text-[#81817a] mt-6">Join 45,000+ Traders Worldwide</p>
      </div>
    </div>
  );
}
