"use client";

import Image from "next/image";
import Link from "next/link";
import { apiOrigin } from "@/app/api/api";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useTrade } from "@/app/providers/tradeProvider/trade";

const workspaceLinks = [
  { label: "Overview", icon: "grid_view", href: "/" },
  { label: "Trade Gift Cards", icon: "swap_horiz", href: "/trade" },
  { label: "Trade History", icon: "receipt_long", href: "/trade-history" },
  { label: "Wallet", icon: "account_balance_wallet", href: "/wallet" },
  { label: "Account Settings", icon: "manage_accounts", href: "/account" },
  { label: "Support", icon: "support_agent", href: "/support" },
];

function Avatar({ user, avatarUrl, size = "large" }) {
  const initial = user.firstName?.charAt(0).toUpperCase() || "U";
  const dimensions = size === "large" ? "h-20 w-20 text-2xl" : "h-10 w-10 text-sm";
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-bold text-on-primary ring-1 ring-white/10 ${dimensions}`}>
      {avatarUrl ? <Image src={avatarUrl} alt={`${user.firstName} profile`} width={80} height={80} unoptimized className="h-full w-full object-cover" /> : initial}
    </span>
  );
}

export default function AccountPage() {
  const { user, token, authReady, logout, logoutLoading } = usePublicAuth();
  const { wallet, walletLoading, unreadNotifications } = useTrade();

  if (!authReady) {
    return <main className="grid min-h-screen place-items-center bg-background"><span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" /></main>;
  }

  if (!user || !token) {
    return (
      <main className="stitch-glow grid min-h-screen place-items-center px-6">
        <section className="stitch-panel w-full max-w-lg rounded-3xl p-10 text-center"><span className="material-symbols-outlined text-4xl text-primary">lock</span><h1 className="mt-5 text-4xl tracking-[-.04em]">Log in to view your account.</h1><p className="mt-3 text-sm text-on-surface-variant">Your personal workspace is available after you log in.</p><Link href="/login" className="mt-7 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-bold text-on-primary">Log In</Link></section>
      </main>
    );
  }

  const avatarUrl = user.avatar ? `${apiOrigin}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}` : "";
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "Not available";

  return (
    <div className="min-h-screen bg-background text-on-background">
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant/10 bg-surface-container-low max-[900px]:hidden">
        <Link href="/" className="flex h-20 items-center px-7" aria-label="TradeVault home"><Image src="/tradevault-logo.svg" alt="TradeVault" width={560} height={150} priority className="h-auto w-[166px]" /></Link>
        <nav className="flex-1 space-y-1 px-4 pt-4" aria-label="Customer workspace">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-on-surface-variant/60">Workspace</p>
          {workspaceLinks.map((item) => <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${item.href === "/account" ? "bg-primary-container text-white shadow-[0_0_15px_rgba(17,152,75,.3)]" : "text-on-surface-variant hover:bg-white/[.04] hover:text-on-surface"}`}><span className="material-symbols-outlined text-xl">{item.icon}</span>{item.label}</Link>)}
        </nav>
        <div className="m-4 border-t border-outline-variant/20 pt-4">
          <div className="flex items-center gap-3 rounded-xl p-2"><Avatar user={user} avatarUrl={avatarUrl} size="small" /><div className="min-w-0"><strong className="block truncate text-xs">{user.firstName} {user.lastName}</strong><span className="block truncate text-[10px] text-on-surface-variant">{user.email}</span></div></div>
        </div>
      </aside>

      <header className="fixed top-0 right-0 left-72 z-40 flex h-20 items-center justify-between border-b border-outline-variant/10 bg-surface/60 px-8 backdrop-blur-xl max-[900px]:left-0 max-[600px]:px-4">
        <div className="flex items-center gap-3"><Link href="/" className="hidden max-[900px]:block"><Image src="/tradevault-mark.svg" alt="TradeVault" width={136} height={146} className="h-9 w-auto" /></Link><div><span className="text-[10px] font-bold uppercase tracking-[.14em] text-on-surface-variant">Personal workspace</span><h1 className="text-base font-semibold">Account Settings</h1></div></div>
        <div className="flex items-center gap-3"><Link href="/notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-surface-container-high text-on-surface-variant" aria-label="Notifications"><span className="material-symbols-outlined">notifications</span>{unreadNotifications > 0 && <i className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary" />}</Link><Avatar user={user} avatarUrl={avatarUrl} size="small" /></div>
      </header>

      <main className="min-h-screen pl-72 pt-20 max-[900px]:pl-0">
        <div className="mx-auto w-full max-w-6xl px-8 py-12 max-[600px]:px-4">
          <header className="mb-10 flex items-end justify-between gap-6 max-[700px]:flex-col max-[700px]:items-start">
            <div><span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-primary">Your profile</span><h2 className="text-[clamp(2rem,4vw,3rem)] tracking-[-.04em]">Account Settings</h2><p className="mt-2 text-sm text-on-surface-variant">Manage your profile, security, and TradeVault preferences.</p></div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${user.isVerified ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"}`}>{user.isVerified ? "Verified account" : "Verification pending"}</span>
          </header>

          <section className="stitch-panel mb-6 rounded-2xl p-7 max-[520px]:p-5">
            <div className="flex items-center gap-5 max-[520px]:items-start"><Avatar user={user} avatarUrl={avatarUrl} /><div className="min-w-0"><h2 className="break-words text-3xl text-on-surface max-[520px]:text-2xl">{user.firstName} {user.lastName}</h2><p className="mt-1 break-all text-sm text-on-surface-variant">{user.email}</p><p className="mt-3 text-xs text-primary">Member since {createdAt}</p></div></div>
          </section>

          <section className="mb-6 grid grid-cols-[1fr_auto] items-center gap-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-[#124d2c] to-surface-container p-7 max-[600px]:grid-cols-1">
            <div><span className="text-xs font-bold uppercase tracking-[.14em] text-white/60">Available wallet balance</span><strong className="mt-2 block text-4xl text-white">{walletLoading ? "Loading…" : `₦${Number(wallet?.balance || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</strong></div><Link href="/wallet" className="rounded-xl bg-primary px-5 py-3 text-center text-xs font-extrabold text-on-primary">View wallet history</Link>
          </section>

          <div className="grid grid-cols-[1.35fr_.65fr] gap-6 max-[900px]:grid-cols-1">
            <section className="stitch-panel rounded-2xl p-7">
              <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined">person</span></span><div><h3 className="text-lg">Personal information</h3><p className="text-xs text-on-surface-variant">Your registered account details</p></div></div>
              <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                <AccountInformation label="First name" value={user.firstName} />
                <AccountInformation label="Last name" value={user.lastName} />
                <AccountInformation label="Email address" value={user.email} wide />
                <AccountInformation label="Account role" value={user.role} />
                <AccountInformation label="Verification" value={user.isVerified ? "Verified" : "Not verified"} />
                <div className="col-span-2 rounded-xl bg-surface-container-highest/45 px-4 py-4 max-[560px]:col-span-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[.1em] text-on-surface-variant">Your referral code</span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <strong className="break-all font-mono text-base tracking-[.08em] text-primary">{user.referralCode || "Generating…"}</strong>
                    {user.referralCode && <button type="button" onClick={() => navigator.clipboard?.writeText(user.referralCode)} className="rounded-lg border border-primary/20 px-3 py-2 text-[10px] font-bold text-primary">Copy</button>}
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-on-surface-variant">Share this code. You receive ₦3,000 and the new customer receives an extra ₦2,000 after verified registration.</p>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="stitch-panel rounded-2xl p-6"><span className="material-symbols-outlined text-primary">verified_user</span><h3 className="mt-4">Security</h3><p className="mt-2 text-sm leading-6 text-on-surface-variant">Your account is protected by TradeVault authentication and secure sessions.</p></section>
              <section className="rounded-2xl border border-error/15 bg-error/[.035] p-6"><span className="text-xs font-bold uppercase tracking-[.14em] text-error">Session</span><p className="mt-3 text-sm text-on-surface-variant">Sign out securely on this device.</p><button type="button" onClick={logout} disabled={logoutLoading} className="mt-5 h-11 w-full rounded-xl border border-error/25 bg-error/10 text-sm font-bold text-error transition hover:bg-error/15 disabled:opacity-60">{logoutLoading ? "Logging out..." : "Log out"}</button></section>
            </aside>
          </div>
        </div>
      </main>

      <nav className="mobile-safe-nav fixed right-3 left-3 z-[60] hidden grid-cols-6 rounded-2xl border border-white/10 bg-surface-container/95 p-2 shadow-2xl backdrop-blur-xl max-[900px]:grid" aria-label="Customer navigation">
        {workspaceLinks.map((item) => <Link key={item.label} href={item.href} className={`grid place-items-center gap-1 rounded-xl py-2 text-[9px] ${item.href === "/account" ? "bg-primary-container text-white" : "text-on-surface-variant"}`}><span className="material-symbols-outlined text-lg">{item.icon}</span><span>{item.label.split(" ")[0]}</span></Link>)}
      </nav>
    </div>
  );
}

function AccountInformation({ label, value, wide = false }) {
  return <div className={`rounded-xl bg-surface-container-highest/45 px-4 py-4 ${wide ? "col-span-2 max-[560px]:col-span-1" : ""}`}><span className="block text-[10px] font-bold uppercase tracking-[.1em] text-on-surface-variant">{label}</span><strong className="mt-1 block break-words text-sm capitalize text-on-surface">{value || "Not available"}</strong></div>;
}
