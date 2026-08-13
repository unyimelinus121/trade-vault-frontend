const recoveryScript = `
(() => {
  const key = "tradevault_asset_recovery";
  const recover = (url) => {
    if (!url || !url.includes("/_next/static/")) return;
    const previous = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - previous < 30000) return;
    sessionStorage.setItem(key, String(Date.now()));
    const next = new URL(location.href);
    next.searchParams.set("_asset_refresh", Date.now().toString(36));
    location.replace(next.toString());
  };
  addEventListener("error", (event) => recover(event.target?.src || event.target?.href), true);
  addEventListener("unhandledrejection", (event) => {
    const message = String(event.reason?.message || event.reason || "");
    if (/ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(message)) {
      recover("/_next/static/chunk");
    }
  });
})();`;

export default function AssetRecovery() {
  return <script dangerouslySetInnerHTML={{ __html: recoveryScript }} />;
}
