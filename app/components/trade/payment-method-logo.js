import Image from "next/image";

const logoMap = {
  PayPal: { src: "/payment-logos/paypal.svg", width: 24, height: 24 },
  Chime: { src: "/payment-logos/chime.svg", width: 58, height: 18, wordmark: true },
  Venmo: { src: "/payment-logos/venmo.svg", width: 24, height: 24 },
  "Cash App": { src: "/payment-logos/cashapp.svg", width: 24, height: 24 },
  Zelle: { src: "/payment-logos/zelle.svg", width: 24, height: 24 },
  Bitcoin: { src: "/payment-logos/bitcoin.svg", width: 24, height: 24 },
};

export default function PaymentMethodLogo({ name, bank = false, showLabel = true, onClick, className = "" }) {
  const logo = logoMap[name];
  const Element = onClick ? "button" : "span";

  return <Element type={onClick ? "button" : undefined} onClick={onClick} aria-label={onClick ? `Open live chat about ${name}` : undefined} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/[.08] bg-white/[.035] px-3 text-[10px] font-semibold text-on-surface-variant outline-none transition hover:border-primary/25 hover:bg-white/[.055] hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary ${className}`}>
    <span className="grid h-6 min-w-6 place-items-center">
      {bank
        ? <span className="material-symbols-outlined text-xl text-primary">account_balance</span>
        : <Image src={logo.src} alt="" width={logo.width} height={logo.height} className="max-h-6 w-auto object-contain" />}
    </span>
    {showLabel && !logo?.wordmark && <span>{name}</span>}
    {(!showLabel || logo?.wordmark) && <span className="sr-only">{name}</span>}
  </Element>;
}
