import { contactChannels, contactQuestions, supportHours } from "../datasources/page-data";

export const metadata = { title: "Contact TradeVault" };

const section = "mx-auto w-[min(1180px,calc(100%_-_48px))] max-[720px]:w-[calc(100%_-_32px)]";
const kicker = "mb-3.5 block text-xs font-extrabold tracking-[.16em] text-primary";
const gmailComposeUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=tradevaultnigeria@gmail.com";

export default function ContactPage() {
  return (
    <main className="overflow-hidden">
      <section className={`${section} relative grid min-h-[440px] max-w-[900px] content-center text-center before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_45%,rgba(17,152,75,.18),transparent_62%)] max-[720px]:min-h-[370px]`}>
        <span className="relative mx-auto inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-extrabold tracking-[.16em] text-primary">◉ &nbsp; We are here to help</span>
        <h1 className="relative my-[22px] text-[clamp(48px,6vw,76px)] leading-[1.02] tracking-[-.05em] max-[720px]:text-5xl">Get in touch with <span className="text-primary">TradeVault.</span></h1>
        <p className="relative mx-auto max-w-[670px] text-[17px] text-on-surface-variant">Whether you need help with a trade, a rate, or your account, our team is ready to point you in the right direction.</p>
      </section>

      <section className={`${section} grid grid-cols-3 gap-[18px] py-[20px_95px] max-[1000px]:grid-cols-2 max-[720px]:grid-cols-1 max-[720px]:py-[20px_75px]`}>
        {contactChannels.map((channel) => (
          <article className="stitch-panel rounded-2xl p-[30px]" key={channel.title}>
            <i className="grid h-[46px] w-[46px] place-items-center rounded-[11px] bg-primary/10 text-primary not-italic">{channel.icon}</i>
            <h3 className="mt-[22px] mb-[7px] font-bold">{channel.title}</h3>
            <a className="font-bold text-primary" href={channel.title === "Email support" ? gmailComposeUrl : channel.title === "Call us" ? "tel:+2348101234567" : "#office"} target={channel.title === "Email support" ? "_blank" : undefined} rel={channel.title === "Email support" ? "noreferrer" : undefined}>{channel.value}</a>
            <p className="text-[13px] text-[#a7b7aa]">{channel.detail}</p>
          </article>
        ))}
      </section>

      <section className={`${section} grid grid-cols-[1.1fr_.9fr] gap-6 border-t border-white/10 py-[100px] max-[1000px]:grid-cols-1 max-[1000px]:gap-10 max-[720px]:py-[75px]`} id="office">
        <article className="stitch-panel rounded-[18px] p-[38px]">
          <span className={kicker}>24/7 AVAILABILITY</span>
          <h2 className="mb-[22px] text-[clamp(33px,4vw,50px)] leading-[1.12] tracking-[-.04em]">We are available every day.</h2>
          {supportHours.map((hour) => <div className="flex justify-between gap-5 border-t border-white/10 py-[17px] text-[#a7b7aa]" key={hour.day}><span>{hour.day}</span><strong className="text-[#e8f1ea]">{hour.time}</strong></div>)}
        </article>
        <aside className="stitch-panel rounded-[18px] p-[38px]">
          <i className="grid h-14 w-14 place-items-center rounded-[14px] bg-[#2ed471]/15 font-black text-[#78eda4] not-italic">◖</i>
          <h3 className="mt-[25px] mb-2.5 text-[23px] font-bold">Need help with a trade?</h3>
          <p className="text-[#a7b7aa]">Include your trade reference, the card type, and a short description when you contact us. This helps our team support you faster.</p>
          <a className="mt-3 inline-block font-extrabold text-[#78eda4]" href={gmailComposeUrl} target="_blank" rel="noreferrer">Email support →</a>
        </aside>
      </section>

      <section className={`${section} grid grid-cols-[.8fr_1.2fr] gap-20 pb-[110px] max-[1000px]:grid-cols-1 max-[1000px]:gap-10 max-[720px]:pb-[85px]`}>
        <header><span className={kicker}>QUESTIONS, ANSWERED</span><h2 className="text-[clamp(32px,4vw,50px)] leading-[1.13] tracking-[-.035em]">Common support questions</h2></header>
        <div>
          {contactQuestions.map((item) => (
            <details className="group border-b border-white/10" key={item.question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-bold marker:hidden">
                <span>{item.question}</span>
                <span className="text-xl font-normal text-[#62e693] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-5 pr-10 text-sm leading-7 text-on-surface-variant">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
