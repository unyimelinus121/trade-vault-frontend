"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, TradeStatusBadge, formatNaira, formatTradeDate } from "@/app/components/trade/trade-ui";
import { useAdmin } from "@/app/providers/adminProvider/admin";

export default function AdminTradeDetailsPage() {
  const params = useParams();
  const { selectedTrade, tradeLoading, processingTradeId, tradeError, tradeMessage, clearTradeFeedback, getTradeDetails, markTradeProcessing, markTradeSuccessful, rejectTrade } = useAdmin();
  const [adminNote, setAdminNote] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    if (params.id) getTradeDetails(params.id);
    // AdminProvider owns the request function; the route id is the refresh trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (tradeLoading && !selectedTrade) return <div className="grid min-h-[70vh] place-items-center"><div className="text-center"><span className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" /><p className="mt-4 text-xs text-on-surface-variant">Loading secure trade evidence…</p></div></div>;
  if (!selectedTrade) return <section className="border border-outline-variant p-10 text-center"><h2 className="text-2xl">Trade unavailable</h2><p className="mt-2 text-sm text-error">{tradeError || "Trade not found"}</p><Link href="/admin/trades" className="mt-5 inline-flex text-xs font-bold text-primary">Return to trade queue</Link></section>;

  const trade = selectedTrade;
  const processing = String(processingTradeId) === String(trade.id);
  const imageUrls = trade.cardImageUrls || [];
  const activeImage = imageUrls[selectedImage] || imageUrls[0];

  async function confirmDecision() {
    const updated = decision === "processing"
      ? await markTradeProcessing(trade.id, adminNote)
      : decision === "successful"
        ? await markTradeSuccessful(trade.id, adminNote)
        : await rejectTrade(trade.id, adminNote);
    if (updated) setDecision(null);
  }

  return <div className="pb-20">
    <Link href="/admin/trades" className="inline-flex items-center gap-1 text-xs font-bold text-primary"><span className="material-symbols-outlined text-base">arrow_back</span>Trade queue</Link>
    <div className="mt-6"><PageHeader eyebrow={`Trade TV-${String(trade.id).padStart(6, "0")}`} title={trade.cardName} text={`Submitted by ${trade.user?.firstName || "Customer"} ${trade.user?.lastName || ""} on ${formatTradeDate(trade.createdAt)}.`} action={<TradeStatusBadge status={trade.status} />} /></div>

    {(tradeError || tradeMessage) && <div role="status" className={`mt-6 border p-4 text-sm ${tradeError ? "border-error/25 bg-error/[.05] text-error" : "border-primary/25 bg-primary/[.05] text-primary"}`}>{tradeError || tradeMessage}</div>}

    <div className="mt-8 grid grid-cols-[minmax(0,1.35fr)_400px] items-start gap-8 max-[1120px]:grid-cols-1">
      <div className="space-y-8">
        <section className="border border-outline-variant bg-surface-container-lowest">
          <header className="flex items-center justify-between gap-4 border-b border-outline-variant/60 px-6 py-4"><div><h2 className="text-lg">Uploaded card evidence</h2><p className="mt-1 text-[10px] text-on-surface-variant">Inspect the full image before making a decision.</p></div><div className="flex items-center gap-3"><span className="text-[10px] text-on-surface-variant">{imageUrls.length} image{imageUrls.length === 1 ? "" : "s"}</span>{activeImage && <a href={activeImage} download={`trade-${trade.id}-card-${selectedImage + 1}`} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-outline-variant px-3 text-[10px] font-bold text-primary"><span className="material-symbols-outlined text-base">download</span>Download</a>}</div></header>
          {activeImage ? <><button type="button" onClick={() => setZoomed(true)} className="group relative block w-full bg-black p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary" aria-label="Open full-size card evidence"><img src={activeImage} alt={`Uploaded gift-card evidence ${selectedImage + 1}`} className="mx-auto max-h-[640px] min-h-[360px] w-full object-contain max-[600px]:min-h-[250px]" /><span className="absolute right-7 bottom-7 inline-flex items-center gap-2 rounded-lg bg-black/80 px-3 py-2 text-[10px] font-bold text-white opacity-70 transition group-hover:opacity-100"><span className="material-symbols-outlined text-base">zoom_in</span>Open full preview</span></button>{imageUrls.length > 1 && <div className="flex gap-3 overflow-x-auto border-t border-outline-variant/60 p-4">{imageUrls.map((url,index) => <button type="button" key={url} onClick={() => setSelectedImage(index)} aria-label={`View card evidence ${index + 1}`} className={`shrink-0 border-2 p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === selectedImage ? "border-primary" : "border-transparent"}`}><img src={url} alt="" className="h-20 w-28 object-cover" /></button>)}</div>}</> : <div className="grid min-h-96 place-items-center text-center"><div><span className="material-symbols-outlined text-5xl text-error">broken_image</span><h3 className="mt-3">No evidence image available</h3><p className="mt-1 text-xs text-on-surface-variant">Do not approve this trade without evidence.</p></div></div>}
        </section>

        <section className="grid grid-cols-2 border-t border-l border-outline-variant/55 max-[680px]:grid-cols-1"><div className="border-r border-b border-outline-variant/55 p-6"><span className="text-[9px] font-bold uppercase tracking-[.11em] text-on-surface-variant">Customer</span><h3 className="mt-3 text-lg">{trade.user?.firstName} {trade.user?.lastName}</h3><p className="mt-1 break-all text-xs text-on-surface-variant">{trade.user?.email}</p></div><div className="border-r border-b border-outline-variant/55 p-6"><span className="text-[9px] font-bold uppercase tracking-[.11em] text-on-surface-variant">Submission date</span><h3 className="mt-3 text-base">{formatTradeDate(trade.createdAt)}</h3><p className="mt-1 text-xs text-on-surface-variant">Trade TV-{String(trade.id).padStart(6, "0")}</p></div><div className="col-span-2 border-r border-b border-outline-variant/55 p-6 max-[680px]:col-span-1"><span className="text-[9px] font-bold uppercase tracking-[.11em] text-on-surface-variant">Customer note</span><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{trade.userNote || "No additional note was supplied with this trade."}</p></div></section>
      </div>

      <aside className="sticky top-24 space-y-6 max-[1120px]:static">
        <section className="border border-primary/20 bg-surface-container p-6">
          <span className="text-[10px] font-bold uppercase tracking-[.13em] text-primary">Stored transaction values</span><h2 className="mt-2 text-xl">Payout verification</h2>
          <dl className="mt-6 divide-y divide-outline-variant/50 border-y border-outline-variant/50"><div className="flex justify-between gap-4 py-4 text-sm"><dt className="text-on-surface-variant">Gift card</dt><dd className="max-w-52 text-right font-semibold">{trade.cardName}</dd></div><div className="flex justify-between gap-4 py-4 text-sm"><dt className="text-on-surface-variant">Card value</dt><dd className="font-semibold">${Number(trade.cardValue).toLocaleString()}</dd></div><div className="flex justify-between gap-4 py-4 text-sm"><dt className="text-on-surface-variant">Stored rate</dt><dd className="font-semibold">₦{Number(trade.rateUsed).toLocaleString()}/$1</dd></div><div className="flex justify-between gap-4 py-4 text-sm"><dt className="text-on-surface-variant">Currency</dt><dd className="font-semibold">{trade.currency}</dd></div></dl>
          <div className="pt-6"><span className="text-[10px] uppercase tracking-[.11em] text-on-surface-variant">Expected payout</span><strong className="mt-2 block font-display text-[clamp(2.5rem,5vw,3.7rem)] tracking-[-.05em] text-primary">{formatNaira(trade.expectedPayout)}</strong><p className="mt-2 text-[10px] leading-5 text-on-surface-variant">This is the backend-calculated value stored when the customer submitted the trade.</p></div>
        </section>

        <section className="border border-outline-variant bg-surface-container-low p-6">
          <h2 className="text-xl">Status decision</h2><p className="mt-2 text-xs leading-6 text-on-surface-variant">Only pending trades can be processed. Successful approval credits the stored payout through a locked database transaction.</p>
          <label className="mt-5 block"><span className="mb-2 block text-xs font-semibold">Admin note or rejection reason</span><textarea value={adminNote} onChange={(event) => { setAdminNote(event.target.value); clearTradeFeedback(); }} disabled={!["pending", "processing"].includes(trade.status) || processing} maxLength={2000} className="min-h-28 w-full resize-y border border-outline-variant bg-surface-container-high p-3 text-sm outline-none transition focus:border-primary disabled:opacity-50" placeholder="Optional for approval; recommended for rejection" /><span className="mt-1 block text-right text-[9px] text-on-surface-variant">{adminNote.length}/2000</span></label>
          {["pending", "processing"].includes(trade.status) ? <>{!decision ? <div className={`mt-5 grid gap-3 ${trade.status === "pending" ? "grid-cols-3" : "grid-cols-2"}`}>{trade.status === "pending" && <button disabled={processing} onClick={() => setDecision("processing")} className="min-h-11 rounded-lg border border-secondary/30 bg-secondary/[.07] text-xs font-extrabold text-secondary disabled:opacity-40">Start Processing</button>}<button disabled={processing} onClick={() => setDecision("successful")} className="min-h-11 rounded-lg bg-primary text-xs font-extrabold text-on-primary disabled:opacity-40">Mark Successful</button><button disabled={processing} onClick={() => setDecision("rejected")} className="min-h-11 rounded-lg border border-error/30 bg-error/[.07] text-xs font-extrabold text-error disabled:opacity-40">Reject Trade</button></div> : <div className={`mt-5 border p-4 ${decision === "successful" ? "border-primary/30 bg-primary/[.05]" : decision === "processing" ? "border-secondary/30 bg-secondary/[.05]" : "border-error/30 bg-error/[.05]"}`}><strong className={`block text-sm ${decision === "successful" ? "text-primary" : decision === "processing" ? "text-secondary" : "text-error"}`}>{decision === "successful" ? "Confirm successful trade?" : decision === "processing" ? "Move trade to processing?" : "Confirm trade rejection?"}</strong><p className="mt-2 text-[10px] leading-5 text-on-surface-variant">{decision === "successful" ? `This will credit ${formatNaira(trade.expectedPayout)} to the customer's wallet and cannot be repeated.` : decision === "processing" ? "The customer will be notified that manual verification has started. No wallet credit occurs yet." : "The wallet will not be credited. The customer will receive the reason above."}</p><div className="mt-4 grid grid-cols-2 gap-2"><button disabled={processing} onClick={confirmDecision} className={`min-h-10 rounded-lg text-xs font-bold ${decision === "successful" ? "bg-primary text-on-primary" : decision === "processing" ? "bg-secondary text-black" : "bg-error text-black"}`}>{processing ? "Processing…" : "Confirm"}</button><button disabled={processing} onClick={() => setDecision(null)} className="min-h-10 rounded-lg border border-outline-variant text-xs font-semibold">Cancel</button></div></div>}</> : <div className="mt-5 border border-outline-variant bg-surface-container p-4"><div className="flex items-center justify-between gap-3"><TradeStatusBadge status={trade.status} /><span className="text-[9px] text-on-surface-variant">Final status</span></div><p className="mt-3 text-xs leading-5 text-on-surface-variant">Processed {formatTradeDate(trade.completedAt)}{trade.processedBy ? ` by ${trade.processedBy.firstName} ${trade.processedBy.lastName}` : ""}.</p>{trade.adminNote && <p className="mt-3 border-t border-outline-variant/50 pt-3 text-xs">{trade.adminNote}</p>}</div>}
        </section>
      </aside>
    </div>

    {zoomed && activeImage && <div role="dialog" aria-modal="true" aria-label="Full-size gift-card evidence" className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-5" onClick={() => setZoomed(false)}><button type="button" onClick={() => setZoomed(false)} className="absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-lg bg-white/10 text-white outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Close image preview"><span className="material-symbols-outlined">close</span></button><img src={activeImage} alt={`Full-size uploaded gift-card evidence ${selectedImage + 1}`} className="max-h-[calc(100vh-40px)] max-w-full object-contain" onClick={(event) => event.stopPropagation()} /></div>}
  </div>;
}
