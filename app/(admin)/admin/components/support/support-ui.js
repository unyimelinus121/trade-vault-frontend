export function TicketStatusBadge({ status }) {
  const tones = {
    open: "bg-primary/10 text-primary",
    in_progress: "bg-secondary/10 text-secondary",
    resolved: "bg-tertiary/10 text-tertiary",
    closed: "bg-white/[.06] text-on-surface-variant",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${tones[status] || tones.open}`}>{(status || "open").replace("_", " ")}</span>;
}

export function PriorityBadge({ priority }) {
  const tones = {
    low: "text-on-surface-variant",
    medium: "text-primary",
    high: "text-[#b5eb7e]",
    urgent: "text-error",
  };
  return <span className={`text-[10px] font-extrabold uppercase tracking-[.08em] ${tones[priority] || tones.medium}`}>{priority || "medium"}</span>;
}

export function TicketEmptyState({ title = "No support tickets", message }) {
  return <div className="grid min-h-72 place-items-center p-8 text-center"><div><span className="material-symbols-outlined text-4xl text-on-surface-variant/45">support_agent</span><h3 className="mt-3 text-lg">{title}</h3><p className="mt-1 max-w-sm text-sm text-on-surface-variant">{message || "There are no tickets matching these filters."}</p></div></div>;
}
