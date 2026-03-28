import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Clock, Trophy, Users, Zap, Lock, Star } from 'lucide-react';

const MINIGAMES = [
  {
    id: 'news-vs-numbers',
    title: 'News vs. Numbers',
    subtitle: 'Media Literacy Challenge',
    description: 'Can you tell real financial value from market hype? 5 headlines. Your verdict: HYPE or VALUE.',
    players: '4,281',
    reward: '₹15,000',
    difficulty: 'Hard',
    timeLimit: '5 min',
    icon: Newspaper,
    bg: 'bg-[#fad538]',
    locked: false,
    tag: 'LIVE',
  },
  {
    id: 'panic-or-patience',
    title: 'Panic or Patience?',
    subtitle: 'Behavioral Finance',
    description: 'The market just crashed 8%. A tweet says "SELL EVERYTHING." What do you do? Test your emotional discipline.',
    players: '2,114',
    reward: '₹10,000',
    difficulty: 'Medium',
    timeLimit: '4 min',
    icon: Zap,
    bg: 'bg-[#c3b4fc]',
    locked: false,
    tag: 'HOT',
  },
  {
    id: 'sector-scout',
    title: 'Sector Scout',
    subtitle: 'Market Classification',
    description: 'Given a company description, classify it into the right sector: FMCG, IT, Banking, Pharma, or Energy.',
    players: '891',
    reward: '₹8,000',
    difficulty: 'Easy',
    timeLimit: '3 min',
    icon: Star,
    bg: 'bg-[#ff7574]',
    locked: false,
    tag: 'NEW',
  },
  {
    id: 'pe-detective',
    title: 'P/E Detective',
    subtitle: 'Valuation Mastery',
    description: 'Given a PE ratio and sector, is this stock overvalued or undervalued? Unlock after completing 2 Dugout lessons.',
    players: '—',
    reward: '₹20,000',
    difficulty: 'Expert',
    timeLimit: '6 min',
    icon: Trophy,
    bg: 'bg-[#e9e9de]',
    locked: true,
    tag: 'LOCKED',
  },
];

