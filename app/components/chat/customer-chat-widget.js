"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/app/providers/chatProvider/chat";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { useRouter } from "next/navigation";
import ChatComposer from "./chat-composer";
import ChatThread from "./chat-thread";

export default function CustomerChatWidget() {
  const { user, token } = usePublicAuth();
  const router = useRouter();
  const { userChatOpen, userChatDraft, openUserChat, closeUserChat, messages, loading, sending, connected, error, unreadCount, sendMessage, deleteMessage } = useChat();
  const isAuthenticated = Boolean(token && user?.role === "user");
  const isSuspended = user?.accountStatus === "suspended";
  const isAdmin = Boolean(token && user?.role === "admin");
  const visibleOpen = userChatOpen && isAuthenticated && !isSuspended;
  const chatHistoryEntryRef = useRef(false);

  useEffect(() => {
    if (!visibleOpen) {
      chatHistoryEntryRef.current = false;
      return;
    }

    if (!window.history.state?.tradeVaultChatOpen) {
      window.history.pushState(
        { ...(window.history.state || {}), tradeVaultChatOpen: true },
        "",
        window.location.href,
      );
    }
    chatHistoryEntryRef.current = true;

    const handleBack = () => {
      if (!chatHistoryEntryRef.current) return;
      chatHistoryEntryRef.current = false;
      closeUserChat();
    };

    window.addEventListener("popstate", handleBack);
    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [closeUserChat, visibleOpen]);

  function handleClose() {
    const ownsHistoryEntry = chatHistoryEntryRef.current && window.history.state?.tradeVaultChatOpen;
    chatHistoryEntryRef.current = false;
    closeUserChat();
    if (ownsHistoryEntry) window.history.back();
  }

  function handleChatButton() {
    if (visibleOpen) {
      handleClose();
    } else if (isAdmin) {
      router.push("/admin/chat");
    } else if (isAuthenticated) {
      openUserChat();
    } else {
      router.push("/login");
    }
  }

  async function requestDelete(messageId) {
    if (window.confirm("Delete this message permanently?")) await deleteMessage(messageId);
  }

  if (isSuspended) return null;

  return (
    <div className="customer-chat-dock fixed right-5 bottom-5 z-[75] transition-[bottom] max-[720px]:right-3 max-[720px]:bottom-[86px]">
      {visibleOpen && (
        <section className="mb-3 flex h-[min(600px,calc(100dvh-120px))] w-[390px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[22px] border border-white/10 bg-surface-container-lowest/95 shadow-[0_28px_90px_rgba(0,0,0,.55)] backdrop-blur-2xl max-[720px]:fixed max-[720px]:inset-x-0 max-[720px]:bottom-0 max-[720px]:z-[80] max-[720px]:mb-0 max-[720px]:h-[82dvh] max-[720px]:max-h-[680px] max-[720px]:w-screen max-[720px]:max-w-none max-[720px]:rounded-b-none max-[720px]:border-b-0" aria-label="TradeVault live support chat">
          <header className="flex shrink-0 items-center justify-between border-b border-white/[.07] bg-surface-container-low px-4 py-3.5 max-[720px]:pt-[max(.875rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-on-primary"><span className="material-symbols-outlined">support_agent</span></span><div><h2 className="text-sm font-bold">TradeVault Support</h2><div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-on-surface-variant"><i className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-tertiary" : "bg-outline"}`} />{connected ? "Live and connected" : "Reconnecting…"}</div></div></div>
            <button type="button" onClick={handleClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/[.045] text-on-surface-variant hover:text-on-surface" aria-label="Close chat"><span className="material-symbols-outlined">close</span></button>
          </header>
          <div className="shrink-0 border-b border-primary/15 bg-primary/[.055] px-4 py-3 text-xs leading-5 text-on-surface" role="status">
            <strong className="text-primary">Hello boss,</strong> what can we do for you today?
          </div>
          {error && <div className="border-b border-error/20 bg-error/10 px-4 py-2 text-[10px] text-error">{error}</div>}
          <ChatThread messages={messages} currentUserId={user.id} loading={loading} onDelete={requestDelete} emptyTitle="How can we help?" />
          <ChatComposer key={userChatDraft || "standard-chat"} onSend={sendMessage} sending={sending} initialContent={userChatDraft} />
        </section>
      )}
      <button type="button" onClick={handleChatButton} className="relative ml-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-on-primary shadow-[0_0_28px_rgba(57,232,121,.68),0_16px_38px_rgba(17,152,75,.48)] transition hover:scale-105 hover:brightness-110" aria-label={visibleOpen ? "Close live chat" : isAdmin ? "Open admin live chat" : isAuthenticated ? "Open live chat" : "Log in to use live chat"}>
        {!visibleOpen && <><span aria-hidden="true" className="absolute inset-[-5px] rounded-full border border-primary/55 motion-safe:animate-ping" /><span aria-hidden="true" className="absolute inset-[-8px] -z-10 rounded-full bg-primary/35 blur-lg motion-safe:animate-pulse" /></>}
        <span className="material-symbols-outlined relative z-10 text-2xl">{visibleOpen ? "close" : "forum"}</span>
        {unreadCount > 0 && !visibleOpen && <span className="absolute -top-1 -right-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-error px-1 text-[9px] font-extrabold text-[#520007]">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
    </div>
  );
}
