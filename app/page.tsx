import { GalleryPage } from "@/components/gallery-page";
import { type Photo } from "@/lib/data";
import { fetchApprovedPhotos, isSupabaseConfigured } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import { getPhotosLocal } from "@/app/actions";

export default async function Home() {
  let initialPhotos: Photo[];

  if (!isSupabaseConfigured()) {
    initialPhotos = await getPhotosLocal(true);
  } else {
    try {
      const supabase = await createClient();
      initialPhotos = await fetchApprovedPhotos(supabase);
    } catch {
      initialPhotos = await getPhotosLocal(true);
    }
  }

  return <GalleryPage initialPhotos={initialPhotos} />;
}
