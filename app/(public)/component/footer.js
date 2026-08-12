import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  ["Trade", [["Current rates", "/trade"], ["Trade history", "/trade-history"], ["Wallet", "/wallet"]]],
  ["Company", [["About TradeVault", "/about"], ["How it works", "/how-it-works"], ["Contact", "/contact"]]],
  ["Account", [["My account", "/account"], ["Notifications", "/notifications"], ["Customer support", "/support"]]],
];

export default function Footer() {
  return <footer className="w-full border-t border-outline-variant/45 bg-surface-container-low pb-8 pt-16 max-[720px]:pb-28">
    <div className="mx-auto w-full max-w-[1440px] px-8 max-[720px]:px-5">
      <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] gap-12 pb-14 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        <div><Link href="/" className="inline-flex" aria-label="TradeVault home"><Image src="/tradevault-logo.svg" alt="TradeVault" width={560} height={150} className="h-auto w-[166px]" /></Link><p className="mt-5 max-w-sm text-sm leading-7 text-on-surface-variant">Secure gift-card trading, transparent verification, and clear wallet payments for the modern African digital economy.</p><div className="mt-6 flex items-center gap-5 text-[10px] uppercase tracking-[.1em] text-on-surface-variant"><span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-base text-primary">shield_lock</span>Protected trades</span><span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-base text-primary">receipt_long</span>Recorded credits</span></div></div>
        {footerLinks.map(([heading,links]) => <nav key={heading} className="flex flex-col gap-3 text-sm text-on-surface-variant" aria-label={`${heading} links`}><h3 className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-on-surface">{heading}</h3>{links.map(([label,href]) => <Link key={href} href={href} className="w-fit transition hover:text-primary focus-visible:text-primary focus-visible:outline-none">{label}</Link>)}</nav>)}
      </div>
      <div className="flex items-center justify-between gap-6 border-t border-outline-variant/55 pt-6 text-[10px] text-on-surface-variant max-[600px]:flex-col max-[600px]:items-start"><span>© {new Date().getFullYear()} TradeVault Technologies. All rights reserved.</span><span>Current rates and final payouts are confirmed before completion.</span></div>
    </div>
  </footer>;
}
