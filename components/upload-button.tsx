"use client";

import { Plus } from "lucide-react";

export function UploadButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-30 sm:bottom-8 sm:right-8 group">
      {/* Floral Wreath */}
      <svg 
        viewBox="0 0 120 120" 
        className="absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)] animate-[spin_20s_linear_infinite] pointer-events-none drop-shadow-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300"
      >
        <defs>
          <path id="leaf" d="M0,0 Q4,-6 8,0 Q4,6 0,0" />
          <g id="flower-red">
            <circle cx="0" cy="-3" r="3" fill="#ef4444"/>
            <circle cx="2.8" cy="1.5" r="3" fill="#ef4444"/>
            <circle cx="-2.8" cy="1.5" r="3" fill="#ef4444"/>
            <circle cx="0" cy="0" r="2" fill="#fef08a"/>
          </g>
          <g id="flower-yellow">
            <circle cx="0" cy="-2.5" r="2.5" fill="#eab308"/>
            <circle cx="2.3" cy="1.2" r="2.5" fill="#eab308"/>
            <circle cx="-2.3" cy="1.2" r="2.5" fill="#eab308"/>
            <circle cx="0" cy="0" r="1.5" fill="#f97316"/>
          </g>
        </defs>

        {/* Main Vine */}
        <circle cx="60" cy="60" r="45" fill="none" stroke="#22c55e" strokeWidth="1.5" className="opacity-80" />
        <circle cx="60" cy="60" r="46" fill="none" stroke="#16a34a" strokeWidth="1" strokeDasharray="8 6" className="opacity-90" />

        {/* Elements around the wreath */}
        {Array.from({ length: 12 }).map((_, i) => {
          const bgAngle = i * 30; // 12 elements
          const rad = (bgAngle * Math.PI) / 180;
          const x = 60 + 45 * Math.sin(rad);
          const y = 60 - 45 * Math.cos(rad);
          
          const isFlower = i % 2 === 0;
          const isRed = i % 4 === 0;
          
          return (
            <g key={i} transform={`translate(${x}, ${y}) rotate(${bgAngle + 45})`}>
              {isFlower ? (
                <>
                  <use href="#leaf" fill="#22c55e" transform="rotate(-30) scale(0.8) translate(-4, 0)" />
                  <use href="#leaf" fill="#15803d" transform="rotate(20) scale(0.6) translate(-6, 0)" />
                  <use href={isRed ? "#flower-red" : "#flower-yellow"} transform="scale(0.9)" />
                </>
              ) : (
                <>
                  <use href="#leaf" fill="#4ade80" transform="rotate(10) scale(0.9) translate(-4, -2)" />
                  <use href="#leaf" fill="#16a34a" transform="rotate(-20) scale(0.7) translate(-2, 2)" />
                  <circle cx="4" cy="0" r="1.5" fill="#f87171" />
                </>
              )}
            </g>
          );
        })}
      </svg>

      <button
        onClick={onClick}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-accent shadow-lg ring-1 ring-border/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:text-accent/80 active:scale-95"
        aria-label="Upload photo"
      >
        <Plus className="h-6 w-6 transition-transform duration-500 group-hover:rotate-180" strokeWidth={1.5} />
      </button>
    </div>
  );
}
