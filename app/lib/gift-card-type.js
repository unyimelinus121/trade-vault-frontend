export function normalizeGiftCardType(value) {
  const type = String(value || "").trim().toLowerCase();
  return type === "e-card" || type === "ecard" || type === "electronic" || type === "digital"
    ? "e-card"
    : "physical";
}

export function giftCardTypeLabel(value) {
  return normalizeGiftCardType(value) === "e-card" ? "E-Card" : "Physical Card";
}
