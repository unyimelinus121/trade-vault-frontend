"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CompactGiftCardItem from "@/app/components/trade/compact-gift-card-item";
import PaymentMethodLogo from "@/app/components/trade/payment-method-logo";
import { SectionHeader } from "@/app/components/trade/trade-ui";
import { giftCardTypeLabel } from "@/app/lib/gift-card-type";
import { usePublic } from "@/app/providers/publicProvider/public";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useChat } from "@/app/providers/chatProvider/chat";

const featuredDefinitions = [
  { label: "Apple", pattern: /apple|itunes/i, symbol: "apple" },
  { label: "Amazon", pattern: /amazon/i, symbol: "shopping_bag" },
  { label: "Steam", pattern: /steam/i, symbol: "sports_esports" },
];

const benefits = [
  ["speed", "Fast verification", "Clear submissions move through review quickly, with the status visible at every step."],
  ["monitoring", "Competitive rates", "Review clear, up-to-date card rates before you start a trade."],
  ["encrypted", "Secure submission", "Protected uploads keep your gift-card images and trade details private."],
  ["account_balance_wallet", "Wallet tracking", "Successful payouts appear in your wallet with a clear activity history."],
  ["receipt_long", "Transaction history", "See the card value, exchange rate, expected payout, and decision for every trade."],
  ["support_agent", "Direct support", "Reach TradeVault support from anywhere in your customer experience."],
];

const processSteps = [
  ["01", "Select your gift card", "Choose from the current card catalogue and review its current exchange rate."],
  ["02", "Upload card evidence", "Enter the value and submit clear images through the protected trade form."],
  ["03", "Card review", "Our team reviews your submission while you track its status from your account."],
  ["04", "Wallet payment", "Successful trades are completed and the confirmed payout is credited to your wallet."],
];

const paymentServices = [
  { name: "PayPal" },
  { name: "Chime" },
  { name: "Venmo" },
  { name: "Cash App" },
  { name: "Zelle" },
  { name: "Bank Transfer", bank: true },
  { name: "Bank Wire", bank: true },
  { name: "Bitcoin" },
];

function paymentChatMessage(service) {
  if (service === "Bitcoin") return "I want to trade Bitcoin. What's your current rate?";
  return `I'm interested in a ${service} transaction.`;
}

