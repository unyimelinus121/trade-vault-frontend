"use client";

import api from "@/app/api/api";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { formatTrade } from "./tradeHelpers";
import useVisibleInterval from "@/app/hooks/use-visible-interval";
import { usePathname } from "next/navigation";

const TradeContext = createContext(null);

export default function TradeProvider({ children }) {
  const pathname = usePathname();
  const accountSummaryRef = useRef({ token: null, loadedAt: 0 });
  const { user, token, authReady } = usePublicAuth();
  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalLimits, setWithdrawalLimits] = useState({ min: "1000.00", max: null });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [submittingTrade, setSubmittingTrade] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [bankAccountActionLoading, setBankAccountActionLoading] = useState(false);
  const [tradeError, setTradeError] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");
  const [withdrawalError, setWithdrawalError] = useState("");
  const [withdrawalMessage, setWithdrawalMessage] = useState("");

  const getMyTrades = useCallback(async (filters = {}, options = {}) => {
    if (user?.role !== "user") return null;
    if (!options.silent) setTradeLoading(true);
    if (!options.silent) setTradeError("");
    try {
      const response = await api.get("/trades", { params: filters });
      const formatted = (response.data?.trades || []).map(formatTrade);
      setTrades(formatted);
      return formatted;
    } catch (requestError) {
      if (!options.silent) setTradeError(requestError.response?.data?.message || "Unable to load your trades.");
      return null;
    } finally {
      if (!options.silent) setTradeLoading(false);
    }
  }, [user?.role]);

  const getTradeDetails = useCallback(async (id) => {
    if (!id || user?.role !== "user") return null;
    setTradeLoading(true);
    setTradeError("");
    setSelectedTrade(null);
    try {
      const response = await api.get(`/trades/${id}`);
      const formatted = formatTrade(response.data?.trade);
      setSelectedTrade(formatted);
      return formatted;
    } catch (requestError) {
      setTradeError(requestError.response?.data?.message || "Unable to load this trade.");
      setSelectedTrade(null);
      return null;
    } finally {
      setTradeLoading(false);
    }
  }, [user?.role]);

  const getWallet = useCallback(async (options = {}) => {
    if (user?.role !== "user") return null;
    if (!options.silent) setWalletLoading(true);
    try {
      const response = await api.get("/wallet", {
        params: options.summary ? { transactions: "false" } : undefined,
      });
      setWallet(response.data?.wallet || null);
      if (Array.isArray(response.data?.transactions)) {
        setWalletTransactions(response.data.transactions);
      }
      if (response.data?.withdrawalLimits) setWithdrawalLimits(response.data.withdrawalLimits);
      return response.data;
    } catch (requestError) {
      if (!options.silent) setTradeError(requestError.response?.data?.message || "Unable to load your wallet.");
      return null;
    } finally {
      if (!options.silent) setWalletLoading(false);
    }
  }, [user?.role]);

  const getBankAccounts = useCallback(async () => {
    if (user?.role !== "user") return null;
    try {
      const response = await api.get("/bank-accounts");
      const items = response.data?.bankAccounts || [];
      setBankAccounts(items);
      return items;
    } catch (requestError) {
      setWithdrawalError(requestError.response?.data?.message || "Unable to load saved bank accounts.");
      return null;
    }
  }, [user?.role]);

  const saveBankAccount = useCallback(async (details) => {
    if (bankAccountActionLoading) return null;
    setBankAccountActionLoading(true); setWithdrawalError(""); setWithdrawalMessage("");
    try {
      const response = await api.post("/bank-accounts", details);
      const account = response.data?.bankAccount;
      if (account) setBankAccounts((current) => [account, ...current.filter((item) => item.id !== account.id)]);
      setWithdrawalMessage(response.data?.message || "Bank account saved.");
      return account || null;
    } catch (requestError) {
      setWithdrawalError(requestError.response?.data?.message || "Unable to save this bank account.");
      return null;
    } finally { setBankAccountActionLoading(false); }
  }, [bankAccountActionLoading]);

  const deleteBankAccount = useCallback(async (id) => {
    if (!id || bankAccountActionLoading) return false;
    setBankAccountActionLoading(true); setWithdrawalError(""); setWithdrawalMessage("");
    try {
      const response = await api.delete(`/bank-accounts/${id}`);
      setBankAccounts((current) => current.filter((item) => item.id !== id));
      setWithdrawalMessage(response.data?.message || "Bank account deleted.");
      return true;
    } catch (requestError) {
      setWithdrawalError(requestError.response?.data?.message || "Unable to delete this bank account.");
      return false;
    } finally { setBankAccountActionLoading(false); }
  }, [bankAccountActionLoading]);

  const getWithdrawals = useCallback(async (options = {}) => {
    if (user?.role !== "user") return null;
    if (!options.silent) setWithdrawalLoading(true);
    try {
      const response = await api.get("/withdrawals/my");
      const items = response.data?.withdrawals || [];
      setWithdrawals(items);
      if (response.data?.limits) setWithdrawalLimits(response.data.limits);
      return items;
    } catch (requestError) {
      if (!options.silent) setWithdrawalError(requestError.response?.data?.message || "Unable to load withdrawal history.");
      return null;
    } finally {
      if (!options.silent) setWithdrawalLoading(false);
    }
  }, [user?.role]);

  const submitWithdrawal = useCallback(async ({ amount, bankAccountId, idempotencyKey }) => {
    if (submittingWithdrawal) return null;
    setSubmittingWithdrawal(true);
    setWithdrawalError("");
    setWithdrawalMessage("");
    try {
      const response = await api.post("/withdrawals", { amount, bankAccountId, idempotencyKey });
      const withdrawal = response.data?.withdrawal;
      if (withdrawal) {
        setWithdrawals((current) => [withdrawal, ...current.filter((item) => item.id !== withdrawal.id)]);
      }
      setWithdrawalMessage(response.data?.message || "Withdrawal submitted.");
      await getWallet();
      return withdrawal || null;
    } catch (requestError) {
      const withdrawal = requestError.response?.data?.withdrawal;
      if (withdrawal) {
        setWithdrawals((current) => [withdrawal, ...current.filter((item) => item.id !== withdrawal.id)]);
        await getWallet();
      }
      setWithdrawalError(requestError.response?.data?.message || "Unable to submit this withdrawal.");
      return null;
    } finally {
      setSubmittingWithdrawal(false);
    }
  }, [getWallet, submittingWithdrawal]);

  const getNotifications = useCallback(async (options = {}) => {
    if (user?.role !== "user") return null;
    if (!options.silent) setNotificationLoading(true);
    try {
      const response = await api.get("/notifications", {
        params: options.summary ? { summary: "true" } : undefined,
      });
      if (Array.isArray(response.data?.notifications)) {
        setNotifications(response.data.notifications);
      }
      setUnreadNotifications(response.data?.unreadCount || 0);
      return response.data;
    } catch (requestError) {
      if (!options.silent) setTradeError(requestError.response?.data?.message || "Unable to load notifications.");
      return null;
    } finally {
      if (!options.silent) setNotificationLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!authReady) return;
    if (!token || user?.role !== "user") return;
    if (new Set(["/login", "/registration", "/verify-code"]).has(pathname)) return;
    if (accountSummaryRef.current.token !== token) {
      accountSummaryRef.current = { token, loadedAt: 0 };
    }
    const summaryFresh = Date.now() - accountSummaryRef.current.loadedAt < 30_000;
    async function loadAccountData() {
      const requests = [];
      if (pathname === "/wallet") requests.push(getWallet());
      else if (!summaryFresh) requests.push(getWallet({ silent: true, summary: true }));
      if (pathname === "/notifications") requests.push(getNotifications());
      else if (!summaryFresh) requests.push(getNotifications({ silent: true, summary: true }));
      if (!requests.length) return;
      await Promise.all(requests);
      accountSummaryRef.current = { token, loadedAt: Date.now() };
    }
    loadAccountData();
  }, [authReady, getNotifications, getWallet, pathname, token, user?.role]);

  useVisibleInterval(() => Promise.all([
    getWallet({ silent: true, summary: true }),
    getNotifications({ silent: true, summary: true }),
  ]), 60_000, authReady && Boolean(token) && user?.role === "user");

  useEffect(() => {
    if (typeof window === "undefined" || user?.role !== "user") return undefined;
    async function refreshAfterNotification(event) {
      const type = String(event.detail?.type || "");
      if (type.startsWith("withdrawal_")) {
        // Dedicated withdrawal/wallet socket events update those resources.
        // Only refresh notification state here to avoid duplicate API requests.
        await getNotifications({ silent: true, summary: true });
        return;
      }
      await Promise.all([getMyTrades({}, { silent: true }), getWallet({ silent: true, summary: true }), getNotifications({ silent: true, summary: true })]);
    }
    window.addEventListener("tradevault:notification", refreshAfterNotification);
    return () => window.removeEventListener("tradevault:notification", refreshAfterNotification);
  }, [getMyTrades, getNotifications, getWallet, user?.role]);

  useEffect(() => {
    if (typeof window === "undefined" || user?.role !== "user") return undefined;
    function updateWithdrawal(event) {
      const incoming = event.detail;
      if (!incoming?.id) return;
      setWithdrawals((current) => current.map((item) => (
        item.id === incoming.id ? { ...item, ...incoming } : item
      )));
      getWallet({ silent: true, summary: true });
    }
    function updateWallet(event) {
      const incoming = event.detail;
      if (!incoming) return;
      setWallet((current) => ({ ...(current || {}), ...incoming }));
      getWallet({ silent: true, summary: true });
    }
    window.addEventListener("tradevault:withdrawal-updated", updateWithdrawal);
    window.addEventListener("tradevault:wallet-updated", updateWallet);
    return () => {
      window.removeEventListener("tradevault:withdrawal-updated", updateWithdrawal);
      window.removeEventListener("tradevault:wallet-updated", updateWallet);
    };
  }, [getWallet, user?.role]);

  async function submitTrade({ rateId, cardValue, note, images }) {
    if (submittingTrade) return null;
    setSubmittingTrade(true);
    setTradeError("");
    setTradeMessage("");
    try {
      const formData = new FormData();
      formData.append("rateId", String(rateId));
      formData.append("cardValue", String(cardValue));
      if (note?.trim()) formData.append("note", note.trim());
      for (const image of images || []) formData.append("card_images", image);
      const response = await api.post("/trades", formData);
      const formatted = formatTrade(response.data?.trade);
      setTrades((current) => [formatted, ...current.filter((item) => item.id !== formatted.id)]);
      setSelectedTrade(formatted);
      setTradeMessage(response.data?.message || "Trade submitted for review.");
      return formatted;
    } catch (requestError) {
      setTradeError(requestError.response?.data?.message || "Unable to submit your trade.");
      return null;
    } finally {
      setSubmittingTrade(false);
    }
  }

  async function markNotificationRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
      setUnreadNotifications((count) => Math.max(count - 1, 0));
      return true;
    } catch {
      return false;
    }
  }

  async function markAllNotificationsRead() {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadNotifications(0);
      return true;
    } catch {
      return false;
    }
  }

  function clearTradeFeedback() {
    setTradeError("");
    setTradeMessage("");
  }

  function clearWithdrawalFeedback() {
    setWithdrawalError("");
    setWithdrawalMessage("");
  }

  return (
    <TradeContext.Provider value={{
      trades,
      selectedTrade,
      wallet,
      walletTransactions,
      bankAccounts,
      withdrawals,
      withdrawalLimits,
      notifications,
      unreadNotifications,
      tradeLoading,
      walletLoading,
      notificationLoading,
      submittingTrade,
      withdrawalLoading,
      submittingWithdrawal,
      bankAccountActionLoading,
      tradeError,
      tradeMessage,
      withdrawalError,
      withdrawalMessage,
      clearTradeFeedback,
      clearWithdrawalFeedback,
      submitTrade,
      getMyTrades,
      getTradeDetails,
      getWallet,
      getBankAccounts,
      saveBankAccount,
      deleteBankAccount,
      getWithdrawals,
      submitWithdrawal,
      getNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (!context) throw new Error("useTrade must be used inside TradeProvider.");
  return context;
}
