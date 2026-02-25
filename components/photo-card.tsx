"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/lib/data";

export function PhotoCard({ photo }: { photo: Photo }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius)] bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
      <div className="relative aspect-square">
        <div
          className={`absolute inset-0 bg-muted animate-pulse transition-opacity duration-300 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/5" />
      </div>
    </div>
  );
}
