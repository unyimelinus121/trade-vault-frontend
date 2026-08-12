import Image from "next/image";
import Link from "next/link";
import PublicAuth from "../providers/publicProvider/publicAuthProvider";

export default function AuthLayout({ children }) {
  return (
    <PublicAuth>
      <div className="stitch-glow min-h-screen bg-background">
        <Link
          href="/"
          className="absolute top-7 left-[max(5vw,24px)] z-10 block w-[166px] leading-none max-[520px]:w-[150px]"
          aria-label="TradeVault home"
        >
          <Image
            src="/tradevault-logo.svg"
            alt="TradeVault"
            width={560}
            height={150}
            className="h-auto w-full"
            priority
          />
        </Link>
        {children}
      </div>
    </PublicAuth>
  );
}
