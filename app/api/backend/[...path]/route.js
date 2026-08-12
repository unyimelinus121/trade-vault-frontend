import { getExternalOrigin } from "../origin.mjs";

const backendOrigin = String(process.env.BACKEND_URL || "").replace(/\/$/, "");
const sessionCookie = "tradevault_session";

async function proxyRequest(request, { params }) {
  if (!backendOrigin) return Response.json({ message: "Backend service is not configured" }, { status: 503 });
  if (!new Set(["GET", "HEAD", "OPTIONS"]).has(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== getExternalOrigin(request)) {
      return Response.json({ message: "Cross-origin request rejected" }, { status: 403 });
    }
  }
  const { path } = await params;
  if (
    !Array.isArray(path) ||
    path.some((segment) => !segment || segment === "." || segment === ".." || /[\\/]/.test(segment))
  ) {
    return Response.json({ message: "Invalid backend path" }, { status: 400 });
  }
  const targetUrl = new URL(`${backendOrigin}/${path.join("/")}`);
  targetUrl.search = new URL(request.url).search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("cookie");
  headers.delete("transfer-encoding");
  headers.delete("x-forwarded-host");
  headers.delete("x-forwarded-proto");
  headers.delete("x-forwarded-for");
  const cookieHeader = request.headers.get("cookie") || "";
  const encodedSession = cookieHeader.split(";").map((item) => item.trim())
    .find((item) => item.startsWith(`${sessionCookie}=`))?.slice(sessionCookie.length + 1);
  if (encodedSession && !headers.has("authorization")) {
    try { headers.set("authorization", `Bearer ${decodeURIComponent(encodedSession)}`); } catch {}
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let response;
  try {
    response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      duplex: hasBody ? "half" : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    console.error("Backend proxy request failed", { path: targetUrl.pathname, message: error.message });
    return Response.json({ message: "Backend service is temporarily unavailable" }, { status: 502 });
  }

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("access-control-allow-origin");

  const routePath = `/${path.join("/")}`;
  const createsSession = new Set(["/login", "/admin/login", "/verify-email"]).has(routePath);
  if (createsSession && response.ok) {
    const data = await response.json();
    if (data?.token) {
      responseHeaders.delete("content-length");
      responseHeaders.delete("content-encoding");
      responseHeaders.append("Set-Cookie", `${sessionCookie}=${encodeURIComponent(data.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
      delete data.token;
      return Response.json({ ...data, authenticated: true }, { status: response.status, headers: responseHeaders });
    }
  }
  if (routePath === "/logout") {
    responseHeaders.append("Set-Cookie", `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
