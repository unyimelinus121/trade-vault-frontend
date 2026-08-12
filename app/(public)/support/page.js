"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiOrigin } from "@/app/api/api";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import useVisibleInterval from "@/app/hooks/use-visible-interval";

const workspaceLinks = [
  { label: "Overview", icon: "grid_view", href: "/" },
  { label: "Trade Gift Cards", icon: "swap_horiz", href: "/trade" },
  { label: "Account Settings", icon: "manage_accounts", href: "/account" },
  { label: "Support", icon: "support_agent", href: "/support" },
];

const fieldClass = "h-11 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/45 px-3 text-sm outline-none focus:border-primary/60 disabled:opacity-50";

function formatDate(value) {
  return new Date(value).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Avatar({ user }) {
  const avatarUrl = user?.avatar ? `${apiOrigin}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}` : "";
  return <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary font-bold text-on-primary">{avatarUrl ? <Image src={avatarUrl} alt={`${user.firstName} avatar`} width={48} height={48} unoptimized className="h-full w-full object-cover" /> : user?.firstName?.[0]?.toUpperCase() || "U"}</span>;
}

function StatusBadge({ status }) {
  const tones = { open: "bg-primary/10 text-primary", in_progress: "bg-secondary/10 text-secondary", resolved: "bg-tertiary/10 text-tertiary", closed: "bg-white/[.06] text-on-surface-variant" };
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${tones[status] || tones.open}`}>{(status || "open").replace("_", " ")}</span>;
}

export default function UserSupportPage() {
  const {
    user,
    token,
    authReady,
    supportTickets,
    selectedSupportTicket,
    supportMessages,
    supportPagination,
    supportLoading,
    supportError,
    supportMessage,
    clearSupportFeedback,
    getSupportTickets,
    createSupportTicket,
    getSupportTicketById,
    replyToSupportTicket,
  } = usePublicAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user && token) getSupportTickets({ status, page, limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, status, page]);

  useVisibleInterval(async () => {
    if (!user || !token) return;
    await getSupportTickets({ status, page, limit: 10 }, { silent: true });
    if (selectedSupportTicket?.id) {
      await getSupportTicketById(selectedSupportTicket.id, { silent: true });
    }
  }, 12_000, Boolean(user && token));

  async function submitTicket(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ticket = await createSupportTicket({ subject: form.get("subject"), category: form.get("category"), message: form.get("message") });
    if (ticket) {
      setShowCreate(false);
      await getSupportTicketById(ticket.id);
    }
  }

  async function sendReply(event) {
    event.preventDefault();
    if (await replyToSupportTicket(selectedSupportTicket.id, reply.trim())) setReply("");
  }

  if (!authReady) return <main className="grid min-h-screen place-items-center"><span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" /></main>;
  if (!user || !token) return <main className="stitch-glow grid min-h-screen place-items-center px-6"><section className="stitch-panel max-w-lg rounded-3xl p-10 text-center"><span className="material-symbols-outlined text-4xl text-primary">lock</span><h1 className="mt-5 text-4xl">Log in for support.</h1><p className="mt-3 text-sm text-on-surface-variant">Your support history is private to your TradeVault account.</p><Link href="/login" className="mt-7 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-bold text-on-primary">Log In</Link></section></main>;

  return (
    <div className="min-h-screen bg-background text-on-background">
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant/10 bg-surface-container-low max-[900px]:hidden"><Link href="/" className="flex h-20 items-center px-7"><Image src="/tradevault-logo.svg" alt="TradeVault" width={560} height={150} priority className="h-auto w-[166px]" /></Link><nav className="flex-1 space-y-1 px-4 pt-4"><p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-on-surface-variant/60">Workspace</p>{workspaceLinks.map((item) => <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${item.href === "/support" ? "bg-primary-container text-white" : "text-on-surface-variant hover:bg-white/[.04]"}`}><span className="material-symbols-outlined text-xl">{item.icon}</span>{item.label}</Link>)}</nav><div className="m-4 flex items-center gap-3 border-t border-outline-variant/20 pt-4"><Avatar user={user} /><div className="min-w-0"><strong className="block truncate text-xs">{user.firstName} {user.lastName}</strong><span className="block truncate text-[10px] text-on-surface-variant">{user.email}</span></div></div></aside>

      <header className="fixed top-0 right-0 left-72 z-40 flex h-20 items-center justify-between border-b border-outline-variant/10 bg-surface/60 px-8 backdrop-blur-xl max-[900px]:left-0 max-[600px]:px-4"><div className="flex items-center gap-3"><Link href="/" className="hidden max-[900px]:block"><Image src="/tradevault-mark.svg" alt="TradeVault" width={136} height={146} className="h-9 w-auto" /></Link><div><span className="text-[10px] font-bold uppercase tracking-[.14em] text-on-surface-variant">Personal workspace</span><h1 className="text-base font-semibold">Help Center</h1></div></div><Avatar user={user} /></header>

      <main className="min-h-screen pl-72 pt-20 max-[900px]:pl-0"><div className="mx-auto w-full max-w-[1400px] px-8 py-10 max-[600px]:px-4"><header className="mb-8 flex items-end justify-between gap-6 max-[620px]:items-start"><div><span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-primary">Account support</span><h2 className="text-[clamp(2rem,4vw,3rem)] tracking-[-.04em]">How can we help?</h2><p className="mt-2 text-sm text-on-surface-variant">Create a request and continue the conversation with the TradeVault team.</p></div><button onClick={() => { clearSupportFeedback(); setShowCreate(true); }} className="h-11 shrink-0 rounded-xl bg-primary-container px-5 text-xs font-extrabold text-white">New ticket</button></header>

        {(supportError || supportMessage) && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${supportError ? "border-error/20 bg-error/10 text-error" : "border-tertiary/20 bg-tertiary/10 text-tertiary"}`}>{supportError || supportMessage}</div>}

        <section className="grid min-h-[650px] grid-cols-[380px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/[.07] bg-surface-container-lowest/35 max-[900px]:grid-cols-1"><div className="border-r border-white/[.07] max-[900px]:border-r-0"><header className="border-b border-white/[.07] p-4"><div className="flex items-center justify-between"><div><h3 className="font-bold">Your tickets</h3><p className="text-[10px] text-on-surface-variant">{supportPagination.total} total</p></div><select className="h-9 rounded-xl border border-white/[.08] bg-surface-container-high px-3 text-[10px]" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div></header><div>{supportLoading && !supportTickets.length ? <div className="grid min-h-48 place-items-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" /></div> : supportTickets.length ? supportTickets.map((ticket) => <button type="button" onClick={() => getSupportTicketById(ticket.id)} key={ticket.id} className={`block w-full border-b border-white/[.06] p-4 text-left hover:bg-white/[.025] ${selectedSupportTicket?.id === ticket.id ? "border-l-2 border-l-primary-container bg-primary-container/[.06]" : ""}`}><div className="flex items-center justify-between gap-3"><strong className="truncate text-xs">{ticket.subject}</strong><StatusBadge status={ticket.status} /></div><p className="mt-2 text-[10px] capitalize text-on-surface-variant">{ticket.category} · TVS-{String(ticket.id).padStart(5, "0")}</p><time className="mt-2 block text-[9px] text-on-surface-variant/60">Updated {formatDate(ticket.updatedAt)}</time></button>) : <div className="p-8 text-center"><span className="material-symbols-outlined text-4xl text-on-surface-variant/40">inbox</span><h3 className="mt-3 text-sm">No tickets yet</h3><p className="mt-1 text-xs text-on-surface-variant">Create a ticket when you need help.</p></div>}</div><footer className="flex justify-between p-4 text-[10px]"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="disabled:opacity-30">Previous</button><span>{page}/{supportPagination.totalPages}</span><button disabled={page >= supportPagination.totalPages} onClick={() => setPage((value) => value + 1)} className="disabled:opacity-30">Next</button></footer></div>

          <div className="flex min-w-0 flex-col">{selectedSupportTicket ? <><header className="flex items-start justify-between gap-4 border-b border-white/[.07] p-5"><div><div className="mb-2 flex items-center gap-2"><StatusBadge status={selectedSupportTicket.status} /><span className="text-[9px] font-bold uppercase text-primary">{selectedSupportTicket.priority}</span></div><h3 className="text-lg">{selectedSupportTicket.subject}</h3><p className="mt-1 text-[10px] capitalize text-on-surface-variant">{selectedSupportTicket.category} · Opened {formatDate(selectedSupportTicket.createdAt)}</p></div></header><div className="flex-1 space-y-5 p-6">{supportMessages.map((message) => { const mine = message.senderId === user.id; return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] p-4 ${mine ? "rounded-[16px_4px_16px_16px] bg-primary-container text-white" : "rounded-[4px_16px_16px_16px] bg-white/[.06]"}`}><strong className="mb-2 block text-[10px]">{mine ? "You" : "TradeVault Support"}</strong><p className="whitespace-pre-wrap text-xs leading-6">{message.message}</p><time className="mt-2 block text-[9px] opacity-60">{formatDate(message.createdAt)}</time></div></div>; })}</div><form onSubmit={sendReply} className="border-t border-white/[.07] p-5"><textarea value={reply} onChange={(event) => setReply(event.target.value)} disabled={selectedSupportTicket.status === "closed" || supportLoading} maxLength={5000} className="min-h-24 w-full resize-y rounded-xl border border-white/[.08] bg-surface-container-highest/40 p-3 text-sm outline-none focus:border-primary/60 disabled:opacity-50" placeholder={selectedSupportTicket.status === "closed" ? "This ticket is closed." : "Write a reply..."} /><div className="mt-3 flex justify-end"><button disabled={!reply.trim() || selectedSupportTicket.status === "closed" || supportLoading} className="h-10 rounded-xl bg-primary-container px-5 text-xs font-bold text-white disabled:opacity-40">Send reply</button></div></form></> : <div className="grid flex-1 place-items-center p-8 text-center"><div><span className="material-symbols-outlined text-5xl text-on-surface-variant/35">forum</span><h3 className="mt-4 text-lg">Select a support ticket</h3><p className="mt-2 text-sm text-on-surface-variant">Open a ticket to read its conversation and replies.</p></div></div>}</div></section>
      </div></main>

      <nav className="fixed right-3 bottom-3 left-3 z-[60] hidden grid-cols-4 rounded-2xl border border-white/10 bg-surface-container/95 p-2 shadow-2xl backdrop-blur-xl max-[900px]:grid">{workspaceLinks.map((item) => <Link key={item.href} href={item.href} className={`grid place-items-center gap-1 rounded-xl py-2 text-[9px] ${item.href === "/support" ? "bg-primary-container text-white" : "text-on-surface-variant"}`}><span className="material-symbols-outlined text-lg">{item.icon}</span>{item.label.split(" ")[0]}</Link>)}</nav>

      {showCreate && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><section className="w-full max-w-xl rounded-3xl border border-white/10 bg-surface-container-low p-6"><header className="mb-6 flex items-start justify-between"><div><h2 className="text-2xl">Create a support ticket</h2><p className="mt-1 text-sm text-on-surface-variant">Describe the issue and our team can reply here.</p></div><button onClick={() => setShowCreate(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/[.06]">×</button></header><form onSubmit={submitTicket} className="space-y-5"><label><span className="mb-2 block text-xs font-bold">Subject</span><input className={fieldClass} name="subject" maxLength={160} required disabled={supportLoading} /></label><label><span className="mb-2 block text-xs font-bold">Category</span><select className={fieldClass} name="category" defaultValue="Account" disabled={supportLoading}><option>Account</option><option>Gift card trade</option><option>Payment</option><option>Verification</option><option>Technical issue</option><option>Other</option></select></label><label><span className="mb-2 block text-xs font-bold">How can we help?</span><textarea className="min-h-36 w-full resize-y rounded-xl border border-white/[.08] bg-surface-container-highest/45 p-3 text-sm outline-none focus:border-primary/60" name="message" maxLength={5000} required disabled={supportLoading} /></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setShowCreate(false)} className="h-11 rounded-xl border border-white/10 px-5 text-sm font-bold">Cancel</button><button disabled={supportLoading} className="h-11 rounded-xl bg-primary px-5 text-sm font-extrabold text-on-primary disabled:opacity-50">{supportLoading ? "Creating..." : "Create ticket"}</button></div></form></section></div>}
    </div>
  );
}
