"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatNaira } from "./trade-ui";

export default function AdminWithdrawalNotification() {
  const [withdrawal, setWithdrawal] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    function showNotification(event) {
      if (!event.detail?.id) return;
      if (["paid", "rejected"].includes(event.detail.status)) {
        setWithdrawal((current) => current?.id === event.detail.id ? null : current);
        return;
      }
      if (event.detail.status !== "pending") return;
      setWithdrawal(event.detail);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setWithdrawal(null), 10000);
    }
    function clearResolvedNotification(event) {
      if (!event.detail?.id) return;
      setWithdrawal((current) => current?.id === event.detail.id ? null : current);
    }
    window.addEventListener("tradevault:admin-withdrawal-updated", showNotification);
    window.addEventListener("tradevault:admin-withdrawal-resolved", clearResolvedNotification);
    return () => {
      window.removeEventListener("tradevault:admin-withdrawal-updated", showNotification);
      window.removeEventListener("tradevault:admin-withdrawal-resolved", clearResolvedNotification);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!withdrawal) return null;
  return (
    <aside className="fixed top-20 right-5 z-[125] w-[min(410px,calc(100vw-2.5rem))] rounded-2xl border border-primary/25 bg-surface-container p-4 shadow-2xl" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined">payments</span></span>
        <div className="min-w-0 flex-1"><strong className="block text-sm">New withdrawal request</strong><p className="mt-1 text-xs text-on-surface-variant">{formatNaira(withdrawal.amount)} to {withdrawal.bankName}</p><Link href="/admin/payments" onClick={() => setWithdrawal(null)} className="mt-3 inline-flex text-xs font-bold text-primary">Review withdrawal →</Link></div>
        <button type="button" onClick={() => setWithdrawal(null)} className="text-on-surface-variant hover:text-white" aria-label="Dismiss withdrawal notification">×</button>
      </div>
    </aside>
  );
}
