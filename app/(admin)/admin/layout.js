import Image from "next/image";
import Link from "next/link";
import AdminProvider from "../../providers/adminProvider/admin";
import PublicAuth from "../../providers/publicProvider/publicAuthProvider";
import { getInitialRates } from "../../lib/server-rates";
import { AdminDesktopNavigation, AdminMobileNavigation, AdminPageIdentity } from "./admin-navigation";
import AdminAccessGuard from "./admin-access-guard";
import AdminCurrentUser from "./admin-current-user";
import ChatProvider from "../../providers/chatProvider/chat";
import AdminChatNotification from "../../components/chat/admin-chat-notification";
import AdminChatHeaderButton from "../../components/chat/admin-chat-header-button";
import AdminTradeNotification from "../../components/trade/admin-trade-notification";
import AdminWithdrawalNotification from "../../components/trade/admin-withdrawal-notification";
import AdminGlobalSearch from "./admin-global-search";
import AdminWithdrawalHeaderNotification from "./admin-withdrawal-header-notification";

export const metadata = {
  title: "Operations Console | TradeVault",
  description: "Manage TradeVault gift cards, rates, customers, and payouts.",
};

export default async function AdminLayout({ children }) {
  const initialRates = await getInitialRates();

  return (
    <PublicAuth>
      <AdminAccessGuard>
        <ChatProvider>
          <AdminProvider initialRates={initialRates}>
            <div className="min-h-screen bg-background text-on-background">
              <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-outline-variant/10 bg-surface-container-low max-[900px]:hidden">
                <Link href="/admin/dashboard" className="flex h-16 items-center border-b border-outline-variant/10 px-6" aria-label="Admin dashboard">
                  <Image src="/tradevault-logo.svg" alt="TradeVault" width={560} height={150} priority className="h-auto w-[158px]" />
                </Link>
                <div className="flex-1 overflow-y-auto px-3 py-5"><AdminDesktopNavigation /></div>
                <div className="m-3 rounded-xl border border-white/[.06] bg-surface-container p-4">
                  <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-tertiary/10 text-tertiary"><span className="material-symbols-outlined">monitor_heart</span></span><div><strong className="block text-xs">System healthy</strong><span className="text-[10px] text-on-surface-variant">All services operational</span></div></div>
                </div>
                <AdminCurrentUser />
              </aside>

              <header className="fixed top-0 right-0 left-64 z-40 flex h-16 items-center justify-between border-b border-outline-variant/10 bg-background/80 px-8 backdrop-blur-xl max-[900px]:left-0 max-[600px]:px-4">
          <div className="flex items-center gap-3"><Link href="/admin/dashboard" className="hidden max-[900px]:block" aria-label="Admin dashboard"><Image src="/tradevault-mark.svg" alt="TradeVault" width={136} height={146} className="h-8 w-auto" /></Link><AdminPageIdentity /></div>
          <div className="flex items-center gap-3">
            <AdminGlobalSearch />
            <AdminWithdrawalHeaderNotification />
            <AdminChatHeaderButton />
            <AdminCurrentUser compact />
          </div>
              </header>

              <main className="min-h-screen pl-64 pt-16 max-[900px]:mobile-safe-content max-[900px]:pl-0"><div className="mx-auto w-full max-w-[1600px] p-8 max-[600px]:p-4">{children}</div></main>
              <AdminMobileNavigation />
              <AdminChatNotification />
              <AdminTradeNotification />
              <AdminWithdrawalNotification />
            </div>
          </AdminProvider>
        </ChatProvider>
      </AdminAccessGuard>
    </PublicAuth>
  );
}
