"use client";

import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const inputClass =
  "h-12 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/55 px-4 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

export default function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    registerForm,
    register,
    handleImage,
    removeImage,
    imagePreview,
    startRegistration,
    loading,
    error,
    message,
  } = usePublicAuth();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-x-hidden px-6 py-24">
      <section className="stitch-panel relative w-full max-w-[560px] rounded-3xl p-9 max-[520px]:p-6">
        <span className="mb-3 block text-xs font-extrabold tracking-[.16em] text-primary">
          JOIN TRADEVAULT
        </span>

        <h1 className="text-[clamp(34px,5vw,46px)] leading-tight tracking-[-.04em] text-on-surface">
          Create your account.
        </h1>

        <p className="mt-3 text-sm text-on-surface-variant">
          Set up your profile and get ready to trade with confidence.
        </p>

        <form
          onSubmit={startRegistration}
          className="mt-8 space-y-5"
          encType="multipart/form-data"
        >
          <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[#dfe9e1]">
                First name
              </span>

              <input
                className={inputClass}
                type="text"
                name="firstName"
                value={registerForm.firstName}
                onChange={register}
                placeholder="First name"
                autoComplete="given-name"
                maxLength={80}
                disabled={loading}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[#dfe9e1]">
                Last name
              </span>

              <input
                className={inputClass}
                type="text"
                name="lastName"
                value={registerForm.lastName}
                onChange={register}
                placeholder="Last name"
                autoComplete="family-name"
                maxLength={80}
                disabled={loading}
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#dfe9e1]">
              Email address
            </span>

            <input
              className={inputClass}
              type="email"
              name="email"
              value={registerForm.email}
              onChange={register}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              disabled={loading}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#dfe9e1]">
              Password
            </span>

            <div className="relative">
              <input
                className={`${inputClass} pr-12`}
                type={showPassword ? "text" : "password"}
                name="password"
                value={registerForm.password}
                onChange={register}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
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

            <span className="mt-2 block text-xs text-[#7f9283]">
              Your password must contain at least 8 characters.
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#dfe9e1]">
              Referral code <span className="font-normal text-[#7f9283]">(optional)</span>
            </span>
            <input
              className={`${inputClass} uppercase`}
              type="text"
              name="referralCode"
              value={registerForm.referralCode}
              onChange={register}
              placeholder="TVXXXXXXXXXXXXXX"
              autoComplete="off"
              maxLength={16}
              disabled={loading}
            />
            <span className="mt-2 block text-xs text-[#7f9283]">Use a valid code to receive an extra ₦2,000 referral bonus.</span>
          </label>

          <div>
            <span className="mb-2 block text-xs font-bold text-[#dfe9e1]">
              Profile image
            </span>

            <div className="rounded-xl border border-dashed border-white/15 bg-[#071f13] p-4">
              <div className="flex items-center gap-4">
                <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#0a2c1a] text-xl font-extrabold text-[#70e99e]">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Selected profile preview"
                      fill
                      sizes="64px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <>{registerForm.firstName?.charAt(0).toUpperCase()}</>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <label
                    className={`inline-flex cursor-pointer items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/15 ${
                      loading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    Choose image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImage}
                      disabled={loading}
                      className="sr-only"
                    />
                  </label>

                  <p className="mt-2 text-xs text-[#7f9283]">
                    JPG, PNG, or WEBP. Maximum size: 5MB.
                  </p>
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={loading}
                    className="text-xs font-bold text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

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
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link
            className="font-bold text-primary hover:text-on-surface"
            href="/login"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
