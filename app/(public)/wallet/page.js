"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useTrade } from "@/app/providers/tradeProvider/trade";
import {
  formatNaira,
  formatTradeDate,
  LoginRequired,
  PageLoader,
} from "@/app/components/trade/trade-ui";
import { createWithdrawalRequestKey, emptyBankForm, getWithdrawalValues } from "./withdrawalUtils";

const inputClass = "mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:border-primary/70 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

function WithdrawalStatus({ status }) {
  const variants = {
    pending: ["schedule", "border-amber-300/20 bg-amber-300/10 text-amber-200", "Pending"],
    paid: ["check_circle", "border-primary/20 bg-primary/10 text-primary", "Paid"],
    rejected: ["cancel", "border-error/20 bg-error/10 text-error", "Rejected"],
  };
  const [icon, styles, label] = variants[status] || variants.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles}`}>
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {label}
    </span>
  );
}

function withdrawalStatusMessage(status) {
  return {
    pending: "Pending admin review. Your wallet balance is unchanged.",
    paid: "Your withdrawal has been paid and deducted from your wallet.",
    rejected: "Your withdrawal request was rejected. No funds were deducted.",
  }[status] || "Your withdrawal status is being updated.";
}

function Feedback({ error, message }) {
  if (!error && !message) return null;
  return (
    <div
      role="status"
      className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-error/20 bg-error/10 text-error"
          : "border-primary/20 bg-primary/10 text-primary"
      }`}
    >
      <span className="material-symbols-outlined text-lg">{error ? "error" : "check_circle"}</span>
      <span>{error || message}</span>
    </div>
  );
}

