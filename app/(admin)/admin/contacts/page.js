export const metadata = {
  title: "Contacts | TradeVault Admin",
};

const conversations = [
  { name: "Chinedu Okafor", initials: "CO", subject: "Amazon card verification", preview: "I submitted my card about twenty minutes ago...", time: "2 min", status: "New", tone: "from-[#22c96a] to-[#0b6b35]" },
  { name: "Amara Johnson", initials: "AJ", subject: "Payment confirmation", preview: "Thank you, I have received the transfer.", time: "18 min", status: "Open", tone: "from-[#37ca72] to-[#176d3c]" },
  { name: "David Mensah", initials: "DM", subject: "Steam card rate", preview: "Can you confirm today’s rate for a $100 card?", time: "42 min", status: "Open", tone: "from-[#2bcf70] to-[#14703b]" },
  { name: "Sofia Williams", initials: "SW", subject: "Unable to upload image", preview: "The upload stops when I select the second photo.", time: "1 hr", status: "Pending", tone: "from-[#6bbd4b] to-[#3f7d2b]" },
  { name: "Michael Adeyemi", initials: "MA", subject: "Account profile update", preview: "I need to change the phone number on my account.", time: "3 hr", status: "Closed", tone: "from-[#5a6c60] to-[#243b2a]" },
];

function Metric({ label, value, note, icon, tone }) {
  return (
    <article className="rounded-2xl border border-white/[.07] bg-[#09130c] p-5">
      <div className="mb-5 flex items-start justify-between"><i className={`grid h-10 w-10 place-items-center rounded-xl text-base not-italic ${tone}`}>{icon}</i><span className="text-[9px] text-[#738577]">TODAY</span></div>
      <span className="text-xs text-[#899b8d]">{label}</span><strong className="mt-1 block text-2xl">{value}</strong><small className="mt-2 block text-[10px] text-[#6c7f71]">{note}</small>
    </article>
  );
}

