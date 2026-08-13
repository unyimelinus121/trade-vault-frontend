"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "@/app/providers/chatProvider/chat";
import { useAdmin } from "@/app/providers/adminProvider/admin";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/admin/dashboard" },
  { label: "Trades", icon: "receipt_long", href: "/admin/trades" },
  { label: "Users", icon: "group", href: "/admin/users" },
  { label: "Withdrawals", icon: "payments", href: "/admin/payments" },
  { label: "Live Chat", icon: "forum", href: "/admin/chat" },
];

const supportItems = [
  { label: "Settings", icon: "settings", href: "/admin/settings" },
  { label: "Support", icon: "support_agent", href: "/admin/support" },
];

const mobileNavItems = [...navItems, supportItems[1]];

function NavItem({ item, mobile = false }) {
  const pathname = usePathname();
  const { unreadCount } = useChat();
  const { tradeUnreadCount, withdrawalUnreadCount } = useAdmin();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const badge = item.href === "/admin/chat" && unreadCount > 0
    ? (unreadCount > 99 ? "99+" : String(unreadCount))
    : item.href === "/admin/trades" && tradeUnreadCount > 0
      ? (tradeUnreadCount > 99 ? "99+" : String(tradeUnreadCount))
      : item.href === "/admin/payments" && withdrawalUnreadCount > 0
        ? (withdrawalUnreadCount > 99 ? "99+" : String(withdrawalUnreadCount))
      : item.badge;

  if (mobile) {
    return <Link href={item.href} className={`relative grid min-h-12 min-w-0 place-items-center gap-1 rounded-xl px-1 py-2 text-center text-[9px] ${active ? "bg-primary-container text-white" : "text-on-surface-variant"}`}><span className="material-symbols-outlined text-lg">{item.icon}</span><span className="max-w-full truncate">{item.label}</span>{badge && <span className="absolute top-0.5 right-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[7px] font-extrabold text-[#520007]">{badge}</span>}</Link>;
  }

  return (
    <Link href={item.href} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-primary-container text-white" : "text-on-surface-variant hover:bg-white/[.04] hover:text-on-surface"}`}>
      <span className="material-symbols-outlined text-xl">{item.icon}</span><span className="flex-1">{item.label}</span>{badge && <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/10" : "bg-error/10 text-error"}`}>{badge}</span>}
    </Link>
  );
}

export function AdminDesktopNavigation() {
  return <><p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-on-surface-variant/55">Operations</p><nav className="space-y-1" aria-label="Admin navigation">{navItems.map((item) => <NavItem item={item} key={item.label} />)}</nav><p className="mt-8 px-3 pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-on-surface-variant/55">System</p><nav className="space-y-1" aria-label="Admin support">{supportItems.map((item) => <NavItem item={item} key={item.label} />)}</nav></>;
}

export function AdminMobileNavigation() {
  return <nav className="mobile-safe-nav fixed right-3 left-3 z-50 hidden grid-cols-6 rounded-2xl border border-white/10 bg-surface-container/95 p-2 shadow-2xl backdrop-blur-xl max-[1024px]:grid">{mobileNavItems.map((item) => <NavItem item={item} mobile key={item.label} />)}</nav>;
}

export function AdminPageIdentity() {
  const pathname = usePathname();
  const current = [...navItems, ...supportItems].find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  ) || navItems[0];
  return <div><span className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">Operations Console</span><h1 className="text-sm font-semibold text-on-surface">{current.label}</h1></div>;
}
