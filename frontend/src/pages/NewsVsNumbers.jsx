import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, TrendingUp, BarChart2, Zap } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    headline: 'RELIANCE TO ACQUIRE GLOBAL TECH GIANT? MARKET ABUZZ!',
    indicators: { revenue: '+2.1% YoY', pe: '24.5x', volatility: 'HIGH' },
    context: 'This is based on an anonymous "industry source" and uses a question mark. No official statement from Reliance.',
    answer: 'hype',
    explanation: 'The question mark and anonymous sourcing are classic hype red flags. The PE of 24.5x is not alarming for Reliance, and +2.1% revenue growth is moderate — not explosive enough to justify an acquisition rumor.',
    xp: 200,
  },
  {
    id: 2,
    headline: 'HDFC BANK REPORTS 18% YOY NET PROFIT GROWTH FOR Q3',
    indicators: { revenue: '+18.0% YoY', pe: '19.5x', volatility: 'LOW' },
    context: 'Official quarterly earnings released by the company. Audited financials. Consistent with 5-year trend.',
    answer: 'value',
    explanation: 'This is a verified earnings report — fundamental data, not speculation. 18% YoY profit growth with a PE of 19.5x (below sector average of 22x) makes this a classic value signal.',
    xp: 200,
  },
  {
    id: 3,
    headline: 'ADANI GROUP STOCKS TO 10X IN 6 MONTHS — EXPERT PREDICTS!',
    indicators: { revenue: '-3.2% YoY', pe: '78.4x', volatility: 'EXTREME' },
    context: 'From a Twitter/X post quoting an unverified "financial analyst" account with 200 followers.',
    answer: 'hype',
    explanation: 'Revenue is declining and PE of 78.4x is extremely high. The source is unverified social media, not a research desk. "10X in 6 months" is a hallmark hype phrase — no credible analyst makes such claims.',
    xp: 250,
  },
  {
    id: 4,
    headline: 'INFOSYS REVISES FY25 REVENUE GUIDANCE UPWARD TO 8-10% GROWTH',
    indicators: { revenue: '+7.8% YoY', pe: '25.8x', volatility: 'MEDIUM' },
    context: 'Official guidance revision announced at quarterly earnings call by CEO and CFO. Third consecutive upgrade.',
    answer: 'value',
    explanation: 'Upward guidance revision from C-suite in an earnings call is a strong fundamental signal. PE of 25.8x is fair for an IT company growing at 8-10%. Third consecutive upgrade shows consistency — not a one-off.',
    xp: 200,
  },
  {
    id: 5,
    headline: 'PAYTM WILL OVERTAKE UPI RIVALS AND BECOME INDIA\'S #1 FINTECH IN 2025',
    indicators: { revenue: '-12.4% YoY', pe: 'N/A (Loss)', volatility: 'EXTREME' },
    context: 'Opinion piece on a crypto blog. Paytm is currently under RBI regulatory scrutiny and reported losses last quarter.',
    answer: 'hype',
    explanation: 'Paytm has declining revenue, is loss-making (no PE possible), under regulatory scrutiny, and this claim comes from a non-financial blog. The word "will" with no basis is pure hype. Always follow the money — the numbers say otherwise.',
    xp: 300,
  },
];

