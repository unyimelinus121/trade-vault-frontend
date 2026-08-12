"use client";

import { useAdmin } from "../../../../providers/adminProvider/admin";

export default function DashboardSummary() {
  const { rates, loading, tradePeriodSummary, tradeLoading } = useAdmin();
  const numericRates = rates
    .map((rate) =>
      Number.parseFloat(String(rate.card_rate).replace(/[^\d.]/g, "")),
    )
    .filter(Number.isFinite);
  const averageRate = numericRates.length
    ? `₦${Math.round(
        numericRates.reduce((total, rate) => total + rate, 0) /
          numericRates.length,
      ).toLocaleString("en-NG")}/$`
    : "—";

  return (
    <>
      <header className="mb-8 flex items-end justify-between gap-6 max-[700px]:items-start">
        <div>
          <span className="mb-2 block text-[10px] font-extrabold tracking-[.16em] text-primary">
            LIVE OPERATIONS
          </span>
          <h2 className="text-[clamp(28px,4vw,40px)] leading-tight tracking-[-.04em]">
            Operations overview
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Review available cards, update market rates, and prepare new
            inventory.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[.07] bg-surface-container px-3 py-2 text-[10px] text-on-surface-variant max-[700px]:hidden">
          <i className="h-1.5 w-1.5 rounded-full bg-tertiary" />
          {loading ? "Syncing with backend" : "Synced with backend"}
        </div>
      </header>

      <section className="mb-8 grid grid-cols-4 gap-4 max-[1150px]:grid-cols-2 max-[600px]:grid-cols-1">
        <article className="stitch-panel rounded-2xl p-5">
          <i className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-lg text-primary not-italic">▣</i>
          <span className="text-xs text-on-surface-variant">Available cards</span>
          <strong className="mt-1 block text-2xl">{loading ? "—" : rates.length}</strong>
          <small className="mt-2 block text-[10px] text-on-surface-variant/70">Loaded from the database</small>
        </article>
        <article className="stitch-panel rounded-2xl p-5">
          <i className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-tertiary/10 text-lg text-tertiary not-italic">↗</i>
          <span className="text-xs text-on-surface-variant">Average rate</span>
          <strong className="mt-1 block text-2xl">{loading ? "—" : averageRate}</strong>
          <small className="mt-2 block text-[10px] text-on-surface-variant/70">Calculated from current rates</small>
        </article>
        <article className="stitch-panel rounded-2xl p-5">
          <i className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-secondary/10 text-lg text-secondary not-italic">◎</i>
          <span className="text-xs text-on-surface-variant">Active markets</span>
          <strong className="mt-1 block text-2xl">4</strong>
          <small className="mt-2 block text-[10px] text-on-surface-variant/70">USD, GBP, EUR, CAD</small>
        </article>
        <article className="stitch-panel rounded-2xl p-5">
          <i className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-error/10 text-lg text-error not-italic">ϟ</i>
          <span className="text-xs text-on-surface-variant">Rate updates</span>
          <strong className="mt-1 block text-2xl">{rates.length}</strong>
          <small className="mt-2 block text-[10px] text-on-surface-variant/70">Current backend records</small>
        </article>
      </section>

      <section className="mb-8">
        <div className="mb-4">
          <span className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">Transaction activity</span>
          <h3 className="mt-1 text-lg">Trade volume by period</h3>
        </div>
        <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[650px]:grid-cols-1">
          {[
            ["Today’s transactions", tradePeriodSummary.todayCount, tradePeriodSummary.todayValue, "today"],
            ["This week’s transactions", tradePeriodSummary.weekCount, tradePeriodSummary.weekValue, "this week"],
            ["This month’s transactions", tradePeriodSummary.monthCount, tradePeriodSummary.monthValue, "this month"],
            ["This year’s transactions", tradePeriodSummary.yearCount, tradePeriodSummary.yearValue, "this year"],
          ].map(([label, count, value, period]) => (
            <article key={label} className="rounded-2xl border border-white/[.07] bg-surface-container-low p-5">
              <span className="text-xs text-on-surface-variant">{label}</span>
              <div className="mt-3 flex items-end justify-between gap-4">
                <strong className="text-3xl">{tradeLoading ? "—" : Number(count || 0).toLocaleString("en-NG")}</strong>
                <strong className="text-sm text-primary">{tradeLoading ? "—" : `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</strong>
              </div>
              <small className="mt-2 block text-[10px] text-on-surface-variant/70">Submitted trades and estimated payout {period}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
