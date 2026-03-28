import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navigation from './components/Navigation';
import PlayingXIDashboard from './pages/Dashboard';
import ScoutMarketplace from './pages/Marketplace';
import DugoutPage from './pages/DugoutPage';
import QuizPage from './pages/QuizPage';
import AssetDetailPage from './pages/AssetDetailPage';
import ChallengePage from './pages/ChallengePage';
import NewsCheckPage from './pages/NewsCheckPage';
import ProfilePage from './pages/ProfilePage';
import TransactionLedger from './pages/TransactionLedger';
import MarketCommentary from './pages/MarketCommentary';
import AuthPage from './pages/AuthPage';
import NewsVsNumbers from './pages/NewsVsNumbers';
import PointsTable from './pages/PointsTable';

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#fefcf4] text-black" style={{
      backgroundImage: 'radial-gradient(rgba(186,185,178,0.15) 2px, transparent 2px)',
      backgroundSize: '32px 32px'
    }}>
      <Navigation />
      {/* pt-16 on mobile to clear the fixed top header bar */}
      <main className="pt-16 md:pt-0">
        <Routes>
          <Route path="/" element={<PlayingXIDashboard />} />
          <Route path="/scout" element={<ScoutMarketplace />} />
          <Route path="/dugout" element={<DugoutPage />} />
          <Route path="/quiz/:lessonId" element={<QuizPage />} />
          <Route path="/asset/:ticker" element={<AssetDetailPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/challenge/news-vs-numbers" element={<NewsVsNumbers />} />
          <Route path="/points-table" element={<PointsTable />} />
          <Route path="/news-check" element={<NewsCheckPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/ledger" element={<TransactionLedger />} />
          <Route path="/news" element={<MarketCommentary />} />
        </Routes>
      </main>
    </div>
  );
}

// Guard: only render children when the user has a valid session
function RequireAuth({ session, loading, children }) {
  if (loading) {
    // Brutalist loading screen
    return (
      <div
        className="min-h-screen bg-[#fefcf4] flex items-center justify-center"
        style={{
          backgroundImage: 'radial-gradient(rgba(186,185,178,0.15) 2px, transparent 2px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div className="bg-[#fad538] border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
          <p className="font-black uppercase text-lg tracking-tight animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for an existing session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);

      // Keep the axios interceptor token in sync
      if (s) {
        localStorage.setItem(
          'sb-auth-token',
          JSON.stringify({ access_token: s.access_token })
        );
      }
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);

      if (s) {
        localStorage.setItem(
          'sb-auth-token',
          JSON.stringify({ access_token: s.access_token })
        );
      } else {
        localStorage.removeItem('sb-auth-token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth session={session} loading={loading}>
              <AppLayout />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
