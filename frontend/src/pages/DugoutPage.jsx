import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const LESSON_SLIDES = {
  'large-cap': [
    {
      title: 'Large-Cap Stocks',
      subtitle: 'The Opening Batsmen',
      tag: 'Slide 1 of 3 — What Are They?',
      bg: 'bg-[#fad538]',
      content: 'Large-cap stocks are companies with a market capitalization above ₹20,000 Crore. Think of them as the Rohit Sharmas of the market — solid, reliable, and trusted to open every innings.',
      stat: { label: 'Min Market Cap', value: '₹20,000 Cr+' },
    },
    {
      title: 'Risk / Reward',
      subtitle: 'Dependable No. 3',
      tag: 'Slide 2 of 3 — Risk Profile',
      bg: 'bg-[#c3b4fc]',
      content: 'Large-caps are the most stable asset class. During a market crash, they bounce back fastest. Lower growth potential, but you sleep easy at night. Ideal for the first 40-50% of your virtual portfolio.',
      pros: 'High liquidity. Institutional backing. Battle-tested in bear markets.',
      cons: 'Lower growth ceiling than mid/small-caps. Slower appreciation.',
    },
    {
      title: 'Scout\'s Tip',
      subtitle: 'Strategy Corner',
      tag: 'Slide 3 of 3 — How to Play',
      bg: 'bg-[#ff7574]',
      content: 'Rule of thumb: allocate large-caps as your "sheet anchor" in the squad. Pair them with 1-2 mid-caps for explosive upside. Always check the Price-to-Earnings (PE) ratio — above 30 means the market is pricing in high expectations.',
      stat: { label: 'Reward Unlocked', value: '₹5,000' },
    },
  ],
  'mid-cap': [
    {
      title: 'Mid-Cap Stocks',
      subtitle: 'The Middle-Order Batsmen',
      tag: 'Slide 1 of 3 — What Are They?',
      bg: 'bg-[#c3b4fc]',
      content: 'Mid-cap stocks represent companies with a market cap typically between ₹5,000 Crore and ₹20,000 Crore. In the cricket of trading, these are your Middle-Order Batsmen — they aren\'t as fragile as small-caps, but have significantly more scoring potential than large-cap giants.',
      stat: { label: 'Market Cap Range', value: '₹5K–20K Cr' },
    },
    {
      title: 'Risk / Reward Profile',
      subtitle: 'High Agility Zone',
      tag: 'Slide 2 of 3 — Risk Profile',
      bg: 'bg-[#fad538]',
      content: 'The sweet spot between stability and aggressive growth. Mid-caps fly high in bull runs and can drop hard during corrections — just like a #5 batsman who scores 80s or ducks.',
      pros: 'High agility and faster capital appreciation during bull runs.',
      cons: 'Lower liquidity than large-caps; can be more volatile in defensive markets.',
    },
    {
      title: 'Scout\'s Tip',
      subtitle: 'The Institutional Signal',
      tag: 'Slide 3 of 3 — Strategy',
      bg: 'bg-[#ff7574]',
      content: 'Always check institutional ownership for mid-caps. If the "Big League" scouts — mutual funds, FIIs — are accumulating, growth is imminent. A rising promoter stake is also a strong bullish signal.',
      stat: { label: 'Reward Unlocked', value: '₹10,000' },
    },
  ],
  'bonds': [
    {
      title: 'Government Bonds',
      subtitle: 'The Defensive Play',
      tag: 'Slide 1 of 3 — What Are They?',
      bg: 'bg-[#fad538]',
      content: 'Government bonds are debt instruments issued by the Government of India to fund public expenditure. When you buy a bond, you\'re lending money to the government at a fixed interest rate (called the coupon rate). Safest instrument in the squad.',
      stat: { label: 'Risk Level', value: 'Very Low' },
    },
    {
      title: 'Yield & Duration',
      subtitle: 'How Returns Work',
      tag: 'Slide 2 of 3 — Understanding Yield',
      bg: 'bg-[#c3b4fc]',
      content: 'Bond yield and price move inversely — when RBI raises rates, existing bond prices fall. The 10-year G-Sec yield is the benchmark. Think of this as the referral between the striker and non-striker end: dynamic, always shifting.',
      pros: 'Guaranteed returns. Zero default risk on government bonds.',
      cons: 'Low returns (6-7% typically). Value erodes in high-inflation environments.',
    },
    {
      title: 'Scout\'s Tip',
      subtitle: 'When to Play Bonds',
      tag: 'Slide 3 of 3 — Strategy',
      bg: 'bg-[#ff7574]',
      content: 'Add bonds when the economy is slowing and equity markets are uncertain. The classic 60/40 rule: 60% equities, 40% bonds. Bonds are your defensive field placement — boring but match-winning.',
      stat: { label: 'Reward Unlocked', value: '₹3,000' },
    },
  ],
};

