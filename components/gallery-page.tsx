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
    <div className="flex min-h-screen flex-col bg-white selection:bg-blue-200 font-sans">
      <Header />

      {/* Full-width wrapper without rounded corners */}
      <section className="w-full bg-[#FBFBFD] pt-20 pb-10">
        <div className="mx-auto max-w-3xl text-center px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-neutral-800 mb-6">
            Our <br />
            Wedding <br />
            Gallery
          </h1>
          <p className="text-sm sm:text-base text-neutral-700/80 max-w-[28rem] mx-auto leading-relaxed text-balance">
            예쁜 사진, 즐거운 사진, 멋진 사진 모두 대환영이에요! <br />
            아래 버튼을 눌러 기분 좋은 순간을 자유롭게 공유해 주세요. 💌
          </p>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#0071E3] px-8 py-3.5 text-base font-medium text-white shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,113,227,0.4)] hover:bg-[#0077ED] active:translate-y-0 active:shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:rotate-90 duration-300"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              사진 올리기
            </button>
          </div>
        </div>
      </section>

      {/* Main photo gallery area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-12 sm:px-6 sm:pt-10 sm:pb-20">
        <div className="mb-8 flex items-center justify-center gap-4 sm:gap-5 opacity-80">
          <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-neutral-300" />
          <p className="text-xs sm:text-sm font-medium tracking-[0.2em] text-neutral-400 uppercase">
            함께한 {totalShown}장의 추억
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
