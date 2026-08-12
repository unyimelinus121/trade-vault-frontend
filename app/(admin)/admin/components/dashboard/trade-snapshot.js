"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAdmin } from "@/app/providers/adminProvider/admin";
import { formatNaira, formatTradeDate, TradeStatusBadge } from "@/app/components/trade/trade-ui";

export default function TradeSnapshot() {
  const { trades, tradePagination, tradeLoading, getTrades } = useAdmin();
  useEffect(() => {
    getTrades({ status: "pending", page: 1, limit: 5 });
    // Load the dashboard queue once; the dedicated trades page handles filtering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <section className="mb-8 overflow-hidden rounded-2xl border border-white/[.07] bg-surface-container-lowest/40"><header className="flex items-center justify-between gap-5 border-b border-white/[.07] p-5"><div><span className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">Verification queue</span><h3 className="mt-1 text-lg">Pending gift-card trades</h3></div><Link href="/admin/trades" className="rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary">Manage all {tradePagination.total ? `(${tradePagination.total})` : ""}</Link></header>{tradeLoading && !trades.length ? <div className="h-32 animate-pulse bg-white/[.025]" /> : trades.length ? <div className="divide-y divide-white/[.055]">{trades.slice(0,5).map((trade) => <Link key={trade.id} href={`/admin/trades/${trade.id}`} className="grid grid-cols-[.7fr_1.3fr_1fr_1fr_1fr_auto] items-center gap-4 p-4 text-xs transition hover:bg-white/[.025] max-[850px]:grid-cols-2"><strong className="text-primary">TV-{String(trade.id).padStart(6, "0")}</strong><div><strong className="block">{trade.user?.firstName} {trade.user?.lastName}</strong><span className="text-[9px] text-on-surface-variant">{trade.cardName}</span></div><span>${Number(trade.cardValue).toLocaleString()}</span><strong>{formatNaira(trade.expectedPayout)}</strong><time className="text-[9px] text-on-surface-variant max-[850px]:hidden">{formatTradeDate(trade.createdAt)}</time><TradeStatusBadge status={trade.status} /></Link>)}</div> : <div className="p-10 text-center"><span className="material-symbols-outlined text-3xl text-primary">task_alt</span><h4 className="mt-2 text-sm">No pending trades</h4><p className="mt-1 text-[10px] text-on-surface-variant">The verification queue is clear.</p></div>}</section>;
}
