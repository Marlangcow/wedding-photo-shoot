"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { mockUpload } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, uploadPhoto } from "@/lib/photos";
import { uploadPhotoLocal } from "@/app/actions";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setIsUploading(false);
    setIsDragging(false);
    setUploadError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (isUploading) return;
    reset();
    onClose();
  }, [isUploading, reset, onClose]);

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    setUploadError(null);
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onerror = () =>
      setUploadError("Could not load preview. Try another file.");
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isUploading) setIsDragging(true);
    },
    [isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (isUploading) return;
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [isUploading, handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFile(selectedFile);
    },
    [handleFile]
  );

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);
    setUploadError(null);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await uploadPhoto(supabase, file, setProgress);
      } else {
        const interval = setInterval(() => setProgress(p => Math.min(p + 20, 90)), 100);
        const formData = new FormData();
        formData.append("file", file);
        await uploadPhotoLocal(formData);
        clearInterval(interval);
        setProgress(100);
      }
      onUploadComplete();
      reset();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message?: unknown }).message ?? "")
            : "";

      const errorMsg = message.toLowerCase();
      if (errorMsg.includes("body exceeded") || errorMsg.includes("large")) {
        setUploadError("업로드 실패: 사진 용량이 제한(10MB)을 초과했습니다. 더 작은 이미지를 선택해주세요.");
      } else {
        setUploadError("업로드에 실패했습니다. 사진 용량이 너무 크거나 인터넷 연결이 불안정할 수 있습니다. 다시 시도해주세요.");
      }
      setIsUploading(false);
    }
  }, [file, onUploadComplete, reset, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Upload photo"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isUploading}
          className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors disabled:opacity-50"
          aria-label="Close upload dialog"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <h3 className="text-2xl font-semibold text-neutral-900 mb-2 mt-2 text-center">사진 올리기</h3>
        <p className="text-sm text-neutral-500 text-center mb-8">가장 빛나던 순간을 공유해 주세요.</p>

        {uploadError && (
          <p
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 text-center"
            role="alert"
          >
            {uploadError}
          </p>
        )}

        {/* Drop zone or preview */}
        {!preview ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-[#0071E3] bg-[#0071E3]/5"
                : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
            }`}
          >
            <div className="mb-4 rounded-full bg-white shadow-sm p-3">
              <Upload className="h-6 w-6 text-[#0071E3]" />
            </div>
            <p className="mb-1 text-sm text-neutral-600 font-medium">
              클릭하여 앨범에서 선택
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="sr-only"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={preview}
                alt="Upload preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* File name */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{file?.name}</span>
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-right text-xs text-muted-foreground">
                  {progress}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full py-3.5 bg-[#0071E3] text-white rounded-full font-medium hover:bg-[#0077ED] transition-colors disabled:opacity-70"
              >
                {isUploading ? "업로드 중..." : "업로드"}
              </button>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="w-full py-3.5 bg-neutral-100 text-neutral-800 rounded-full font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
