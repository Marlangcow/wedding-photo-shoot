"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { PhotoGrid } from "@/components/photo-grid";
import { UploadButton } from "@/components/upload-button";
import { UploadModal } from "@/components/upload-modal";
import { dummyPhotos } from "@/lib/data";

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
            Photo Gallery
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {dummyPhotos.length + uploadCount} photos shared
          </p>
        </div>
        <PhotoGrid photos={dummyPhotos} />
        {/* Infinite scroll placeholder */}
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
        onUploadComplete={() => setUploadCount((c) => c + 1)}
      />
    </div>
  );
}