const TOTAL_TIME = 300; // 5 minutes in seconds

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function NewsVsNumbersGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('intro'); // intro | game | result
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'game') return;
    if (timeLeft <= 0) { setPhase('result'); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  const q = QUESTIONS[currentQ];
  const progress = ((currentQ) / QUESTIONS.length) * 100;
  const isCorrect = selected === q?.answer;

  const handleAnswer = (choice) => {
    if (revealed) return;
    setSelected(choice);
    setRevealed(true);
    const correct = choice === q.answer;
    if (correct) {
      setScore(s => s + 1);
      setXpEarned(x => x + q.xp);
    }
    setAnswers(a => [...a, { headline: q.headline, chosen: choice, correct, answer: q.answer }]);
  };

  const handleNext = () => {
    if (currentQ + 1 < QUESTIONS.length) {
      setCurrentQ(i => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setPhase('result');
    }
  };

  // ── INTRO SCREEN ──
  if (phase === 'intro') return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen flex flex-col justify-center">
      <button onClick={() => navigate('/challenge')} className="bg-white border-4 border-black font-black uppercase text-sm px-4 py-2 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-8 cursor-pointer w-fit">
        ← Challenge Rooms
      </button>

      {/* Main intro card */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000]" style={{ transform: 'rotate(-0.5deg)' }}>
          {/* Header */}
          <div className="bg-[#fad538] border-b-4 border-black px-6 py-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#776300]">Challenge Room</p>
            <h1 className="text-3xl font-black uppercase leading-tight mt-1">News vs. Numbers</h1>
            <p className="text-sm font-bold uppercase text-[#776300] mt-1">Media Literacy Challenge</p>
          </div>

          <div className="p-6 space-y-5">
            <p className="font-medium text-base leading-relaxed">You'll be shown <strong>5 real-world style market headlines</strong>. Your job: decide if each is driven by <strong>HYPE</strong> (speculation, fear, noise) or <strong>VALUE</strong> (fundamentals, verified data, earnings).</p>

            {/* Rules */}
            <div className="space-y-3">
              {['Read the headline AND the real-time financial indicators below it.', 'Tap HYPE 🔥 or VALUE 📊 — no going back!', 'You have 5 minutes for all 5 questions.', 'Earn XP for each correct answer. Bonus XP for speed.'].map((r, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f5f4eb] border-2 border-black p-3">
                  <span className="bg-[#b6353a] text-white font-black text-xs w-6 h-6 flex items-center justify-center border-2 border-black shrink-0">{i + 1}</span>
                  <p className="text-sm font-medium">{r}</p>
                </div>
              ))}
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#be2d06] text-white border-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center justify-center gap-2 mb-1"><Users size={16} /></div>
                <p className="text-2xl font-black">4,281</p>
                <p className="text-[10px] font-black uppercase">Traders Competing</p>
              </div>
              <div className="bg-[#c3b4fc] border-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center justify-center gap-2 mb-1"><Clock size={16} /></div>
                <p className="text-2xl font-black">05:00</p>
                <p className="text-[10px] font-black uppercase">Time Limit</p>
              </div>
            </div>

            <button
              onClick={() => setPhase('game')}
              className="w-full bg-[#b6353a] text-white border-4 border-black font-black uppercase py-4 text-lg shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#000] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all cursor-pointer"
            >
              🏏 Start Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── RESULT SCREEN ──
  if (phase === 'result') return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        {/* Score header */}
        <div className={`border-4 border-black shadow-[10px_10px_0px_0px_#000] p-0 ${score >= 4 ? '' : score >= 2 ? '' : ''}`} style={{ transform: 'rotate(0.5deg)' }}>
          <div className={`px-6 py-6 border-b-4 border-black text-center ${score >= 4 ? 'bg-[#fad538]' : score >= 2 ? 'bg-[#c3b4fc]' : 'bg-[#ff7574]'}`}>
            <p className="text-5xl mb-2">
              {score === 5 ? '🏆' : score >= 4 ? '🥇' : score >= 3 ? '🥈' : score >= 2 ? '🥉' : '📚'}
            </p>
            <h2 className="text-3xl font-black uppercase">
              {score === 5 ? 'Perfect Score!' : score >= 4 ? 'Sharp Analyst!' : score >= 3 ? 'Good Instincts' : score >= 2 ? 'Keep Practicing' : 'Back to Basics!'}
            </h2>
            <p className="text-xl font-black mt-1">{score} / {QUESTIONS.length} Correct</p>
          </div>

          <div className="bg-white p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#fad538] border-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_#000]">
                <p className="text-[10px] font-black uppercase">XP Earned</p>
                <p className="text-2xl font-black">+{xpEarned} XP</p>
              </div>
              <div className="bg-[#c3b4fc] border-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_#000]">
                <p className="text-[10px] font-black uppercase">Accuracy</p>
                <p className="text-2xl font-black">{Math.round((score / QUESTIONS.length) * 100)}%</p>
              </div>
            </div>

            {/* Answer recap */}
            <h3 className="font-black uppercase text-sm border-b-4 border-black pb-2 mb-3">Your Answers</h3>
            <div className="space-y-2 mb-6">
              {answers.map((a, i) => (
                <div key={i} className={`border-4 p-3 flex items-start gap-3 ${a.correct ? 'border-green-700 bg-green-50' : 'border-[#be2d06] bg-red-50'}`}>
                  <span className="text-lg">{a.correct ? '✅' : '❌'}</span>
                  <p className="text-xs font-bold leading-snug">{a.headline}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPhase('intro'); setCurrentQ(0); setSelected(null); setRevealed(false); setScore(0); setXpEarned(0); setAnswers([]); setTimeLeft(TOTAL_TIME); }} className="flex-1 bg-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer text-sm">
                Play Again
              </button>
              <button onClick={() => navigate('/challenge')} className="flex-1 bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer text-sm">
                All Challenges →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── GAME SCREEN ──
  return (
    <div className="p-4 md:p-6 md:ml-64 pb-24 md:pb-6 min-h-screen">
      {/* Top HUD bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex-1 bg-[#e9e9de] border-4 border-black h-4 relative">
          <div className="bg-[#b6353a] h-full border-r-4 border-black transition-all" style={{ width: `${progress}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase">
            {currentQ}/{QUESTIONS.length} Completed
          </span>
        </div>
        <div className={`border-4 border-black px-3 py-2 font-black text-sm flex items-center gap-2 ${timeLeft < 60 ? 'bg-[#be2d06] text-white' : 'bg-white'}`}>
          <Clock size={14} />
          {formatTime(timeLeft)}
        </div>
        <div className="bg-[#fad538] border-4 border-black px-3 py-2 font-black text-sm flex items-center gap-2">
          <Users size={14} />
          4,281
        </div>
      </div>

      {/* Headline Card — matches Stitch design */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] mb-5" style={{ transform: 'rotate(-0.4deg)' }}>
        {/* Breaking label */}
        <div className="bg-[#be2d06] border-b-4 border-black px-4 py-2 flex items-center gap-2">
          <span className="text-white font-black text-xs uppercase tracking-widest">⬤ Breaking Headline</span>
          <span className="ml-auto text-white text-[10px] font-bold uppercase">Real-Time Indicator</span>
        </div>
        <div className="p-5">
          <h2 className="text-xl md:text-2xl font-black uppercase leading-snug mb-4">{q.headline}</h2>

          {/* Real-time indicators row — exact match to Stitch */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border-4 border-black p-3">
              <div className="flex items-center gap-1 mb-1"><TrendingUp size={12} /><p className="text-[9px] font-black uppercase tracking-wider">Revenue Growth</p></div>
              <p className="font-black text-base">{q.indicators.revenue}</p>
            </div>
            <div className="border-4 border-black p-3">
              <div className="flex items-center gap-1 mb-1"><BarChart2 size={12} /><p className="text-[9px] font-black uppercase tracking-wider">P/E Ratio</p></div>
              <p className="font-black text-base">{q.indicators.pe}</p>
            </div>
            <div className={`border-4 border-black p-3 ${q.indicators.volatility === 'EXTREME' ? 'bg-[#be2d06] text-white' : q.indicators.volatility === 'HIGH' ? 'bg-[#ff7574]' : q.indicators.volatility === 'MEDIUM' ? 'bg-[#fad538]' : 'bg-green-100'}`}>
              <div className="flex items-center gap-1 mb-1"><Zap size={12} /><p className="text-[9px] font-black uppercase tracking-wider">Volatility</p></div>
              <p className="font-black text-base">{q.indicators.volatility}</p>
            </div>
          </div>

          {/* Context clue */}
          <div className="mt-4 bg-[#f5f4eb] border-4 border-[#81817a] p-3">
            <p className="text-[10px] font-black uppercase text-[#65655f] mb-1">Source Context</p>
            <p className="text-xs font-medium">{q.context}</p>
          </div>
        </div>
      </div>

      {/* Question prompt */}
      <div className="bg-[#c3b4fc] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] mb-5 text-center">
        <p className="font-black uppercase text-base">Is this headline driven by HYPE or FUNDAMENTAL VALUE?</p>
      </div>

      {/* Answer buttons */}
      {!revealed && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => handleAnswer('hype')}
            className="bg-[#ff7574] border-4 border-black font-black uppercase text-2xl py-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] hover:-translate-y-1 active:shadow-none active:translate-x-2 active:translate-y-2 transition-all cursor-pointer"
          >
            🔥 HYPE
          </button>
          <button
            onClick={() => handleAnswer('value')}
            className="bg-[#fad538] border-4 border-black font-black uppercase text-2xl py-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] hover:-translate-y-1 active:shadow-none active:translate-x-2 active:translate-y-2 transition-all cursor-pointer"
          >
            📊 VALUE
          </button>
        </div>
      )}

      {/* Reveal panel */}
      {revealed && (
        <div className={`border-4 border-black shadow-[6px_6px_0px_0px_#000] mb-4 ${isCorrect ? 'bg-green-50 border-green-700' : 'bg-red-50 border-[#be2d06]'}`} style={{ transform: 'rotate(0.3deg)' }}>
          <div className={`border-b-4 border-black px-5 py-4 flex items-center gap-3 ${isCorrect ? 'bg-green-700 text-white' : 'bg-[#be2d06] text-white'}`}>
            <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
            <div>
              <h3 className="font-black uppercase text-lg">
                {isCorrect ? `Correct! +${q.xp} XP` : `Incorrect — It was ${q.answer.toUpperCase()}`}
              </h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm font-medium leading-relaxed">{q.explanation}</p>
          </div>
          <div className="border-t-4 border-black p-4">
            <button onClick={handleNext} className={`w-full border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer ${isCorrect ? 'bg-green-700 text-white' : 'bg-[#b6353a] text-white'}`}>
              {currentQ + 1 < QUESTIONS.length ? `Next Headline (${currentQ + 2}/${QUESTIONS.length}) →` : 'See Results 🏆'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
