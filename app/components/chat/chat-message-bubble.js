"use client";

import Image from "next/image";
import { chatAssetUrl, formatChatTime } from "./chat-utils";

export default function ChatMessageBubble({ message, currentUserId, onDelete, onPreview }) {
  const owned = Number(message.senderId) === Number(currentUserId);
  const image = chatAssetUrl(message.imageUrl);
  return (
    <div className={`group flex ${owned ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] ${owned ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`overflow-hidden rounded-2xl border ${owned ? "rounded-br-md border-primary/10 bg-primary-container text-white" : "rounded-bl-md border-white/[.07] bg-surface-container-high text-on-surface"}`}>
          {image && (
            <button type="button" onClick={() => onPreview(image)} className="relative block h-44 w-[min(260px,64vw)] overflow-hidden bg-surface-container-low" aria-label="View larger image">
              <Image src={image} alt="Chat attachment" fill sizes="260px" unoptimized className="object-cover transition duration-300 hover:scale-[1.03]" />
            </button>
          )}
          {message.content && <p className="whitespace-pre-wrap break-words px-3.5 py-2.5 text-[13px] leading-5">{message.content}</p>}
        </div>
        <div className={`mt-1 flex items-center gap-1.5 px-1 text-[9px] text-on-surface-variant/65 ${owned ? "flex-row-reverse" : ""}`}>
          <time dateTime={message.createdAt}>{formatChatTime(message.createdAt)}</time>
          {owned && (
            <button type="button" onClick={() => onDelete(message.id)} className="opacity-0 transition hover:text-error focus:opacity-100 group-hover:opacity-100" aria-label="Delete your message">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}
