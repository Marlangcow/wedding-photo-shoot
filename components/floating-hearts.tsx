"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface HeartElement {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartElement[]>([]);

  useEffect(() => {
    let heartId = 0;
    const handleMouseClick = (e: MouseEvent) => {
      // Avoid spawning hearts when clicking interactive elements
      if ((e.target as HTMLElement).closest("button, a, input, select, textarea")) return;
      
      const newHeart: HeartElement = {
        id: heartId++,
        x: e.clientX,
        y: e.clientY,
        rotation: Math.random() * 60 - 30, // -30 to 30 deg
        scale: Math.random() * 0.5 + 0.8, // 0.8 to 1.3
      };
      
      setHearts((prev) => [...prev, newHeart]);
      
      // Remove after animation completes (1s)
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1000);
    };

    window.addEventListener("click", handleMouseClick);
    return () => window.removeEventListener("click", handleMouseClick);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float-up text-pink-300 opacity-80"
          style={{
            left: heart.x - 12, // center the 24px heart
            top: heart.y - 12,
            transform: `rotate(${heart.rotation}deg) scale(${heart.scale})`,
            transformOrigin: "center",
          }}
        >
          <Heart fill="currentColor" strokeWidth={1} />
        </div>
      ))}
    </div>
  );
}
