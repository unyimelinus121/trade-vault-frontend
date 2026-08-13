"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiOrigin } from "@/app/api/api";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useTrade } from "@/app/providers/tradeProvider/trade";
import { navigation } from "../datasources/site-data";

function UserAvatar({ user, avatarUrl, mobile = false }) {
  const initial = user?.firstName?.charAt(0).toUpperCase() || "U";

  return (
    <Link
      href="/account"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-bold text-on-primary ring-1 ring-white/10 ${mobile ? "h-9 w-9 text-xs" : "h-8 w-8 text-xs"}`}
      aria-label={`${user?.firstName || "User"} account`}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt={`${user?.firstName || "User"} profile`} width={40} height={40} unoptimized className="h-full w-full object-cover" />
      ) : initial}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, token } = usePublicAuth();
  const { wallet, walletLoading, unreadNotifications } = useTrade();
  const isLoggedIn = Boolean(user && token);
  const avatarUrl = user?.avatar ? `${apiOrigin}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}` : "";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/[.045] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-8 max-[720px]:px-5">
          <Link href="/" className="inline-flex items-center" aria-label="TradeVault home">
            <Image src="/tradevault-logo.svg" alt="TradeVault" width={560} height={150} priority className="h-auto w-[166px] max-[720px]:w-[148px]" />
          </Link>

          <nav className="flex items-center gap-8 max-[1100px]:gap-4 max-[900px]:hidden" aria-label="Main navigation">
            {navigation.map((item) => {
              const active = item.href === pathname;
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`text-sm font-medium transition-colors ${active ? "font-bold text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 max-[900px]:hidden">
            {isLoggedIn ? (
              <>
                {user.role === "user" && (
                  <>
                    <Link href="/trade-history" className="text-xs font-semibold text-on-surface-variant transition hover:text-primary">My trades</Link>
                    <Link href="/wallet" className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
                      {walletLoading ? "Wallet…" : `₦${Number(wallet?.balance || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`}
                    </Link>
                    <Link href="/notifications" className="relative grid h-9 w-9 place-items-center rounded-full bg-surface-container-high text-on-surface-variant" aria-label="Notifications">
                      <span className="material-symbols-outlined text-lg">notifications</span>
                      {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[8px] font-black text-on-primary">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}
                    </Link>
                  </>
                )}
                <UserAvatar user={user} avatarUrl={avatarUrl} />
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface">Log In</Link>
                <Link href="/registration" className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-transform hover:scale-[1.02]">Sign Up</Link>
              </>
            )}
          </div>

          {isLoggedIn ? (
            <span className="hidden items-center gap-2 max-[900px]:flex">
              {user.role === "user" && <Link href="/notifications" className="relative grid h-9 w-9 place-items-center rounded-full bg-surface-container-high" aria-label="Notifications"><span className="material-symbols-outlined text-lg">notifications</span>{unreadNotifications > 0 && <i className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary" />}</Link>}
              <UserAvatar user={user} avatarUrl={avatarUrl} mobile />
            </span>
          ) : (
            <Link href="/login" className="hidden h-11 w-11 place-items-center rounded-full bg-primary text-on-primary max-[900px]:grid" aria-label="Log in">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
              </svg>
            </Link>
          )}
        </div>
      </header>

      <nav className="mobile-safe-nav fixed right-3 left-3 z-[60] hidden grid-cols-5 rounded-2xl border border-white/10 bg-surface-container/95 p-2 shadow-2xl backdrop-blur-xl max-[900px]:grid" aria-label="Mobile navigation">
        {navigation.map((item) => {
          const active = item.href === pathname;
          return <Link key={item.href} href={item.href} className={`grid min-h-11 place-items-center rounded-xl px-1 text-center text-[10px] font-semibold ${active ? "bg-primary-container text-white" : "text-on-surface-variant"}`}>{item.href === "/how-it-works" ? "How" : item.label}</Link>;
        })}
      </nav>
    </>
  );
}
