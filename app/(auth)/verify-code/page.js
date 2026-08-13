"use client";

import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";

export default function VerifyCodePage() {
  const {
    verificationCode,
    handleVerificationCode,
    verifyRegistrationCode,
    resendVerificationCode,
    resendLoading,
    resendCooldown,
    loading,
    error,
    message,
  } = usePublicAuth();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-x-hidden px-6 py-24">
      <section className="stitch-panel relative w-full max-w-[500px] rounded-3xl p-9 max-[520px]:p-6">
        <span className="mb-3 block text-xs font-extrabold tracking-[.16em] text-primary">
          VERIFY YOUR ACCOUNT
        </span>

        <h1 className="text-[clamp(34px,5vw,46px)] leading-tight tracking-[-.04em] text-on-surface">
          Enter your code.
        </h1>

        <p className="mt-3 text-sm text-on-surface-variant">
          We sent a verification code to your email address.
        </p>

        <form onSubmit={verifyRegistrationCode} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#dfe9e1]">
              Verification code
            </span>

            <input
              type="text"
              name="verificationCode"
              value={verificationCode}
              onChange={handleVerificationCode}
              placeholder="Enter verification code"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={loading}
              required
              className="h-14 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/55 px-4 text-center text-2xl font-bold tracking-[.4em] text-on-surface outline-none placeholder:text-sm placeholder:tracking-normal placeholder:text-on-surface-variant/50 focus:border-primary/60"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className="h-12 w-full rounded-xl bg-primary text-sm font-extrabold text-on-primary shadow-[0_12px_28px_rgba(57,232,121,.12)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify account"}
          </button>

          <div className="border-t border-white/[.07] pt-5 text-center">
            <p className="text-xs text-on-surface-variant">Code invalid, expired, or not received?</p>
            <button
              type="button"
              onClick={resendVerificationCode}
              disabled={loading || resendLoading || resendCooldown > 0}
              className="mt-3 min-h-11 rounded-xl border border-primary/25 px-5 text-sm font-bold text-primary transition hover:bg-primary/[.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendLoading ? "Sending new code…" : resendCooldown > 0 ? `Request another code in ${resendCooldown}s` : "Request a new code"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
