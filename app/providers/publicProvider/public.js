"use client";
import api, { apiOrigin } from "@/app/api/api";
import { useContext, createContext, useState, useEffect } from "react";
import useVisibleInterval from "@/app/hooks/use-visible-interval";

const PublicContext = createContext();
function getCardPictureUrl(cardPicture) {
  const picturePath = Array.isArray(cardPicture) ? cardPicture[0] : cardPicture;

  if (!picturePath) return "";
  if (picturePath.startsWith("http")) return picturePath;

  return `${apiOrigin}${picturePath.startsWith("/") ? "" : "/"}${picturePath}`;
}

export default function PublicProvider({ children, initialRates }) {
  const hasInitialRates = Array.isArray(initialRates) && initialRates.length > 0;
  const [rates, setRates] = useState(() =>
    hasInitialRates
      ? initialRates.map((card) => ({
          ...card,
          card_picture_url: getCardPictureUrl(card.card_picture),
        }))
      : [],
  );
  const [loading, setLoading] = useState(!hasInitialRates);
  const [error, setError] = useState("");

  async function getRate(options = {}) {
    if (!options.silent) setLoading(true);
    if (!options.silent) setError("");

    try {
      const result = await api.get("/getRates");
      const { rate } = result.data;
      const formattedRates = Array.isArray(rate)
        ? rate.map((card) => ({
            ...card,
            card_picture_url: getCardPictureUrl(card.card_picture),
          }))
        : [];

      setRates(formattedRates);
    } catch {
      if (!options.silent) setError("Unable to load the latest gift-card rates.");
    } finally {
      if (!options.silent) setLoading(false);
    }
  }

  useEffect(() => {
    if (hasInitialRates) return;

    async function fetchData() {
      await getRate();
    }

    fetchData();
  }, [hasInitialRates]);

  useVisibleInterval(() => getRate({ silent: true }), 300_000);

  return (
    <PublicContext.Provider value={{ rates, loading, error, getRate }}>
      {children}
    </PublicContext.Provider>
  );
}

export function usePublic() {
  return useContext(PublicContext);
}
