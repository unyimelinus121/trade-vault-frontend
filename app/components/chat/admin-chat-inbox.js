"use client";

import { useEffect, useState } from "react";
import { useChat } from "@/app/providers/chatProvider/chat";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import ChatAvatar from "./chat-avatar";
import ChatComposer from "./chat-composer";
import ChatThread from "./chat-thread";
import { formatChatTime } from "./chat-utils";

function ConversationItem({ item, active, onClick }) {
  const preview = item.lastMessage?.content || (item.lastMessage?.imageUrl ? "Photo attachment" : "No messages yet");
  return (
    <button type="button" onClick={onClick} className={`flex w-full gap-3 border-b border-white/[.055] p-4 text-left transition ${active ? "bg-primary-container/15" : "hover:bg-white/[.025]"}`}>
      <span className="relative"><ChatAvatar person={item.user} />{item.adminUnreadCount > 0 && <i className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-container-low bg-error" />}</span>
      <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><strong className="truncate text-xs">{item.user.firstName} {item.user.lastName}</strong><time className="shrink-0 text-[8px] text-on-surface-variant/60">{formatChatTime(item.lastMessageAt)}</time></span><span className={`mt-1 block truncate text-[10px] ${item.adminUnreadCount > 0 ? "font-semibold text-on-surface" : "text-on-surface-variant/65"}`}>{preview}</span></span>
      {item.adminUnreadCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-error px-1 text-[8px] font-extrabold text-[#520007]">{item.adminUnreadCount}</span>}
    </button>
  );
}

export default function AdminChatInbox() {
  const { user } = usePublicAuth();
  const { conversations, conversation, selectedConversationId, messages, loading, sending, connected, error, loadAdminConversations, selectConversation, sendMessage, deleteMessage, setAdminInboxActive } = useChat();
  const [search, setSearch] = useState("");

  useEffect(() => {
    setAdminInboxActive(true);
    loadAdminConversations();
    return () => setAdminInboxActive(false);
  }, [loadAdminConversations, setAdminInboxActive]);

  async function requestDelete(messageId) {
    if (window.confirm("Delete this message permanently?")) await deleteMessage(messageId);
  }

  return (
    <section className="grid h-[calc(100dvh-185px)] min-h-[610px] grid-cols-[310px_minmax(360px,1fr)_260px] overflow-hidden rounded-[22px] border border-white/[.07] bg-surface-container-lowest/45 shadow-[0_24px_70px_rgba(0,0,0,.22)] max-[1250px]:grid-cols-[300px_1fr] max-[720px]:h-[calc(100dvh-185px)] max-[720px]:min-h-[320px] max-[720px]:grid-cols-1">
      <aside className={`min-h-0 border-r border-white/[.07] bg-surface-container-low/75 max-[720px]:border-r-0 ${selectedConversationId ? "max-[720px]:hidden" : ""}`}>
        <header className="border-b border-white/[.07] p-4"><form onSubmit={(event) => { event.preventDefault(); loadAdminConversations(search.trim()); }} className="relative"><span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-on-surface-variant">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full rounded-xl border border-white/[.07] bg-surface-container pr-3 pl-9 text-xs outline-none placeholder:text-on-surface-variant/55 focus:border-primary/45" placeholder="Search conversations" /></form><div className="mt-3 flex items-center justify-between text-[9px] text-on-surface-variant"><span>{conversations.length} conversations</span><span className="flex items-center gap-1"><i className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-tertiary" : "bg-outline"}`} />{connected ? "Live" : "Reconnecting"}</span></div></header>
        <div className="h-[calc(100%-104px)] overflow-y-auto">{conversations.length ? conversations.map((item) => <ConversationItem key={item.id} item={item} active={selectedConversationId === item.id} onClick={() => selectConversation(item.id)} />) : <div className="grid h-full place-items-center p-7 text-center"><div><span className="material-symbols-outlined text-4xl text-on-surface-variant/40">inbox</span><h3 className="mt-3 text-sm">No conversations</h3><p className="mt-1 text-[10px] leading-4 text-on-surface-variant">Customer chats will appear here after they open support.</p></div></div>}</div>
      </aside>

      <main className={`min-h-0 flex-col bg-[radial-gradient(circle_at_50%_0%,rgba(57,232,121,.05),transparent_45%)] ${selectedConversationId ? "flex" : "flex max-[720px]:hidden"}`}>
        {selectedConversationId && conversation ? <><header className="flex min-h-16 items-center gap-3 border-b border-white/[.07] bg-surface-container-low/45 px-4"><button type="button" onClick={() => selectConversation(null)} className="hidden h-9 w-9 place-items-center rounded-lg bg-white/[.04] max-[720px]:grid" aria-label="Back to conversations"><span className="material-symbols-outlined">arrow_back</span></button><ChatAvatar person={conversation.user} size="sm" /><div className="min-w-0 flex-1"><h2 className="truncate text-sm">{conversation.user.firstName} {conversation.user.lastName}</h2><p className="truncate text-[9px] text-on-surface-variant">{conversation.user.email}</p></div><span className="rounded-full bg-tertiary/10 px-2.5 py-1 text-[9px] font-bold capitalize text-tertiary">{conversation.user.accountStatus}</span></header>{error && <div className="border-b border-error/20 bg-error/10 px-4 py-2 text-[10px] text-error">{error}</div>}<ChatThread messages={messages} currentUserId={user.id} loading={loading} onDelete={requestDelete} emptyTitle="No messages yet" /><ChatComposer onSend={sendMessage} sending={sending} /></> : <div className="grid h-full place-items-center p-8 text-center"><div><span className="material-symbols-outlined text-5xl text-primary/40">forum</span><h2 className="mt-4 text-lg">Select a conversation</h2><p className="mt-1 max-w-xs text-xs leading-5 text-on-surface-variant">Choose a customer from the inbox to review their history and respond in real time.</p></div></div>}
      </main>

      <aside className="border-l border-white/[.07] bg-surface-container-low/55 p-5 max-[1250px]:hidden">{conversation ? <><div className="flex flex-col items-center border-b border-white/[.07] pb-5 text-center"><ChatAvatar person={conversation.user} size="lg" /><h3 className="mt-3 text-sm">{conversation.user.firstName} {conversation.user.lastName}</h3><p className="mt-1 break-all text-[9px] text-on-surface-variant">{conversation.user.email}</p></div><dl className="mt-5 space-y-4 text-[10px]"><div><dt className="uppercase tracking-[.1em] text-on-surface-variant/55">Customer ID</dt><dd className="mt-1 font-semibold">TVU-{String(conversation.user.id).padStart(5, "0")}</dd></div><div><dt className="uppercase tracking-[.1em] text-on-surface-variant/55">Conversation started</dt><dd className="mt-1 font-semibold">{new Date(conversation.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</dd></div><div><dt className="uppercase tracking-[.1em] text-on-surface-variant/55">Status</dt><dd className="mt-1 font-semibold capitalize text-tertiary">{conversation.user.accountStatus}</dd></div></dl><div className="mt-6 rounded-xl border border-primary/10 bg-primary/5 p-3 text-[9px] leading-4 text-on-surface-variant"><span className="material-symbols-outlined mb-2 text-lg text-primary">verified_user</span><p>This private room is bound to the authenticated customer account. Messages remain available after logout.</p></div></> : null}</aside>
    </section>
  );
}
