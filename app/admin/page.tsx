"use client";

import { useCallback, useState } from "react";
import { AdminLogin } from "@/components/admin-login";
import { AdminTable } from "@/components/admin-table";
import { dummyPhotos } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { fetchAllPhotos, isSupabaseConfigured } from "@/lib/photos";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [photos, setPhotos] = useState(dummyPhotos);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    "idle"
  );

  const loadRemotePhotos = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setPhotos(dummyPhotos);
      setLoadState("idle");
      return;
    }
    setLoadState("loading");
    try {
      const sb = createClient();
      const list = await fetchAllPhotos(sb);
      setPhotos(list);
      setLoadState("idle");
    } catch {
      setLoadState("error");
    }
  }, []);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    void loadRemotePhotos();
  }, [loadRemotePhotos]);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (isSupabaseConfigured() && loadState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Loading photos…</p>
      </div>
    );
  }

  if (isSupabaseConfigured() && loadState === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-sm text-destructive">Could not load photos.</p>
        <button
          type="button"
          onClick={() => void loadRemotePhotos()}
          className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AdminTable photos={photos} useRemote={isSupabaseConfigured()} />
  );
}
