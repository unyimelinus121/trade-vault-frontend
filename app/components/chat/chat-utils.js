import { apiOrigin } from "@/app/api/api";

export function chatAssetUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${apiOrigin}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function formatChatTime(value, options = {}) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return date.toLocaleString("en-NG", sameDay
    ? { hour: "2-digit", minute: "2-digit", ...options }
    : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", ...options });
}

export function initials(person) {
  return `${person?.firstName?.[0] || ""}${person?.lastName?.[0] || ""}`.toUpperCase() || "TV";
}
