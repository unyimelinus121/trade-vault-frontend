"use client";

import Image from "next/image";
import { chatAssetUrl, initials } from "./chat-utils";

export default function ChatAvatar({ person, size = "md", admin = false }) {
  const sizes = size === "sm" ? "h-9 w-9 text-[10px]" : size === "lg" ? "h-14 w-14 text-sm" : "h-11 w-11 text-xs";
  const avatar = chatAssetUrl(person?.avatar);
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full font-extrabold ring-1 ring-white/10 ${sizes} ${admin ? "bg-primary text-on-primary" : "bg-primary-container/20 text-primary"}`}>
      {avatar ? <Image src={avatar} alt="" fill sizes="56px" className="object-cover" /> : initials(person)}
    </span>
  );
}
