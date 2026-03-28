import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function CoachAlert({ title, message, onDismiss, onProceed }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#fefcf4] border-[6px] border-[#be2d06] w-full max-w-lg p-0 shadow-[12px_12px_0px_0px_#be2d06] relative" style={{ transform: 'rotate(0.5deg)' }}>
        {/* Close button */}
        <button onClick={onDismiss} className="absolute -top-4 -right-4 bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000] hover:bg-[#be2d06] hover:text-white transition-colors cursor-pointer z-10">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-[#be2d06] text-white px-6 py-4 flex items-center gap-3">
          <AlertTriangle size={28} />
          <h2 className="text-2xl font-black uppercase tracking-tight">Coach Alert!</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-[#be2d06]/10 border-4 border-[#be2d06] p-5 mb-6" style={{ transform: 'rotate(-0.5deg)' }}>
            <h3 className="font-black text-lg uppercase mb-2">{title || 'PANIC DETECTED!'}</h3>
            <p className="font-medium text-sm leading-relaxed">{message || "You're selling after a minor dip. This is a classic behavioral bias. Are you sure you want to abandon the match early?"}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={onDismiss} className="flex-1 bg-[#fad538] border-4 border-black font-black uppercase py-3 px-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer text-sm">
              Stay in Match
            </button>
            {onProceed && (
              <button onClick={onProceed} className="flex-1 bg-white border-4 border-black font-bold uppercase py-3 px-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer text-sm text-[#65655f]">
                Proceed Anyway
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