function SlideViewer({ lesson, onClose, onFinish }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = LESSON_SLIDES[lesson.id] || [];
  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#fefcf4] border-4 border-black w-full max-w-2xl shadow-[12px_12px_0px_0px_#000] overflow-hidden" style={{ transform: 'rotate(0.3deg)' }}>
        
        {/* Top bar */}
        <div className={`${slide.bg} border-b-4 border-black px-6 py-4 flex justify-between items-center`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/60">{slide.tag}</p>
            <h2 className="font-black text-2xl uppercase leading-none mt-1">{slide.title}</h2>
            <p className="text-xs font-bold uppercase text-black/70 mt-1">{slide.subtitle}</p>
          </div>
          <button onClick={onClose} className="bg-white border-4 border-black px-3 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer text-lg">✕</button>
        </div>

        {/* Slide Progress dots */}
        <div className="flex gap-2 px-6 pt-4">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 flex-1 border-2 border-black transition-all ${i <= currentSlide ? 'bg-black' : 'bg-[#e9e9de]'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 min-h-[280px]">
          <p className="text-base font-medium leading-relaxed text-[#383833]">{slide.content}</p>

          {slide.pros && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 border-4 border-green-700 p-4">
                <p className="font-black uppercase text-[10px] text-green-700 mb-1">Strengths</p>
                <p className="text-sm font-medium">{slide.pros}</p>
              </div>
              <div className="bg-red-50 border-4 border-[#be2d06] p-4">
                <p className="font-black uppercase text-[10px] text-[#be2d06] mb-1">Risks</p>
                <p className="text-sm font-medium">{slide.cons}</p>
              </div>
            </div>
          )}

          {slide.stat && (
            <div className="bg-[#fad538] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] inline-block" style={{ transform: 'rotate(-0.5deg)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest">{slide.stat.label}</p>
              <p className="text-2xl font-black">{slide.stat.value}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t-4 border-black p-4 flex gap-3">
          <button
            onClick={() => setCurrentSlide(s => s - 1)}
            disabled={currentSlide === 0}
            className="border-4 border-black font-black p-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-white"
          >
            <ChevronLeft size={20} />
          </button>

          {!isLast ? (
            <button
              onClick={() => setCurrentSlide(s => s + 1)}
              className="flex-1 bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Next Slide <ChevronRight size={18} />
            </button>
          ) : (
            <Link
              to={`/quiz/${lesson.id}`}
              onClick={onClose}
              className="flex-1 bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> Take the Quiz →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

const LESSONS = [
  {
    id: 'large-cap',
    title: 'Large-Cap Stocks',
    subtitle: 'The Opening Batsmen',
    description: 'Blue-chip companies with massive market capitalizations. These are your dependable run-scorers.',
    difficulty: 'Beginner',
    completed: true,
    reward: '₹5,000',
    slides: 3,
  },
  {
    id: 'mid-cap',
    title: 'Mid-Cap Stocks',
    subtitle: 'The Middle-Order Batsmen',
    description: '"The sweet spot between stability and aggressive growth." Mid-caps have more scoring potential than large-caps.',
    difficulty: 'Intermediate',
    completed: false,
    reward: '₹10,000',
    slides: 3,
  },
  {
    id: 'bonds',
    title: 'Government Bonds',
    subtitle: 'The Defensive Play',
    description: 'Low-risk, steady yields for a balanced portfolio. The sheet anchor of your squad.',
    difficulty: 'Beginner',
    completed: false,
    reward: '₹3,000',
    slides: 3,
  },
];

export default function DugoutPage() {
  const [activeLesson, setActiveLesson] = useState(null);

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen">
      {/* Slide Viewer Overlay */}
      {activeLesson && (
        <SlideViewer
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">The Dugout</h1>
        <p className="text-xs font-bold uppercase text-[#65655f] mt-2 tracking-widest">Knowledge Gate • Learn to Unlock</p>
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LESSONS.map((lesson) => {
          const rot = (Math.random() * 1.5 - 0.75).toFixed(2);
          return (
            <div
              key={lesson.id}
              className={`border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 transition-all ${
                lesson.completed ? 'bg-[#fad538]/20' : 'bg-white'
              }`}
              style={{ transform: `rotate(${rot}deg)` }}
            >
              {/* Header tab */}
              <div className={`border-b-4 border-black px-4 py-3 flex justify-between items-center ${
                lesson.completed ? 'bg-green-700 text-white' : 'bg-[#c3b4fc]'
              }`}>
                <span className="font-black text-xs uppercase tracking-wider">{lesson.difficulty}</span>
                {lesson.completed
                  ? <span className="text-xs font-bold">✅ COMPLETED</span>
                  : <span className="text-xs font-bold bg-[#fad538] border-2 border-black px-2 py-0.5">🔒 GATED</span>
                }
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-black text-xl uppercase leading-tight mb-1">{lesson.title}</h3>
                <p className="text-xs font-bold uppercase text-[#65655f] mb-3">{lesson.subtitle}</p>
                <p className="text-sm font-medium text-[#383833] leading-relaxed mb-4">{lesson.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-[#65655f]">{lesson.slides} Slides</span>
                  <span className="text-xs font-black bg-[#fad538] border-2 border-black px-2 py-1">Reward: {lesson.reward}</span>
                </div>
              </div>

              {/* Action button */}
              <div className="border-t-4 border-black p-3">
                <button
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full border-4 border-black font-black uppercase py-3 text-sm shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer ${
                    lesson.completed ? 'bg-white text-[#65655f]' : 'bg-[#b6353a] text-white'
                  }`}
                >
                  {lesson.completed ? 'Review Lesson' : 'Start Learning'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
