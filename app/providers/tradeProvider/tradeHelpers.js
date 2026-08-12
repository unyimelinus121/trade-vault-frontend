import { apiOrigin } from "@/app/api/api";

export function absoluteUploadUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${apiOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatTrade(trade) {
  return { ...trade, cardImageUrls: (trade?.cardImages || []).map(absoluteUploadUrl) };
}
