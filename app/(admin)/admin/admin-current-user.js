"use client";

import Image from "next/image";
import { apiOrigin } from "@/app/api/api";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";

function AdminAvatar({ user, size = "small" }) {
  const avatarUrl = user?.avatar
    ? `${apiOrigin}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`
    : "";
  const initials = `${user?.firstName?.[0] || "A"}${user?.lastName?.[0] || ""}`.toUpperCase();
  const dimensions = size === "medium" ? "h-10 w-10" : "h-9 w-9";

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xs font-bold text-on-primary ${dimensions}`}>
      {avatarUrl ? (
        <Image src={avatarUrl} alt={`${user.firstName} profile`} width={40} height={40} sizes="40px" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export default function AdminCurrentUser({ compact = false }) {
  const { user, logout, logoutLoading } = usePublicAuth();

  if (compact) return <div className="flex items-center gap-1.5">
    <AdminAvatar user={user} />
    <button type="button" onClick={logout} disabled={logoutLoading} className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[.07] text-on-surface-variant transition hover:border-error/30 hover:text-error disabled:opacity-50 max-[1024px]:grid" aria-label="Log out of administrator account">
      <span className="material-symbols-outlined text-lg">logout</span>
    </button>
  </div>;

  return (
    <div className="flex items-center gap-3 border-t border-outline-variant/10 p-4">
      <AdminAvatar user={user} size="medium" />
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-xs">{user?.firstName} {user?.lastName}</strong>
        <span className="block truncate text-[10px] text-on-surface-variant">{user?.email}</span>
      </div>
      <button type="button" onClick={logout} disabled={logoutLoading} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-on-surface-variant transition hover:bg-white/[.05] hover:text-on-surface disabled:opacity-50" aria-label="Log out">
        <span className="material-symbols-outlined text-lg">logout</span>
      </button>
    </div>
  );
}
