"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";
import Navbar from "./navbar";

export default function PublicChrome({ children }) {
  const pathname = usePathname();
  if (pathname === "/account-suspended") return children;
  const usesCustomerWorkspace = pathname === "/account" || pathname === "/support";

  if (usesCustomerWorkspace) {
    return children;
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 max-[900px]:mobile-safe-content">{children}</div>
      <Footer />
    </>
  );
}
