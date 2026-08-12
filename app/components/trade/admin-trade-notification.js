"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AdminTradeNotification() {
  const [trade, setTrade] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    function showTradeNotification(event) {
      if (!event.detail?.id) return;
      setTrade(event.detail);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setTrade(null), 8000);
    }

    window.addEventListener("tradevault:admin-trade", showTradeNotification);
    return () => {
      window.removeEventListener("tradevault:admin-trade", showTradeNotification);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!trade) return null;

  return (
    <aside className="fixed top-20 right-5 z-[120] w-[min(390px,calc(100vw-2.5rem))] rounded-2xl border border-primary/25 bg-surface-container p-4 shadow-2xl" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined">receipt_long</span></span>
        <div className="min-w-0 flex-1">
          <strong className="block text-sm">New trade received</strong>
          <p className="mt-1 truncate text-xs text-on-surface-variant">{trade.cardName} from {trade.user?.firstName || "a customer"}</p>
          <Link href={`/admin/trades/${trade.id}`} onClick={() => setTrade(null)} className="mt-3 inline-flex text-xs font-bold text-primary">Open trade →</Link>
        </div>
        <button type="button" onClick={() => setTrade(null)} className="text-on-surface-variant hover:text-white" aria-label="Dismiss new trade notification">×</button>
      </div>
    </aside>
  );
}
