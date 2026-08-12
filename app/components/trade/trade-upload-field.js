"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useMemo, useRef, useState } from "react";

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function TradeUploadField({ files, onChange, disabled = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => previews.forEach((item) => URL.revokeObjectURL(item.url));
  }, [previews]);

  function acceptFiles(fileList, replaceIndex = null) {
    const incoming = [...fileList];
    const invalidType = incoming.find((file) => !ALLOWED_TYPES.has(file.type));
    const oversized = incoming.find((file) => file.size > MAX_SIZE);
    if (invalidType) return setError("Upload JPG, PNG, or WebP images only.");
    if (oversized) return setError("Each image must be 5MB or smaller.");

    let next;
    if (replaceIndex !== null && incoming[0]) {
      next = files.map((file, index) => index === replaceIndex ? incoming[0] : file);
    } else {
      next = [...files, ...incoming].slice(0, MAX_FILES);
    }
    if (files.length + incoming.length > MAX_FILES && replaceIndex === null) {
      setError(`A maximum of ${MAX_FILES} images can be uploaded.`);
    } else {
      setError("");
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function replaceFile(index) {
    const replacement = document.createElement("input");
    replacement.type = "file";
    replacement.accept = "image/jpeg,image/png,image/webp";
    replacement.onchange = (event) => acceptFiles(event.target.files || [], index);
    replacement.click();
  }

  return <div>
    <div
      onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) acceptFiles(event.dataTransfer.files); }}
      className={`border border-dashed p-6 transition-colors ${dragging ? "border-primary bg-primary/[.06]" : "border-outline-variant bg-surface-container-lowest/60"} ${disabled ? "opacity-50" : ""}`}
    >
      <input ref={inputRef} id={inputId} type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled || files.length >= MAX_FILES} onChange={(event) => acceptFiles(event.target.files || [])} className="sr-only" />
      <div className="flex items-center justify-between gap-5 max-[560px]:flex-col max-[560px]:items-start">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><span className="material-symbols-outlined">cloud_upload</span></span>
          <div><strong className="block text-sm">Drop clear gift-card images here</strong><p className="mt-1 text-xs leading-5 text-on-surface-variant">JPG, PNG or WebP · Up to 5 images · 5MB each</p></div>
        </div>
        <label htmlFor={inputId} className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-primary/25 px-4 text-xs font-bold text-primary outline-none focus-within:ring-2 focus-within:ring-primary ${files.length >= MAX_FILES || disabled ? "pointer-events-none opacity-40" : "hover:bg-primary/10"}`}>Choose files</label>
      </div>
    </div>

    {error && <p className="mt-2 text-xs text-error" role="alert">{error}</p>}
    {previews.length > 0 && <div className="mt-4 grid grid-cols-3 gap-3 max-[560px]:grid-cols-2">
      {previews.map((item, index) => <figure key={`${item.file.name}-${item.file.lastModified}-${index}`} className="group relative overflow-hidden border border-outline-variant bg-surface-container-lowest">
        <img src={item.url} alt={`Gift card preview ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
        <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/80 p-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" onClick={() => replaceFile(index)} className="text-[10px] font-bold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Replace</button>
          <button type="button" onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))} className="text-[10px] font-bold text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-error">Remove</button>
        </figcaption>
        <span className="absolute top-2 left-2 rounded bg-black/75 px-2 py-1 text-[9px] font-bold">{index + 1}</span>
      </figure>)}
    </div>}
    <div className="mt-2 flex justify-between text-[10px] text-on-surface-variant"><span>{files.length ? `${files.length} image${files.length === 1 ? "" : "s"} ready` : "At least one image is required"}</span><span>{files.length}/{MAX_FILES}</span></div>
  </div>;
}
