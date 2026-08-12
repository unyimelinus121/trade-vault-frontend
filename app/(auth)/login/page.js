"use client";

import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import Link from "next/link";
import { useState } from "react";

const inputClass =
  "h-12 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/55 px-4 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { loginForm, handleLogin, login, loading, error, message } =
    usePublicAuth();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-x-hidden px-6 py-24">
      <section className="stitch-panel relative w-full max-w-[470px] rounded-3xl p-9 max-[520px]:p-6">
        <span className="mb-3 block text-xs font-extrabold tracking-[.16em] text-primary">
          WELCOME BACK
        </span>

        <h1 className="text-[clamp(34px,5vw,46px)] leading-tight tracking-[-.04em] text-on-surface">
          Log in to TradeVault.
        </h1>

        <p className="mt-3 text-sm text-on-surface-variant">
          Access your account and continue managing your trades.
        </p>

        <form onSubmit={login} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-on-surface">
              Email address
            </span>

            <input
              className={inputClass}
              type="email"
              name="email"
              value={loginForm.email}
              onChange={handleLogin}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-on-surface">
              <span>Password</span>
              <Link href="/forgot-password" className="font-semibold text-primary hover:text-on-surface">
                Forgot password?
              </Link>
            </span>

            <div className="relative">
              <input
                className={`${inputClass} pr-12`}
                type={showPassword ? "text" : "password"}
                name="password"
                value={loginForm.password}
                onChange={handleLogin}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-on-surface-variant transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-200"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-on-primary shadow-[0_12px_28px_rgba(57,232,121,.12)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          New to TradeVault?{" "}
          <Link
            className="font-bold text-primary hover:text-on-surface"
            href="/registration"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
