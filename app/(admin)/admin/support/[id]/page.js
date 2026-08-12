"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "@/app/providers/adminProvider/admin";
import { fieldClass, UserAvatar } from "../../components/users/user-ui";
import { PriorityBadge, TicketStatusBadge } from "../../components/support/support-ui";

function formatDate(value) {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTicketDetailsPage() {
  const { id } = useParams();
  const {
    selectedTicket,
    ticketMessages,
    supportLoading,
    supportError,
    supportMessage,
    clearSupportFeedback,
    getSupportTicketById,
    updateSupportTicket,
    replyToSupportTicket,
  } = useAdmin();
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [reply, setReply] = useState("");

  useEffect(() => {
    let active = true;
    async function loadTicket() {
      if (!id) return;
      const data = await getSupportTicketById(id);
      if (active && data?.ticket) {
        setStatus(data.ticket.status);
        setPriority(data.ticket.priority);
      }
    }
    loadTicket();
    const refreshTimer = window.setInterval(() => {
      if (id) getSupportTicketById(id, { silent: true });
    }, 10_000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveTicketChanges(changes) {
    const updated = await updateSupportTicket(id, changes);
    if (updated) {
      setStatus(updated.status);
      setPriority(updated.priority);
    }
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!reply.trim()) return;
    if (await replyToSupportTicket(id, reply.trim())) setReply("");
  }

  if (supportLoading && !selectedTicket) return <div className="grid min-h-[65vh] place-items-center"><span className="h-11 w-11 animate-spin rounded-full border-2 border-outline-variant border-t-primary" /></div>;
  if (!selectedTicket) return <section className="stitch-panel mx-auto max-w-xl rounded-3xl p-10 text-center"><span className="material-symbols-outlined text-4xl text-error">support_agent</span><h2 className="mt-4 text-2xl">Ticket unavailable</h2><p className="mt-2 text-sm text-on-surface-variant">{supportError || "This ticket could not be found."}</p><Link href="/admin/support" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary">Return to Help Center</Link></section>;

  const ticket = selectedTicket;
  return (
    <div className="pb-20">
      <div className="mb-7"><Link href="/admin/support" className="inline-flex items-center gap-2 text-xs font-bold text-primary"><span className="material-symbols-outlined text-base">arrow_back</span>Back to Help Center</Link></div>
      {(supportError || supportMessage) && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${supportError ? "border-error/20 bg-error/10 text-error" : "border-tertiary/20 bg-tertiary/10 text-tertiary"}`}>{supportError || supportMessage}</div>}

      <section className="mb-6 rounded-3xl border border-white/[.07] bg-surface-container-low p-7"><div className="flex items-start justify-between gap-6 max-[800px]:flex-col"><div><div className="mb-3 flex flex-wrap items-center gap-2"><TicketStatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} /><span className="text-[10px] font-bold text-on-surface-variant">TVS-{String(ticket.id).padStart(5, "0")}</span></div><h2 className="text-[clamp(26px,4vw,38px)] tracking-[-.04em]">{ticket.subject}</h2><p className="mt-2 text-sm capitalize text-on-surface-variant">{ticket.category} · Opened {formatDate(ticket.createdAt)}</p></div><div className="flex gap-2"><button type="button" disabled={supportLoading || ticket.status === "resolved"} onClick={() => saveTicketChanges({ status: "resolved" })} className="h-10 rounded-xl bg-tertiary/10 px-4 text-xs font-bold text-tertiary disabled:opacity-40">Mark resolved</button><button type="button" disabled={supportLoading || ticket.status === "closed"} onClick={() => saveTicketChanges({ status: "closed" })} className="h-10 rounded-xl border border-white/10 px-4 text-xs font-bold text-on-surface-variant disabled:opacity-40">Close</button></div></div></section>

      <div className="grid grid-cols-[minmax(0,1.3fr)_360px] gap-6 max-[1000px]:grid-cols-1">
        <section className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl border border-white/[.07] bg-surface-container-lowest/40">
          <header className="border-b border-white/[.07] p-5"><h3 className="font-bold">Conversation</h3><p className="text-[10px] text-on-surface-variant">{ticketMessages.length} message{ticketMessages.length === 1 ? "" : "s"}</p></header>
          <div className="flex-1 space-y-5 p-6">{ticketMessages.map((message) => { const adminMessage = message.sender?.role === "admin"; return <div key={message.id} className={`flex gap-3 ${adminMessage ? "justify-end" : "justify-start"}`}>{!adminMessage && <UserAvatar user={message.sender || ticket.user} />}<div className={`max-w-[76%] p-4 ${adminMessage ? "rounded-[16px_4px_16px_16px] bg-primary-container text-white" : "rounded-[4px_16px_16px_16px] bg-white/[.055] text-on-surface"}`}><div className="mb-2 flex items-center justify-between gap-4"><strong className="text-[10px]">{message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : "Deleted user"}</strong><span className="text-[9px] opacity-60">{message.sender?.role || "user"}</span></div><p className="whitespace-pre-wrap text-xs leading-6">{message.message}</p><time className="mt-2 block text-[9px] opacity-60">{formatDate(message.createdAt)}</time></div></div>; })}</div>
          <form onSubmit={sendReply} className="border-t border-white/[.07] p-5"><textarea value={reply} onChange={(event) => setReply(event.target.value)} disabled={supportLoading || ticket.status === "closed"} maxLength={5000} className="min-h-28 w-full resize-y rounded-xl border border-white/[.08] bg-surface-container-highest/45 p-4 text-sm outline-none focus:border-primary/60 disabled:opacity-50" placeholder={ticket.status === "closed" ? "Reopen the ticket before replying." : "Write an admin reply..."} /><div className="mt-3 flex items-center justify-between"><span className="text-[10px] text-on-surface-variant">{reply.length}/5000</span><button disabled={supportLoading || !reply.trim() || ticket.status === "closed"} className="h-10 rounded-xl bg-primary-container px-5 text-xs font-extrabold text-white disabled:opacity-40">Send reply</button></div></form>
        </section>

        <aside className="space-y-6">
          <section className="stitch-panel rounded-2xl p-6"><h3 className="text-lg">Requester</h3><div className="mt-5 flex items-center gap-3"><UserAvatar user={ticket.user} /><div className="min-w-0"><strong className="block truncate text-sm">{ticket.user?.firstName} {ticket.user?.lastName}</strong><span className="block truncate text-[10px] text-on-surface-variant">{ticket.user?.email}</span></div></div><Link href={`/admin/users/${ticket.userId}`} className="mt-5 flex h-10 items-center justify-center rounded-xl border border-white/10 text-xs font-bold text-primary">View user profile</Link></section>
          <section className="stitch-panel rounded-2xl p-6"><h3 className="text-lg">Ticket controls</h3><label className="mt-5 block"><span className="mb-2 block text-xs font-bold">Status</span><select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label><label className="mt-4 block"><span className="mb-2 block text-xs font-bold">Priority</span><select className={fieldClass} value={priority} onChange={(event) => setPriority(event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><button type="button" disabled={supportLoading || (status === ticket.status && priority === ticket.priority)} onClick={() => { clearSupportFeedback(); saveTicketChanges({ status, priority }); }} className="mt-5 h-11 w-full rounded-xl bg-primary text-xs font-extrabold text-on-primary disabled:opacity-40">Save ticket controls</button><div className="mt-5 border-t border-white/[.07] pt-5 text-[10px] text-on-surface-variant"><p>Created: {formatDate(ticket.createdAt)}</p><p className="mt-2">Updated: {formatDate(ticket.updatedAt)}</p></div></section>
        </aside>
      </div>
    </div>
  );
}
