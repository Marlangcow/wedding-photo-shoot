import type { SupabaseClient } from "@supabase/supabase-js";
import type { Photo } from "@/lib/data";

export const PHOTOS_BUCKET = "wedding-photos";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const QUERY_MS = 12_000;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

type PhotoRow = {
  id: string;
  src: string;
  alt: string | null;
  upload_date: string;
  captured_at: string | null;
  metadata: any | null;
  status: string;
  storage_path: string | null;
};

function assertStatus(s: string): Photo["status"] {
  if (s === "approved" || s === "rejected" || s === "pending") return s;
  return "pending";
}

export function mapPhotoRow(row: PhotoRow): Photo {
  return {
    id: row.id,
    src: row.src,
    alt: row.alt ?? "",
    uploadDate: row.upload_date,
    capturedAt: row.captured_at,
    metadata: row.metadata,
    status: assertStatus(row.status),
    storagePath: row.storage_path,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

export async function fetchApprovedPhotos(
  supabase: SupabaseClient
): Promise<Photo[]> {
  const { data, error } = await withTimeout(
    Promise.resolve(
      supabase
        .from("photos")
        .select("id, src, alt, upload_date, captured_at, metadata, status, storage_path")
        .eq("status", "approved")
        .order("captured_at", { ascending: false, nullsFirst: false })
        .order("upload_date", { ascending: false })
    ),
    QUERY_MS
  );
  if (error) throw error;
  return (data ?? []).map((row) => mapPhotoRow(row as PhotoRow));
}

export async function fetchAllPhotos(
  supabase: SupabaseClient
): Promise<Photo[]> {
  const { data, error } = await withTimeout(
    Promise.resolve(
      supabase
        .from("photos")
        .select("id, src, alt, upload_date, captured_at, metadata, status, storage_path")
        .order("captured_at", { ascending: false, nullsFirst: false })
        .order("upload_date", { ascending: false })
    ),
    QUERY_MS
  );
  if (error) throw error;
  return (data ?? []).map((row) => mapPhotoRow(row as PhotoRow));
}

function validateImageFile(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File is too large (max 10 MB).");
  }
}

function safeExt(filename: string): string {
  const raw = (filename.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(raw)) return "jpg";
  return raw === "jpeg" ? "jpg" : raw;
}

export async function uploadPhoto(
  supabase: SupabaseClient,
  file: File,
  onProgress: (n: number) => void,
  metadata: { capturedAt?: Date; raw?: any } = {}
): Promise<void> {
  validateImageFile(file);
  onProgress(5);

  const ext = safeExt(file.name);
  const path = `uploads/${crypto.randomUUID()}.${ext}`;
  let uploadedPath: string | null = null;

  try {
    onProgress(15);
    const { error: upErr } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (upErr) {
      const storageMsg = `Storage Error: ${upErr.message}`;
      console.error(storageMsg, upErr);
      throw new Error(storageMsg);
    }
    uploadedPath = path;
    onProgress(55);

    const { data: pub } = supabase.storage
      .from(PHOTOS_BUCKET)
      .getPublicUrl(path);
    if (!pub?.publicUrl) {
      throw new Error("Could not generate public URL for uploaded image.");
    }

    const alt = file.name.slice(0, 200);
    const insertData: any = {
      src: pub.publicUrl,
      alt,
      storage_path: path,
      status: "approved", // By default visible
      captured_at: metadata.capturedAt?.toISOString() || null,
      metadata: metadata.raw || null,
    };

    const { error: insErr } = await supabase.from("photos").insert(insertData);
    
    // Fallback: If columns captured_at or metadata are missing (error 42703), retry without them
    if (insErr && insErr.code === "42703") {
      console.warn("Metadata columns missing, retrying without metadata...");
      const { error: fallbackErr } = await supabase.from("photos").insert({
        src: pub.publicUrl,
        alt,
        storage_path: path,
        status: "approved",
      });
      if (fallbackErr) {
        const dbMsg = `DB Fallback Error: ${fallbackErr.message}`;
        console.error(dbMsg, fallbackErr);
        throw new Error(dbMsg);
      }
    } else if (insErr) {
      const dbMsg = `DB Error: ${insErr.message} (Code: ${insErr.code})`;
      console.error(dbMsg, insErr);
      throw new Error(dbMsg);
    }
    onProgress(100);
  } catch (e) {
    if (uploadedPath) {
      try {
        await supabase.storage.from(PHOTOS_BUCKET).remove([uploadedPath]);
      } catch {
        /* best-effort cleanup */
      }
    }
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e && "message" in e
          ? String((e as { message?: unknown }).message ?? "")
          : "";
    throw new Error(
      message || "Upload failed. Check storage/db policies and try again."
    );
  }
}

export async function updatePhotoStatus(
  supabase: SupabaseClient,
  id: string,
  status: Photo["status"]
): Promise<void> {
  const { error } = await supabase
    .from("photos")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePhoto(
  supabase: SupabaseClient,
  photo: Photo
): Promise<void> {
  if (photo.storagePath) {
    const { error: rmErr } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove([photo.storagePath]);
    if (rmErr) throw rmErr;
  }
  const { error } = await supabase.from("photos").delete().eq("id", photo.id);
  if (error) throw error;
}
