import { apiOrigin } from "@/app/api/api";

export function getCardPictureUrl(cardPicture) {
  const path = Array.isArray(cardPicture) ? cardPicture[0] : cardPicture;
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${apiOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatRateCard(card) {
  return { ...card, card_picture_url: getCardPictureUrl(card.card_picture) };
}

export function formatAdminTrade(trade) {
  return {
    ...trade,
    cardImageUrls: (trade?.cardImages || []).map((path) => {
      if (path.startsWith("http")) return path;
      return `${apiOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
    }),
  };
}
