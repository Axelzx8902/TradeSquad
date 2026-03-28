import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import OnboardingModal from '../components/OnboardingModal';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When a new user signs up, we surface the onboarding modal
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUserId, setNewUserId] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        /* ─── LOGIN ─── */
        const { data, error: loginErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginErr) throw loginErr;

        // Persist token for the axios interceptor in api.js
        if (data.session) {
          localStorage.setItem('sb-auth-token', JSON.stringify({
            access_token: data.session.access_token,
          }));
        }

        navigate('/');
      } else {
        /* ─── SIGN UP ─── */
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpErr) throw signUpErr;

        // Show the onboarding modal so the user can fill in their profile
        const userId = data.user?.id;
        if (userId) {
          // Persist token for the axios interceptor
          if (data.session) {
            localStorage.setItem('sb-auth-token', JSON.stringify({
              access_token: data.session.access_token,
            }));
          }
          setNewUserId(userId);
          setShowOnboarding(true);
        } else {
          // Supabase may require email confirmation
          setError('CHECK YOUR EMAIL TO CONFIRM YOUR ACCOUNT, THEN LOG IN.');
        }
      }
    } catch (err) {
      setError(err.message || 'SOMETHING WENT WRONG');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-[#fefcf4] flex items-center justify-center p-6 relative overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(rgba(186,185,178,0.15) 2px, transparent 2px)',
          backgroundSize: '32px 32px',
        }}
      >
        {/* Decorative floating shapes */}
        <div
          className="absolute top-10 left-10 bg-[#fad538] border-4 border-black w-20 h-20 shadow-[8px_8px_0px_0px_#000]"
          style={{ transform: 'rotate(12deg)' }}
        />
        <div
          className="absolute bottom-20 right-16 bg-[#c3b4fc] border-4 border-black w-16 h-16 shadow-[6px_6px_0px_0px_#000]"
          style={{ transform: 'rotate(-8deg)' }}
        />
        <div
          className="absolute top-1/4 right-10 bg-[#ff7574] border-4 border-black w-12 h-12 shadow-[4px_4px_0px_0px_#000]"
          style={{ transform: 'rotate(25deg)' }}
        />
        <div
          className="absolute bottom-40 left-20 bg-[#b6353a] border-4 border-black w-10 h-10 shadow-[4px_4px_0px_0px_#000]"
          style={{ transform: 'rotate(-15deg)' }}
        />

        <div className="w-full max-w-md relative">
          {/* Title sticker */}
          <div
            className="bg-[#b6353a] border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000] mb-8 text-center"
            style={{ transform: 'rotate(-1deg)' }}
          >
            <h1 className="text-4xl font-black uppercase text-white tracking-tight">
              TradeSquad
            </h1>
            <p className="text-sm font-bold uppercase text-white/80 mt-1">
              Join the Arena
            </p>
          </div>

          {/* Main Auth Card */}
          <div
            className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8"
            style={{ transform: 'rotate(0.5deg)' }}
          >
            {/* Toggle Tabs */}
            <div className="flex mb-6 border-4 border-black">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className="flex-1 py-3 font-black uppercase text-sm tracking-wide transition-colors cursor-pointer"
                style={{
                  background: isLogin ? '#fad538' : '#fefcf4',
                  borderRight: '4px solid black',
                  boxShadow: isLogin ? 'inset 0 -4px 0 black' : 'none',
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className="flex-1 py-3 font-black uppercase text-sm tracking-wide transition-colors cursor-pointer"
                style={{
                  background: !isLogin ? '#fad538' : '#fefcf4',
                  boxShadow: !isLogin ? 'inset 0 -4px 0 black' : 'none',
                }}
              >
                Create Account
              </button>
            </div>

            <h2 className="text-3xl font-black uppercase mb-2">
              {isLogin ? 'Join The Squad' : 'New Recruit'}
            </h2>
            <p className="font-bold text-[#65655f] uppercase text-xs mb-8">
              {isLogin ? 'No rules. Only gains.' : 'Your journey starts here.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@arena.com"
                  required
                  className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#be2d06',
                    background: '#fefcf4',
                    border: '3px solid #be2d06',
                    padding: '10px 14px',
                    textTransform: 'uppercase',
                  }}
                >
                  ✕ {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                id="auth-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 text-lg shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:shadow-none active:translate-y-1 active:translate-x-1 transition-all cursor-pointer mt-6 disabled:opacity-60 disabled:cursor-wait"
              >
                {loading
                  ? 'Loading...'
                  : isLogin
                    ? 'Enter The Arena →'
                    : 'Create Account →'}
              </button>
            </form>

            {/* Toggle Link */}
            <div className="mt-6 text-center">
              <p className="text-xs font-bold text-[#65655f] uppercase">
                {isLogin ? 'New Player?' : 'Already a Player?'}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm font-black uppercase text-[#b6353a] hover:underline mt-1 cursor-pointer"
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] font-bold uppercase text-[#81817a] mt-6">
            Join 45,000+ Traders Worldwide
          </p>
        </div>
      </div>

      {/* Onboarding modal – shown after successful sign-up */}
      {showOnboarding && <OnboardingModal userId={newUserId} />}
    </>
  );
}
