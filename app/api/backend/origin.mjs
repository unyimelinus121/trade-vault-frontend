export function getExternalOrigin(request) {
  const requestUrl = new URL(request.url);
  const forwardedProtocol = request.headers.get("x-forwarded-proto")
    ?.split(",")[0]
    .trim()
    .toLowerCase();
  const protocol = new Set(["http", "https"]).has(forwardedProtocol)
    ? forwardedProtocol
    : requestUrl.protocol.slice(0, -1);
  const forwardedHost = request.headers.get("x-forwarded-host")
    ?.split(",")[0]
    .trim();
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return requestUrl.origin;
  }
}
