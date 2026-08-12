"use client";

import Image from "next/image";

export default function ChatImageLightbox({ image, onClose }) {
  if (!image) return null;
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-[#010402]/90 p-5 backdrop-blur-lg" role="dialog" aria-modal="true" aria-label="Message image preview" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <button type="button" onClick={onClose} className="absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Close image preview"><span className="material-symbols-outlined">close</span></button>
      <div className="relative h-[min(78vh,760px)] w-[min(90vw,1080px)]"><Image src={image} alt="Expanded chat attachment" fill unoptimized sizes="90vw" className="object-contain" /></div>
    </div>
  );
}
