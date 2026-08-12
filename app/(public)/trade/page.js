"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CompactGiftCardItem from "@/app/components/trade/compact-gift-card-item";
import TradeUploadField from "@/app/components/trade/trade-upload-field";
import { PageHeader, TradeStatusBadge } from "@/app/components/trade/trade-ui";
import { normalizeGiftCardType } from "@/app/lib/gift-card-type";
import { usePublic } from "@/app/providers/publicProvider/public";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useTrade } from "@/app/providers/tradeProvider/trade";

function numberFrom(value) {
  const parsed = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function naira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TradePage() {
  const router = useRouter();
  const { rates, loading, error, getRate } = usePublic();
  const { user, token, authReady } = usePublicAuth();
  const { submitTrade, submittingTrade, tradeError, tradeMessage, clearTradeFeedback } = useTrade();
  const [selectedRateId, setSelectedRateId] = useState("");
  const [cardValue, setCardValue] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [denomination, setDenomination] = useState("custom");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [cardType, setCardType] = useState("physical");
  const [sort, setSort] = useState("highest");
  const skipInitialRouteSelection = useRef(false);

  useEffect(() => {
    function syncSelectionFromLocation() {
      const requestedRateId = new URLSearchParams(window.location.search).get("rate") || "";
      const requestedRateExists = requestedRateId && rates.some(
        (rate) => String(rate.id) === requestedRateId,
      );
      setSelectedRateId(requestedRateExists ? requestedRateId : "");
    }

    const timer = window.setTimeout(() => {
      if (!skipInitialRouteSelection.current) syncSelectionFromLocation();
    }, 0);
    window.addEventListener("popstate", syncSelectionFromLocation);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("popstate", syncSelectionFromLocation);
    };
  }, [rates]);

  const selectedRate = rates.find((item) => String(item.id) === String(selectedRateId));
  const currentRate = numberFrom(selectedRate?.card_rate);
  const estimatedPayout = numberFrom(cardValue) * currentRate;
  const popularRates = useMemo(() => {
    const patterns = [/apple|itunes/i, /amazon/i, /steam/i];
    return patterns.map((pattern) => rates.find((rate) => pattern.test(String(rate.card_name || "")))).filter(Boolean);
  }, [rates]);
  const countries = useMemo(() => [...new Set(rates.map((rate) => rate.country).filter(Boolean))].sort(), [rates]);
  const marketplaceRates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rates.filter((rate) =>
      (!query || String(rate.card_name).toLowerCase().includes(query)) &&
      (!country || rate.country === country) &&
      normalizeGiftCardType(rate.category) === cardType,
    ).sort((a, b) => {
      if (sort === "latest") return Number(b.id) - Number(a.id);
      if (sort === "name") return String(a.card_name).localeCompare(String(b.card_name));
      return numberFrom(b.card_rate) - numberFrom(a.card_rate);
    });
  }, [cardType, country, rates, search, sort]);
  const canSubmit = Boolean(selectedRate && numberFrom(cardValue) > 0 && images.length && !submittingTrade);

  function chooseRate(id) {
    skipInitialRouteSelection.current = false;
    setSelectedRateId(String(id));
    clearTradeFeedback();
    router.replace(`/trade?rate=${id}`, { scroll: false });
  }

  function beginTrade(id) {
    skipInitialRouteSelection.current = false;
    setSelectedRateId(String(id));
    clearTradeFeedback();
    router.push(`/trade?rate=${id}`, { scroll: false });
  }

  function showMarketplace() {
    skipInitialRouteSelection.current = true;
    setSelectedRateId("");
    clearTradeFeedback();
    router.replace("/trade", { scroll: false });
  }

  async function sendTrade(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const created = await submitTrade({ rateId: selectedRateId, cardValue, note, images });
    if (!created) return;
    setCardValue("");
    setNote("");
    setImages([]);
    setDenomination("custom");
    form.reset();
  }

  if (!selectedRateId) return <main className="min-h-screen bg-background">
    <section className="mx-auto w-full max-w-[1440px] px-8 py-16 max-[720px]:px-5 max-[720px]:py-12">
      <PageHeader eyebrow="Gift-card marketplace" title="Find the card you want to trade." text="Browse current gift-card rates and start a trade in one click." action={<Link href="/trade-history" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-outline-variant px-4 text-xs font-bold text-on-surface-variant hover:border-primary/40 hover:text-primary"><span className="material-symbols-outlined text-lg">history</span>My trades</Link>} />

      <ol className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-outline-variant bg-surface-container/60 max-[660px]:grid-cols-1">
        {[
          ["01", "Choose a card", "Compare current rates"],
          ["02", "Upload images", "Add value and clear photos"],
          ["03", "Track your trade", "Follow review to completion"],
        ].map(([number, title, text]) => <li key={number} className="flex min-h-20 items-center gap-3 border-r border-outline-variant/60 px-5 last:border-r-0 max-[660px]:border-r-0 max-[660px]:border-b max-[660px]:last:border-b-0"><span className="font-display text-sm font-semibold text-primary">{number}</span><span><strong className="block text-xs">{title}</strong><small className="mt-1 block text-[10px] text-on-surface-variant">{text}</small></span></li>)}
      </ol>

      <section className="mt-8 border border-outline-variant bg-surface-container-low p-5">
        <div className="grid grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(140px,.7fr))] gap-3 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
          <label className="relative max-[1100px]:col-span-3 max-[700px]:col-span-1"><span className="sr-only">Search gift cards</span><span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg text-on-surface-variant">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-12 w-full border border-outline-variant bg-surface-container-high pr-4 pl-11 text-sm outline-none placeholder:text-on-surface-variant/55 focus:border-primary" placeholder="Search Apple, Steam, Amazon…" /></label>
          <label><span className="sr-only">Filter by country</span><select value={country} onChange={(event) => setCountry(event.target.value)} className="h-12 w-full border border-outline-variant bg-surface-container-high px-3 text-xs outline-none focus:border-primary"><option value="">All countries</option>{countries.map((item) => <option key={item}>{item}</option>)}</select></label>
          <fieldset className="grid h-12 grid-cols-2 overflow-hidden border border-outline-variant bg-surface-container-high" aria-label="Category">
            <legend className="sr-only">Category</legend>
            <button type="button" aria-pressed={cardType === "e-card"} onClick={() => setCardType("e-card")} className={`px-2 text-[10px] font-bold transition ${cardType === "e-card" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}>E-Card</button>
            <button type="button" aria-pressed={cardType === "physical"} onClick={() => setCardType("physical")} className={`border-l border-outline-variant px-2 text-[10px] font-bold transition ${cardType === "physical" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}>Physical Card</button>
          </fieldset>
          <label><span className="sr-only">Sort gift cards</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 w-full border border-outline-variant bg-surface-container-high px-3 text-xs outline-none focus:border-primary"><option value="highest">Highest rate</option><option value="latest">Latest added</option><option value="name">Name A–Z</option></select></label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 text-[10px] text-on-surface-variant"><span>{loading ? "Loading marketplace…" : `${marketplaceRates.length} card${marketplaceRates.length === 1 ? "" : "s"} available`}</span>{(search || country) && <button type="button" onClick={() => { setSearch(""); setCountry(""); }} className="font-bold text-primary underline">Clear filters</button>}</div>
      </section>

      {error ? <div className="mt-8 border border-error/25 bg-error/[.05] p-6 text-center"><p className="text-sm text-error">{error}</p><button onClick={getRate} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-on-primary">Try again</button></div> : loading ? <div className="mt-8 grid grid-cols-3 gap-3 max-[1040px]:grid-cols-2 max-[660px]:grid-cols-1">{[1,2,3,4,5,6,7,8,9].map((item) => <div key={item} className="h-[88px] animate-pulse rounded-xl bg-surface-container" />)}</div> : marketplaceRates.length ? <div className="mt-8 grid grid-cols-3 gap-3 max-[1040px]:grid-cols-2 max-[660px]:grid-cols-1">{marketplaceRates.map((rate) => <CompactGiftCardItem key={rate.id} card={rate} onTrade={beginTrade} />)}</div> : <div className="mt-8 border border-dashed border-outline-variant p-14 text-center"><span className="material-symbols-outlined text-5xl text-on-surface-variant/40">search_off</span><h2 className="mt-4 text-2xl">No cards match these filters</h2><p className="mt-2 text-sm text-on-surface-variant">Clear one or more filters to see the marketplace again.</p></div>}
    </section>
  </main>;

  return <main className="min-h-screen bg-background">
    <section className="mx-auto w-full max-w-[1360px] px-8 py-16 max-[720px]:px-5 max-[720px]:py-12">
      <PageHeader eyebrow="Secure gift-card trade" title={`Trade ${selectedRate?.card_name || "gift card"}.`} text="Choose a value, upload clear card images, and review your estimate. Your final payout is confirmed after card verification." action={<button type="button" onClick={showMarketplace} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/30 bg-primary/[.06] px-4 text-xs font-bold text-primary transition hover:bg-primary hover:text-on-primary focus-visible:ring-2 focus-visible:ring-primary"><span className="material-symbols-outlined text-lg">arrow_back</span>Back to gift cards</button>} />

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)_400px] items-start gap-8 max-[1020px]:grid-cols-1">
        <section className="border border-outline-variant bg-surface-container-low">
          <header className="flex items-center justify-between gap-5 border-b border-outline-variant/60 px-7 py-5 max-[600px]:px-5"><div><h2 className="text-xl">Trade information</h2><p className="mt-1 text-xs text-on-surface-variant">Fields marked required must be completed.</p></div><span className="inline-flex items-center gap-2 text-[10px] text-on-surface-variant"><i className="h-2 w-2 rounded-full bg-primary" />Encrypted submission</span></header>

          {!authReady ? <div className="h-[580px] animate-pulse bg-white/[.02]" /> : !user || !token ? <div className="p-8 max-[600px]:p-5"><div className="border border-primary/20 bg-primary/[.045] p-7"><span className="material-symbols-outlined text-3xl text-primary">lock</span><h3 className="mt-4 text-2xl">Log in before submitting</h3><p className="mt-2 max-w-lg text-sm leading-7 text-on-surface-variant">Trades, uploaded images, transaction history, and wallet credits are protected by your account.</p><Link href="/login?next=/trade" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-on-primary">Log In</Link></div></div> : user.role !== "user" ? <div className="p-8 text-sm text-error">Administrator accounts cannot submit customer trades.</div> : <form onSubmit={sendTrade} className="space-y-6 p-7 max-[600px]:p-5">
            <fieldset>
              <legend className="text-sm font-semibold">1. Select gift card <span className="text-primary">*</span></legend>
              <p className="mt-1 text-xs text-on-surface-variant">Choose a gift card and view its current exchange rate.</p>
              {popularRates.length > 0 && <div className="mt-4 grid grid-cols-3 gap-3 max-[660px]:grid-cols-1">{popularRates.map((rate) => { const active = String(rate.id) === String(selectedRateId); return <button type="button" key={rate.id} onClick={() => chooseRate(rate.id)} className={`flex min-h-16 items-center gap-3 border px-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary bg-primary/[.08]" : "border-outline-variant bg-surface-container hover:border-primary/35"}`}><span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-container-high">{rate.card_picture_url ? <img src={rate.card_picture_url} alt="" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-primary">redeem</span>}</span><span className="min-w-0"><strong className="block truncate text-xs">{rate.card_name}</strong><small className="text-[10px] text-primary">₦{numberFrom(rate.card_rate).toLocaleString()}/$1</small></span></button>; })}</div>}
              <label className="mt-4 block"><span className="mb-2 block text-xs font-semibold">All gift cards</span><select value={selectedRateId} onChange={(event) => chooseRate(event.target.value)} required disabled={loading} className="h-12 w-full border border-outline-variant bg-surface-container-high px-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"><option value="">{loading ? "Loading gift cards…" : "Choose a gift card"}</option>{rates.map((rate) => <option value={rate.id} key={rate.id}>{rate.card_name} — ₦{numberFrom(rate.card_rate).toLocaleString()}/$1</option>)}</select></label>
              {error && <div className="mt-3 flex items-center justify-between gap-4 border border-error/20 bg-error/[.04] p-3 text-xs text-error"><span>{error}</span><button type="button" onClick={getRate} className="font-bold underline">Retry</button></div>}
            </fieldset>

            <fieldset className="grid grid-cols-[1fr_150px_130px] gap-4 max-[700px]:grid-cols-1">
              <legend className="sr-only">Card value and currency</legend>
              <label><span className="mb-2 block text-sm font-semibold">2. Gift-card value <span className="text-primary">*</span></span><div className="flex h-12 border border-outline-variant bg-surface-container-high transition focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"><span className="grid w-12 place-items-center border-r border-outline-variant text-on-surface-variant">$</span><input value={cardValue} onChange={(event) => { setCardValue(event.target.value); setDenomination("custom"); clearTradeFeedback(); }} required min="0.01" max="1000000" step="0.01" inputMode="decimal" type="number" className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" placeholder="100.00" /></div><span className="mt-2 block text-[10px] text-on-surface-variant">Enter the face value printed on the card.</span></label>
              <label><span className="mb-2 block text-sm font-semibold">Denomination</span><select value={denomination} onChange={(event) => { const value = event.target.value; setDenomination(value); if (value !== "custom") setCardValue(value); clearTradeFeedback(); }} className="h-12 w-full border border-outline-variant bg-surface-container-high px-3 text-sm outline-none focus:border-primary"><option value="custom">Custom</option>{[25,50,100,200,500].map((value) => <option value={value} key={value}>${value}</option>)}</select><span className="mt-2 block text-[10px] text-on-surface-variant">Quick value selection</span></label>
              <label><span className="mb-2 block text-sm font-semibold">Currency</span><input value="USD" readOnly className="h-12 w-full border border-outline-variant bg-surface-container px-4 text-sm text-on-surface-variant outline-none" /><span className="mt-2 block text-[10px] text-on-surface-variant">Current rate currency</span></label>
            </fieldset>

            <fieldset><legend className="text-sm font-semibold">3. Upload card images <span className="text-primary">*</span></legend><p className="mt-1 mb-4 text-xs text-on-surface-variant">Make the card number, value, and receipt details readable where applicable.</p><TradeUploadField files={images} onChange={(next) => { setImages(next); clearTradeFeedback(); }} disabled={submittingTrade} /></fieldset>

            <label className="block"><span className="mb-2 block text-sm font-semibold">4. Additional note <span className="font-normal text-on-surface-variant">(optional)</span></span><textarea value={note} onChange={(event) => { setNote(event.target.value); clearTradeFeedback(); }} maxLength={2000} className="min-h-28 w-full resize-y border border-outline-variant bg-surface-container-high p-4 text-sm leading-6 outline-none transition placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Add information that may help the verification team…" /><span className="mt-2 flex justify-between text-[10px] text-on-surface-variant"><span>Do not include account passwords or unrelated private information.</span><span>{note.length}/2000</span></span></label>

            {(tradeError || tradeMessage) && <div role="status" className={`border p-4 text-sm ${tradeError ? "border-error/25 bg-error/[.05] text-error" : "border-primary/25 bg-primary/[.05] text-primary"}`}><div className="flex items-start gap-3"><span className="material-symbols-outlined">{tradeError ? "error" : "task_alt"}</span><div><strong className="block">{tradeError ? "Trade not submitted" : "Trade submitted successfully"}</strong><p className="mt-1 text-xs leading-5 text-on-surface-variant">{tradeError || tradeMessage}</p>{tradeMessage && <Link href="/trade-history" className="mt-3 inline-flex text-xs font-bold text-primary underline">View pending trade</Link>}</div></div></div>}

            <button disabled={!canSubmit} className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-extrabold text-on-primary outline-none transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-35">{submittingTrade ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />Submitting securely…</> : <><span className="material-symbols-outlined">verified_user</span>Submit Trade for Review</>}</button>
          </form>}
        </section>

        <aside className="sticky top-28 border border-primary/20 bg-surface-container p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] max-[1020px]:static">
          <header className="flex items-center justify-between border-b border-outline-variant/55 pb-5"><div><span className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Transaction summary</span><h2 className="mt-1 text-xl">Review your estimate</h2></div>{tradeMessage ? <TradeStatusBadge status="pending" /> : <span className="text-[10px] text-on-surface-variant">Not submitted</span>}</header>
          <div className="mt-5 flex items-center gap-4 bg-surface-container-high p-4"><span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-container-highest text-primary">{selectedRate?.card_picture_url ? <img src={selectedRate.card_picture_url} alt="" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined">redeem</span>}</span><div className="min-w-0"><span className="text-[9px] uppercase tracking-[.1em] text-on-surface-variant">Gift card</span><strong className="mt-1 block truncate text-sm">{selectedRate?.card_name || "Not selected"}</strong></div></div>
          <dl className="mt-5 divide-y divide-outline-variant/50 border-y border-outline-variant/50">
            <div className="flex items-center justify-between gap-5 py-4 text-sm"><dt className="text-on-surface-variant">Card value</dt><dd className="font-semibold">${numberFrom(cardValue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div>
            <div className="flex items-center justify-between gap-5 py-4 text-sm"><dt className="text-on-surface-variant">Current rate</dt><dd className="font-semibold text-primary">₦{currentRate.toLocaleString()}/$1</dd></div>
            <div className="flex items-center justify-between gap-5 py-4 text-sm"><dt className="text-on-surface-variant">Images ready</dt><dd className="font-semibold">{images.length}</dd></div>
          </dl>
          <div className="py-6"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-on-surface-variant">Estimated payout</span><strong className="mt-2 block font-display text-[clamp(2.35rem,5vw,3.25rem)] tracking-[-.05em] text-primary">{naira(estimatedPayout)}</strong></div>
          <div className="border-l-2 border-primary bg-primary/[.045] p-4"><div className="flex gap-3"><span className="material-symbols-outlined text-lg text-primary">shield_lock</span><p className="text-[11px] leading-5 text-on-surface-variant">Your estimate is based on the current rate. Your final payout is confirmed after card verification.</p></div></div>
          <ol className="mt-6 space-y-3 text-[11px] text-on-surface-variant"><li className="flex gap-3"><span className="text-primary">01</span>Your trade appears as Pending.</li><li className="flex gap-3"><span className="text-primary">02</span>Our team reviews the uploaded card images.</li><li className="flex gap-3"><span className="text-primary">03</span>Successful trades are credited to your wallet.</li></ol>
        </aside>
      </div>
    </section>
  </main>;
}