function WithdrawalHistory({ withdrawals, loading }) {
  if (loading && !withdrawals.length) {
    return <div className="h-52 animate-pulse rounded-2xl bg-white/[.025]" />;
  }
  if (!withdrawals.length) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant p-10 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">account_balance</span>
        <h3 className="mt-3 text-lg">No withdrawals yet</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Your manual withdrawal requests will appear here.</p>
      </div>
    );
  }
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/[.07] max-[760px]:hidden">
        <table className="w-full border-collapse text-left">
          <thead className="bg-surface-container-high text-[10px] uppercase tracking-[.1em] text-on-surface-variant">
            <tr>
              <th className="px-5 py-4 font-semibold">Bank account</th>
              <th className="px-5 py-4 font-semibold">Reference</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[.055] bg-surface-container/45">
            {withdrawals.map((item) => (
              <tr key={item.id} className="transition hover:bg-white/[.025]">
                <td className="px-5 py-4">
                  <strong className="block text-sm">{item.bankName}</strong>
                  <span className="mt-1 block text-[11px] text-on-surface-variant">{item.accountName} · {item.accountNumber}</span>
                </td>
                <td className="px-5 py-4 font-mono text-[11px] text-on-surface-variant">{item.reference}</td>
                <td className="px-5 py-4 text-xs text-on-surface-variant">{formatTradeDate(item.createdAt)}</td>
                <td className="px-5 py-4"><WithdrawalStatus status={item.status} /><span className="mt-1.5 block max-w-52 text-[9px] leading-4 text-on-surface-variant">{withdrawalStatusMessage(item.status)}</span></td>
                <td className="px-5 py-4 text-right text-sm font-bold">{formatNaira(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 min-[761px]:hidden">
        {withdrawals.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/[.07] bg-surface-container/55 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong className="block text-sm">{item.bankName}</strong>
                <span className="mt-1 block text-[11px] text-on-surface-variant">{item.accountNumber} · {item.accountName}</span>
              </div>
              <strong className="text-sm">{formatNaira(item.amount)}</strong>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[.06] pt-3">
              <span className="text-[10px] text-on-surface-variant">{formatTradeDate(item.createdAt)}</span>
              <WithdrawalStatus status={item.status} />
            </div>
            <p className="mt-3 text-[10px] leading-4 text-on-surface-variant">{withdrawalStatusMessage(item.status)}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export default function WalletPage() {
  const { user, token, authReady } = usePublicAuth();
  const {
    wallet,
    walletTransactions,
    walletLoading,
    bankAccounts,
    withdrawals,
    withdrawalLimits,
    withdrawalLoading,
    submittingWithdrawal,
    bankAccountActionLoading,
    withdrawalError,
    withdrawalMessage,
    getWithdrawals,
    submitWithdrawal,
    saveBankAccount,
    deleteBankAccount,
    clearWithdrawalFeedback,
  } = useTrade();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [requestKey, setRequestKey] = useState("");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const verifiedBankAccounts = bankAccounts.filter((item) => item.isVerified);
  const selectedAccount = verifiedBankAccounts.find((item) => String(item.id) === selectedAccountId) || verifiedBankAccounts[0];
  const withdrawalValues = getWithdrawalValues({ amount, wallet, limits: withdrawalLimits });
  const { amountValue, configuredMaximum: maxAmount, available: availableBalance,
    maximum: effectiveMaximum, isValid: amountIsValid } = withdrawalValues;

  function openConfirmation(event) {
    event.preventDefault();
    clearWithdrawalFeedback();
    if (!selectedAccount || !amountIsValid) return;
    setRequestKey(createWithdrawalRequestKey());
    setConfirming(true);
  }

  async function confirmWithdrawal() {
    const result = await submitWithdrawal({
      amount,
      bankAccountId: selectedAccount.id,
      idempotencyKey: requestKey,
    });
    setConfirming(false);
    if (result) {
      setAmount("");
      setRequestKey("");
      await getWithdrawals();
    }
  }

  async function handleSaveBankAccount(event) {
    event.preventDefault();
    const saved = await saveBankAccount(bankForm);
    if (saved) {
      setSelectedAccountId(String(saved.id));
      setBankForm(emptyBankForm);
      setShowAccountForm(false);
    }
  }

  async function handleDeleteBankAccount(id) {
    const deleted = await deleteBankAccount(id);
    if (deleted) {
      if (String(selectedAccountId) === String(id)) setSelectedAccountId("");
      setDeleteConfirmId(null);
    }
  }

  if (!authReady) return <PageLoader />;
  if (!user || !token || user.role !== "user") {
    return <LoginRequired title="Log in to view your wallet" />;
  }

  return (
    <main className="stitch-glow min-h-screen">
      <section className="mx-auto max-w-7xl px-8 py-14 max-[650px]:px-4 max-[650px]:py-9">
        <header className="flex items-end justify-between gap-8 max-[760px]:items-start max-[760px]:flex-col">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">TradeVault wallet</span>
            <h1 className="mt-3 text-[clamp(2.6rem,5vw,4.7rem)] leading-[.95] tracking-[-.055em]">Your money, ready when you are.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-on-surface-variant">Request a manual payout to one of your saved Nigerian bank accounts.</p>
          </div>
          <Link href="/trade" className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container px-5 py-3 text-xs font-bold transition hover:border-primary/40 hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-lg">add_card</span>
            Start a trade
          </Link>
        </header>

        <div className="mt-10 grid grid-cols-[minmax(0,1.05fr)_minmax(22rem,.95fr)] gap-6 max-[900px]:grid-cols-1">
          <section className="relative min-h-[25rem] overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-[#103f25] via-[#0b2c1a] to-surface-container p-8 shadow-[0_26px_70px_rgba(0,0,0,.38)] max-[540px]:p-6">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[.16em] text-white/55">Wallet balance</span>
                  <strong className="mt-4 block text-[clamp(3rem,7vw,5.6rem)] leading-none tracking-[-.06em] text-white">
                    {walletLoading && !wallet ? "—" : formatNaira(wallet?.balance)}
                  </strong>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.06] text-primary">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </span>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-3 pt-14 max-[650px]:grid-cols-1">
                <div className="rounded-2xl border border-white/[.08] bg-black/15 p-4">
                  <span className="text-[9px] font-bold uppercase tracking-[.12em] text-white/45">Wallet balance</span>
                  <strong className="mt-2 block text-lg text-white">{formatNaira(wallet?.balance)}</strong>
                </div>
                <div className="rounded-2xl border border-white/[.08] bg-black/15 p-4">
                  <span className="text-[9px] font-bold uppercase tracking-[.12em] text-white/45">Pending withdrawals</span>
                  <strong className="mt-2 block text-lg text-amber-200">{formatNaira(wallet?.pendingWithdrawals)}</strong>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/[.07] p-4">
                  <span className="text-[9px] font-bold uppercase tracking-[.12em] text-white/45">Available to withdraw</span>
                  <strong className="mt-2 block text-lg text-primary">{formatNaira(wallet?.availableToWithdraw)}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/[.08] bg-surface-container/80 p-6 shadow-2xl max-[540px]:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Bank withdrawal</span>
                <h2 className="mt-2 text-2xl tracking-[-.035em]">Send to your bank</h2>
              </div>
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">account_balance</span>
            </div>

            <form className="mt-7" onSubmit={openConfirmation}>
              <label className="block text-xs font-semibold text-on-surface-variant">
                Verified bank account
                <select
                  className={inputClass}
                  value={selectedAccount ? String(selectedAccount.id) : ""}
                  onChange={(event) => setSelectedAccountId(event.target.value)}
                  disabled={!verifiedBankAccounts.length}
                  required
                >
                  {!verifiedBankAccounts.length && <option value="">No verified account</option>}
                  {verifiedBankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.bankName} · {account.accountNumber} · {account.accountName}</option>
                  ))}
                </select>
              </label>

              <label className="mt-5 block text-xs font-semibold text-on-surface-variant">
                Amount to withdraw
                <div className="relative">
                  <span className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-sm font-bold text-on-surface-variant">₦</span>
                  <input
                    className={`${inputClass} pl-9`}
                    type="number"
                    inputMode="decimal"
                    min={withdrawalLimits.min}
                    max={effectiveMaximum || undefined}
                    step="0.01"
                    placeholder={String(withdrawalLimits.min || "1000")}
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                </div>
              </label>
              {amount && !amountIsValid && (
                <p className="mt-2 text-[11px] text-error">
                  {amountValue > availableBalance
                    ? "This amount is higher than your available balance."
                    : `Enter at least ${formatNaira(withdrawalLimits.min)}${maxAmount ? ` and no more than ${formatNaira(maxAmount)}` : ""}.`}
                </p>
              )}

              <button
                type="submit"
                disabled={!selectedAccount || !amountIsValid || submittingWithdrawal}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-extrabold text-on-primary transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(57,232,121,.2)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                <span className="material-symbols-outlined text-lg">send_money</span>
                Review withdrawal
              </button>
              <p className="mt-3 text-center text-[10px] leading-5 text-on-surface-variant">Only verified accounts you own can receive wallet funds.</p>
            </form>
            <Feedback error={withdrawalError} message={withdrawalMessage} />
          </section>
        </div>

        <section className="mt-7 rounded-[1.5rem] border border-white/[.07] bg-surface-container/60 p-6 max-[540px]:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl">Bank accounts</h2>
              <p className="mt-1 text-xs text-on-surface-variant">Choose one of your previously saved bank accounts for manual payout.</p>
            </div>
            <button type="button" onClick={() => { setShowAccountForm((current) => !current); clearWithdrawalFeedback(); }} className="shrink-0 rounded-xl border border-primary/30 bg-primary/[.06] px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/10">{showAccountForm ? "Close form" : "Add account"}</button>
          </div>

          {showAccountForm && <form onSubmit={handleSaveBankAccount} className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-white/[.08] bg-surface-container-low p-5 max-[760px]:grid-cols-1">
            <label className="text-xs font-semibold text-on-surface-variant">Bank name<input className={inputClass} value={bankForm.bankName} onChange={(event) => setBankForm((current) => ({ ...current, bankName: event.target.value }))} maxLength={160} placeholder="e.g. Access Bank" required /></label>
            <label className="text-xs font-semibold text-on-surface-variant">Account number<input className={inputClass} value={bankForm.accountNumber} onChange={(event) => setBankForm((current) => ({ ...current, accountNumber: event.target.value.replace(/\D/g, "").slice(0, 10) }))} inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit account number" required /></label>
            <label className="text-xs font-semibold text-on-surface-variant">Account owner’s name<input className={inputClass} value={bankForm.accountName} onChange={(event) => setBankForm((current) => ({ ...current, accountName: event.target.value }))} maxLength={200} placeholder="Name on the bank account" required /></label>
            <div className="col-span-3 flex items-center justify-between gap-4 max-[760px]:col-span-1 max-[540px]:items-stretch max-[540px]:flex-col"><p className="text-[10px] leading-5 text-on-surface-variant">Check every detail carefully. Manual payouts will use exactly the information saved here.</p><button type="submit" disabled={bankAccountActionLoading || bankForm.accountNumber.length !== 10} className="min-h-11 shrink-0 rounded-xl bg-primary px-5 text-xs font-extrabold text-on-primary disabled:opacity-40">{bankAccountActionLoading ? "Saving…" : "Save bank account"}</button></div>
          </form>}

          {bankAccounts.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1">
              {bankAccounts.map((account) => (
                <article key={account.id} className={`relative rounded-2xl border p-4 transition ${String(account.id) === String(selectedAccount?.id) ? "border-primary/50 bg-primary/[.07]" : "border-white/[.07] bg-surface-container-low hover:border-outline"}`}>
                  <button type="button" onClick={() => setSelectedAccountId(String(account.id))} className="block w-full text-left">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined text-lg">account_balance</span></span>
                    {account.isVerified ? (String(account.id) === String(selectedAccount?.id) && <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">Selected</span>) : <span className="rounded-full bg-amber-300/10 px-2 py-1 text-[9px] font-bold text-amber-200">Awaiting verification</span>}
                  </div>
                  <strong className="mt-4 block text-sm">{account.bankName}</strong>
                  <span className="mt-1 block text-xs text-on-surface-variant">{account.accountNumber}</span>
                  <span className="mt-3 block truncate text-[10px] uppercase tracking-[.08em] text-on-surface-variant">{account.accountName}</span>
                  </button>
                  <div className="mt-4 border-t border-white/[.06] pt-3">{deleteConfirmId === account.id ? <div className="flex items-center justify-between gap-2"><span className="text-[10px] text-error">Delete this account?</span><div className="flex gap-2"><button type="button" onClick={() => handleDeleteBankAccount(account.id)} disabled={bankAccountActionLoading} className="rounded-lg bg-error px-3 py-1.5 text-[10px] font-bold text-black disabled:opacity-40">Delete</button><button type="button" onClick={() => setDeleteConfirmId(null)} className="rounded-lg border border-outline-variant px-3 py-1.5 text-[10px]">Cancel</button></div></div> : <button type="button" onClick={() => setDeleteConfirmId(account.id)} className="inline-flex items-center gap-1 text-[10px] font-bold text-error"><span className="material-symbols-outlined text-sm">delete</span>Remove account</button>}</div>
                </article>
              ))}
            </div>
          )}

          {!bankAccounts.length && !showAccountForm && <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-xs text-amber-200">No saved bank account is available. Select “Add account” to save your first payout account.</p>}
          <Feedback error={withdrawalError} message={withdrawalMessage} />
        </section>

        <section className="mt-12">
          <header className="mb-5 flex items-end justify-between gap-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Manual payouts</span>
              <h2 className="mt-2 text-2xl tracking-[-.035em]">Withdrawal history</h2>
            </div>
            <button type="button" onClick={getWithdrawals} disabled={withdrawalLoading} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-white/[.05] hover:text-on-surface disabled:opacity-40"><span className={`material-symbols-outlined text-sm ${withdrawalLoading ? "animate-spin" : ""}`}>refresh</span>{withdrawalLoading ? "Refreshing…" : "Refresh"}</button>
          </header>
          <WithdrawalHistory withdrawals={withdrawals} loading={withdrawalLoading} />
        </section>

        <section className="mt-12 overflow-hidden rounded-2xl border border-white/[.07] bg-surface-container/50">
          <header className="border-b border-white/[.07] p-5">
            <h2 className="text-xl">Wallet activity</h2>
            <p className="mt-1 text-xs text-on-surface-variant">Credits and completed manual withdrawals in one ledger.</p>
          </header>
          {walletLoading && !walletTransactions.length ? (
            <div className="h-48 animate-pulse bg-white/[.025]" />
          ) : walletTransactions.length ? (
            walletTransactions.map((item) => {
              const isDebit = item.type === "debit";
              const isRefund = item.category === "withdrawal_reversal";
              return (
                <article key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/[.055] p-5 last:border-0 max-[520px]:grid-cols-[auto_1fr]">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${isDebit ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}>
                    <span className="material-symbols-outlined">{isRefund ? "undo" : isDebit ? "north_east" : "south_west"}</span>
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm">{item.description}</strong>
                    <span className="mt-1 block text-[10px] text-on-surface-variant">{formatTradeDate(item.createdAt)} · {item.reference || (item.tradeId ? `Trade TV-${String(item.tradeId).padStart(6, "0")}` : "Wallet entry")}</span>
                  </div>
                  <div className="text-right max-[520px]:col-start-2 max-[520px]:text-left">
                    <strong className={isDebit ? "text-error" : "text-primary"}>{isDebit ? "−" : "+"}{formatNaira(item.amount)}</strong>
                    <span className="mt-1 block text-[9px] capitalize text-on-surface-variant">{item.status} · Balance {formatNaira(item.balanceAfter)}</span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">account_balance_wallet</span>
              <h3 className="mt-3">No wallet activity</h3>
              <p className="mt-1 text-sm text-on-surface-variant">Successful trades will create credit entries here.</p>
            </div>
          )}
        </section>
      </section>

      {confirming && selectedAccount && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="withdrawal-confirm-title">
          <section className="w-full max-w-md rounded-[1.75rem] border border-white/[.1] bg-surface-container-high p-6 shadow-2xl">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><span className="material-symbols-outlined">security</span></span>
            <h2 id="withdrawal-confirm-title" className="mt-5 text-2xl tracking-[-.035em]">Confirm withdrawal</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">Review these details carefully. The transfer can only go to this verified account.</p>
            <dl className="mt-6 divide-y divide-white/[.06] rounded-2xl border border-white/[.07] bg-surface-container-low px-4">
              <div className="flex items-center justify-between gap-4 py-4"><dt className="text-xs text-on-surface-variant">Amount</dt><dd className="text-lg font-bold text-primary">{formatNaira(amount)}</dd></div>
              <div className="flex items-center justify-between gap-4 py-4"><dt className="text-xs text-on-surface-variant">Bank</dt><dd className="text-right text-sm font-semibold">{selectedAccount.bankName}</dd></div>
              <div className="flex items-center justify-between gap-4 py-4"><dt className="text-xs text-on-surface-variant">Account</dt><dd className="text-right text-sm font-semibold">{selectedAccount.accountNumber}<span className="mt-1 block text-[10px] font-normal text-on-surface-variant">{selectedAccount.accountName}</span></dd></div>
            </dl>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirming(false)} disabled={submittingWithdrawal} className="rounded-xl border border-outline-variant px-4 py-3 text-xs font-bold disabled:opacity-50">Cancel</button>
              <button type="button" onClick={confirmWithdrawal} disabled={submittingWithdrawal} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-on-primary disabled:opacity-50">
                {submittingWithdrawal && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />}
                {submittingWithdrawal ? "Submitting…" : "Confirm & withdraw"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
