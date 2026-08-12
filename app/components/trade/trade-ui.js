import Link from "next/link";

export function formatNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatTradeDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TradeStatusBadge({ status }) {
  const variants = {
    pending: {
      icon: "schedule",
      styles: "border-[#b5eb7e]/20 bg-[#b5eb7e]/10 text-[#c8f39e]",
    },
    processing: {
      icon: "sync",
      styles: "border-secondary/20 bg-secondary/10 text-secondary",
    },
    successful: {
      icon: "check_circle",
      styles: "border-primary/20 bg-primary/10 text-primary",
    },
    rejected: {
      icon: "cancel",
      styles: "border-error/20 bg-error/10 text-error",
    },
  };
  const variant = variants[status] || variants.pending;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${variant.styles}`}><span className="material-symbols-outlined text-[14px]">{variant.icon}</span>{status || "pending"}</span>;
}

export function SectionHeader({ eyebrow, title, text, action, centered = false }) {
  return <header className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
    {eyebrow && <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-primary"><i className="h-px w-6 bg-primary" />{eyebrow}</span>}
    <h2 className="mt-4 text-[clamp(2rem,4vw,3.5rem)] leading-[1.02] tracking-[-.045em]">{title}</h2>
    {text && <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant">{text}</p>}
    {action && <div className="mt-6">{action}</div>}
  </header>;
}

export function PageHeader({ eyebrow, title, text, action }) {
  return <header className="flex items-end justify-between gap-8 border-b border-outline-variant/55 pb-8 max-[760px]:flex-col max-[760px]:items-start">
    <div className="max-w-3xl">
      {eyebrow && <span className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</span>}
      <h1 className="mt-3 text-[clamp(2.35rem,4.3vw,4rem)] leading-[1] tracking-[-.05em]">{title}</h1>
      {text && <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant">{text}</p>}
    </div>
    {action && <div className="shrink-0 max-[480px]:w-full max-[480px]:[&>*]:w-full">{action}</div>}
  </header>;
}

export function TradeStat({ label, value, icon, tone = "neutral" }) {
  const tones = {
    neutral: "text-on-surface",
    pending: "text-[#c8f39e]",
    processing: "text-secondary",
    successful: "text-primary",
    rejected: "text-error",
  };
  return <article className="border-l border-outline-variant/70 px-5 first:border-l-0 first:pl-0 max-[620px]:border-l-0 max-[620px]:border-t max-[620px]:px-0 max-[620px]:pt-4 max-[620px]:first:border-t-0 max-[620px]:first:pt-0">
    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.1em] text-on-surface-variant"><span className="material-symbols-outlined text-base">{icon}</span>{label}</div>
    <strong className={`mt-2 block font-display text-3xl tracking-[-.04em] ${tones[tone]}`}>{value}</strong>
  </article>;
}

export function LoginRequired({ title = "Log in to continue", text }) {
  return <main className="stitch-glow grid min-h-[calc(100vh-5rem)] place-items-center px-6"><section className="w-full max-w-lg border border-outline-variant bg-surface-container p-10 text-center shadow-2xl"><span className="material-symbols-outlined text-4xl text-primary">lock</span><h1 className="mt-5 text-4xl tracking-[-.04em]">{title}</h1><p className="mt-3 text-sm leading-6 text-on-surface-variant">{text || "This information is private to your TradeVault account."}</p><Link href="/login" className="mt-7 inline-flex rounded-lg bg-primary px-7 py-3 text-sm font-bold text-on-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">Log In</Link></section></main>;
}

export function PageLoader() {
  return <main className="grid min-h-[calc(100vh-5rem)] place-items-center"><span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" /></main>;
}
