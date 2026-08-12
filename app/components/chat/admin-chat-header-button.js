"use client";

import Link from "next/link";
import { useChat } from "@/app/providers/chatProvider/chat";

export default function AdminChatHeaderButton() {
  const { unreadCount } = useChat();
  return (
    <Link href="/admin/chat" className="relative grid h-10 w-10 place-items-center rounded-full bg-surface-container text-on-surface-variant" aria-label={`${unreadCount} unread live chat messages`}>
      <span className="material-symbols-outlined">forum</span>
      {unreadCount > 0 && <span className="absolute -top-1 -right-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-error px-1 text-[8px] font-extrabold text-[#520007]">{unreadCount > 99 ? "99+" : unreadCount}</span>}
    </Link>
  );
}
