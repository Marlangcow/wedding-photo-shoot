"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PhotoCard } from "@/components/photo-card";
import type { Photo } from "@/lib/data";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(photos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPhotos = photos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleClose = useCallback(() => setViewingIndex(null), []);

  const handlePrevious = useCallback(() => {
    setViewingIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setViewingIndex((prev) =>
      prev !== null && prev < photos.length - 1 ? prev + 1 : prev
    );
  }, [photos.length]);

  useEffect(() => {
    if (viewingIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewingIndex, handleClose, handlePrevious, handleNext]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleDownload = async (url: string, alt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = alt || "wedding-photo";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <p className="font-serif text-2xl text-foreground mt-2">No photos yet</p>
        <p className="mt-1 font-serif text-lg text-muted-foreground">
          첫 번째 사진을 올려주세요!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 sm:gap-6 space-y-4 sm:space-y-6">
        {currentPhotos.map((photo, i) => (
          <div key={photo.id} className="break-inside-avoid">
            <PhotoCard 
              photo={photo} 
              onClick={() => setViewingIndex(startIndex + i)} 
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            disabled={currentPage === 1}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:scale-105 hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
          </button>
          
          <span className="font-serif text-2xl tracking-widest text-muted-foreground min-w-[3rem] text-center">
            {currentPage} <span className="text-base text-muted-foreground/50 mx-1">/</span> {totalPages}
          </span>
          
          <button
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            disabled={currentPage === totalPages}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:scale-105 hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {viewingIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-8 backdrop-blur-md transition-opacity"
          onClick={handleClose}
        >
          {/* Controls */}
          <button
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-8 sm:top-8"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(photos[viewingIndex].src, photos[viewingIndex].alt); }}
            className="absolute right-16 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-20 sm:top-8 flex items-center gap-2"
            aria-label="Download photo"
          >
            <Download className="h-5 w-5" />
          </button>

          {/* Navigation */}
          {viewingIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
              className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-colors hover:bg-black/80 sm:left-8"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {viewingIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-colors hover:bg-black/80 sm:right-8"
              aria-label="Next photo"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* Image Container */}
          <div className="relative h-full w-full flex items-center justify-center">
            <div 
              className="relative h-[85vh] w-full max-w-6xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[viewingIndex].src}
                alt={photos[viewingIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
          
          {/* Caption */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
            <p className="text-sm font-medium text-white/80 tracking-wide">
              {viewingIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
