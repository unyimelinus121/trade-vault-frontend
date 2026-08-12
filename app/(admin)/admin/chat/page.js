import AdminChatInbox from "@/app/components/chat/admin-chat-inbox";

export default function AdminChatPage() {
  return (
    <div className="pb-10">
      <header className="mb-6 flex items-end justify-between gap-5 max-[720px]:items-start max-[720px]:flex-col"><div><span className="mb-2 block text-[10px] font-extrabold tracking-[.16em] text-primary-container">CUSTOMER SUPPORT</span><h2 className="text-[clamp(28px,4vw,40px)] leading-tight tracking-[-.04em]">Live Chat</h2><p className="mt-2 text-sm text-on-surface-variant">Private, persistent conversations with every TradeVault customer.</p></div><div className="flex items-center gap-2 rounded-full border border-tertiary/15 bg-tertiary/5 px-3 py-2 text-[9px] font-semibold text-tertiary"><i className="h-1.5 w-1.5 rounded-full bg-tertiary" />Realtime inbox active</div></header>
      <AdminChatInbox />
    </div>
  );
}
