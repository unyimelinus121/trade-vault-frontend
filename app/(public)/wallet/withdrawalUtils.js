export function getWithdrawalValues({ amount, wallet, limits }) {
  const amountValue = Number(amount);
  const minimum = Number(limits.min || 1000);
  const configuredMaximum = limits.max ? Number(limits.max) : null;
  const available = Number(wallet?.availableToWithdraw ?? wallet?.balance ?? 0);
  const maximum = configuredMaximum ? Math.min(configuredMaximum, available) : available;

  return {
    amountValue,
    minimum,
    configuredMaximum,
    available,
    maximum,
    isValid: Number.isFinite(amountValue)
      && amountValue >= minimum
      && amountValue <= available
      && (!configuredMaximum || amountValue <= configuredMaximum),
  };
}

export function createWithdrawalRequestKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID().toLowerCase();
  return `withdraw-${Date.now()}-${Math.random().toString(36).slice(2)}`.toLowerCase();
}

export const emptyBankForm = {
  bankName: "",
  accountNumber: "",
  accountName: "",
};
