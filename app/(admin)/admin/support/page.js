"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "@/app/providers/adminProvider/admin";
import { fieldClass, UserAvatar } from "../components/users/user-ui";
import { PriorityBadge, TicketEmptyState, TicketStatusBadge } from "../components/support/support-ui";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminSupportPage() {
  const {
    supportTickets,
    supportPagination,
    supportLoading,
    supportError,
    supportMessage,
    getSupportTickets,
  } = useAdmin();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [order, setOrder] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const filters = { search: appliedSearch, status, priority, category, order, page, limit: 10 };
    getSupportTickets(filters);
    const refreshTimer = window.setInterval(() => {
      getSupportTickets(filters, { silent: true });
    }, 15_000);
    return () => window.clearInterval(refreshTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, status, priority, category, order, page]);

  const counts = supportTickets.reduce(
    (result, ticket) => ({ ...result, [ticket.status]: (result[ticket.status] || 0) + 1 }),
    {},
  );

  return (
    <div className="pb-20">
      <header className="mb-8"><span className="mb-2 block text-[10px] font-extrabold tracking-[.16em] text-primary-container">SUPPORT OPERATIONS</span><h2 className="text-[clamp(28px,4vw,40px)] leading-tight tracking-[-.04em]">Help Center</h2><p className="mt-2 text-sm text-on-surface-variant">Review real support requests, respond to users, and manage resolution status.</p></header>

      <section className="mb-7 grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        {[["All tickets", supportPagination.total, "support_agent", "text-primary"], ["Open on this page", counts.open || 0, "mark_email_unread", "text-primary"], ["In progress", counts.in_progress || 0, "pending_actions", "text-secondary"], ["Resolved", counts.resolved || 0, "task_alt", "text-tertiary"]].map(([label, value, icon, tone]) => <article key={label} className="rounded-2xl border border-white/[.07] bg-surface-container-low p-5"><span className={`material-symbols-outlined ${tone}`}>{icon}</span><span className="mt-5 block text-xs text-on-surface-variant">{label}</span><strong className="mt-1 block text-2xl">{Number(value).toLocaleString()}</strong></article>)}
      </section>

      {(supportError || supportMessage) && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${supportError ? "border-error/20 bg-error/10 text-error" : "border-tertiary/20 bg-tertiary/10 text-tertiary"}`}>{supportError || supportMessage}</div>}

      <section className="overflow-hidden rounded-[20px] border border-white/[.07] bg-surface-container-lowest/45">
        <header className="border-b border-white/[.07] p-5"><div className="mb-4"><h3 className="font-bold">Support tickets</h3><p className="text-[10px] text-on-surface-variant/65">Only authenticated administrators can access this inbox.</p></div><div className="grid grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(125px,.65fr))] gap-3 max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1"><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); }}><input className={fieldClass} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user, email, or subject" /><button className="rounded-xl bg-white/[.07] px-3 text-xs font-bold">Search</button></form><select className={fieldClass} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select><select className={fieldClass} value={priority} onChange={(event) => { setPriority(event.target.value); setPage(1); }}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input className={fieldClass} value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} placeholder="Category" /><select className={fieldClass} value={order} onChange={(event) => { setOrder(event.target.value); setPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div></header>

        {supportLoading ? <div className="grid min-h-72 place-items-center"><span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" /></div> : supportTickets.length === 0 ? <TicketEmptyState /> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left"><thead><tr className="border-b border-white/[.07] bg-white/[.018] text-[9px] font-extrabold tracking-[.1em] text-on-surface-variant/65 uppercase"><th className="px-5 py-4">Ticket</th><th className="px-5 py-4">User</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Priority</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Updated</th><th className="px-5 py-4" /></tr></thead><tbody>{supportTickets.map((ticket) => <tr className="border-b border-white/[.055] transition last:border-0 hover:bg-white/[.02]" key={ticket.id}><td className="px-5 py-4"><Link href={`/admin/support/${ticket.id}`} className="block max-w-64 truncate text-xs font-bold hover:text-primary">{ticket.subject}</Link><span className="mt-1 block text-[9px] text-primary">TVS-{String(ticket.id).padStart(5, "0")}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2"><UserAvatar user={ticket.user} /><div><strong className="block text-xs">{ticket.user?.firstName} {ticket.user?.lastName}</strong><span className="text-[9px] text-on-surface-variant">{ticket.user?.email}</span></div></div></td><td className="px-5 py-4 text-xs capitalize text-on-surface-variant">{ticket.category}</td><td className="px-5 py-4"><TicketStatusBadge status={ticket.status} /></td><td className="px-5 py-4"><PriorityBadge priority={ticket.priority} /></td><td className="px-5 py-4 text-[10px] text-on-surface-variant">{formatDate(ticket.createdAt)}</td><td className="px-5 py-4 text-[10px] text-on-surface-variant">{formatDate(ticket.updatedAt)}</td><td className="px-5 py-4"><Link href={`/admin/support/${ticket.id}`} className="grid h-9 w-9 place-items-center rounded-lg bg-white/[.04] text-on-surface-variant"><span className="material-symbols-outlined text-lg">chevron_right</span></Link></td></tr>)}</tbody></table></div>}

        <footer className="flex items-center justify-between gap-4 border-t border-white/[.07] p-4 text-[10px] text-on-surface-variant"><span>Page {supportPagination.page} of {supportPagination.totalPages}</span><div className="flex gap-2"><button disabled={page <= 1 || supportLoading} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="rounded-lg border border-white/[.08] px-3 py-2 disabled:opacity-40">Previous</button><button disabled={page >= supportPagination.totalPages || supportLoading} onClick={() => setPage((value) => value + 1)} className="rounded-lg bg-primary-container px-3 py-2 font-bold text-white disabled:opacity-40">Next</button></div></footer>
      </section>
    </div>
  );
}
