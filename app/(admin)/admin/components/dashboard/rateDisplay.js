"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../../providers/adminProvider/admin";

const fieldClass =
  "h-11 w-full rounded-xl border border-white/[.08] bg-[#0a150d] px-3.5 text-sm text-white outline-none transition focus:border-[#22c96a]/60 focus:ring-2 focus:ring-[#22c96a]/10 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "mb-2 block text-[11px] font-bold tracking-[.04em] text-[#9db0a1]";

export default function RateDisplay() {
  const {
    rates,
    loading,
    error,
    getRate,
    deleteCard,
    deletingCardId,
    editRate,
    handleEditChange,
    handleEditImageChange,
    startEditingRate,
    closeEditRate,
    updateRate,
    updatingRate,
    rateActionError,
    rateMessage,
    clearRateFeedback,
  } = useAdmin();
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!editRate && !deleteTarget) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [deleteTarget, editRate]);

  const filteredRates = rates.filter((rate) =>
    String(rate.card_name || "")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    const deleted = await deleteCard(deleteTarget.id);
    if (deleted) setDeleteTarget(null);
  }

  function requestDelete(rate) {
    clearRateFeedback();
    setDeleteTarget(rate);
  }

  function cancelDelete() {
    if (deletingCardId) return;
    setDeleteTarget(null);
  }

  return (
    <section
      className="stitch-panel min-w-0 rounded-2xl p-5 max-[600px]:p-3"
      // A backdrop-filter makes fixed descendants use this (very tall) card
      // inventory panel as their containing block. That placed the confirmation
      // dialog far below the viewport while only its blurry overlay was visible.
      style={
        editRate || deleteTarget
          ? { backdropFilter: "none", WebkitBackdropFilter: "none" }
          : undefined
      }
    >
      {editRate && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#020603]/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-rate-title"
        >
          <form
            onSubmit={updateRate}
            className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[.09] bg-surface-container-low shadow-[0_30px_90px_rgba(0,0,0,.55)]"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[.07] p-5">
              <div>
                <span className="text-[10px] font-extrabold tracking-[.14em] text-primary">
                  UPDATE INVENTORY
                </span>
                <h2 id="edit-rate-title" className="mt-1 text-lg font-bold">
                  Edit {editRate.cardName}
                </h2>
                <p className="mt-1 text-[11px] text-[#8b9d8f]">
                  Changes apply to the live marketplace rate immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditRate}
                disabled={updatingRate}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[.05] text-xl text-[#91a395] transition hover:bg-white/[.09] hover:text-white disabled:opacity-50"
                aria-label="Close update form"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {rateActionError && (
                <div className="mb-4 rounded-xl border border-error/20 bg-error/[.06] px-4 py-3 text-xs text-error" role="alert">
                  {rateActionError}
                </div>
              )}

              <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-5 max-[620px]:grid-cols-1">
                <div>
                  <span className={labelClass}>CARD IMAGE</span>
                  <label className="group relative block cursor-pointer overflow-hidden rounded-xl border border-dashed border-white/[.12] bg-[#0a150d] transition hover:border-primary/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      disabled={updatingRate}
                      className="sr-only"
                    />
                    {editRate.imagePreview ? (
                      // Existing uploads and local blob previews are intentionally rendered directly.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editRate.imagePreview}
                        alt={`${editRate.cardName} preview`}
                        className="h-44 w-full object-cover max-[620px]:h-48"
                      />
                    ) : (
                      <div className="grid h-44 place-items-center text-3xl font-black text-white/60">
                        {editRate.cardName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <span className="absolute inset-x-2 bottom-2 rounded-lg bg-black/70 px-2 py-2 text-center text-[10px] font-bold text-white backdrop-blur">
                      Choose replacement image
                    </span>
                  </label>
                  <p className="mt-2 text-[10px] leading-4 text-[#718476]">
                    Leave unchanged to keep the current image. PNG, JPG or WEBP up to 5MB.
                  </p>
                </div>

                <div className="grid content-start grid-cols-2 gap-4 max-[500px]:grid-cols-1">
                  <label className="col-span-2 max-[500px]:col-span-1">
                    <span className={labelClass}>CARD NAME *</span>
                    <input
                      type="text"
                      name="cardName"
                      value={editRate.cardName}
                      onChange={handleEditChange}
                      disabled={updatingRate}
                      className={fieldClass}
                      required
                    />
                  </label>

                  <label>
                    <span className={labelClass}>COUNTRY *</span>
                    <input
                      type="text"
                      name="country"
                      value={editRate.country}
                      onChange={handleEditChange}
                      disabled={updatingRate}
                      className={fieldClass}
                      required
                    />
                  </label>

                  <label>
                    <span className={labelClass}>CATEGORY *</span>
                    <input
                      type="text"
                      name="category"
                      value={editRate.category}
                      onChange={handleEditChange}
                      disabled={updatingRate}
                      className={fieldClass}
                      required
                    />
                  </label>

                  <label className="col-span-2 max-[500px]:col-span-1">
                    <span className={labelClass}>CARD RATE IN NAIRA *</span>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-[#7f9283]">
                        ₦
                      </span>
                      <input
                        type="number"
                        name="cardRate"
                        value={editRate.cardRate}
                        onChange={handleEditChange}
                        disabled={updatingRate}
                        className={`${fieldClass} pr-11 pl-8`}
                        min="0.01"
                        step="0.01"
                        required
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-[#7f9283]">
                        /$1
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-white/[.07] bg-[#07100a]/70 p-5">
              <button
                type="button"
                onClick={closeEditRate}
                disabled={updatingRate}
                className="h-10 rounded-xl border border-white/[.08] px-4 text-xs font-bold text-[#9db0a1] transition hover:bg-white/[.05] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingRate}
                className="h-10 min-w-32 rounded-xl bg-primary px-5 text-xs font-extrabold text-on-primary transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
              >
                {updatingRate ? "Updating…" : "Update card"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] grid place-items-center bg-[#020603]/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-rate-title"
        >
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[.09] bg-surface-container-low p-6 shadow-[0_30px_90px_rgba(0,0,0,.55)]">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-error/10 text-error">
              <span className="material-symbols-outlined">delete_forever</span>
            </span>
            <h2 id="delete-rate-title" className="mt-5 text-lg font-bold">
              Delete {deleteTarget.card_name}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              This permanently removes the card and its marketplace rate. This action cannot be undone.
            </p>
            {rateActionError && (
              <div className="mt-4 rounded-xl border border-error/20 bg-error/[.06] px-4 py-3 text-xs text-error" role="alert">
                {rateActionError}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={Boolean(deletingCardId)}
                className="h-10 rounded-xl border border-white/[.08] px-4 text-xs font-bold text-[#9db0a1] transition hover:bg-white/[.05] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingCardId === deleteTarget.id}
                className="h-10 min-w-28 rounded-xl bg-error px-4 text-xs font-extrabold text-on-error transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
              >
                {deletingCardId === deleteTarget.id ? "Deleting…" : "Delete card"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-5 flex items-center justify-between gap-4 max-[600px]:items-start">
        <div>
          <h2 className="text-base font-bold">Card inventory</h2>
          <p className="text-[11px] text-[#7c8f81]">
            {filteredRates.length} cards currently visible
          </p>
        </div>
        <label className="relative block">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#6d8072]">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-52 rounded-xl border border-white/[.07] bg-surface-container-highest/50 pr-3 pl-9 text-xs text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary/50 max-[600px]:w-36"
            type="search"
            placeholder="Find a card"
          />
        </label>
      </header>

      {(rateMessage || (rateActionError && !editRate && !deleteTarget)) && (
        <div
          className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-xs ${
            rateActionError
              ? "border-error/20 bg-error/[.06] text-error"
              : "border-tertiary/20 bg-tertiary/[.06] text-tertiary"
          }`}
          role={rateActionError ? "alert" : "status"}
        >
          <span>{rateActionError || rateMessage}</span>
          <button type="button" onClick={clearRateFeedback} className="text-base leading-none opacity-70" aria-label="Dismiss message">×</button>
        </div>
      )}

      {error ? (
        <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-[#ff627e]/20 bg-[#ff627e]/[.025] text-center">
          <div className="max-w-xs px-5">
            <strong className="block text-sm">Card inventory unavailable</strong>
            <p className="mt-1 text-xs text-[#899b8d]">{error}</p>
            <button className="mt-4 rounded-xl bg-[#11984b] px-4 py-2 text-[10px] font-extrabold text-white" type="button" onClick={getRate}>Try again</button>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-3 gap-4 max-[1450px]:grid-cols-2 max-[650px]:grid-cols-1">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="h-[268px] animate-pulse rounded-2xl border border-white/[.06] bg-white/[.025]" key={item} />
          ))}
        </div>
      ) : filteredRates.length ? (
        <div className="grid grid-cols-3 gap-4 max-[1450px]:grid-cols-2 max-[650px]:grid-cols-1">
          {filteredRates.map((rate) => {
            const numericRate = Number.parseFloat(String(rate.card_rate).replace(/[^\d.]/g, ""));
            const displayRate = Number.isFinite(numericRate)
              ? `₦${numericRate.toLocaleString("en-NG", { minimumFractionDigits: numericRate % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
              : "Rate unavailable";

            return (
              <article className="group overflow-hidden rounded-2xl border border-white/[.07] bg-surface-container/70 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_45px_rgba(0,0,0,.2)]" key={rate.id}>
                <div className="relative m-3 min-h-[142px] overflow-hidden rounded-xl bg-gradient-to-br from-[#124d2c] to-[#092a18]">
                  {rate.card_picture_url ? (
                    // Uploads are served by the configurable backend.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rate.card_picture_url} alt={`${rate.card_name} gift card`} className="h-[142px] w-full object-cover" />
                  ) : (
                    <div className="grid h-[142px] place-items-center text-4xl font-black text-white/70">{String(rate.card_name || "?").charAt(0).toUpperCase()}</div>
                  )}
                  <span className="absolute top-3 right-3 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">ACTIVE</span>
                </div>

                <div className="p-4 pt-1">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{rate.card_name}</h3>
                      <span className="text-[10px] text-[#7d9082]">{rate.category} · {rate.country}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <strong className="block text-sm text-tertiary">{displayRate}</strong>
                      <span className="text-[9px] text-[#6e8173]">per $1</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[.06] pt-3">
                    <span className="flex items-center gap-1.5 text-[10px] text-tertiary"><i className="h-1.5 w-1.5 rounded-full bg-tertiary" />Available</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => startEditingRate(rate)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/[.04] text-[#91a395] transition hover:bg-primary/10 hover:text-primary" aria-label={`Update ${rate.card_name}`} title="Update rate">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
                      </button>
                      <button type="button" onClick={() => requestDelete(rate)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/[.04] text-[#91a395] transition hover:bg-error/10 hover:text-error" aria-label={`Delete ${rate.card_name}`} title="Delete rate">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/10 text-center">
          <div>
            <strong className="block text-sm">{query ? "No cards found" : "No cards in the database"}</strong>
            <p className="mt-1 text-xs text-[#728476]">{query ? "Try a different search term." : "Add a card to see it here."}</p>
          </div>
        </div>
      )}
    </section>
  );
}
