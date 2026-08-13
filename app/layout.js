import "./globals.css";
import AssetRecovery from "./components/asset-recovery";

export const metadata = {
  title: "TradeVault | Trade Gift Cards Instantly",
  description: "Trade gift cards safely, quickly and at the best rates.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full scroll-smooth bg-background antialiased">
      <head>
        <link rel="preload" href="/fonts/material-symbols-outlined.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <AssetRecovery />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans leading-relaxed text-on-background">
        {children}
      </body>
    </html>
  );
}
