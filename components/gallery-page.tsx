"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/header";
import { PhotoGrid } from "@/components/photo-grid";
import { UploadModal } from "@/components/upload-modal";
import type { Photo } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/photos";

export function GalleryPage({ initialPhotos }: { initialPhotos: Photo[] }) {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [mockUploadCount, setMockUploadCount] = useState(0);

  const supabaseOn = isSupabaseConfigured();
  const totalShown = supabaseOn
    ? initialPhotos.length
    : initialPhotos.length + mockUploadCount;

  const handleUploadComplete = () => {
    if (supabaseOn) {
      router.refresh();
    } else {
      setMockUploadCount((c) => c + 1);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFCF0] font-sans selection:bg-yellow-200/50">
      <Header />

      {/* Minimal Header area - Pinterest Look - Pixel-Perfect Centering */}
      <section className="relative w-full flex flex-col items-center justify-center px-4 pt-12 pb-12 overflow-hidden sm:px-6 sm:pt-16 sm:pb-16 min-h-[300px] sm:min-h-[400px]">
        {/* Subtle background blobs */}
        <div className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 rounded-full bg-yellow-100/40 blur-[120px] filter"></div>
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-emerald-50/30 blur-[100px] filter"></div>

        {/* Minimal Title - No Logo */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="mb-4 font-serif text-3xl font-extrabold tracking-tight text-[#6B8E23] sm:text-5xl sm:mb-6">
            '따스한 봄날의 사진첩'
          </h1>
          <p className="mb-8 max-w-md font-serif text-sm font-medium leading-relaxed text-[#333333] sm:text-base">
            여러분의 시선으로 담아낸 소중한 순간들을<br />
            자유롭게 나누어 주세요. 😊<span className="text-[#F48FB1]">🌸</span>
          </p>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#FFC107] px-12 py-4.5 text-[14px] font-bold uppercase tracking-[0.2em] text-slate-800 shadow-[0_15px_35px_rgba(255,193,7,0.25)] transition-all hover:scale-105 hover:bg-[#FFD54F] active:scale-95"
          >
            <span className="relative z-10">사진 올리기</span>
          </button>
        </div>
      </section>

      {/* Main photo gallery area */}
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 pb-12 pt-0 sm:px-6 sm:pb-20">
        <div className="mb-8 flex items-center justify-center gap-4 opacity-80 sm:gap-5">
          <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-neutral-300" />
          <p className="text-xs sm:text-sm font-medium tracking-[0.2em] text-neutral-400 uppercase">
            함께 채워가는 {totalShown}개의 기록
          </p>
          <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent to-neutral-300" />
        </div>

        <PhotoGrid photos={initialPhotos} />
      </main>

      {/* Footer with Thank You message */}
      <footer className="w-full border-t border-neutral-100 bg-white py-12 text-center text-neutral-400">
        <p className="text-xs font-medium tracking-wide">
          참석해주시고 축하해주셔서 진심으로 감사합니다.
        </p>
      </footer>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
