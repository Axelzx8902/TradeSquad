import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * DemoStockChart — Candlestick chart with live demo simulation.
 *
 * Props:
 *   candles  — Array of { timestamp, open, high, low, close }
 *   ticker   — String ticker symbol shown in badge
 *   demoMode — Boolean to enable 1.5s interval simulation on last candle
 *   maxBars  — Number of candles to render (default 30)
 */
export default function DemoStockChart({ candles: rawCandles = [], ticker = '', demoMode = true, maxBars = 30 }) {
  const [chartCandles, setChartCandles] = useState([]);
  const intervalRef = useRef(null);

  // Seed chart data whenever new raw candles arrive
  useEffect(() => {
    if (rawCandles.length === 0) return;
    // Deep-clone the last N candles so mutations don't touch source
    const sliced = rawCandles.slice(-maxBars).map(c => ({ ...c }));
    setChartCandles(sliced);
  }, [rawCandles, maxBars]);

  // ── DEMO MODE: mutate only the last candle every 1500ms ──
  const tick = useCallback(() => {
    setChartCandles(prev => {
      if (prev.length === 0) return prev;
      const next = prev.map(c => ({ ...c })); // shallow clone array
      const last = { ...next[next.length - 1] }; // clone last candle

      // Random volatility shift: -0.15% to +0.15%
      const shift = (Math.random() * 0.003 - 0.0015); // ±0.15%
      const newClose = +(last.close * (1 + shift)).toFixed(2);

      last.close = newClose;

      // Expand high/low if simulated close pushes past them
      if (newClose > last.high) last.high = newClose;
      if (newClose < last.low) last.low = newClose;

      next[next.length - 1] = last;
      return next;
    });
  }, []);

  useEffect(() => {
    if (demoMode && chartCandles.length > 0) {
      intervalRef.current = setInterval(tick, 1500);
      return () => clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [demoMode, chartCandles.length, tick]);

  // ── Rendering ──
  if (chartCandles.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="font-black text-xs uppercase text-[#bab9b2] tracking-widest">No chart data</p>
      </div>
    );
  }

  const allHighs = chartCandles.map(c => c.high);
  const allLows = chartCandles.map(c => c.low);
  const maxH = Math.max(...allHighs);
  const minL = Math.min(...allLows);
  const range = maxH - minL || 1;

  const svgW = 400;
  const svgH = 160;
  const padY = 16;
  const padX = 4;
  const usableW = svgW - padX * 2;
  const candleW = (usableW / chartCandles.length) * 0.7;
  const gap = (usableW / chartCandles.length) * 0.3;

  const yScale = (val) => padY + (svgH - 2 * padY) * (1 - (val - minL) / range);

  // Latest candle stats
  const lastCandle = chartCandles[chartCandles.length - 1];
  const firstOpen = chartCandles[0].open;
  const sessionChange = ((lastCandle.close - firstOpen) / firstOpen * 100).toFixed(2);
  const isBullSession = sessionChange >= 0;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top bar: demo badge + live price */}
      <div className="flex items-center justify-between px-1 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#bab9b2]">
            5D • 15min
          </span>
          {demoMode && (
            <span className="flex items-center gap-1.5 bg-[#1b1b1b] text-[#ff4444] px-2 py-0.5 border-2 border-[#ff4444] text-[9px] font-black uppercase tracking-wider animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4444]"></span>
              </span>
              Demo Mode: Live Simulation
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-black text-xs ${isBullSession ? 'text-green-700' : 'text-[#be2d06]'}`}>
            ₹{lastCandle.close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className={`text-[10px] font-black ${isBullSession ? 'text-green-700' : 'text-[#be2d06]'}`}>
            {isBullSession ? '+' : ''}{sessionChange}%
          </span>
        </div>
      </div>

      {/* SVG Candlestick Chart */}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full flex-1"
        preserveAspectRatio="none"
        style={{ minHeight: 0 }}
      >
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map(pct => {
          const y = padY + (svgH - 2 * padY) * pct;
          return (
            <line key={pct} x1={padX} y1={y} x2={svgW - padX} y2={y}
              stroke="#e9e9de" strokeWidth="0.5" strokeDasharray="4,4" />
          );
        })}

        {chartCandles.map((c, i) => {
          const x = padX + i * (candleW + gap) + gap / 2;
          const isBullish = c.close >= c.open;
          const bodyTop = yScale(Math.max(c.open, c.close));
          const bodyBot = yScale(Math.min(c.open, c.close));
          const bodyH = Math.max(bodyBot - bodyTop, 0.8);
          const wickTop = yScale(c.high);
          const wickBot = yScale(c.low);
          const wickX = x + candleW / 2;

          const isLast = i === chartCandles.length - 1;
          const fillColor = isBullish ? '#22c55e' : '#be2d06';
          const strokeColor = isBullish ? '#16a34a' : '#991b1b';

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={wickX} y1={wickTop} x2={wickX} y2={wickBot}
                stroke={strokeColor} strokeWidth={isLast && demoMode ? '1' : '0.6'}
              />
              {/* Body */}
              <rect
                x={x} y={bodyTop} width={candleW} height={bodyH}
                fill={fillColor}
                stroke={isLast && demoMode ? '#000' : strokeColor}
                strokeWidth={isLast && demoMode ? '0.8' : '0.3'}
                rx="0.5"
              />
              {/* Pulsing glow on the live candle during demo mode */}
              {isLast && demoMode && (
                <rect
                  x={x - 1} y={bodyTop - 1} width={candleW + 2} height={bodyH + 2}
                  fill="none" stroke={fillColor} strokeWidth="0.6" rx="1"
                  opacity="0.4"
                >
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" />
                </rect>
              )}
            </g>
          );
        })}

        {/* Current price line (dashed) */}
        {demoMode && (
          <>
            <line
              x1={padX} y1={yScale(lastCandle.close)}
              x2={svgW - padX} y2={yScale(lastCandle.close)}
              stroke={lastCandle.close >= lastCandle.open ? '#22c55e' : '#be2d06'}
              strokeWidth="0.5" strokeDasharray="3,3"
            />
          </>
        )}
      </svg>
    </div>
  );
}
