import { aboutValues, milestones } from "../datasources/page-data";
import { statistics } from "../datasources/site-data";

export const metadata = { title: "About TradeVault" };

const section = "mx-auto w-[min(1180px,calc(100%_-_48px))] max-[720px]:w-[calc(100%_-_32px)]";
const kicker = "mb-3.5 block text-xs font-extrabold tracking-[.16em] text-primary";
const heading = "mb-[22px] text-[clamp(33px,4vw,50px)] leading-[1.12] tracking-[-.04em]";

export default function AboutPage() {
  return (
    <main className="overflow-hidden">
      <section className={`${section} relative grid min-h-[440px] max-w-[900px] content-center text-center before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_45%,rgba(17,152,75,.18),transparent_62%)] max-[720px]:min-h-[370px]`}>
        <span className="relative mx-auto inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-extrabold tracking-[.16em] text-primary">◉ &nbsp; About TradeVault</span>
        <h1 className="relative my-[22px] text-[clamp(48px,6vw,76px)] leading-[1.02] tracking-[-.05em] max-[720px]:text-5xl">Better trades begin with <span className="text-primary">more trust.</span></h1>
        <p className="relative mx-auto max-w-[670px] text-[17px] text-on-surface-variant">TradeVault exists to make gift-card trading feel clear, secure, and dependable from the first rate check to payment.</p>
      </section>

      <section className={`${section} grid grid-cols-[1.2fr_.8fr] items-center gap-20 py-[80px_110px] max-[1000px]:grid-cols-1 max-[1000px]:gap-[50px] max-[720px]:py-[50px_75px]`}>
        <div><span className={kicker}>OUR STORY</span><h2 className={heading}>A simpler standard for every trade.</h2><p className="text-[#a7b7aa]">We believe trading gift cards should never feel uncertain. That is why TradeVault focuses on transparent information, clear trade steps, and support that respects your time.</p><p className="text-[#a7b7aa]">Our goal is straightforward: build a space where users can trade with confidence and always understand what comes next.</p></div>
        <aside className="stitch-panel rounded-[18px] p-[38px]">
          <i className="grid h-14 w-14 place-items-center rounded-[14px] bg-[#2ed471]/15 font-black text-[#78eda4] not-italic">TV</i>
          <h3 className="mt-[25px] mb-2.5 text-[23px] font-bold">Our mission</h3><p className="text-[#a7b7aa]">To make every gift-card trade feel safe, simple, and worthwhile.</p>
        </aside>
      </section>

      <section className={`${section} border-t border-white/10 py-[100px] max-[720px]:py-[75px]`}>
        <header className="mb-[42px] max-w-[660px]"><span className={kicker}>WHAT GUIDES US</span><h2 className={heading}>The values behind TradeVault.</h2></header>
        <div className="grid grid-cols-3 gap-[18px] max-[1000px]:grid-cols-2 max-[720px]:grid-cols-1">
          {aboutValues.map((value) => <article className="stitch-panel rounded-2xl p-[30px]" key={value.title}><i className="grid h-11 w-11 place-items-center rounded-[11px] bg-primary/10 text-primary not-italic">{value.icon}</i><h3 className="mt-[25px] mb-[9px] font-bold">{value.title}</h3><p className="text-sm text-on-surface-variant">{value.text}</p></article>)}
        </div>
      </section>

      <section className={`${section} grid grid-cols-5 gap-px overflow-hidden rounded-[17px] border border-white/10 bg-white/10 p-8 max-[1000px]:grid-cols-3 max-[720px]:grid-cols-2 max-[720px]:p-5`}>
        {statistics.map((stat) => <article className="grid min-h-[130px] place-items-center bg-[#092517] text-center max-[720px]:min-h-[105px]" key={stat.label}><i className="text-[#62e693] not-italic">{stat.icon}</i><strong className="mt-1 text-[26px]">{stat.value}</strong><span className="text-[11px] text-[#9aab9e]">{stat.label}</span></article>)}
      </section>

      <section className={`${section} py-[110px] max-[720px]:py-[75px]`}>
        <header className="mb-[42px] max-w-[660px]"><span className={kicker}>OUR JOURNEY</span><h2 className={heading}>Growing with our community.</h2></header>
        <div className="grid">
          {milestones.map((milestone) => <article className="grid grid-cols-[150px_1fr] gap-[35px] max-[720px]:grid-cols-[70px_1fr] max-[720px]:gap-2.5" key={milestone.year}><span className="pt-6 font-extrabold text-[#70e99e]">{milestone.year}</span><div className="relative border-l border-white/10 py-[20px_40px] pl-[38px]"><i className="absolute top-[30px] -left-[5px] h-[9px] w-[9px] rounded-full bg-[#31d875] shadow-[0_0_0_6px_#092918]" /><h3 className="mb-1 font-bold">{milestone.title}</h3><p className="text-[#a7b7aa]">{milestone.text}</p></div></article>)}
        </div>
      </section>
    </main>
  );
}
