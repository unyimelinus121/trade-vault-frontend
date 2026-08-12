"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const destinations = [
  { label: "Dashboard", description: "Operations overview and transaction totals", href: "/admin/dashboard", icon: "dashboard", keywords: "home overview landing" },
  { label: "Trades", description: "Live transactions and submitted gift cards", href: "/admin/trades", icon: "receipt_long", keywords: "trade transaction live card verification pending processing successful rejected" },
  { label: "Users", description: "Customers, profiles, and account access", href: "/admin/users", icon: "group", keywords: "user customer client profile portrait account" },
  { label: "Withdrawals", description: "Payments and withdrawal requests", href: "/admin/payments", icon: "payments", keywords: "withdrawal payment payout bank transfer" },
  { label: "Live Chat", description: "Customer conversations and unread messages", href: "/admin/chat", icon: "forum", keywords: "chat live message conversation inbox" },
  { label: "Support", description: "Support tickets and customer issues", href: "/admin/support", icon: "support_agent", keywords: "help ticket issue complaint" },
  { label: "Settings", description: "Administration settings", href: "/admin/settings", icon: "settings", keywords: "configuration preferences system" },
];

export default function AdminGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return destinations
      .map((item) => {
        const haystack = `${item.label} ${item.description} ${item.keywords}`.toLowerCase();
        return { ...item, score: terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0) };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [query]);

  function navigate(item) {
    if (!item) return;
    setQuery("");
    setFocused(false);
    router.push(item.href);
  }

  return (
    <div className="relative max-[700px]:hidden">
      <label className="relative block">
        <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lg text-on-surface-variant">search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) {
              event.preventDefault();
              navigate(results[0]);
            }
            if (event.key === "Escape") {
              setQuery("");
              setFocused(false);
            }
          }}
          className="h-10 w-64 rounded-xl border border-white/[.07] bg-surface-container/70 pr-3 pl-10 text-xs text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:border-primary/50"
          type="search"
          placeholder="Search trades, chat, users…"
          aria-label="Search admin pages"
        />
      </label>
      {focused && query && (
        <div className="absolute top-12 right-0 z-[100] w-80 overflow-hidden rounded-xl border border-white/10 bg-surface-container-low p-2 shadow-2xl">
          {results.length ? results.map((item) => (
            <button key={item.href} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => navigate(item)} className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-white/[.05] focus:bg-white/[.05]">
              <span className="material-symbols-outlined text-lg text-primary">{item.icon}</span>
              <span className="min-w-0"><strong className="block text-xs">{item.label}</strong><small className="mt-0.5 block truncate text-[9px] text-on-surface-variant">{item.description}</small></span>
            </button>
          )) : <p className="p-4 text-center text-xs text-on-surface-variant">No admin page matches “{query}”.</p>}
        </div>
      )}
    </div>
  );
}
