"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Photo } from "@/lib/data";

function StatusBadge({ status }: { status: Photo["status"] }) {
  const styles = {
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
    pending: "bg-accent/10 text-accent",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

interface AdminTableProps {
  photos: Photo[];
}

export function AdminTable({ photos: initialPhotos }: AdminTableProps) {
  const [photos, setPhotos] = useState(initialPhotos);

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Back to gallery"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                {photos.length} photos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Table */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="overflow-hidden rounded-[var(--radius)] border bg-card">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Photo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Upload Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {photos.map((photo) => (
                  <tr
                    key={photo.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(photo.uploadDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={photo.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                        aria-label={`Delete photo ${photo.alt}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="divide-y sm:hidden">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {new Date(photo.uploadDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={photo.status} />
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="shrink-0 rounded-full p-2 text-destructive transition-colors hover:bg-destructive/10"
                  aria-label={`Delete photo ${photo.alt}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {photos.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No photos to manage
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
