"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/app/providers/adminProvider/admin";

export default function AdminWithdrawalHeaderNotification() {
  const { withdrawalUnreadCount, markWithdrawalNotificationsViewed } = useAdmin();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  async function toggleNotifications() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && withdrawalUnreadCount > 0) await markWithdrawalNotificationsViewed();
  }

  return <div ref={wrapperRef} className="relative">
    <button type="button" onClick={toggleNotifications} className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/[.07] bg-surface-container text-on-surface-variant transition hover:border-primary/30 hover:text-primary" aria-label={`${withdrawalUnreadCount} pending withdrawal notifications`} aria-expanded={open}>
      <span className="material-symbols-outlined">notifications</span>
      {withdrawalUnreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-error px-1 text-[8px] font-black text-[#520007]">{withdrawalUnreadCount > 99 ? "99+" : withdrawalUnreadCount}</span>}
    </button>
    {open && <section className="absolute right-0 top-12 z-[100] w-[min(350px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-surface-container-high shadow-2xl">
      <header className="border-b border-white/[.07] p-4"><span className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">Admin notifications</span><h2 className="mt-1 text-sm font-bold">Withdrawal requests</h2></header>
      <div className="p-4">{withdrawalUnreadCount > 0 ? <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined">payments</span></span><div><strong className="block text-sm">{withdrawalUnreadCount} pending {withdrawalUnreadCount === 1 ? "withdrawal" : "withdrawals"}</strong><p className="mt-1 text-xs leading-5 text-on-surface-variant">Review the bank details and confirm payment after sending the funds.</p></div></div> : <div className="py-4 text-center"><span className="material-symbols-outlined text-3xl text-on-surface-variant/40">notifications_off</span><p className="mt-2 text-xs text-on-surface-variant">No pending withdrawal notifications.</p></div>}</div>
      <Link href="/admin/payments" onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-center border-t border-white/[.07] text-xs font-bold text-primary">Open withdrawal queue →</Link>
    </section>}
  </div>;
}
