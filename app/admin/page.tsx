"use client";

import { useState } from "react";
import { AdminLogin } from "@/components/admin-login";
import { AdminTable } from "@/components/admin-table";
import { dummyPhotos } from "@/lib/data";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminTable photos={dummyPhotos} />;
}
