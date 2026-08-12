"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";

export default function AdminSessionRedirect({ children }) {
  const { user, authReady } = usePublicAuth();
  const router = useRouter();
  const isAdmin = authReady && user?.role === "admin";

  useEffect(() => {
    if (isAdmin) router.replace("/admin/dashboard");
  }, [isAdmin, router]);

  if (isAdmin) {
    return <main className="grid min-h-screen place-items-center" aria-live="polite">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
      <span className="sr-only">Returning to the admin dashboard</span>
    </main>;
  }
  return children;
}
