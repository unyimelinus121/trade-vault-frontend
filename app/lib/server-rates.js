const backendOrigin = String(process.env.BACKEND_URL || "").replace(/\/$/, "");

export async function getInitialRates() {
  try {
    if (!backendOrigin) return [];
    const response = await fetch(`${backendOrigin}/getRates`, {
      cache: "no-store",
    });

    if (!response.ok) return [];

    const payload = await response.json();
    return Array.isArray(payload.rate) ? payload.rate : [];
  } catch {
    return [];
  }
}
