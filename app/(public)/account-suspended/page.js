"use client";

import Image from "next/image";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";

export default function AccountSuspendedPage() {
  const { user, logout, logoutLoading } = usePublicAuth();

  return (
    <main className="stitch-glow grid min-h-screen place-items-center bg-background px-5 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-error/20 bg-surface-container-low p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,.45)] max-[520px]:p-6" role="alert" aria-live="assertive">
        <Image src="/tradevault-logo.svg" alt="TradeVault" width={560} height={150} priority className="mx-auto h-auto w-[170px]" />
        <span className="material-symbols-outlined mx-auto mt-10 grid h-20 w-20 place-items-center rounded-full border border-error/25 bg-error/10 text-4xl text-error">person_off</span>
        <span className="mt-7 block text-[10px] font-extrabold uppercase tracking-[.18em] text-error">Account access restricted</span>
        <h1 className="mt-3 text-[clamp(2rem,7vw,3.3rem)] leading-tight tracking-[-.045em]">You are currently suspended.</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-on-surface-variant">Wait to be verified and get access back in. You cannot use your wallet, trades, live chat, or other account features while this suspension remains active.</p>
        {user?.email && <p className="mt-5 text-xs text-on-surface-variant/70">Signed in as <strong className="text-on-surface">{user.email}</strong></p>}
        <button type="button" onClick={logout} disabled={logoutLoading} className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-error px-6 text-sm font-extrabold text-[#4c0007] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
          <span className="material-symbols-outlined text-lg">logout</span>
          {logoutLoading ? "Logging out…" : "Log out"}
        </button>
        <p className="mt-4 text-[10px] leading-5 text-on-surface-variant/60">After logging out, you will return to the TradeVault home page.</p>
      </section>
    </main>
  );
}