export default function ContactsPage() {
  return (
    <div className="pb-20">
      <header className="mb-8 flex items-end justify-between gap-6 max-[700px]:items-start">
        <div><span className="mb-2 block text-[10px] font-extrabold tracking-[.16em] text-[#4edc87]">SUPPORT WORKSPACE</span><h2 className="text-[clamp(28px,4vw,40px)] leading-tight tracking-[-.04em]">Customer contacts</h2><p className="mt-2 text-sm text-[#899b8d]">Review customer messages, resolve requests, and keep response times low.</p></div>
        <button className="rounded-xl bg-[#11984b] px-4 py-3 text-xs font-extrabold text-white shadow-[0_12px_28px_rgba(17,152,75,.25)] max-[600px]:hidden" type="button">＋ New message</button>
      </header>

      <section className="mb-8 grid grid-cols-4 gap-4 max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1">
        <Metric label="Open requests" value="24" note="8 need a first response" icon="✉" tone="bg-[#22c96a]/10 text-[#67e99a]" />
        <Metric label="Resolved today" value="31" note="+12% above daily average" icon="✓" tone="bg-[#39e879]/10 text-[#72eda0]" />
        <Metric label="Average response" value="4m 12s" note="Within the 5 minute target" icon="ϟ" tone="bg-[#9ddd62]/10 text-[#b5eb7e]" />
        <Metric label="Satisfaction" value="96.8%" note="Based on 148 responses" icon="☆" tone="bg-[#55df89]/10 text-[#7bea9f]" />
      </section>

      <section className="grid min-h-[650px] grid-cols-[minmax(330px,.85fr)_1.15fr] overflow-hidden rounded-[20px] border border-white/[.07] bg-[#07100a] max-[900px]:grid-cols-1">
        <div className="border-r border-white/[.07] max-[900px]:border-r-0">
          <header className="border-b border-white/[.07] p-5">
            <div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">Support inbox</h3><p className="text-[10px] text-[#77897b]">24 active conversations</p></div><button className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.04] text-[#91a395]" type="button">☷</button></div>
            <label className="relative block"><span className="absolute top-1/2 left-3 -translate-y-1/2 text-[#687b6d]">⌕</span><input className="h-10 w-full rounded-xl border border-white/[.07] bg-[#0b160e] pr-3 pl-9 text-xs text-white outline-none placeholder:text-[#697b6e] focus:border-[#22c96a]/50" placeholder="Search contacts or messages" /></label>
            <div className="mt-3 flex gap-2 text-[10px]"><button className="rounded-lg bg-[#11984b] px-3 py-1.5 font-bold text-white">All</button><button className="rounded-lg bg-white/[.04] px-3 py-1.5 text-[#90a194]">Unread</button><button className="rounded-lg bg-white/[.04] px-3 py-1.5 text-[#90a194]">Assigned</button></div>
          </header>
          <div>
            {conversations.map((item, index) => (
              <article className={`flex cursor-pointer gap-3 border-b border-white/[.06] p-4 transition hover:bg-white/[.025] ${index === 0 ? "border-l-2 border-l-[#22c96a] bg-[#22c96a]/[.055]" : ""}`} key={item.name}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-[11px] font-extrabold ${item.tone}`}>{item.initials}</span>
                <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><strong className="truncate text-xs">{item.name}</strong><time className="shrink-0 text-[9px] text-[#6d8072]">{item.time}</time></div><div className="mt-1 flex items-center gap-2"><span className="truncate text-[11px] font-semibold text-[#afbeb2]">{item.subject}</span>{item.status === "New" && <i className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#31d875]" />}</div><p className="mt-1 truncate text-[10px] text-[#748678]">{item.preview}</p></div>
              </article>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between border-b border-white/[.07] p-5">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#22c96a] to-[#0b6b35] text-xs font-extrabold">CO</span><div><h3 className="text-sm font-bold">Chinedu Okafor</h3><p className="text-[10px] text-[#7f9283]">Amazon card verification · #TV-20491</p></div></div>
            <div className="flex gap-2"><button className="rounded-xl border border-white/[.07] bg-white/[.035] px-3 py-2 text-[10px] text-[#9db0a1]">Assign</button><button className="rounded-xl bg-[#39e879]/10 px-3 py-2 text-[10px] font-bold text-[#72eda0]">Resolve</button></div>
          </header>
          <div className="flex-1 space-y-5 p-6">
            <div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#22c96a] to-[#0b6b35] text-[9px] font-bold">CO</span><div className="max-w-[75%] rounded-[4px_16px_16px_16px] bg-white/[.055] p-4"><p className="text-xs leading-relaxed text-[#c5d1c7]">Hello, I submitted my Amazon gift card about twenty minutes ago but the status still says it is being reviewed. Could you please check it for me?</p><time className="mt-2 block text-[9px] text-[#6b7e70]">10:42 AM</time></div></div>
            <div className="flex justify-end"><div className="max-w-[75%] rounded-[16px_4px_16px_16px] bg-[#11984b] p-4"><p className="text-xs leading-relaxed text-white">Hi Chinedu, I’m checking trade #TV-20491 now. The card image is clear and the verification should complete shortly.</p><time className="mt-2 block text-right text-[9px] text-white/60">10:44 AM · Delivered</time></div></div>
            <div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#22c96a] to-[#0b6b35] text-[9px] font-bold">CO</span><div className="max-w-[75%] rounded-[4px_16px_16px_16px] bg-white/[.055] p-4"><p className="text-xs leading-relaxed text-[#c5d1c7]">Perfect, thank you. Please let me know if you need another image.</p><time className="mt-2 block text-[9px] text-[#6b7e70]">10:45 AM</time></div></div>
          </div>
          <footer className="border-t border-white/[.07] p-5"><div className="rounded-2xl border border-white/[.08] bg-[#0b160e] p-3"><textarea className="min-h-20 w-full resize-none bg-transparent text-xs text-white outline-none placeholder:text-[#657869]" placeholder="Write a reply..." /><div className="flex items-center justify-between"><div className="flex gap-1"><button className="grid h-8 w-8 place-items-center rounded-lg text-[#829487] hover:bg-white/5">＋</button><button className="grid h-8 w-8 place-items-center rounded-lg text-[#829487] hover:bg-white/5">☺</button></div><button className="rounded-xl bg-[#11984b] px-4 py-2 text-[10px] font-extrabold text-white">Send reply →</button></div></div></footer>
        </div>
      </section>
    </div>
  );
}
