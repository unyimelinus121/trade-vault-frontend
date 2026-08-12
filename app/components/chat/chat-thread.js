"use client";

import { useEffect, useRef, useState } from "react";
import ChatImageLightbox from "./chat-image-lightbox";
import ChatMessageBubble from "./chat-message-bubble";

export default function ChatThread({ messages, currentUserId, loading, onDelete, emptyTitle = "Start a conversation" }) {
  const viewportRef = useRef(null);
  const nearBottomRef = useRef(true);
  const firstScrollRef = useRef(true);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (firstScrollRef.current || nearBottomRef.current) {
      requestAnimationFrame(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: firstScrollRef.current ? "auto" : "smooth" }));
      firstScrollRef.current = false;
    }
  }, [messages]);

  function handleScroll(event) {
    const node = event.currentTarget;
    nearBottomRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 120;
  }

  return (
    <>
      <div ref={viewportRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-color:rgba(57,232,121,.25)_transparent]">
        {loading ? (
          <div className="grid h-full min-h-56 place-items-center"><span className="h-9 w-9 animate-spin rounded-full border-2 border-outline-variant border-t-primary" aria-label="Loading messages" /></div>
        ) : messages.length === 0 ? (
          <div className="grid h-full min-h-56 place-items-center text-center"><div><span className="material-symbols-outlined text-4xl text-primary/55">forum</span><h3 className="mt-3 text-base">{emptyTitle}</h3><p className="mt-1 max-w-64 text-xs leading-5 text-on-surface-variant">Messages and images are saved securely, so you can continue here anytime.</p></div></div>
        ) : (
          <div className="space-y-4">{messages.map((message) => <ChatMessageBubble key={message.id} message={message} currentUserId={currentUserId} onDelete={onDelete} onPreview={setPreview} />)}</div>
        )}
      </div>
      <ChatImageLightbox image={preview} onClose={() => setPreview("")} />
    </>
  );
}
