import React from 'react';

export default function AssetCard({ name, ticker, price, change, role, locked, onAction, actionLabel }) {
  const isPositive = change >= 0;
  const rotation = React.useMemo(() => (Math.random() * 2 - 1).toFixed(2), []);

  return (
    <div
      className={`bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-0 transition-all hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 ${locked ? 'opacity-70' : ''}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Card Header */}
      <div className="bg-[#c3b4fc] border-b-4 border-black px-4 py-2 flex justify-between items-center">
        <span className="font-black text-xs uppercase tracking-wider">{ticker}</span>
        {role && <span className="text-[10px] font-bold uppercase bg-[#fad538] border-2 border-black px-2 py-0.5">{role}</span>}
        {locked && <span className="text-[10px] font-bold uppercase bg-[#be2d06] text-white border-2 border-black px-2 py-0.5">🔒 LOCKED</span>}
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="font-black text-lg uppercase leading-tight mb-3">{name}</h3>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#65655f] tracking-widest">LTP</p>
            <p className="text-2xl font-black">₹{parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`text-right`}>
            <span className={`font-black text-lg ${isPositive ? 'text-green-700' : 'text-[#be2d06]'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
          </div>
        </div>
      </div>

      {/* Card Action */}
      {onAction && (
        <div className="border-t-4 border-black p-3">
          <button
            onClick={() => onAction()}
            disabled={locked}
            className={`w-full border-4 border-black font-black uppercase py-2 px-4 text-sm shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer ${
              locked ? 'bg-[#bab9b2] text-[#65655f] cursor-not-allowed' : 'bg-[#b6353a] text-white hover:scale-[1.02]'
            }`}
          >
            {locked ? '🔒 Complete Lesson First' : actionLabel || 'Scout Asset'}
          </button>
        </div>
      )}
    </div>
  );
}
