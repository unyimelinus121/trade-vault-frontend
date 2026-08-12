"use client";

import { useRef, useState } from "react";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function ChatComposer({ onSend, sending, disabled = false, initialContent = "" }) {
  const [content, setContent] = useState(initialContent);
  const [image, setImage] = useState(null);
  const [localError, setLocalError] = useState("");
  const fileRef = useRef(null);

  function chooseImage(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!allowedTypes.has(selected.type)) {
      setLocalError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setLocalError("Images must be 5MB or smaller.");
      event.target.value = "";
      return;
    }
    setImage(selected);
    setLocalError("");
  }

  async function submit(event) {
    event.preventDefault();
    if ((!content.trim() && !image) || sending || disabled) return;
    const sent = await onSend({ content, image });
    if (sent) {
      setContent("");
      setImage(null);
      setLocalError("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form onSubmit={submit} className="shrink-0 border-t border-white/[.07] bg-surface-container-low/90 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
      {(image || localError) && <div className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-white/[.035] px-3 py-2 text-[10px]"><span className={localError ? "text-error" : "truncate text-primary"}>{localError || image?.name}</span>{image && <button type="button" onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-on-surface-variant hover:text-error">Remove</button>}</div>}
      <div className="flex items-end gap-2">
        <label className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/[.055] text-on-surface-variant transition hover:bg-white/[.09] hover:text-primary" aria-label="Attach image"><span className="material-symbols-outlined text-xl">attach_file</span><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="sr-only" disabled={disabled || sending} /></label>
        <textarea value={content} maxLength={5000} rows={1} onChange={(event) => setContent(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(event); } }} placeholder="Write a message…" className="max-h-28 min-h-10 min-w-0 flex-1 resize-none rounded-xl border border-white/[.07] bg-surface-container px-3 py-2.5 text-xs text-on-surface outline-none placeholder:text-on-surface-variant/55 focus:border-primary/45" disabled={disabled || sending} />
        <button type="submit" disabled={disabled || sending || (!content.trim() && !image)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45" aria-label="Send message">{sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" /> : <span className="material-symbols-outlined text-xl">send</span>}</button>
      </div>
    </form>
  );
}
