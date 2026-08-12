import PublicProvider from "../providers/publicProvider/public";
import PublicAuth from "../providers/publicProvider/publicAuthProvider";
import PublicChrome from "./component/public-chrome";
import { getInitialRates } from "../lib/server-rates";
import ChatProvider from "../providers/chatProvider/chat";
import CustomerChatWidget from "../components/chat/customer-chat-widget";
import TradeProvider from "../providers/tradeProvider/trade";

export default async function PublicLayout({ children }) {
  const initialRates = await getInitialRates();

  return (
    <div className="min-h-full w-full bg-background">
      <PublicAuth>
        <TradeProvider>
          <ChatProvider>
            <PublicProvider initialRates={initialRates}>
              <PublicChrome>{children}</PublicChrome>
              <CustomerChatWidget />
            </PublicProvider>
          </ChatProvider>
        </TradeProvider>
      </PublicAuth>
    </div>
  );
}
