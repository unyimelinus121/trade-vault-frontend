"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, formatNaira, formatTradeDate, LoginRequired, PageLoader, TradeStatusBadge } from "@/app/components/trade/trade-ui";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useTrade } from "@/app/providers/tradeProvider/trade";

export default function TradeDetailsPage() {
  const params = useParams();
  const { user, token, authReady } = usePublicAuth();
  const { selectedTrade, tradeLoading, tradeError, getTradeDetails } = useTrade();
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => { if (user?.role === "user" && token && params.id) getTradeDetails(params.id); }, [getTradeDetails, params.id, token, user?.role]);
  if (!authReady) return <PageLoader />;
  if (!user || !token || user.role !== "user") return <LoginRequired title="Log in to view this trade" />;
  if (tradeLoading && !selectedTrade) return <PageLoader />;
  if (!selectedTrade) return <main className="grid min-h-[70vh] place-items-center px-6"><section className="text-center"><h1 className="text-3xl">Trade unavailable</h1><p className="mt-2 text-sm text-error">{tradeError || "This transaction could not be found."}</p><Link href="/trade-history" className="mt-6 inline-flex text-sm font-bold text-primary">← Back to trade history</Link></section></main>;

  const trade = selectedTrade;
  const activeImage = trade.cardImageUrls?.[selectedImage] || trade.cardImageUrls?.[0];
  return <main className="min-h-screen bg-background"><section className="mx-auto max-w-[1240px] px-8 py-16 max-[650px]:px-5 max-[650px]:py-12">
    <Link href="/trade-history" className="inline-flex items-center gap-1 text-xs font-bold text-primary"><span className="material-symbols-outlined text-base">arrow_back</span>Trade history</Link>
    <div className="mt-6"><PageHeader eyebrow={`Transaction TV-${String(trade.id).padStart(6, "0")}`} title={trade.cardName} text={`Submitted ${formatTradeDate(trade.createdAt)}. The rate and expected payout shown here are the values stored with this transaction.`} action={<TradeStatusBadge status={trade.status} />} /></div>

    <div className="mt-8 grid grid-cols-[.85fr_1.15fr] items-start gap-8 max-[900px]:grid-cols-1">
      <section className="border border-outline-variant bg-surface-container-low p-6"><h2 className="text-lg">Transaction values</h2><dl className="mt-5 divide-y divide-outline-variant/50 border-y border-outline-variant/50">{[["Card value", `$${Number(trade.cardValue).toLocaleString()}`],["Rate used", `₦${Number(trade.rateUsed).toLocaleString()}/$1`],["Currency", trade.currency],["Submitted", formatTradeDate(trade.createdAt)],["Completed", trade.completedAt ? formatTradeDate(trade.completedAt) : "Awaiting decision"]].map(([label,value]) => <div key={label} className="flex items-center justify-between gap-5 py-4 text-sm"><dt className="text-on-surface-variant">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl><div className="pt-6"><span className="text-[10px] uppercase tracking-[.11em] text-on-surface-variant">Expected payout</span><strong className="mt-2 block font-display text-[clamp(2.5rem,5vw,3.8rem)] tracking-[-.05em] text-primary">{formatNaira(trade.expectedPayout)}</strong></div>{trade.userNote && <div className="mt-6 border-l-2 border-outline bg-surface-container p-4"><span className="text-[9px] font-bold uppercase text-on-surface-variant">Your note</span><p className="mt-2 whitespace-pre-wrap text-xs leading-6">{trade.userNote}</p></div>}{trade.adminNote && <div className={`mt-4 border-l-2 p-4 ${trade.status === "rejected" ? "border-error bg-error/[.04]" : "border-primary bg-primary/[.04]"}`}><span className="text-[9px] font-bold uppercase text-on-surface-variant">TradeVault note</span><p className="mt-2 whitespace-pre-wrap text-xs leading-6">{trade.adminNote}</p></div>}</section>

      <section className="border border-outline-variant bg-surface-container-lowest"><header className="flex items-center justify-between border-b border-outline-variant/60 px-5 py-4"><div><h2 className="text-lg">Submitted evidence</h2><p className="mt-1 text-[10px] text-on-surface-variant">Your protected gift-card uploads</p></div><span className="text-[10px] text-on-surface-variant">{trade.cardImageUrls?.length || 0} image{trade.cardImageUrls?.length === 1 ? "" : "s"}</span></header>{activeImage ? <><a href={activeImage} target="_blank" rel="noreferrer" className="block bg-black p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"><img src={activeImage} alt={`Submitted gift-card evidence ${selectedImage + 1}`} className="mx-auto max-h-[520px] min-h-72 w-full object-contain" /></a>{trade.cardImageUrls.length > 1 && <div className="flex gap-3 overflow-x-auto border-t border-outline-variant/60 p-4">{trade.cardImageUrls.map((url,index) => <button type="button" onClick={() => setSelectedImage(index)} key={url} className={`shrink-0 border-2 p-1 ${index === selectedImage ? "border-primary" : "border-transparent"}`}><img src={url} alt={`Show submitted card ${index + 1}`} className="h-16 w-24 object-cover" /></button>)}</div>}</> : <div className="grid min-h-72 place-items-center text-sm text-on-surface-variant">No image available</div>}</section>
    </div>
  </section></main>;
}
