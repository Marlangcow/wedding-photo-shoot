export interface Photo {
  id: string;
  src: string;
  alt: string;
  uploadDate: string;
  capturedAt?: string | null;
  metadata?: any | null;
  status: "approved" | "rejected" | "pending";
  /** Supabase Storage object path when uploaded to bucket `wedding-photos` */
  storagePath?: string | null;
}

export function filterApprovedPhotos(photos: Photo[]): Photo[] {
  return photos.filter((p) => p.status === "approved");
}

export const dummyPhotos: Photo[] = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=600&fit=crop",
    alt: "Wedding ceremony moment",
    uploadDate: "2026-02-20",
    status: "approved",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=600&fit=crop",
    alt: "Bride and groom first dance",
    uploadDate: "2026-02-20",
    status: "approved",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=600&fit=crop",
    alt: "Wedding venue decorated",
    uploadDate: "2026-02-19",
    status: "pending",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=600&fit=crop",
    alt: "Wedding bouquet",
    uploadDate: "2026-02-19",
    status: "approved",
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=600&fit=crop",
    alt: "Wedding rings close-up",
    uploadDate: "2026-02-18",
    status: "rejected",
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=600&fit=crop",
    alt: "Wedding cake display",
    uploadDate: "2026-02-18",
    status: "approved",
  },
  {
    id: "7",
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=600&fit=crop",
    alt: "Bride getting ready",
    uploadDate: "2026-02-17",
    status: "approved",
  },
  {
    id: "8",
    src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=600&fit=crop",
    alt: "Wedding table setting",
    uploadDate: "2026-02-17",
    status: "pending",
  },
  {
    id: "9",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    alt: "Outdoor wedding ceremony",
    uploadDate: "2026-02-16",
    status: "approved",
  },
];

export async function mockUpload(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ success: boolean; url: string }> {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onProgress(100);
        setTimeout(() => {
          resolve({
            success: true,
            url: URL.createObjectURL(file),
          });
        }, 300);
      } else {
        onProgress(Math.round(progress));
      }
    }, 200);
  });
}
