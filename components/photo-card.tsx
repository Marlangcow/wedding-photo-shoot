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

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-[var(--radius)] bg-card shadow-sm ring-1 ring-border/50 transition-all duration-300 ease-out hover:shadow-2xl hover:z-10 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${rotation.x === 0 && rotation.y === 0 ? 1 : 1.05})`,
      }}
      onClick={onClick}
    >
      <div className="relative aspect-[9/16]">
        <div
          className={`absolute inset-0 bg-muted animate-pulse transition-opacity duration-300 ${
            isLoaded || loadError ? "opacity-0" : "opacity-100"
          }`}
        />
        {loadError ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4 text-center"
            role="img"
            aria-label={`${photo.alt} — failed to load`}
          >
            <p className="text-xs text-muted-foreground">Could not load image</p>
          </div>
        ) : (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setLoadError(true);
              setIsLoaded(true);
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      </div>
    </div>
  );
}
