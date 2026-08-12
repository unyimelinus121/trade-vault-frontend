"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";

function AdminLoadingScreen() {
  return (
    <main className="stitch-glow grid min-h-screen place-items-center px-6" aria-live="polite">
      <div className="text-center">
        <span className="mx-auto block h-11 w-11 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
        <strong className="mt-5 block text-sm">Checking admin access</strong>
        <span className="mt-1 block text-xs text-on-surface-variant">Verifying your secure TradeVault session…</span>
      </div>
    </main>
  );
}

export default function AdminAccessGuard({ children }) {
  const { user, token, authReady } = usePublicAuth();
  const router = useRouter();
  const authenticatedAdmin = Boolean(user && token && user.role === "admin");

  useEffect(() => {
    if (!authReady) return;

    if (!user || !token) {
      router.replace("/");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [authReady, router, token, user]);

  if (!authReady || !authenticatedAdmin) {
    return <AdminLoadingScreen />;
  }

  return children;
}