function numericRate(value) {
  const parsed = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function displayRate(value) {
  const rate = numericRate(value);
  return rate === null ? "Unavailable" : `₦${rate.toLocaleString("en-NG", { maximumFractionDigits: 2 })}/$1`;
}

export default function Home() {
  const router = useRouter();
  const handledChatContext = useRef("");
  const { rates, loading, error, getRate } = usePublic();
  const { user, token } = usePublicAuth();
  const { openUserChat } = useChat();
  const featured = featuredDefinitions.map((definition) => ({
    ...definition,
    card: rates.find((rate) => definition.pattern.test(String(rate.card_name || ""))) || null,
  }));
  const priorityIds = new Set(featured.map((item) => item.card?.id).filter(Boolean));
  const featuredPreview = [
    ...featured.map((item) => item.card).filter(Boolean),
    ...rates.filter((rate) => !priorityIds.has(rate.id)),
  ].slice(0, 6);

  useEffect(() => {
    if (user?.role !== "user" || !token || typeof window === "undefined") return;
    const service = new URLSearchParams(window.location.search).get("chat");
    if (!service || handledChatContext.current === service) return;
    handledChatContext.current = service;
    openUserChat(paymentChatMessage(service));
    router.replace("/", { scroll: false });
  }, [openUserChat, router, token, user?.role]);

  async function startChat(service = "") {
    if (user?.role === "user" && token) {
      return openUserChat(service ? paymentChatMessage(service) : "");
    }
    const nextPath = service ? `/?chat=${encodeURIComponent(service)}` : "/";
    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return <main className="overflow-hidden bg-background">
    <section className="relative border-b border-outline-variant/45">
      <div className="pointer-events-none absolute top-12 right-[-12rem] h-[32rem] w-[32rem] rounded-full bg-primary/[.08] blur-[120px]" />
      <div className="mx-auto grid min-h-[680px] w-full max-w-[1440px] grid-cols-[1.05fr_.95fr] items-center gap-16 px-8 py-20 max-[980px]:grid-cols-1 max-[980px]:gap-10 max-[720px]:min-h-0 max-[720px]:px-5 max-[720px]:py-16">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 border-l-2 border-primary pl-3 text-[11px] font-bold uppercase tracking-[.16em] text-primary">Gift-card trading and wallet management</span>
          <h1 className="mt-7 text-[clamp(3.35rem,6.2vw,5.9rem)] leading-[.96] tracking-[-.058em]">Turn gift cards into <span className="text-primary">usable funds.</span></h1>
          <p className="mt-7 max-w-2xl text-[17px] leading-8 text-on-surface-variant">Trade gift cards at competitive rates, follow every review, and receive successful payouts in your TradeVault wallet.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/trade" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-on-primary outline-none transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"><span className="material-symbols-outlined">swap_horiz</span>Trade Gift Card</Link>
            <button onClick={() => startChat()} className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-6 text-sm font-semibold outline-none transition hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"><span className="material-symbols-outlined">forum</span>Chat With Us</button>
          </div>
          <div className="mt-6 max-w-2xl rounded-xl border border-primary/15 bg-primary/[.035] p-4">
            <div className="flex gap-3"><span className="material-symbols-outlined mt-0.5 text-xl text-primary">payments</span><div><strong className="block text-sm">Send or Receive Money</strong><p className="mt-1 text-[11px] leading-5 text-on-surface-variant">Choose a supported service below and live chat will help you arrange the transaction.</p></div></div>
            <div className="mt-3 -mx-1 flex flex-wrap gap-2 px-1 pb-1 max-[520px]:flex-nowrap max-[520px]:overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {paymentServices.map((service) => <PaymentMethodLogo key={service.name} name={service.name} bank={service.bank} showLabel={Boolean(service.bank)} onClick={() => startChat(service.name)} />)}
            </div>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-outline-variant/55 pt-6 max-[540px]:grid-cols-1 max-[540px]:gap-4">
            <div><dt className="text-[10px] uppercase tracking-[.12em] text-on-surface-variant">Rates</dt><dd className="mt-1 font-display text-lg font-semibold">Competitive rates</dd></div>
            <div><dt className="text-[10px] uppercase tracking-[.12em] text-on-surface-variant">Status</dt><dd className="mt-1 font-display text-lg font-semibold">Track your trade</dd></div>
            <div><dt className="text-[10px] uppercase tracking-[.12em] text-on-surface-variant">Wallet</dt><dd className="mt-1 font-display text-lg font-semibold">Fast wallet credit</dd></div>
          </dl>
        </div>

        <div className="relative z-10 border border-outline-variant bg-surface-container-low p-3 shadow-[0_36px_90px_rgba(0,0,0,.45)] max-[600px]:p-2">
          <div className="border border-white/[.06] bg-surface-container p-6 max-[600px]:p-4">
            <header className="flex items-center justify-between gap-4 border-b border-outline-variant/55 pb-5"><div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Trading overview</span><h2 className="mt-1 text-xl">Current market snapshot</h2></div><span className="inline-flex items-center gap-2 text-[10px] text-on-surface-variant"><i className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_#39e879]" />Current rates</span></header>
            <div className="mt-3">
              {featured.map((item, index) => <div key={item.label} className="grid grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-outline-variant/45 py-4 last:border-0">
                <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-surface-container-high text-primary">{item.card?.card_picture_url ? <img src={item.card.card_picture_url} alt="" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined">{item.symbol}</span>}</span>
                <div className="min-w-0"><strong className="block truncate text-sm">{item.card?.card_name || `${item.label} Gift Card`}</strong><span className="text-[10px] text-on-surface-variant">{item.card ? `${giftCardTypeLabel(item.card.category)} · ${item.card.country}` : "Not currently listed"}</span></div>
                <div className="text-right"><strong className="block font-display text-lg text-primary">{item.card ? displayRate(item.card.card_rate) : "—"}</strong><span className="text-[9px] text-on-surface-variant">Current rate</span></div>
              </div>)}
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-5 bg-primary/[.06] p-5"><div><span className="text-[10px] uppercase tracking-[.1em] text-on-surface-variant">Wallet settlement</span><strong className="mt-1 block text-sm">Verified trades credit automatically</strong></div><span className="material-symbols-outlined text-3xl text-primary">account_balance_wallet</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-outline-variant/45 bg-surface-container-low/45">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-5 px-8 py-20 max-[880px]:grid-cols-1 max-[720px]:px-5 max-[720px]:py-16">
        <article className="relative overflow-hidden rounded-3xl border border-[#f7931a]/25 bg-[linear-gradient(145deg,rgba(247,147,26,.11),rgba(8,22,13,.9)_58%)] p-8 max-[560px]:p-6">
          <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-[#f7931a]/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-5">
            <div><span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#f7a63f]">Bitcoin trading</span><h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-.045em]">Trade your Bitcoin through live chat.</h2></div>
            <PaymentMethodLogo name="Bitcoin" showLabel={false} className="h-14 rounded-2xl border-[#f7931a]/25 bg-[#f7931a]/10 px-4" />
          </div>
          <p className="relative mt-5 max-w-xl text-sm leading-7 text-on-surface-variant">Start a secure conversation with our team, receive the current TradeVault Bitcoin wallet address, and follow the guided confirmation process.</p>
          <ol className="relative mt-7 grid gap-3">
            {[
              ["forum", "Text us on live chat", "Click Trade Bitcoin and your request will already be written for you."],
              ["account_balance_wallet", "Receive the wallet address", "Our live-chat team sends the TradeVault Bitcoin wallet for your transaction."],
              ["currency_bitcoin", "Send your Bitcoin", "Send the agreed amount only to the wallet address confirmed in the chat."],
              ["add_photo_alternate", "Send your screenshot", "Share your transaction screenshot or confirmation details in the same chat."],
              ["verified", "Wait for confirmation and credit", "After the blockchain payment is confirmed, the team completes your credit through live chat."],
            ].map(([icon, title, text], index) => <li key={title} className="grid grid-cols-[38px_1fr] gap-3 rounded-xl border border-white/[.06] bg-black/10 p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f7931a]/12 text-[#f7a63f]"><span className="material-symbols-outlined text-lg">{icon}</span></span><div><strong className="block text-xs">{index + 1}. {title}</strong><p className="mt-1 text-[10px] leading-5 text-on-surface-variant">{text}</p></div></li>)}
          </ol>
          <button type="button" onClick={() => startChat("Bitcoin")} className="relative mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#f7931a] px-6 text-sm font-extrabold text-[#211000] shadow-[0_14px_34px_rgba(247,147,26,.18)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7931a]"><img src="/payment-logos/bitcoin.svg" alt="" className="h-6 w-6" />Trade Bitcoin<span className="material-symbols-outlined text-lg">arrow_forward</span></button>
        </article>

        <article className="rounded-3xl border border-primary/20 bg-surface-container p-8 max-[560px]:p-6">
          <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Receive money from the United States</span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-.045em]">Your friends, family, and loved ones can send through familiar services.</h2>
          <p className="mt-5 text-sm leading-7 text-on-surface-variant">Receive money sent from the United States through PayPal, Venmo, Cash App, Chime, Zelle, bank transfer, or bank wire. Choose the service below to open live chat, confirm the transaction details, and receive guidance from the TradeVault team.</p>
          <div className="mt-7 grid grid-cols-2 items-stretch gap-2 max-[520px]:grid-cols-1">
            {paymentServices.filter((service) => service.name !== "Bitcoin").map((service) => (
              <button
                type="button"
                key={service.name}
                onClick={() => startChat(service.name)}
                className="flex h-16 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-outline-variant/60 bg-background/25 p-3 text-left transition hover:border-primary/35 hover:bg-primary/[.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <PaymentMethodLogo
                  name={service.name}
                  bank={service.bank}
                  className="min-w-0 flex-1 justify-start border-0 bg-transparent px-0 hover:border-transparent hover:bg-transparent"
                />
                <span className="material-symbols-outlined shrink-0 text-lg text-primary">forum</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3 rounded-xl border border-primary/15 bg-primary/[.035] p-4"><span className="material-symbols-outlined text-xl text-primary">info</span><p className="text-[10px] leading-5 text-on-surface-variant">Always confirm the service, sender details, amount, and next step with the live-chat team before moving money.</p></div>
        </article>
      </div>
    </section>

    <section className="mx-auto w-full max-w-[1440px] px-8 py-24 max-[720px]:px-5 max-[720px]:py-20">
      <div className="flex items-end justify-between gap-8 max-[760px]:flex-col max-[760px]:items-start"><SectionHeader eyebrow="Featured gift cards" title="A quick look at today’s marketplace." text="Explore a focused selection of available gift cards and current exchange rates. Visit the marketplace to see the complete list." /><div className="flex items-center gap-5"><button type="button" onClick={getRate} disabled={loading} className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant disabled:opacity-40"><span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>refresh</span>Refresh</button><Link href="/trade" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-xs font-bold text-on-primary">View All Gift Cards<span className="material-symbols-outlined text-base">arrow_forward</span></Link></div></div>
      {error ? <div className="mt-10 border border-error/25 bg-error/[.05] p-6"><strong className="text-error">Rates could not be loaded.</strong><p className="mt-2 text-sm text-on-surface-variant">Please try again in a moment.</p><button onClick={getRate} className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary">Try again</button></div> : loading ? <div className="mt-10 grid grid-cols-2 gap-3 max-[680px]:grid-cols-1">{[1,2,3,4,5,6].map((item) => <div key={item} className="h-[88px] animate-pulse rounded-xl bg-surface-container" />)}</div> : featuredPreview.length ? <div className="mt-10 grid grid-cols-2 gap-3 max-[680px]:grid-cols-1">{featuredPreview.map((card) => <CompactGiftCardItem key={card.id} card={card} href={`/trade?rate=${card.id}`} />)}</div> : <div className="mt-10 border border-dashed border-outline-variant p-10 text-center text-sm text-on-surface-variant">No cards are currently available.</div>}
    </section>

    <section className="border-y border-outline-variant/45 bg-surface-container-low">
      <div className="mx-auto w-full max-w-[1440px] px-8 py-24 max-[720px]:px-5 max-[720px]:py-20">
        <SectionHeader eyebrow="How it works" title="A clear path from card to wallet." text="Four simple steps take you from choosing a card to receiving a successful payout." />
        <ol className="relative mt-14 grid grid-cols-4 gap-0 before:absolute before:top-6 before:right-[12.5%] before:left-[12.5%] before:h-px before:bg-outline-variant max-[820px]:grid-cols-1 max-[820px]:gap-8 max-[820px]:before:top-6 max-[820px]:before:bottom-6 max-[820px]:before:left-6 max-[820px]:before:h-auto max-[820px]:before:w-px">
          {processSteps.map(([number, title, text]) => <li key={number} className="relative px-5 first:pl-0 last:pr-0 max-[820px]:pl-16 max-[820px]:first:pl-16"><span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-primary/30 bg-surface-container-low font-display text-sm font-semibold text-primary max-[820px]:absolute max-[820px]:left-0">{number}</span><h3 className="mt-6 text-lg max-[820px]:mt-0">{title}</h3><p className="mt-3 text-xs leading-6 text-on-surface-variant">{text}</p></li>)}
        </ol>
      </div>
    </section>

    <section className="mx-auto grid w-full max-w-[1440px] grid-cols-[.72fr_1.28fr] gap-16 px-8 py-28 max-[960px]:grid-cols-1 max-[720px]:px-5 max-[720px]:py-20">
      <div><SectionHeader eyebrow="Why TradeVault" title="Built for confident trading." text="Every important rate, decision, and wallet update stays easy to find in your account." /><Link href="/how-it-works" className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-primary">Explore the complete process<span className="material-symbols-outlined text-base">arrow_forward</span></Link></div>
      <div className="grid grid-cols-2 border-t border-l border-outline-variant/55 max-[620px]:grid-cols-1">{benefits.map(([icon,title,text]) => <article key={title} className="min-h-48 border-r border-b border-outline-variant/55 p-6 transition hover:bg-surface-container-low"><span className="material-symbols-outlined text-2xl text-primary">{icon}</span><h3 className="mt-8 text-lg">{title}</h3><p className="mt-2 text-xs leading-6 text-on-surface-variant">{text}</p></article>)}</div>
    </section>

    <section className="border-y border-outline-variant/45 bg-[#07150c]">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_1fr] items-center gap-16 px-8 py-24 max-[900px]:grid-cols-1 max-[720px]:px-5 max-[720px]:py-20">
        <div><span className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Money service enquiries</span><h2 className="mt-4 text-[clamp(2.5rem,5vw,4.3rem)] leading-[1] tracking-[-.05em]">Talk to a person before moving money.</h2><p className="mt-6 max-w-xl text-sm leading-7 text-on-surface-variant">Select any supported service and our live-chat team will help you arrange the transaction.</p><button onClick={() => startChat()} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-on-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"><span className="material-symbols-outlined">forum</span>Open Live Chat</button></div>
        <div className="border border-primary/20 bg-background/65 p-3"><div className="grid grid-cols-2 gap-2 p-3 max-[520px]:grid-cols-1">{paymentServices.map((service) => <button type="button" onClick={() => startChat(service.name)} key={service.name} className="flex min-h-20 min-w-0 items-center justify-between gap-3 rounded-xl border border-outline-variant/50 bg-surface-container/50 p-4 text-left outline-none transition hover:border-primary/35 hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary"><PaymentMethodLogo name={service.name} bank={service.bank} className="min-w-0" /><span className="shrink-0 text-[9px] font-bold uppercase tracking-[.08em] text-primary">Live chat →</span></button>)}</div></div>
      </div>
    </section>

    <section className="mx-auto w-full max-w-[1440px] px-8 py-24 max-[720px]:px-5 max-[720px]:py-20">
      <div className="grid grid-cols-[1fr_auto] items-center gap-10 border border-primary/25 bg-surface-container px-10 py-12 max-[760px]:grid-cols-1 max-[600px]:px-6"><div><span className="text-[11px] font-bold uppercase tracking-[.15em] text-primary">Ready to begin?</span><h2 className="mt-3 text-[clamp(2.3rem,4.5vw,4rem)] tracking-[-.045em]">Ready to trade your gift card?</h2><p className="mt-3 text-sm text-on-surface-variant">Choose a current rate, submit clear evidence, and track the result from your account.</p></div><div className="flex flex-wrap gap-3"><Link href="/trade" className="inline-flex min-h-12 items-center rounded-lg bg-primary px-6 text-sm font-bold text-on-primary">Start Trading</Link><button onClick={() => startChat()} className="inline-flex min-h-12 items-center rounded-lg border border-outline-variant px-6 text-sm font-semibold hover:border-primary/40 hover:text-primary">Chat With Support</button></div></div>
    </section>
  </main>;
}