export default function ChallengePage() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handlePlay = (game) => {
    if (game.locked) return;
    if (game.id === 'news-vs-numbers') {
      navigate('/challenge/news-vs-numbers');
    } else {
      setActiveGame(game.id);
    }
  };

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen">
      {/* Coming Soon Modal for unimplemented games */}
      {activeGame && activeGame !== 'news-vs-numbers' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 max-w-sm w-full text-center" style={{ transform: 'rotate(1deg)' }}>
            <p className="text-5xl mb-4">🏗️</p>
            <h3 className="font-black text-2xl uppercase mb-2">Coming Soon!</h3>
            <p className="font-medium text-[#65655f] mb-6">This challenge room is under construction. Check back after the hackathon!</p>
            <button onClick={() => setActiveGame(null)} className="w-full bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">Back to Rooms</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Challenge Rooms</h1>
          <div className="bg-[#be2d06] border-4 border-black px-3 py-1 shadow-[4px_4px_0px_0px_#000]">
            <span className="font-black text-white text-xs uppercase tracking-widest">⚡ Live Arena</span>
          </div>
        </div>
        <p className="text-xs font-bold uppercase text-[#65655f] mt-3 tracking-widest">Pick your challenge. Prove your edge.</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000] text-center">
          <div className="flex items-center justify-center gap-1 mb-1"><Users size={14} /><span className="text-[10px] font-black uppercase">Total Players</span></div>
          <p className="text-xl font-black">7,286</p>
        </div>
        <div className="bg-[#fad538] border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000] text-center">
          <div className="flex items-center justify-center gap-1 mb-1"><Trophy size={14} /><span className="text-[10px] font-black uppercase">Your Rank</span></div>
          <p className="text-xl font-black">#42</p>
        </div>
        <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000] text-center">
          <div className="flex items-center justify-center gap-1 mb-1"><Star size={14} /><span className="text-[10px] font-black uppercase">Rooms Won</span></div>
          <p className="text-xl font-black">3</p>
        </div>
      </div>

      {/* Mini-game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MINIGAMES.map((game, i) => {
          const rot = (Math.random() * 1.2 - 0.6).toFixed(2);
          const Icon = game.icon;
          return (
            <div
              key={game.id}
              onMouseEnter={() => setHoveredCard(game.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`border-4 border-black transition-all ${
                game.locked ? 'opacity-60' : hoveredCard === game.id ? 'shadow-[10px_10px_0px_0px_#000] -translate-y-1 -translate-x-1' : 'shadow-[4px_4px_0px_0px_#000]'
              } bg-white`}
              style={{ transform: `rotate(${rot}deg)` }}
            >
              {/* Card Header */}
              <div className={`${game.bg} border-b-4 border-black px-5 py-4 flex justify-between items-start`}>
                <div className="flex items-center gap-3">
                  <div className="bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000]">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase leading-none">{game.title}</h3>
                    <p className="text-[11px] font-bold uppercase text-black/70 mt-1">{game.subtitle}</p>
                  </div>
                </div>
                <div className={`text-[10px] font-black uppercase border-2 border-black px-2 py-1 ${
                  game.tag === 'LIVE' ? 'bg-[#be2d06] text-white' :
                  game.tag === 'HOT' ? 'bg-[#b6353a] text-white' :
                  game.tag === 'NEW' ? 'bg-black text-white' :
                  'bg-[#81817a] text-white'
                }`}>
                  {game.tag === 'LIVE' && '● '}{game.tag}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <p className="text-sm font-medium text-[#383833] leading-relaxed mb-4">{game.description}</p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#f5f4eb] border-2 border-black p-2 text-center">
                    <p className="text-[9px] font-black uppercase text-[#65655f]">Players</p>
                    <p className="font-black text-sm">{game.players}</p>
                  </div>
                  <div className="bg-[#f5f4eb] border-2 border-black p-2 text-center">
                    <p className="text-[9px] font-black uppercase text-[#65655f]">Time</p>
                    <p className="font-black text-sm flex items-center justify-center gap-1"><Clock size={12} />{game.timeLimit}</p>
                  </div>
                  <div className="bg-[#fad538] border-2 border-black p-2 text-center">
                    <p className="text-[9px] font-black uppercase text-[#776300]">Reward</p>
                    <p className="font-black text-sm">{game.reward}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase border-2 border-black px-3 py-1 ${
                    game.difficulty === 'Easy' ? 'bg-green-200 text-green-800' :
                    game.difficulty === 'Medium' ? 'bg-[#fad538]' :
                    game.difficulty === 'Hard' ? 'bg-[#ff7574]' : 'bg-[#b6353a] text-white'
                  }`}>{game.difficulty}</span>
                </div>
              </div>

              {/* Card Action */}
              <div className="border-t-4 border-black p-4">
                <button
                  onClick={() => handlePlay(game)}
                  disabled={game.locked}
                  className={`w-full border-4 border-black font-black uppercase py-3 text-sm shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${
                    game.locked
                      ? 'bg-[#bab9b2] text-[#65655f] cursor-not-allowed'
                      : 'bg-[#b6353a] text-white cursor-pointer hover:scale-[1.01]'
                  }`}
                >
                  {game.locked ? '🔒 Complete Dugout Lessons to Unlock' : '🏏 Play Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard teaser */}
      <div className="mt-10 bg-[#c3b4fc] border-4 border-black shadow-[4px_4px_0px_0px_#000] p-5 flex items-center justify-between flex-wrap gap-4" style={{ transform: 'rotate(-0.3deg)' }}>
        <div>
          <h3 className="font-black uppercase text-lg">7-Day Challenge: Mid-Cap Mania</h3>
          <p className="text-xs font-bold uppercase text-[#3d306f] mt-1">See how you stack against other traders</p>
        </div>
        <button onClick={() => navigate('/points-table')} className="bg-black text-white border-4 border-black font-black uppercase py-2 px-6 shadow-[4px_4px_0px_0px_#685b9c] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm cursor-pointer">
          View Leaderboard →
        </button>
      </div>
    </div>
  );
}
