"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { getPublicAccessRedirect } from "@/app/lib/account-access.mjs";

export default function AdminSessionRedirect({ children }) {
  const { user, authReady } = usePublicAuth();
  const router = useRouter();
  const pathname = usePathname();
  const suspendedPath = "/account-suspended";
  const redirect = getPublicAccessRedirect({ authReady, user, pathname });

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  const redirecting = Boolean(redirect) || (pathname === suspendedPath && !authReady);
  if (redirecting) {
    return <main className="grid min-h-screen place-items-center" aria-live="polite">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
      <span className="sr-only">Checking account access</span>
    </main>;
  }
  return children;
}
