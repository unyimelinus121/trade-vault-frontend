"use client";

import { useChat } from "@/app/providers/chatProvider/chat";
import { useRouter } from "next/navigation";

export default function AdminChatNotification() {
  const { newMessageNotice, setNewMessageNotice, selectConversation } = useChat();
  const router = useRouter();
  if (!newMessageNotice) return null;
  return (
    <button type="button" onClick={() => { selectConversation(newMessageNotice.conversationId); router.push("/admin/chat"); setNewMessageNotice(null); }} className="fixed top-20 right-5 z-[100] flex w-[min(360px,calc(100vw-40px))] items-start gap-3 rounded-2xl border border-primary/20 bg-surface-container-high/95 p-4 text-left shadow-2xl backdrop-blur-xl">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary"><span className="material-symbols-outlined">mark_chat_unread</span></span>
      <span className="min-w-0 flex-1"><strong className="block text-xs">New message from {newMessageNotice.userName}</strong><span className="mt-1 block truncate text-[10px] text-on-surface-variant">{newMessageNotice.preview}</span></span>
      <span className="material-symbols-outlined text-base text-on-surface-variant">chevron_right</span>
    </button>
  );
}
