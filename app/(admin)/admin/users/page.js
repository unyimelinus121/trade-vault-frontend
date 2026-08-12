"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "@/app/providers/adminProvider/admin";
import {
  ConfirmDialog,
  Modal,
  RoleBadge,
  StatusBadge,
  UserAvatar,
  UserForm,
  fieldClass,
} from "../components/users/user-ui";

function formatDate(value, fallback = "Never") {
  return value
    ? new Date(value).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : fallback;
}

export default function UsersPage() {
  const {
    users,
    usersSummary,
    usersPagination,
    usersLoading,
    userLoading,
    usersError,
    usersMessage,
    clearUsersFeedback,
    getUsers,
    createUser,
    updateUserRole,
    updateUserStatus,
    deleteUser,
  } = useAdmin();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [verified, setVerified] = useState("");
  const [sort, setSort] = useState("joined");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    getUsers({ search: appliedSearch, role, status, verified, sort, order, page, limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, role, status, verified, sort, order, page]);

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  async function submitCreate(payload) {
    const created = await createUser(payload);
    if (created) {
      setShowCreate(false);
      await getUsers({ search: appliedSearch, role, status, verified, sort, order, page: 1, limit: 10 });
      setPage(1);
    }
  }

  async function runConfirmedAction() {
    if (!confirmAction) return;
    let success = false;
    if (confirmAction.type === "delete") success = await deleteUser(confirmAction.user.id);
    if (confirmAction.type === "status") success = Boolean(await updateUserStatus(confirmAction.user.id, confirmAction.value));
    if (confirmAction.type === "role") success = Boolean(await updateUserRole(confirmAction.user.id, confirmAction.value));
    if (success) {
      setConfirmAction(null);
      await getUsers({ search: appliedSearch, role, status, verified, sort, order, page, limit: 10 });
    }
  }

  const metrics = [
    ["Total users", usersSummary.total, "group", "bg-primary/10 text-primary"],
    ["Active accounts", usersSummary.active, "verified_user", "bg-tertiary/10 text-tertiary"],
    ["Verified users", usersSummary.verified, "task_alt", "bg-secondary/10 text-secondary"],
    ["Administrators", usersSummary.admins, "admin_panel_settings", "bg-error/10 text-error"],
  ];

  return (
    <div className="pb-20">
      <header className="mb-8 flex items-end justify-between gap-6 max-[700px]:items-start">
        <div><span className="mb-2 block text-[10px] font-extrabold tracking-[.16em] text-primary-container">IDENTITY & ACCESS</span><h2 className="text-[clamp(28px,4vw,40px)] leading-tight tracking-[-.04em]">Users</h2><p className="mt-2 text-sm text-on-surface-variant">Manage real TradeVault accounts, roles, verification, and access status.</p></div>
        <button type="button" onClick={() => { clearUsersFeedback(); setShowCreate(true); }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-container px-4 text-xs font-extrabold text-white shadow-[0_12px_28px_rgba(17,152,75,.25)]"><span className="material-symbols-outlined text-lg">person_add</span>Add user</button>
      </header>

      <section className="mb-7 grid grid-cols-4 gap-4 max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1">
        {metrics.map(([label, value, icon, tone]) => <article className="rounded-2xl border border-white/[.07] bg-surface-container-low p-5" key={label}><span className={`mb-5 grid h-10 w-10 place-items-center rounded-xl ${tone}`}><span className="material-symbols-outlined">{icon}</span></span><span className="text-xs text-on-surface-variant">{label}</span><strong className="mt-1 block text-2xl">{Number(value || 0).toLocaleString()}</strong><small className="mt-2 block text-[10px] text-on-surface-variant/60">Live database records</small></article>)}
      </section>

      {(usersError || usersMessage) && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${usersError ? "border-error/20 bg-error/10 text-error" : "border-tertiary/20 bg-tertiary/10 text-tertiary"}`} role={usersError ? "alert" : "status"}>{usersError || usersMessage}</div>}

      <section className="overflow-hidden rounded-[20px] border border-white/[.07] bg-surface-container-lowest/45">
        <header className="border-b border-white/[.07] p-5">
          <div className="mb-4 flex items-center justify-between gap-4"><div><h3 className="font-bold">User directory</h3><p className="text-[10px] text-on-surface-variant/65">Passwords and authentication secrets are never returned.</p></div><span className="rounded-full bg-white/[.04] px-3 py-1.5 text-[10px] text-on-surface-variant">{usersPagination.total} records</span></div>
          <div className="grid grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(120px,.65fr))] gap-3 max-[1100px]:grid-cols-2 max-[600px]:grid-cols-1">
            <form onSubmit={applySearch} className="flex gap-2"><label className="relative flex-1"><span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-on-surface-variant/60">search</span><input className={`${fieldClass} pl-10`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" /></label><button className="h-11 rounded-xl bg-white/[.07] px-3 text-xs font-bold">Search</button></form>
            <select className={fieldClass} value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} aria-label="Filter by role"><option value="">All roles</option><option value="user">Users</option><option value="admin">Admins</option></select>
            <select className={fieldClass} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter by account status"><option value="">All statuses</option><option value="active">Active</option><option value="deactivated">Deactivated</option><option value="suspended">Suspended</option></select>
            <select className={fieldClass} value={verified} onChange={(event) => { setVerified(event.target.value); setPage(1); }} aria-label="Filter by verification"><option value="">Any verification</option><option value="true">Verified</option><option value="false">Unverified</option></select>
            <select className={fieldClass} value={`${sort}:${order}`} onChange={(event) => { const [nextSort, nextOrder] = event.target.value.split(":"); setSort(nextSort); setOrder(nextOrder); setPage(1); }} aria-label="Sort users"><option value="joined:desc">Newest joined</option><option value="joined:asc">Oldest joined</option><option value="name:asc">Name A–Z</option><option value="name:desc">Name Z–A</option><option value="lastLogin:desc">Recent login</option></select>
          </div>
        </header>

        {usersLoading ? (
          <div className="grid min-h-72 place-items-center"><span className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" aria-label="Loading users" /></div>
        ) : users.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-8 text-center"><div><span className="material-symbols-outlined text-4xl text-on-surface-variant/50">group_off</span><h3 className="mt-3 text-lg">No users found</h3><p className="mt-1 text-sm text-on-surface-variant">Adjust the filters or create the first matching account.</p></div></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[1120px] border-collapse text-left"><thead><tr className="border-b border-white/[.07] bg-white/[.018] text-[9px] font-extrabold tracking-[.1em] text-on-surface-variant/65 uppercase"><th className="px-5 py-4">User</th><th className="px-5 py-4">User ID</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Verification</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Last login</th><th className="px-5 py-4">Actions</th></tr></thead><tbody>{users.map((user) => <tr className="border-b border-white/[.055] transition last:border-0 hover:bg-white/[.02]" key={user.id}><td className="px-5 py-4"><div className="flex items-center gap-3"><UserAvatar user={user} /><div className="min-w-0"><Link href={`/admin/users/${user.id}`} className="block truncate text-xs font-bold hover:text-primary">{user.firstName} {user.lastName}</Link><span className="block max-w-56 truncate text-[10px] text-on-surface-variant/65">{user.email}</span></div></div></td><td className="px-5 py-4 text-[10px] font-bold text-primary">TVU-{String(user.id).padStart(5, "0")}</td><td className="px-5 py-4"><RoleBadge role={user.role} /></td><td className="px-5 py-4"><StatusBadge status={user.accountStatus} /></td><td className="px-5 py-4"><span className={`text-[10px] font-bold ${user.isVerified ? "text-tertiary" : "text-error"}`}>{user.isVerified ? "Verified" : "Unverified"}</span></td><td className="px-5 py-4 text-[10px] text-on-surface-variant">{formatDate(user.createdAt)}</td><td className="px-5 py-4 text-[10px] text-on-surface-variant">{formatDate(user.lastLogin)}</td><td className="px-5 py-4"><details className="relative"><summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg bg-white/[.04] text-on-surface-variant">•••</summary><div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-white/10 bg-surface-container p-2 shadow-2xl"><Link className="block rounded-lg px-3 py-2 text-xs hover:bg-white/[.05]" href={`/admin/users/${user.id}`}>View or edit user</Link><button className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-white/[.05]" onClick={() => setConfirmAction({ type: "role", user, value: user.role === "admin" ? "user" : "admin" })}>Change to {user.role === "admin" ? "user" : "admin"}</button><button className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-white/[.05]" onClick={() => setConfirmAction({ type: "status", user, value: user.accountStatus === "suspended" ? "active" : "suspended" })}>{user.accountStatus === "suspended" ? "Unsuspend" : "Suspend"} account</button><button className="block w-full rounded-lg px-3 py-2 text-left text-xs text-error hover:bg-error/10" onClick={() => setConfirmAction({ type: "delete", user })}>Delete user</button></div></details></td></tr>)}</tbody></table></div>
        )}

        <footer className="flex items-center justify-between gap-4 border-t border-white/[.07] p-4 text-[10px] text-on-surface-variant"><span>Page {usersPagination.page} of {usersPagination.totalPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1 || usersLoading} onClick={() => setPage((current) => Math.max(current - 1, 1))} className="rounded-lg border border-white/[.08] px-3 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={page >= usersPagination.totalPages || usersLoading} onClick={() => setPage((current) => current + 1)} className="rounded-lg bg-primary-container px-3 py-2 font-bold text-white disabled:opacity-40">Next</button></div></footer>
      </section>

      {showCreate && <Modal title="Add a TradeVault user" description="The password is hashed before storage. The account can be managed immediately." onClose={() => setShowCreate(false)} wide><UserForm submitLabel="Create user" busy={userLoading} onSubmit={submitCreate} onCancel={() => setShowCreate(false)} /></Modal>}
      {confirmAction && <ConfirmDialog title={confirmAction.type === "delete" ? "Delete this user?" : "Confirm account change"} message={confirmAction.type === "delete" ? `This permanently removes ${confirmAction.user.firstName} ${confirmAction.user.lastName} and their support records.` : `Apply ${confirmAction.value} to ${confirmAction.user.firstName} ${confirmAction.user.lastName}?`} confirmLabel={confirmAction.type === "delete" ? "Delete user" : "Confirm change"} busy={userLoading} onClose={() => setConfirmAction(null)} onConfirm={runConfirmedAction} danger={confirmAction.type === "delete"} />}
    </div>
  );
}
