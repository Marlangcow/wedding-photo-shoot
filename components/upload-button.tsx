"use client";

import { Plus } from "lucide-react";

export function UploadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 sm:bottom-8 sm:right-8"
      aria-label="Upload photo"
    >
      <Plus className="h-6 w-6" strokeWidth={2} />
    </button>
  );
}
