import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) return <AuthPage />;

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
