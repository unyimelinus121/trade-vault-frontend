"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
} from "../../components/users/user-ui";

function formatDate(value, fallback = "Never") {
  return value
    ? new Date(value).toLocaleString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : fallback;
}

function Detail({ label, value }) {
  return <div className="rounded-xl bg-surface-container-highest/40 p-4"><span className="block text-[10px] font-bold uppercase tracking-[.1em] text-on-surface-variant/65">{label}</span><strong className="mt-1 block break-words text-sm font-semibold">{value || "Not available"}</strong></div>;
}

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    selectedUser,
    userLoading,
    usersError,
    usersMessage,
    clearUsersFeedback,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserStatus,
    deleteUser,
  } = useAdmin();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    let active = true;
    async function loadUser() {
      if (!id) return;
      const loadedUser = await getUserById(id);
      if (active && loadedUser) {
        setRole(loadedUser.role);
        setStatus(loadedUser.accountStatus);
      }
    }
    loadUser();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveProfile(changes) {
    const updated = await updateUser(id, changes);
    if (updated) setShowEdit(false);
  }

  async function removeUser() {
    if (await deleteUser(Number(id))) router.push("/admin/users");
  }

  if (userLoading && !selectedUser) {
    return <div className="grid min-h-[65vh] place-items-center"><span className="h-11 w-11 animate-spin rounded-full border-2 border-outline-variant border-t-primary" /></div>;
  }

  if (!selectedUser) {
    return <section className="stitch-panel mx-auto max-w-xl rounded-3xl p-10 text-center"><span className="material-symbols-outlined text-4xl text-error">person_off</span><h2 className="mt-4 text-2xl">User unavailable</h2><p className="mt-2 text-sm text-on-surface-variant">{usersError || "This user could not be found."}</p><Link href="/admin/users" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary">Return to users</Link></section>;
  }

  const user = selectedUser;
  return (
    <div className="pb-20">
      <div className="mb-7"><Link href="/admin/users" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-on-surface"><span className="material-symbols-outlined text-base">arrow_back</span>Back to users</Link></div>

      {(usersError || usersMessage) && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${usersError ? "border-error/20 bg-error/10 text-error" : "border-tertiary/20 bg-tertiary/10 text-tertiary"}`}>{usersError || usersMessage}</div>}

      <section className="mb-6 rounded-3xl border border-white/[.07] bg-gradient-to-br from-surface-container-low to-surface-container p-7">
        <div className="flex items-start justify-between gap-6 max-[700px]:flex-col"><div className="flex items-center gap-5"><UserAvatar user={user} size="large" /><div><div className="mb-2 flex flex-wrap gap-2"><RoleBadge role={user.role} /><StatusBadge status={user.accountStatus} /><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${user.isVerified ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"}`}>{user.isVerified ? "Verified" : "Unverified"}</span></div><h2 className="text-[clamp(28px,4vw,42px)] tracking-[-.04em]">{user.firstName} {user.lastName}</h2><p className="mt-1 text-sm text-on-surface-variant">{user.email} · TVU-{String(user.id).padStart(5, "0")}</p></div></div><button type="button" onClick={() => { clearUsersFeedback(); setShowEdit(true); }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-container px-5 text-xs font-bold text-white"><span className="material-symbols-outlined text-lg">edit</span>Edit profile</button></div>
      </section>

      <div className="grid grid-cols-[1.2fr_.8fr] gap-6 max-[980px]:grid-cols-1">
        <div className="space-y-6">
          <section className="stitch-panel rounded-2xl p-6"><header className="mb-5"><h3 className="text-lg">Account information</h3><p className="mt-1 text-xs text-on-surface-variant">Real fields from the users table.</p></header><div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1"><Detail label="First name" value={user.firstName} /><Detail label="Last name" value={user.lastName} /><Detail label="Email" value={user.email} /><Detail label="User ID" value={`TVU-${String(user.id).padStart(5, "0")}`} /><Detail label="Date registered" value={formatDate(user.createdAt)} /><Detail label="Last login" value={formatDate(user.lastLogin)} /></div></section>

          <section className="stitch-panel rounded-2xl p-6"><header className="mb-5 flex items-center justify-between"><div><h3 className="text-lg">Support activity</h3><p className="mt-1 text-xs text-on-surface-variant">Recent tickets linked to this account.</p></div><Link href="/admin/support" className="text-xs font-bold text-primary">View all</Link></header>{user.supportTickets?.length ? <div className="space-y-3">{user.supportTickets.map((ticket) => <Link href={`/admin/support/${ticket.id}`} key={ticket.id} className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-highest/35 p-4 transition hover:bg-surface-container-highest/55"><div className="min-w-0"><strong className="block truncate text-sm">{ticket.subject}</strong><span className="mt-1 block text-[10px] capitalize text-on-surface-variant">{ticket.category} · {ticket.status.replace("_", " ")}</span></div><span className="text-xs font-bold uppercase text-primary">{ticket.priority}</span></Link>)}</div> : <div className="rounded-xl border border-dashed border-white/10 p-7 text-center text-sm text-on-surface-variant">No support tickets have been created by this user.</div>}</section>

          <section className="rounded-2xl border border-dashed border-white/10 bg-white/[.015] p-6"><h3 className="text-lg">Trade and financial activity</h3><p className="mt-2 text-sm leading-6 text-on-surface-variant">Customer wallets, transaction ledgers, trades, and verified bank withdrawals are connected to the operations console.</p><div className="mt-5 grid grid-cols-3 gap-3 max-[600px]:grid-cols-1">{["Wallet & balance", "Trades & orders", "Withdrawal operations"].map((label) => <div key={label} className="rounded-xl bg-white/[.025] p-4"><span className="material-symbols-outlined text-on-surface-variant/55">database</span><strong className="mt-3 block text-xs">{label}</strong><span className="mt-1 block text-[10px] text-on-surface-variant/60">Connected</span></div>)}</div></section>
        </div>

        <aside className="space-y-6">
          <section className="stitch-panel rounded-2xl p-6"><h3 className="text-lg">Role and access</h3><p className="mt-1 text-xs text-on-surface-variant">Self-demotion and self-disable are blocked by the API.</p><label className="mt-5 block"><span className="mb-2 block text-xs font-bold">Role</span><div className="flex gap-2"><select className={fieldClass} value={role} onChange={(event) => setRole(event.target.value)}><option value="user">User</option><option value="admin">Admin</option></select><button type="button" disabled={userLoading || role === user.role} onClick={() => updateUserRole(user.id, role)} className="rounded-xl bg-primary-container px-4 text-xs font-bold text-white disabled:opacity-40">Save</button></div></label><label className="mt-4 block"><span className="mb-2 block text-xs font-bold">Account status</span><div className="flex gap-2"><select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="active">Active</option><option value="deactivated">Deactivated</option><option value="suspended">Suspended</option></select><button type="button" disabled={userLoading || status === user.accountStatus} onClick={() => updateUserStatus(user.id, status)} className="rounded-xl bg-primary-container px-4 text-xs font-bold text-white disabled:opacity-40">Save</button></div></label><button type="button" disabled={userLoading} onClick={() => updateUser(user.id, { isVerified: !user.isVerified })} className="mt-4 h-11 w-full rounded-xl border border-white/10 text-xs font-bold text-on-surface-variant">{user.isVerified ? "Mark unverified" : "Verify account"}</button></section>

          <section className="rounded-2xl border border-error/15 bg-error/[.035] p-6"><span className="text-xs font-bold uppercase tracking-[.14em] text-error">Danger zone</span><p className="mt-3 text-sm leading-6 text-on-surface-variant">Deletion is permanent and also removes support tickets owned by this user.</p><button type="button" onClick={() => setShowDelete(true)} className="mt-5 h-11 w-full rounded-xl bg-error/10 text-sm font-bold text-error hover:bg-error/15">Delete user</button></section>
        </aside>
      </div>

      {showEdit && <Modal title="Edit user profile" description="Update identity and verification fields. Role and status are managed separately." onClose={() => setShowEdit(false)} wide><UserForm initialUser={user} submitLabel="Save profile" busy={userLoading} onSubmit={saveProfile} onCancel={() => setShowEdit(false)} /></Modal>}
      {showDelete && <ConfirmDialog title="Permanently delete this user?" message={`This removes ${user.firstName} ${user.lastName} and their support records. This cannot be undone.`} confirmLabel="Delete user" busy={userLoading} onConfirm={removeUser} onClose={() => setShowDelete(false)} />}
    </div>
  );
}
