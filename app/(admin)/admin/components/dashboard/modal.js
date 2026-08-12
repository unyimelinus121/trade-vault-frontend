"use client";

import { useAdmin } from "../../../../providers/adminProvider/admin";

const inputClass =
  "h-11 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/50 px-3.5 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10";
const labelClass =
  "mb-2 block text-[11px] font-bold tracking-[.04em] text-[#9db0a1]";

export default function Modal() {
  const {
    rateForm,
    imagePreview,
    submitting,
    rateActionError,
    rateMessage,
    handleChange,
    handleImageChange,
    clearRateForm,
    addRate,
  } = useAdmin();

  return (
    <aside className="stitch-panel sticky top-[88px] max-h-[calc(100vh-112px)] overflow-y-auto rounded-2xl max-[1200px]:static max-[1200px]:max-h-none">
      <div className="border-b border-white/[.07] bg-gradient-to-r from-surface-container-high to-surface-container p-5">
        <span className="mb-1 block text-[10px] font-extrabold tracking-[.14em] text-primary">
          NEW INVENTORY
        </span>
        <h2 className="text-lg font-bold">Add a card</h2>
        <p className="mt-1 text-[11px] text-[#8b9d8f]">
          Enter the card details for the marketplace.
        </p>
      </div>

      <form onSubmit={addRate} className="space-y-4 p-5">
        {(rateActionError || rateMessage) && (
          <div
            className={`rounded-xl border px-4 py-3 text-xs ${
              rateActionError
                ? "border-error/20 bg-error/[.06] text-error"
                : "border-tertiary/20 bg-tertiary/[.06] text-tertiary"
            }`}
            role={rateActionError ? "alert" : "status"}
          >
            {rateActionError || rateMessage}
          </div>
        )}

        <div>
          <span className={labelClass}>CARD IMAGE *</span>
          <label className="block cursor-pointer rounded-xl border border-dashed border-white/[.12] bg-[#0a150d] p-4 transition hover:border-[#22c96a]/50">
            <input
              type="file"
              name="card_picture"
              accept="image/*"
              onChange={handleImageChange}
              disabled={submitting}
              className="hidden"
              required={!rateForm.image}
            />

            {imagePreview ? (
              // Blob previews are local browser URLs.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Selected card preview"
                className="h-44 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="grid min-h-36 place-items-center text-center">
                <div>
                  <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#22c96a]/10 text-xl text-[#67e99a]">
                    +
                  </span>
                  <strong className="block text-xs text-white">
                    Select card image
                  </strong>
                  <span className="mt-1 block text-[10px] text-[#6e8173]">
                    PNG, JPG or WEBP
                  </span>
                </div>
              </div>
            )}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className={labelClass}>COUNTRY *</span>
            <select
              className={inputClass}
              name="country"
              value={rateForm.country}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="">Select country</option>

              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Europe">Europe</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>CATEGORY *</span>
            <select
              className={inputClass}
              name="category"
              value={rateForm.category}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="">Select category</option>
              <option value="Physical">Physical</option>
              <option value="E-card">E-card</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>CARD NAME *</span>
          <input
            className={inputClass}
            name="cardName"
            value={rateForm.cardName}
            onChange={handleChange}
            disabled={submitting}
            placeholder="e.g. Amazon"
            required
          />
        </label>

        <label className="block">
          <span className={labelClass}>CARD RATE IN NAIRA *</span>
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-[#7f9283]">
              ₦
            </span>
            <input
              className={`${inputClass} pr-11 pl-8`}
              type="number"
              name="cardRate"
              value={rateForm.cardRate}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g. 1500"
              min="0"
              step="0.01"
              required
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-[#7f9283]">
              /$
            </span>
          </div>
        </label>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={clearRateForm}
            disabled={submitting}
            className="h-11 flex-1 rounded-xl border border-white/8 bg-white/[.035] text-xs font-bold text-[#9db0a1] transition hover:bg-white/[.07]"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 flex-[1.6] rounded-xl bg-primary text-xs font-extrabold text-on-primary shadow-[0_12px_28px_rgba(57,232,121,.12)] transition hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? "Adding card…" : "Add card"}
          </button>
        </div>
      </form>
    </aside>
  );
}
