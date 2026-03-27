"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import type { Photo } from "@/lib/data";

export function PhotoCard({ photo, onClick }: { photo: Photo; onClick?: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // 0 to width
    const y = e.clientY - rect.top;  // 0 to height
    
    // Convert to -1 to +1 range
    const xPct = (x / rect.width - 0.5) * 2;
    const yPct = (y / rect.height - 0.5) * 2;
    
    // Rotate max 10 degrees
    setRotation({ x: -yPct * 10, y: xPct * 10 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  // Variable aspect ratio for masonry look (since we don't have metadata)
  const getAspectRatio = () => {
    const sum = photo.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return sum % 3 === 0 ? "aspect-[4/5]" : "aspect-square";
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative mb-4 sm:mb-6 overflow-hidden rounded-[1.5rem] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-white/60 transition-all duration-500 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${rotation.x === 0 && rotation.y === 0 ? 1 : 1.02})`,
      }}
      onClick={onClick}
    >
      <div className={`relative ${getAspectRatio()}`}>
        <div
          className={`absolute inset-0 bg-neutral-100 animate-pulse transition-opacity duration-500 ${
            isLoaded || loadError ? "opacity-0" : "opacity-100"
          }`}
        />
        {loadError ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 p-4 text-center"
            role="img"
            aria-label={`${photo.alt} — failed to load`}
          >
            <p className="text-xs text-neutral-400">이미지 로드 실패</p>
          </div>
        ) : (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className={`object-cover transition-all duration-[1200ms] ease-in-out group-hover:scale-110 group-hover:brightness-110 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setLoadError(true);
              setIsLoaded(true);
            }}
          />
        )}
        
        {/* Heart Icon Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-4 right-4 text-white hover:scale-125 transition-transform active:scale-95">
             <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-6 w-6">
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
             </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
