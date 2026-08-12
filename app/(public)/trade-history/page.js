"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, TradeStat, formatNaira, formatTradeDate, LoginRequired, PageLoader, TradeStatusBadge } from "@/app/components/trade/trade-ui";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useTrade } from "@/app/providers/tradeProvider/trade";

const filters = [
  ["", "All"],
  ["pending", "Pending"],
  ["processing", "Processing"],
  ["successful", "Successful"],
  ["rejected", "Rejected"],
];

export default function TradeHistoryPage() {
  const { user, token, authReady } = usePublicAuth();
  const { trades, tradeLoading, tradeError, getMyTrades } = useTrade();
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (user?.role === "user" && token) getMyTrades();
  }, [getMyTrades, token, user?.role]);

  const visibleTrades = useMemo(() => status ? trades.filter((trade) => trade.status === status) : trades, [status, trades]);
  const counts = useMemo(() => trades.reduce((summary, trade) => ({ ...summary, [trade.status]: (summary[trade.status] || 0) + 1 }), { pending: 0, processing: 0, successful: 0, rejected: 0 }), [trades]);

  if (!authReady) return <PageLoader />;
  if (!user || !token || user.role !== "user") return <LoginRequired title="Log in to view your trades" />;

  return <main className="min-h-screen bg-background">
    <section className="mx-auto w-full max-w-[1360px] px-8 py-16 max-[720px]:px-5 max-[720px]:py-12">
      <PageHeader eyebrow="Private transaction history" title="Your gift-card trades." text="Review every submitted value, confirmed rate, expected payout, and trade decision in one place." action={<Link href="/trade" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-xs font-bold text-on-primary"><span className="material-symbols-outlined text-lg">add</span>New trade</Link>} />

      <section className="mt-8 grid grid-cols-5 gap-0 border-y border-outline-variant/55 py-5 max-[760px]:grid-cols-1 max-[760px]:gap-4">
        <TradeStat label="Total trades" value={trades.length} icon="receipt_long" />
        <TradeStat label="Pending" value={counts.pending} icon="schedule" tone="pending" />
        <TradeStat label="Processing" value={counts.processing} icon="sync" tone="processing" />
        <TradeStat label="Successful" value={counts.successful} icon="check_circle" tone="successful" />
        <TradeStat label="Rejected" value={counts.rejected} icon="cancel" tone="rejected" />
      </section>

      <div className="mt-8 flex items-center justify-between gap-5 border-b border-outline-variant/55 pb-4 max-[700px]:flex-col max-[700px]:items-stretch"><div className="flex flex-wrap gap-2" role="group" aria-label="Filter trades by status">{filters.map(([value,label]) => <button key={label} onClick={() => setStatus(value)} className={`min-h-10 rounded-lg px-4 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary ${status === value ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant hover:border-primary/35 hover:text-primary"}`}>{label}</button>)}</div><span className="text-xs text-on-surface-variant">Showing {visibleTrades.length} of {trades.length}</span></div>

      {tradeError && <div className="mt-6 border border-error/25 bg-error/[.05] p-4 text-sm text-error">{tradeError}</div>}
      {tradeLoading && !trades.length ? <div className="mt-6 space-y-3">{[1,2,3,4].map((item) => <div key={item} className="h-20 animate-pulse bg-surface-container" />)}</div> : visibleTrades.length ? <>
        <div className="mt-6 overflow-hidden border border-outline-variant max-[820px]:hidden">
          <div className="grid grid-cols-[.8fr_1.4fr_.7fr_.8fr_1fr_1fr_.8fr_40px] gap-4 border-b border-outline-variant/60 bg-surface-container-low px-5 py-3 text-[9px] font-bold uppercase tracking-[.11em] text-on-surface-variant"><span>Trade</span><span>Gift card</span><span>Value</span><span>Rate</span><span>Payout</span><span>Submitted</span><span>Status</span><span /></div>
          {visibleTrades.map((trade) => <Link href={`/trade-history/${trade.id}`} key={trade.id} className="grid min-h-20 grid-cols-[.8fr_1.4fr_.7fr_.8fr_1fr_1fr_.8fr_40px] items-center gap-4 border-b border-outline-variant/45 px-5 text-xs transition last:border-0 hover:bg-surface-container-low focus-visible:bg-surface-container-low focus-visible:outline-none">
            <strong className="font-mono text-primary">TV-{String(trade.id).padStart(6, "0")}</strong><div className="min-w-0"><strong className="block truncate text-sm">{trade.cardName}</strong><span className="text-[10px] text-on-surface-variant">{trade.currency}</span></div><span>${Number(trade.cardValue).toLocaleString()}</span><span>₦{Number(trade.rateUsed).toLocaleString()}/$</span><strong>{formatNaira(trade.expectedPayout)}</strong><time className="text-[10px] leading-4 text-on-surface-variant">{formatTradeDate(trade.createdAt)}</time><span><TradeStatusBadge status={trade.status} /></span><span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_right</span>
          </Link>)}
        </div>

        <div className="mt-6 hidden space-y-3 max-[820px]:block">{visibleTrades.map((trade) => <Link href={`/trade-history/${trade.id}`} key={trade.id} className="block border border-outline-variant bg-surface-container p-5 outline-none transition hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary"><header className="flex items-start justify-between gap-4"><div><span className="font-mono text-[10px] text-primary">TV-{String(trade.id).padStart(6, "0")}</span><h2 className="mt-1 text-base">{trade.cardName}</h2></div><TradeStatusBadge status={trade.status} /></header><dl className="mt-5 grid grid-cols-3 gap-4 border-y border-outline-variant/50 py-4 max-[480px]:grid-cols-2"><div><dt className="text-[9px] uppercase text-on-surface-variant">Card value</dt><dd className="mt-1 text-sm font-semibold">${Number(trade.cardValue).toLocaleString()}</dd></div><div><dt className="text-[9px] uppercase text-on-surface-variant">Rate</dt><dd className="mt-1 text-sm font-semibold">₦{Number(trade.rateUsed).toLocaleString()}/$</dd></div><div><dt className="text-[9px] uppercase text-on-surface-variant">Payout</dt><dd className="mt-1 text-sm font-semibold text-primary">{formatNaira(trade.expectedPayout)}</dd></div></dl><footer className="mt-4 flex items-center justify-between gap-4 text-[10px] text-on-surface-variant"><time>{formatTradeDate(trade.createdAt)}</time><span className="inline-flex items-center gap-1 text-primary">View details<span className="material-symbols-outlined text-sm">arrow_forward</span></span></footer></Link>)}</div>
      </> : <section className="mt-8 border border-dashed border-outline-variant p-14 text-center"><span className="material-symbols-outlined text-5xl text-primary">receipt_long</span><h2 className="mt-4 text-2xl">{status ? `No ${status} trades` : "No trades yet"}</h2><p className="mt-2 text-sm text-on-surface-variant">{status ? "Choose another status to review your transactions." : "Your submitted gift-card transactions will appear here."}</p>{!status && <Link href="/trade" className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary">Start a trade</Link>}</section>}
    </section>
  </main>;
}
