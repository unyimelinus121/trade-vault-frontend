import Link from "next/link";
import { howSteps, tradePromises } from "../datasources/page-data";

export const metadata = { title: "How TradeVault Works" };

const section = "mx-auto w-[min(1180px,calc(100%_-_48px))] max-[720px]:w-[calc(100%_-_32px)]";
const kicker = "mb-3.5 block text-xs font-extrabold tracking-[.16em] text-primary";
const heading = "mb-[22px] text-[clamp(33px,4vw,50px)] leading-[1.12] tracking-[-.04em]";

export default function HowItWorksPage() {
  return (
    <main className="overflow-hidden">
      <section className={`${section} relative grid min-h-[440px] max-w-[900px] content-center text-center before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_45%,rgba(17,152,75,.18),transparent_62%)] max-[720px]:min-h-[370px]`}>
        <span className="relative mx-auto inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-extrabold tracking-[.16em] text-primary">◉ &nbsp; Simple from start to finish</span>
        <h1 className="relative my-[22px] text-[clamp(48px,6vw,76px)] leading-[1.02] tracking-[-.05em] max-[720px]:text-5xl">Trade your gift cards in <span className="text-primary">four clear steps.</span></h1>
        <p className="relative mx-auto max-w-[670px] text-[17px] text-on-surface-variant">We have designed the journey to be straightforward, so you can focus on making the right trade at the right rate.</p>
      </section>

      <section className={`${section} py-[70px_110px] max-[720px]:py-[75px]`}>
        <header><span className={kicker}>THE PROCESS</span><h2 className={heading}>How your trade moves forward.</h2></header>
        <div className="grid grid-cols-2 gap-[18px] max-[720px]:grid-cols-1">
          {howSteps.map((step) => <article className="stitch-panel grid grid-cols-[48px_48px_1fr] gap-[18px] rounded-2xl p-7" key={step.number}><span className="text-xs font-extrabold text-on-surface-variant">{step.number}</span><i className="text-2xl text-primary not-italic">{step.icon}</i><div><h3 className="mb-2 font-bold">{step.title}</h3><p className="text-sm text-on-surface-variant">{step.text}</p></div></article>)}
        </div>
      </section>

      <section className={`${section} border-t border-white/10 py-[100px] max-[720px]:py-[75px]`}>
        <header className="mb-[42px] max-w-[660px]"><span className={kicker}>OUR PROMISE</span><h2 className={heading}>Clarity at every stage.</h2></header>
        <div className="grid grid-cols-3 gap-[18px] max-[1000px]:grid-cols-2 max-[720px]:grid-cols-1">
          {tradePromises.map((promise) => <article className="stitch-panel rounded-2xl p-[30px]" key={promise.title}><i className="grid h-11 w-11 place-items-center rounded-[11px] bg-primary/10 text-primary not-italic">{promise.icon}</i><h3 className="mt-[25px] mb-[9px] font-bold">{promise.title}</h3><p className="text-sm text-on-surface-variant">{promise.text}</p></article>)}
        </div>
      </section>

      <section className={`${section} my-[50px] mb-[110px] flex items-center justify-between gap-[50px] rounded-[20px] border border-primary/20 bg-gradient-to-br from-surface-container-high to-surface-container p-[48px_54px] shadow-2xl max-[720px]:mb-[85px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:p-[32px_25px]`}>
        <div><span className={kicker}>READY WHEN YOU ARE</span><h2 className="mb-2 max-w-[700px] text-[clamp(28px,4vw,42px)] leading-[1.15]">Check your rate and begin with confidence.</h2><p className="text-[#bac9bd]">Each trade follows a clear review process, with support available whenever you need it.</p></div>
        <Link href="/trade" className="inline-flex shrink-0 gap-5 rounded-full bg-primary p-[14px_22px] font-extrabold text-on-primary">View live rates →</Link>
      </section>
    </main>
  );
}
