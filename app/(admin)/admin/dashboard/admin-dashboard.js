import DashboardSummary from "../components/dashboard/dashboardSummary";
import Modal from "../components/dashboard/modal";
import RateDisplay from "../components/dashboard/rateDisplay";
import TradeSnapshot from "../components/dashboard/trade-snapshot";

export default function AdminDashboard() {
  return (
    <div className="pb-20 text-on-background">
      <DashboardSummary />
      <TradeSnapshot />

      <div className="grid grid-cols-[minmax(0,1fr)_390px] items-start gap-6 max-[1200px]:grid-cols-1">
        <RateDisplay />
        <Modal />
      </div>
    </div>
  );
}
