"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";

const inputClass =
  "h-12 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/55 px-4 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminPortal = searchParams.get("portal") === "admin";
  const loginPath = adminPortal ? "/admin/login" : "/login";
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const { requestPasswordReset, verifyPasswordResetCode, loading, error, message } = usePublicAuth();

  async function submit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!codeSent) {
      const sent = await requestPasswordReset(normalizedEmail);
      if (sent) setCodeSent(true);
      return;
    }

    const result = await verifyPasswordResetCode({
      email: normalizedEmail,
      code,
    });
    if (result?.resetToken) {
      router.push(`/reset-password?token=${encodeURIComponent(result.resetToken)}${adminPortal ? "&portal=admin" : ""}`);
    }
  }

  async function resendCode() {
    setCode("");
    await requestPasswordReset(email.trim().toLowerCase());
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-x-hidden px-6 py-24">
      <section className="stitch-panel relative w-full max-w-[480px] rounded-3xl p-9 max-[520px]:p-6">
        <span className="mb-3 block text-xs font-extrabold tracking-[.16em] text-primary">
          {adminPortal ? "ADMIN ACCOUNT RECOVERY" : "ACCOUNT RECOVERY"}
        </span>
        <h1 className="text-[clamp(34px,5vw,46px)] leading-tight tracking-[-.04em] text-on-surface">
          Reset your password.
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          {codeSent
            ? `Enter the six-digit code sent to ${email}.`
            : adminPortal
              ? "Enter the Gmail connected to your authorized administrator account."
              : "Enter the Gmail connected to your TradeVault customer account."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-on-surface">Email address</span>
            <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@gmail.com" autoComplete="email" disabled={loading || codeSent} required />
          </label>

          {codeSent && (
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-on-surface">Verification code</span>
              <input className={`${inputClass} text-center text-xl font-bold tracking-[.35em]`} type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" autoComplete="one-time-code" disabled={loading} required />
            </label>
          )}

          {error && <div role="alert" className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}
          {message && <div role="status" className="rounded-xl border border-tertiary/20 bg-tertiary/10 px-4 py-3 text-sm text-tertiary">{message}</div>}

          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-on-primary shadow-[0_12px_28px_rgba(57,232,121,.12)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? (codeSent ? "Verifying code…" : "Sending code…") : (codeSent ? "Verify code" : "Send verification code")}
          </button>

          {codeSent && <div className="flex items-center justify-center gap-4 text-xs font-bold"><button type="button" onClick={resendCode} disabled={loading} className="text-primary hover:text-white disabled:opacity-50">Resend code</button><span className="text-outline-variant">•</span><button type="button" onClick={() => { setCodeSent(false); setCode(""); }} disabled={loading} className="text-on-surface-variant hover:text-primary disabled:opacity-50">Use a different email</button></div>}
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Remembered your password? <Link href={loginPath} className="font-bold text-primary hover:text-on-surface">Return to {adminPortal ? "admin login" : "login"}</Link>
        </p>
      </section>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center"><span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" aria-label="Loading password recovery" /></main>}><ForgotPasswordForm /></Suspense>;
}
