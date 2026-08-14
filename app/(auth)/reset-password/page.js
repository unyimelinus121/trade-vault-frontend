"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";

const inputClass =
  "h-12 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/55 px-4 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const adminPortal = searchParams.get("portal") === "admin";
  const originatingLoginPath = adminPortal ? "/manager/login" : "/login";
  const recoveryPath = adminPortal ? "/forgot-password?portal=admin" : "/forgot-password";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [localError, setLocalError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loginPath, setLoginPath] = useState("/login");
  const { completePasswordReset, loading, error, message } = usePublicAuth();

  async function submit(event) {
    event.preventDefault();
    setLocalError("");
    if (!resetToken) {
      setLocalError("This reset link is missing its secure token. Request a new password reset email.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Your new password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setLocalError("The passwords do not match.");
      return;
    }
    const result = await completePasswordReset({ resetToken, password });
    if (result) {
      setLoginPath(adminPortal ? "/manager/login" : result.loginPath || "/login");
      setCompleted(true);
      setPassword("");
      setConfirmation("");
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-x-hidden px-6 py-24">
      <section className="stitch-panel relative w-full max-w-[480px] rounded-3xl p-9 max-[520px]:p-6">
        <span className="mb-3 block text-xs font-extrabold tracking-[.16em] text-primary">{adminPortal ? "SECURE ADMIN PASSWORD RESET" : "SECURE PASSWORD RESET"}</span>
        <h1 className="text-[clamp(34px,5vw,46px)] leading-tight tracking-[-.04em] text-on-surface">Choose a new password.</h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">Your reset link is single-use. Completing this form signs out existing sessions for this account.</p>

        {!completed ? (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block"><span className="mb-2 block text-xs font-bold text-on-surface">New password</span><input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete="new-password" disabled={loading} required /></label>
            <label className="block"><span className="mb-2 block text-xs font-bold text-on-surface">Confirm new password</span><input className={inputClass} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Enter it again" autoComplete="new-password" disabled={loading} required /></label>
            {(localError || error) && <div role="alert" className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">{localError || error}</div>}
            <button type="submit" disabled={loading || !resetToken} className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-on-primary shadow-[0_12px_28px_rgba(57,232,121,.12)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating password…" : "Update password"}</button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-tertiary/20 bg-tertiary/10 p-5 text-sm leading-6 text-tertiary" role="status">{message || "Password reset successfully."}</div>
        )}

        <p className="mt-6 text-center text-sm text-on-surface-variant"><Link href={completed ? loginPath : resetToken ? originatingLoginPath : recoveryPath} className="font-bold text-primary hover:text-on-surface">{completed ? `Continue to ${loginPath === "/manager/login" ? "admin login" : "login"}` : resetToken ? `Back to ${adminPortal ? "admin login" : "login"}` : "Request a new code"}</Link></p>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center"><span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" aria-label="Loading password reset" /></main>}><ResetPasswordForm /></Suspense>;
}
