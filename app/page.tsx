import { GalleryPage } from "@/components/gallery-page";
import { dummyPhotos, filterApprovedPhotos, type Photo } from "@/lib/data";
import { fetchApprovedPhotos, isSupabaseConfigured } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  let initialPhotos: Photo[];

  if (!isSupabaseConfigured()) {
    initialPhotos = filterApprovedPhotos(dummyPhotos);
  } else {
    try {
      const supabase = await createClient();
      initialPhotos = await fetchApprovedPhotos(supabase);
    } catch {
      initialPhotos = filterApprovedPhotos(dummyPhotos);
    }
  }

  return <GalleryPage initialPhotos={initialPhotos} />;
}
