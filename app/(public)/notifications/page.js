"use client";

import Link from "next/link";
import { useEffect } from "react";
import { formatTradeDate, LoginRequired, PageLoader } from "@/app/components/trade/trade-ui";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useTrade } from "@/app/providers/tradeProvider/trade";

function notificationAppearance(type) {
  const normalizedType = String(type || "").toLowerCase();
  if (normalizedType.includes("rejected") || normalizedType.includes("failed")) return { icon: "cancel", style: "bg-error/10 text-error", rejected: true };
  if (type === "trade_processing") return { icon: "sync", style: "bg-secondary/10 text-secondary" };
  return { icon: "task_alt", style: "bg-primary/10 text-primary" };
}

export default function NotificationsPage() {
  const { user, token, authReady } = usePublicAuth();
  const { notifications, unreadNotifications, notificationLoading, getNotifications, markNotificationRead, markAllNotificationsRead } = useTrade();

  useEffect(() => { if (user?.role === "user" && token) getNotifications(); }, [getNotifications, token, user?.role]);
  if (!authReady) return <PageLoader />;
  if (!user || !token || user.role !== "user") return <LoginRequired title="Log in to view notifications" />;

  return <main className="stitch-glow min-h-screen"><section className="mx-auto max-w-4xl px-8 py-16 max-[650px]:px-4">
    <header className="flex items-end justify-between gap-5 max-[550px]:flex-col max-[550px]:items-start"><div><span className="text-xs font-bold uppercase tracking-[.16em] text-primary">Account updates</span><h1 className="mt-3 text-[clamp(3rem,6vw,4.8rem)] tracking-[-.055em]">Notifications</h1><p className="mt-2 text-sm text-on-surface-variant">{unreadNotifications} unread notification{unreadNotifications === 1 ? "" : "s"}</p></div>{unreadNotifications > 0 && <button onClick={markAllNotificationsRead} className="rounded-xl border border-primary/25 px-4 py-2.5 text-xs font-bold text-primary">Mark all read</button>}</header>
    <section className="mt-10 overflow-hidden rounded-2xl border border-white/[.07] bg-surface-container/50">
      {notificationLoading && !notifications.length ? <div className="h-52 animate-pulse bg-white/[.025]" /> : notifications.length ? notifications.map((item) => { const appearance = notificationAppearance(item.type); return <article key={item.id} className={`grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b border-white/[.055] p-5 last:border-0 ${item.isRead ? "opacity-65" : appearance.rejected ? "bg-error/[.035]" : "bg-primary/[.035]"}`}><span className={`grid h-11 w-11 place-items-center rounded-xl ${appearance.style}`}><span className="material-symbols-outlined">{appearance.icon}</span></span><div><div className="flex items-center gap-2"><h2 className="text-sm font-bold">{item.title}</h2>{!item.isRead && <i className={`h-2 w-2 rounded-full ${appearance.rejected ? "bg-error" : "bg-primary"}`} />}</div><p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.message}</p><div className="mt-3 flex gap-4 text-[10px]"><time className="text-on-surface-variant">{formatTradeDate(item.createdAt)}</time>{item.tradeId && <Link href={`/trade-history/${item.tradeId}`} className="font-bold text-primary">View trade</Link>}{item.withdrawalId && <Link href="/wallet" className={`font-bold ${appearance.rejected ? "text-error" : "text-primary"}`}>View withdrawal</Link>}</div></div>{!item.isRead && <button onClick={() => markNotificationRead(item.id)} className={`text-[10px] font-bold ${appearance.rejected ? "text-error" : "text-primary"}`}>Mark read</button>}</article>; }) : <div className="p-14 text-center"><span className="material-symbols-outlined text-5xl text-on-surface-variant/35">notifications_none</span><h2 className="mt-4 text-xl">No notifications</h2><p className="mt-2 text-sm text-on-surface-variant">Trade status updates will appear here.</p></div>}
    </section>
  </section></main>;
}
