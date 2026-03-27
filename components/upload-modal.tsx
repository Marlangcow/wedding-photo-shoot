"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { mockUpload } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, uploadPhoto } from "@/lib/photos";
import { uploadPhotoLocal } from "@/app/actions";
import ExifReader from "exifreader";

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
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFiles([]);
    setPreviews([]);
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

  const handleFiles = useCallback((selectedFiles: FileList | File[]) => {
    setUploadError(null);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    let errorMsg = null;

    Array.from(selectedFiles).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errorMsg = "이미지 파일만 업로드 가능합니다.";
      } else if (file.size > 10 * 1024 * 1024) {
        errorMsg = "용량 초과: 각 사진은 10MB 이하여야 합니다.";
      } else {
        validFiles.push(file);
      }
    });

    if (errorMsg) setUploadError(errorMsg);
    if (validFiles.length === 0) return;

    setFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
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
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [isUploading, handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFiles]
  );

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setProgress(0);
    setUploadError(null);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        let totalProgress = 0;
        for (const f of files) {
          try {
            let capturedAt: Date | undefined;
            let rawMetadata: any = null;

            try {
              const tags = await ExifReader.load(f);
              // Only keep safe text fields — raw tags can contain huge binary thumbnail data
              rawMetadata = {
                Make: tags.Make?.description,
                Model: tags.Model?.description,
                DateTimeOriginal: tags.DateTimeOriginal?.description,
                ExposureTime: tags.ExposureTime?.description,
                FNumber: tags.FNumber?.description,
                ISOSpeedRatings: tags.ISOSpeedRatings?.description,
                FocalLength: tags.FocalLength?.description,
                ImageWidth: tags.ImageWidth?.description,
                ImageHeight: tags.ImageHeight?.description,
              };
              if (tags.DateTimeOriginal?.description) {
                const dateStr = tags.DateTimeOriginal.description;
                const parts = dateStr.split(/[: ]/);
                if (parts.length >= 6) {
                  capturedAt = new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    Number(parts[2]),
                    Number(parts[3]),
                    Number(parts[4]),
                    Number(parts[5])
                  );
                }
              }
            } catch (exifErr) {
              console.warn("EXIF info not found or unreadable for", f.name);
            }

            await uploadPhoto(supabase, f, (p) => {
              setProgress(Math.round(totalProgress + (p / files.length)));
            }, { capturedAt, raw: rawMetadata });
          } catch (fileErr: any) {
            console.error("Upload failed for file:", f.name, fileErr);
            throw new Error(`'${f.name}' 업로드 실패: ${fileErr.message}`);
          }
          totalProgress += (100 / files.length);
        }
        setProgress(100);
      } else {
        let uploaded = 0;
        for (const f of files) {
          const formData = new FormData();
          formData.append("file", f);
          await uploadPhotoLocal(formData);
          uploaded++;
          setProgress(Math.round((uploaded / files.length) * 100));
        }
      }
      onUploadComplete();
      reset();
      onClose();
    } catch (err: any) {
      const msg = err?.message || "알 수 없는 오류";
      console.error("Upload error:", err);
      setUploadError(msg);
      setIsUploading(false);
      setProgress(0);
    }
  }, [files, onUploadComplete, reset, onClose]);

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
          <div
            className="mb-6 rounded-2xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-2"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-100 p-1">
                <X className="h-3 w-3" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <p className="font-bold mb-1">업로드 실패</p>
                <p className="opacity-90 leading-normal break-words">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Drop zone or preview */}
        {previews.length === 0 ? (
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
              클릭하여 여러 장의 사진 선택 (장당 최대 10MB)
            </p>
            <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               multiple
               onChange={handleFileInput}
               className="sr-only"
            />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Previews Grid */}
            <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-xl bg-muted border border-border group shadow-sm">
                  <Image
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    onClick={() => {
                      setFiles(f => f.filter((_, i) => i !== idx));
                      setPreviews(p => p.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 rounded-full p-1.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative flex items-center justify-center aspect-square overflow-hidden rounded-xl bg-neutral-50 border-2 border-dashed border-neutral-300 cursor-pointer hover:bg-neutral-100 transition-colors"
              >
                  <Upload className="h-6 w-6 text-neutral-400" />
              </div>
            </div>

            {/* Hidden Input for Adding More */}
            <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               multiple
               onChange={handleFileInput}
               className="sr-only"
            />

            {/* File info */}
            <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-border">
              <ImageIcon className="h-4 w-4 shrink-0 text-neutral-400" />
              <span className="font-medium">총 {files.length}장의 사진</span>
            </div>

            {/* Progress area with Sprout Animation */}
            {isUploading && (
              <div className="flex flex-col items-center justify-center p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 animate-in fade-in zoom-in-95 duration-500">
                {/* Sprout SVG Animation */}
                <div className="relative mb-4 h-16 w-16">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 text-emerald-500 animate-[bounce_2s_infinite]">
                     <path d="M32 52V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                     <path d="M32 36C32 36 24 32 20 32C16 32 32 36 32 36Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-[pulse_1.5s_infinite]" />
                     <path d="M32 32C32 32 40 28 44 28C48 28 32 32 32 32Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-[pulse_1.5s_infinite_delay-200]" />
                     <circle cx="32" cy="52" r="4" fill="currentColor" opacity="0.2" />
                  </svg>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 bg-emerald-200/50 rounded-full blur-[1px]"></div>
                </div>
                
                <div className="w-full space-y-2">
                  <div className="h-2.5 overflow-hidden rounded-full bg-white shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300 relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-700/60">
                    <span>GROWING MOMENTS...</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-100">
              <button
                onClick={handleUpload}
                disabled={isUploading || files.length === 0}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-800 rounded-full text-sm font-bold uppercase tracking-widest hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(234,179,8,0.2)]"
              >
                {isUploading ? "업로드 중..." : `${files.length}장 업로드`}
              </button>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="w-full py-4 bg-white text-neutral-500 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all disabled:opacity-50"
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
