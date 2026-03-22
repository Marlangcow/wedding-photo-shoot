"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/header";
import { PhotoGrid } from "@/components/photo-grid";
import { UploadButton } from "@/components/upload-button";
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
            Photo Gallery
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {totalShown} photos shared
          </p>
        </div>
        <PhotoGrid photos={initialPhotos} />
        <div className="mt-12 flex justify-center">
          <p className="text-xs text-muted-foreground">
            You have reached the end
          </p>
        </div>
      </main>
      <UploadButton onClick={() => setIsUploadOpen(true)} />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
