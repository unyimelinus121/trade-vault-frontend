"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, TradeStatusBadge, formatNaira, formatTradeDate } from "@/app/components/trade/trade-ui";
import { useAdmin } from "@/app/providers/adminProvider/admin";
import useVisibleInterval from "@/app/hooks/use-visible-interval";

const statusOptions = [
  ["", "All trades", "receipt_long", "total"],
  ["pending", "Pending", "schedule", "pending"],
  ["processing", "Processing", "sync", "processing"],
  ["successful", "Successful", "check_circle", "successful"],
  ["rejected", "Rejected", "cancel", "rejected"],
];

export default function AdminTradesPage() {
  const { trades, tradePagination, tradeSummary, tradeLoading, tradeError, getTrades } = useAdmin();
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getTrades({ status, search: appliedSearch, page, limit: 20 });
    // AdminProvider owns the request function; filters are the refresh triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, page, status]);

  useVisibleInterval(
    () => getTrades({ status, search: appliedSearch, page, limit: 20 }, { silent: true }),
    8_000,
  );

  function selectStatus(next) {
    setStatus(next);
    setPage(1);
  }

  return <div className="pb-20">
    <PageHeader eyebrow="Financial operations" title="Gift-card trade queue." text="Inspect submitted evidence, verify the stored payout, and resolve each pending transaction exactly once." action={<button type="button" onClick={() => getTrades({ status, search: appliedSearch, page, limit: 20 })} disabled={tradeLoading} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-outline-variant px-4 text-xs font-bold text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-40"><span className={`material-symbols-outlined text-lg ${tradeLoading ? "animate-spin" : ""}`}>refresh</span>Refresh queue</button>} />

    <section className="mt-8 grid grid-cols-5 border-y border-outline-variant/55 max-[900px]:grid-cols-2 max-[460px]:grid-cols-1">
      {statusOptions.map(([value,label,icon,key], index) => { const active = status === value; return <button key={key} onClick={() => selectStatus(value)} className={`group min-h-28 border-r border-outline-variant/55 px-5 text-left outline-none transition last:border-r-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary max-[760px]:border-b max-[460px]:border-r-0 ${active ? "bg-primary/[.07]" : "hover:bg-surface-container-low"}`}><span className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[.11em] text-on-surface-variant"><span>{label}</span><span className={`material-symbols-outlined text-lg ${active ? "text-primary" : ""}`}>{icon}</span></span><strong className={`mt-3 block font-display text-3xl tracking-[-.04em] ${key === "rejected" ? "text-error" : key === "successful" || active ? "text-primary" : ""}`}>{tradeSummary?.[key] ?? 0}</strong>{index === 1 && <span className="mt-1 block text-[9px] text-on-surface-variant">Requires review</span>}</button>; })}
    </section>

    <section className="mt-8 border border-outline-variant bg-surface-container-lowest/35">
      <header className="flex items-center justify-between gap-5 border-b border-outline-variant/60 p-5 max-[760px]:flex-col max-[760px]:items-stretch">
        <div><h2 className="text-lg">{status ? `${status[0].toUpperCase()}${status.slice(1)} transactions` : "All transactions"}</h2><p className="mt-1 text-[10px] text-on-surface-variant">{tradePagination.total} matching result{tradePagination.total === 1 ? "" : "s"}</p></div>
        <form onSubmit={(event) => { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); }} className="flex min-w-0 gap-2 max-[520px]:grid max-[520px]:grid-cols-[1fr_auto]"><label className="relative min-w-0"><span className="sr-only">Search submitted trades</span><span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lg text-on-surface-variant">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 w-80 max-w-full border border-outline-variant bg-surface-container-high pr-4 pl-10 text-xs outline-none transition placeholder:text-on-surface-variant/55 focus:border-primary max-[520px]:w-full" placeholder="Trade ID, card, customer or email" /></label><button className="rounded-lg bg-primary px-4 text-xs font-bold text-on-primary">Search</button>{appliedSearch && <button type="button" onClick={() => { setSearch(""); setAppliedSearch(""); setPage(1); }} className="px-2 text-[10px] text-on-surface-variant underline max-[520px]:col-span-2">Clear search</button>}</form>
      </header>

      {tradeError && <div className="m-5 border border-error/25 bg-error/[.05] p-4 text-sm text-error">{tradeError}</div>}
      {tradeLoading && !trades.length ? <div className="space-y-px p-px">{[1,2,3,4,5].map((item) => <div key={item} className="h-20 animate-pulse bg-surface-container" />)}</div> : trades.length ? <>
        <div className="overflow-x-auto max-[900px]:hidden"><table className="w-full min-w-[1080px] border-collapse text-left"><thead><tr className="border-b border-outline-variant/60 bg-surface-container-low text-[9px] uppercase tracking-[.11em] text-on-surface-variant"><th className="px-5 py-3">Trade</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Gift card</th><th className="px-5 py-3">Value</th><th className="px-5 py-3">Rate</th><th className="px-5 py-3">Expected payout</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"><span className="sr-only">Action</span></th></tr></thead><tbody>{trades.map((trade) => <tr key={trade.id} className="border-b border-outline-variant/45 last:border-0 hover:bg-surface-container-low"><td className="px-5 py-4"><strong className="font-mono text-[11px] text-primary">TV-{String(trade.id).padStart(6, "0")}</strong></td><td className="px-5 py-4"><strong className="block text-xs">{trade.user?.firstName} {trade.user?.lastName}</strong><span className="block max-w-44 truncate text-[9px] text-on-surface-variant">{trade.user?.email}</span></td><td className="px-5 py-4"><div className="flex items-center gap-3">{trade.cardImageUrls?.[0] ? <img src={trade.cardImageUrls[0]} alt="" className="h-10 w-12 border border-outline-variant object-cover" /> : <span className="grid h-10 w-12 place-items-center bg-surface-container-high text-primary"><span className="material-symbols-outlined">redeem</span></span>}<strong className="max-w-36 truncate text-xs">{trade.cardName}</strong></div></td><td className="px-5 py-4 text-xs">${Number(trade.cardValue).toLocaleString()}</td><td className="px-5 py-4 text-xs">₦{Number(trade.rateUsed).toLocaleString()}/$</td><td className="px-5 py-4 text-xs font-bold">{formatNaira(trade.expectedPayout)}</td><td className="px-5 py-4 text-[10px] leading-4 text-on-surface-variant">{formatTradeDate(trade.createdAt)}</td><td className="px-5 py-4"><TradeStatusBadge status={trade.status} /></td><td className="px-5 py-4"><Link href={`/admin/trades/${trade.id}`} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-outline-variant px-3 text-[10px] font-bold text-on-surface-variant transition hover:border-primary/40 hover:text-primary">Inspect<span className="material-symbols-outlined text-sm">arrow_forward</span></Link></td></tr>)}</tbody></table></div>

        <div className="hidden divide-y divide-outline-variant/50 max-[900px]:block">{trades.map((trade) => <article key={trade.id} className="p-5"><header className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3">{trade.cardImageUrls?.[0] ? <img src={trade.cardImageUrls[0]} alt="" className="h-14 w-16 shrink-0 border border-outline-variant object-cover" /> : <span className="grid h-14 w-16 shrink-0 place-items-center bg-surface-container-high text-primary"><span className="material-symbols-outlined">redeem</span></span>}<div className="min-w-0"><span className="font-mono text-[9px] text-primary">TV-{String(trade.id).padStart(6, "0")}</span><h3 className="truncate text-sm">{trade.cardName}</h3><p className="truncate text-[10px] text-on-surface-variant">{trade.user?.firstName} {trade.user?.lastName}</p></div></div><TradeStatusBadge status={trade.status} /></header><dl className="mt-4 grid grid-cols-3 gap-3 border-y border-outline-variant/50 py-3 max-[480px]:grid-cols-2"><div><dt className="text-[9px] uppercase text-on-surface-variant">Value</dt><dd className="mt-1 text-xs font-semibold">${Number(trade.cardValue).toLocaleString()}</dd></div><div><dt className="text-[9px] uppercase text-on-surface-variant">Rate</dt><dd className="mt-1 text-xs font-semibold">₦{Number(trade.rateUsed).toLocaleString()}/$</dd></div><div><dt className="text-[9px] uppercase text-on-surface-variant">Payout</dt><dd className="mt-1 text-xs font-semibold text-primary">{formatNaira(trade.expectedPayout)}</dd></div></dl><footer className="mt-4 flex items-center justify-between gap-4"><time className="text-[9px] text-on-surface-variant">{formatTradeDate(trade.createdAt)}</time><Link href={`/admin/trades/${trade.id}`} className="inline-flex min-h-9 items-center rounded-lg bg-primary px-4 text-[10px] font-bold text-on-primary">Inspect trade</Link></footer></article>)}</div>
      </> : <div className="p-16 text-center"><span className="material-symbols-outlined text-5xl text-on-surface-variant/30">receipt_long</span><h3 className="mt-4 text-lg">No matching trades</h3><p className="mt-1 text-xs text-on-surface-variant">Try another status or search term.</p></div>}

      <footer className="flex items-center justify-between border-t border-outline-variant/60 p-4 text-[10px] text-on-surface-variant"><span>Page {tradePagination.page} of {tradePagination.totalPages}</span><div className="flex gap-2"><button disabled={page <= 1 || tradeLoading} onClick={() => setPage((value) => value - 1)} className="min-h-9 rounded-lg border border-outline-variant px-3 disabled:opacity-30">Previous</button><button disabled={page >= tradePagination.totalPages || tradeLoading} onClick={() => setPage((value) => value + 1)} className="min-h-9 rounded-lg bg-primary px-3 font-bold text-on-primary disabled:opacity-30">Next</button></div></footer>
    </section>
  </div>;
}
