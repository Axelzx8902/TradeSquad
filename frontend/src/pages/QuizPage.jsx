import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const QUIZ_DATA = {
  'mid-cap': {
    title: 'Mid-Cap Stocks',
    questions: [
      {
        q: 'Which of the following best describes the risk/reward profile of Mid-Cap stocks?',
        options: [
          'Extremely high risk with no potential for stable returns',
          'Moderate risk with higher growth potential than large-caps',
          'Zero risk guaranteed returns like government bonds',
          'Only suitable for institutional investors'
        ],
        correct: 1,
      },
      {
        q: 'What market cap range typically defines a Mid-Cap company?',
        options: [
          'Below $500M',
          'Between $2B and $10B',
          'Above $50B',
          'Between $100M and $500M'
        ],
        correct: 1,
      },
      {
        q: 'Why should you check institutional ownership for mid-caps?',
        options: [
          'It doesn\'t matter at all',
          'If big institutions are investing, growth potential is higher',
          'Institutional ownership always means the stock will crash',
          'It only matters for government bonds'
        ],
        correct: 1,
      }
    ]
  }
};

export default function QuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const quiz = QUIZ_DATA[lessonId] || QUIZ_DATA['mid-cap'];

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = quiz.questions[currentQ];

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 < quiz.questions.length) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    const passed = score >= Math.ceil(quiz.questions.length * 0.6);
    return (
      <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen flex items-center justify-center">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-lg p-0 text-center" style={{ transform: 'rotate(0.5deg)' }}>
          <div className={`${passed ? 'bg-[#fad538]' : 'bg-[#be2d06] text-white'} border-b-4 border-black p-6`}>
            <p className="text-5xl mb-2">{passed ? '🏏' : '❌'}</p>
            <h2 className="text-3xl font-black uppercase">{passed ? 'Asset Unlocked!' : 'Not Quite!'}</h2>
          </div>
          <div className="p-6">
            <p className="font-bold text-lg mb-2">Score: {score}/{quiz.questions.length}</p>
            <p className="font-medium text-[#65655f] mb-6">
              {passed
                ? `${quiz.title} are now available in your Scout tab.`
                : 'Review the lesson material and try again. Every great batsman practices.'}
            </p>
            <button
              onClick={() => navigate(passed ? '/scout' : '/dugout')}
              className="bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 px-8 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer"
            >
              {passed ? 'Go to Scout →' : 'Back to Dugout'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Dugout Quiz</h1>
        <p className="text-xs font-black uppercase text-[#65655f] tracking-widest mt-1">Gatekeeper Challenge</p>
      </div>

      {/* Progress */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-4 mb-6 flex justify-between items-center">
        <span className="font-black uppercase text-sm">Knowledge Strike</span>
        <span className="font-bold text-sm bg-[#c3b4fc] border-2 border-black px-3 py-1">Question {String(currentQ + 1).padStart(2, '0')}/{String(quiz.questions.length).padStart(2, '0')}</span>
      </div>

      {/* Question */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-6 mb-6">
        <h2 className="font-black text-xl uppercase leading-snug">{question.q}</h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((opt, idx) => {
          let bg = 'bg-white';
          let border = 'border-black';
          if (answered && idx === question.correct) { bg = 'bg-green-100'; border = 'border-green-700'; }
          else if (answered && idx === selected && idx !== question.correct) { bg = 'bg-red-50'; border = 'border-[#be2d06]'; }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={answered}
              className={`w-full text-left ${bg} border-4 ${border} p-4 font-bold shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer hover:bg-[#f5f4eb] ${
                answered ? 'cursor-default' : ''
              }`}
            >
              <span className="font-black mr-3 uppercase">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      {answered && (
        <div className="flex gap-3">
          <button onClick={handleNext} className="flex-1 bg-[#fad538] border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
            {currentQ + 1 < quiz.questions.length ? 'Next Question →' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  );
}
