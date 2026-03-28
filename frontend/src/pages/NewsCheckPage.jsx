import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewsCheckPage() {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const headline = "RELIANCE TO ACQUIRE GLOBAL TECH GIANT? MARKET ABUZZ!";
  const correctAnswer = 'hype';
  const explanation = "Master the art of media literacy before you commit your capital. Always cross-reference breaking news with the earnings report. This headline uses emotional language ('ABUZZ') and a question mark — classic hype indicators.";

  const handleAnswer = (answer) => {
    if (answered) return;
    setSelected(answer);
    setAnswered(true);
  };

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">News vs. Numbers</h1>
        <p className="text-xs font-black uppercase text-[#65655f] tracking-widest mt-1">Hype Check Challenge</p>
      </div>

      {/* Headline Card */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 mb-6" style={{ transform: 'rotate(-0.5deg)' }}>
        <p className="text-[10px] font-black uppercase text-[#be2d06] tracking-widest mb-3">Breaking Headline</p>
        <h2 className="text-2xl md:text-3xl font-black uppercase leading-tight">{headline}</h2>
      </div>

      {/* Question */}
      <div className="bg-[#c3b4fc] border-4 border-black p-5 shadow-[4px_4px_0px_0px_#000] mb-6">
        <p className="font-black uppercase text-lg">Is this headline driven by hype or fundamental value?</p>
      </div>

      {/* Answer Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleAnswer('hype')}
          disabled={answered}
          className={`border-4 border-black p-6 font-black uppercase text-xl shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer ${
            answered && selected === 'hype'
              ? correctAnswer === 'hype' ? 'bg-green-200 border-green-700' : 'bg-red-100 border-[#be2d06]'
              : answered && correctAnswer === 'hype' ? 'bg-green-200 border-green-700' : 'bg-[#ff7574] hover:bg-[#b6353a] hover:text-white'
          }`}
        >
          🔥 Hype
        </button>
        <button
          onClick={() => handleAnswer('value')}
          disabled={answered}
          className={`border-4 border-black p-6 font-black uppercase text-xl shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer ${
            answered && selected === 'value'
              ? correctAnswer === 'value' ? 'bg-green-200 border-green-700' : 'bg-red-100 border-[#be2d06]'
              : answered && correctAnswer === 'value' ? 'bg-green-200 border-green-700' : 'bg-[#fad538] hover:bg-[#776300] hover:text-white'
          }`}
        >
          📊 Value
        </button>
      </div>

      {/* Explanation */}
      {answered && (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-6" style={{ transform: 'rotate(0.3deg)' }}>
          <div className={`mb-4 ${selected === correctAnswer ? 'text-green-700' : 'text-[#be2d06]'}`}>
            <p className="text-3xl font-black">{selected === correctAnswer ? '✅ Correct!' : '❌ Not Quite!'}</p>
          </div>
          <p className="font-medium text-sm leading-relaxed">{explanation}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 px-8 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer"
          >
            Continue Trading →
          </button>
        </div>
      )}
    </div>
  );
}
