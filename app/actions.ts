"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import type { Photo } from "@/lib/data";

const DATA_FILE = path.join(process.cwd(), "data.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Initialize DB and folders
async function initDb() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf-8");
  }
}

async function readDb(): Promise<Photo[]> {
  await initDb();
  const data = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(data) as Photo[];
}

async function writeDb(photos: Photo[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(photos, null, 2), "utf-8");
}

export async function getPhotosLocal(onlyApproved = false): Promise<Photo[]> {
  const photos = await readDb();
  let result = photos;
  if (onlyApproved) {
    result = photos.filter(p => p.status === "approved");
  }
  // Sort by uploadDate descending
  return result.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
}

export async function uploadPhotoLocal(formData: FormData): Promise<{ success: boolean; url: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    await initDb();
    await fs.writeFile(filePath, buffer);
    
    const publicUrl = `/uploads/${filename}`;
    
    const newPhoto: Photo = {
      id: crypto.randomUUID(),
      src: publicUrl,
      alt: file.name.slice(0, 100),
      uploadDate: new Date().toISOString(),
      status: "approved", // User requested to be visible by default
    };
    
    const photos = await readDb();
    photos.push(newPhoto);
    await writeDb(photos);
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Local upload error", error);
    throw new Error("Upload failed");
  }
}

export async function updateStatusLocal(id: string, status: Photo["status"]) {
  const photos = await readDb();
  const index = photos.findIndex(p => p.id === id);
  if (index !== -1) {
    photos[index].status = status;
    await writeDb(photos);
    revalidatePath("/");
    revalidatePath("/admin");
  }
}

export async function deletePhotoLocal(id: string) {
  const photos = await readDb();
  const photo = photos.find(p => p.id === id);
  if (photo) {
    try {
      const filename = photo.src.split("/").pop();
      if (filename) {
        await fs.unlink(path.join(UPLOADS_DIR, filename));
      }
    } catch {
      // ignore unlink errors
    }
    const updated = photos.filter(p => p.id !== id);
    await writeDb(updated);
    revalidatePath("/");
    revalidatePath("/admin");
  }
}
