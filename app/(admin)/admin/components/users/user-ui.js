"use client";

import Image from "next/image";
import { apiOrigin } from "@/app/api/api";

export const fieldClass =
  "h-11 w-full rounded-xl border border-white/[.08] bg-surface-container-highest/55 px-3 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-60";

export function StatusBadge({ status }) {
  const tones = {
    active: "bg-tertiary/10 text-tertiary",
    suspended: "bg-error/10 text-error",
    deactivated: "bg-white/[.06] text-on-surface-variant",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${tones[status] || tones.deactivated}`}>
      {status || "unknown"}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${role === "admin" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
      {role || "user"}
    </span>
  );
}

export function UserAvatar({ user, size = "medium" }) {
  const dimensions = size === "large" ? "h-20 w-20 text-2xl" : "h-10 w-10 text-xs";
  const avatarUrl = user?.avatar
    ? `${apiOrigin}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`
    : "";
  const initials = `${user?.firstName?.[0] || "U"}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-container to-secondary-container font-extrabold text-white ${dimensions}`}>
      {avatarUrl ? (
        <Image src={avatarUrl} alt={`${user.firstName || "User"} avatar`} width={80} height={80} unoptimized className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export function Modal({ title, description, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <section className={`responsive-dialog my-auto w-full rounded-3xl border border-white/10 bg-surface-container-low p-6 shadow-2xl max-[520px]:p-5 ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <header className="mb-6 flex items-start justify-between gap-5">
          <div><h2 className="text-2xl">{title}</h2>{description && <p className="mt-1 text-sm text-on-surface-variant">{description}</p>}</div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[.06] text-on-surface-variant" aria-label="Close dialog">×</button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel, busy, onConfirm, onClose, danger = true }) {
  return (
    <Modal title={title} description={message} onClose={onClose}>
      <div className="flex justify-end gap-3 max-[420px]:grid max-[420px]:grid-cols-1">
        <button type="button" onClick={onClose} disabled={busy} className="h-11 rounded-xl border border-white/10 px-5 text-sm font-bold text-on-surface-variant">Cancel</button>
        <button type="button" onClick={onConfirm} disabled={busy} className={`h-11 rounded-xl px-5 text-sm font-bold disabled:opacity-50 ${danger ? "bg-error text-[#4c0007]" : "bg-primary text-on-primary"}`}>{busy ? "Working..." : confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function UserForm({ initialUser, submitLabel, busy, onSubmit, onCancel }) {
  const editing = Boolean(initialUser);

  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      ...(editing
        ? { isVerified: data.get("isVerified") === "true" }
        : {
            password: data.get("password"),
            role: data.get("role"),
            accountStatus: data.get("accountStatus"),
            isVerified: data.get("isVerified") === "true",
            avatar: data.get("avatar")?.size ? data.get("avatar") : undefined,
          }),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
        <label><span className="mb-2 block text-xs font-bold">First name</span><input className={fieldClass} name="firstName" defaultValue={initialUser?.firstName || ""} required disabled={busy} /></label>
        <label><span className="mb-2 block text-xs font-bold">Last name</span><input className={fieldClass} name="lastName" defaultValue={initialUser?.lastName || ""} required disabled={busy} /></label>
      </div>
      <label><span className="mb-2 block text-xs font-bold">Email address</span><input className={fieldClass} type="email" name="email" defaultValue={initialUser?.email || ""} required disabled={busy} /></label>
      {!editing && <label><span className="mb-2 block text-xs font-bold">Temporary password</span><input className={fieldClass} type="password" name="password" minLength={8} required disabled={busy} autoComplete="new-password" /></label>}
      <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
        {!editing && <label><span className="mb-2 block text-xs font-bold">Role</span><select className={fieldClass} name="role" defaultValue="user" disabled={busy}><option value="user">User</option><option value="admin">Admin</option></select></label>}
        {!editing && <label><span className="mb-2 block text-xs font-bold">Account status</span><select className={fieldClass} name="accountStatus" defaultValue="active" disabled={busy}><option value="active">Active</option><option value="deactivated">Deactivated</option><option value="suspended">Suspended</option></select></label>}
        <label><span className="mb-2 block text-xs font-bold">Verification</span><select className={fieldClass} name="isVerified" defaultValue={String(initialUser?.isVerified ?? true)} disabled={busy}><option value="true">Verified</option><option value="false">Unverified</option></select></label>
      </div>
      {!editing && <label><span className="mb-2 block text-xs font-bold">Avatar (optional)</span><input className="block w-full rounded-xl border border-dashed border-white/10 bg-white/[.025] p-3 text-xs text-on-surface-variant" type="file" name="avatar" accept="image/*" disabled={busy} /></label>}
      <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onCancel} disabled={busy} className="h-11 rounded-xl border border-white/10 px-5 text-sm font-bold text-on-surface-variant">Cancel</button><button type="submit" disabled={busy} className="h-11 rounded-xl bg-primary px-5 text-sm font-extrabold text-on-primary disabled:opacity-50">{busy ? "Saving..." : submitLabel}</button></div>
    </form>
  );
}
