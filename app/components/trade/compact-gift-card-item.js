"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { giftCardTypeLabel } from "@/app/lib/gift-card-type";

function numberFrom(value) {
  const parsed = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function rateLabel(value) {
  const rate = numberFrom(value);
  return rate === null
    ? "Rate unavailable"
    : `₦${rate.toLocaleString("en-NG", { maximumFractionDigits: 2 })}/$1`;
}

function GiftCardContent({ card }) {
  return <>
    <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/[.06] bg-surface-container-high text-primary">
      {card.card_picture_url
        ? <img src={card.card_picture_url} alt="" className="h-full w-full object-cover" />
        : <span className="material-symbols-outlined text-2xl">redeem</span>}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[13px] font-bold text-on-surface">{card.card_name}</span>
      <span className="mt-1 block truncate text-[9px] font-medium uppercase tracking-[.09em] text-on-surface-variant">
        {[giftCardTypeLabel(card.category), card.country].filter(Boolean).join(" · ")}
      </span>
    </span>
    <span className="shrink-0 text-right">
      <strong className="block font-display text-base font-semibold text-primary">{rateLabel(card.card_rate)}</strong>
      <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[.08em] text-on-surface-variant transition group-hover:text-primary">
        Trade <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </span>
    </span>
  </>;
}

const baseClassName = "group flex min-h-[88px] w-full items-center gap-3 rounded-xl border border-outline-variant bg-surface-container px-3.5 py-3 text-left shadow-[0_12px_30px_rgba(0,0,0,.18)] outline-none transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-container-high hover:shadow-[0_18px_38px_rgba(0,0,0,.28)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-[420px]:gap-2.5 max-[420px]:px-3";

export default function CompactGiftCardItem({ card, href, onTrade }) {
  const label = `Trade ${card.card_name} at ${rateLabel(card.card_rate)}`;

  if (href) {
    return <Link href={href} aria-label={label} className={baseClassName}>
      <GiftCardContent card={card} />
    </Link>;
  }

  return <button type="button" onClick={() => onTrade?.(card.id)} aria-label={label} className={baseClassName}>
    <GiftCardContent card={card} />
  </button>;
}
