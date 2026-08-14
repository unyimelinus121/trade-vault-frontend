"use client";

import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import Link from "next/link";

const inputClass = "h-12 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/55 px-4 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

export default function ManagerLoginPage() {
  const { loginForm, handleLogin, adminLogin, loading, error, message } = usePublicAuth();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-x-hidden px-6 py-24">
      <section className="stitch-panel relative w-full max-w-[470px] rounded-3xl border-primary/15 p-9 shadow-[0_28px_80px_rgba(0,0,0,.48)] max-[520px]:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="text-xs font-extrabold tracking-[.18em] text-primary">ADMIN PORTAL</span>
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><span className="material-symbols-outlined">shield_lock</span></span>
        </div>

        <h1 className="text-[clamp(32px,5vw,44px)] leading-tight tracking-[-.04em] text-on-surface">Welcome back, Administrator.</h1>
        <p className="mt-3 text-sm text-on-surface-variant">Sign in with an authorized administrator account to manage TradeVault.</p>

        <form onSubmit={adminLogin} className="mt-8 space-y-5">
          <label className="block"><span className="mb-2 block text-xs font-bold text-on-surface">Email address</span><input className={inputClass} type="email" name="email" value={loginForm.email} onChange={handleLogin} placeholder="admin@tradevault.com" autoComplete="email" disabled={loading} required /></label>
          <label className="block"><span className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-on-surface"><span>Password</span><Link href="/forgot-password?portal=admin" className="font-semibold text-primary hover:text-white">Forgot password?</Link></span><input className={inputClass} type="password" name="password" value={loginForm.password} onChange={handleLogin} placeholder="Enter your password" autoComplete="current-password" disabled={loading} required /></label>

          {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          {message && <div role="status" className="rounded-xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">{message}</div>}

          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-on-primary shadow-[0_12px_28px_rgba(57,232,121,.12)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
            <span className="material-symbols-outlined text-lg">login</span>{loading ? "Signing in…" : "Sign in to Admin Panel"}
          </button>
        </form>

        <p className="mt-6 border-t border-white/[.06] pt-5 text-center text-[11px] leading-5 text-on-surface-variant">Restricted access. Administrative activity is protected and authenticated.</p>
      </section>
    </main>
  );
}
