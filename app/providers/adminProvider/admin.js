"use client";

import api from "@/app/api/api";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatAdminTrade, formatRateCard } from "./adminHelpers";
import useVisibleInterval from "@/app/hooks/use-visible-interval";

const AdminContext = createContext();
export default function AdminProvider({ children, initialRates }) {
  const router = useRouter();
  const hasInitialRates = Array.isArray(initialRates) && initialRates.length > 0;
  const [rates, setRates] = useState(() =>
    hasInitialRates
      ? initialRates.map(formatRateCard)
      : [],
  );
  const [loading, setLoading] = useState(!hasInitialRates);
  const [error, setError] = useState("");
  const [rateActionError, setRateActionError] = useState("");
  const [rateMessage, setRateMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingRate, setUpdatingRate] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState(null);

  async function getRate() {
    setLoading(true);
    setError("");

    try {
      const result = await api.get("/getRates");
      const { rate } = result.data;
      const formattedRates = Array.isArray(rate)
        ? rate.map(formatRateCard)
        : [];

      setRates(formattedRates);
    } catch {
      setError("Unable to load gift cards from the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasInitialRates) return;

    async function fetchData() {
      await getRate();
    }

    fetchData();
  }, [hasInitialRates]);

  const [rateForm, setRateForm] = useState({
    cardName: "",
    cardRate: "",
    category: "",
    country: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");

  function clearRateFeedback() {
    setRateActionError("");
    setRateMessage("");
  }

  function clearRateForm() {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setRateForm({
      cardName: "",
      cardRate: "",
      category: "",
      country: "",
      image: null,
    });
    setImagePreview("");
    clearRateFeedback();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setRateForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleImageChange(e) {
    const image = e.target.files?.[0];
    if (!image) return;

    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(image.type)) {
      setRateActionError("Please select a JPG, PNG, or WebP card image.");
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      setRateActionError("Card images must be smaller than 5MB.");
      return;
    }

    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setRateForm((current) => ({ ...current, image }));
    setImagePreview(URL.createObjectURL(image));
    clearRateFeedback();
  }

  async function addRate(e) {
    e.preventDefault();
    if (submitting) return false;

    setSubmitting(true);
    clearRateFeedback();

    try {
      if (!rateForm.image) {
        setRateActionError("Please select a card image.");
        return false;
      }

      const formData = new FormData();

      formData.append("cardName", rateForm.cardName);
      formData.append("cardRate", rateForm.cardRate);
      formData.append("category", rateForm.category);
      formData.append("country", rateForm.country);
      formData.append("card_picture", rateForm.image);

      const response = await api.post("/addCard", formData);

      if (response.data?.rate) {
        setRates((current) => [formatRateCard(response.data.rate), ...current]);
      }
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setRateForm({ cardName: "", cardRate: "", category: "", country: "", image: null });
      setImagePreview("");
      setRateMessage(response.data?.message || "Card added successfully.");
      return true;
    } catch (requestError) {
      setRateActionError(
        requestError.response?.data?.message || "Unable to add the card.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCard(id) {
    if (!id || deletingCardId) return false;

    setDeletingCardId(id);
    clearRateFeedback();

    try {
      const response = await api.delete(`/deleteCard/${encodeURIComponent(id)}`);

      // IDs can arrive as numbers from the API and strings from server-rendered
      // data. Compare their canonical values so a successful deletion always
      // disappears from the dashboard immediately.
      setRates((current) =>
        current.filter((rate) => String(rate.id) !== String(id)),
      );
      setRateMessage(response.data?.message || "Card deleted successfully.");
      return true;
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401 || status === 403) {
        setRateActionError(
          "Your administrator session has expired. Sign in again to delete cards.",
        );
        window.setTimeout(() => {
          router.replace("/manager/login?next=%2Fadmin%2Fdashboard");
        }, 900);
        return false;
      }

      setRateActionError(
        requestError.response?.data?.message || "Unable to delete this card.",
      );
      return false;
    } finally {
      setDeletingCardId(null);
    }
  }

  const [editRate, setEditRate] = useState(null);

  function handleEditChange(e) {
    const { name, value } = e.target;

    setEditRate((current) => ({
      ...current,
      [name]: value,
    }));
    clearRateFeedback();
  }

  function startEditingRate(rate) {
    clearRateFeedback();
    setEditRate({
      id: rate.id,
      cardName: rate.card_name,
      cardRate: rate.card_rate,
      category: rate.category || "",
      country: rate.country || "",
      image: null,
      imagePreview: rate.card_picture_url || "",
    });
  }

  function handleEditImageChange(event) {
    const image = event.target.files?.[0];
    if (!image) return;
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(image.type)) {
      setRateActionError("Please select a JPG, PNG, or WebP card image.");
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      setRateActionError("Card images must be smaller than 5MB.");
      return;
    }

    setEditRate((current) => {
      if (current?.imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(current.imagePreview);
      }
      return {
        ...current,
        image,
        imagePreview: URL.createObjectURL(image),
      };
    });
    clearRateFeedback();
  }

  function closeEditRate() {
    if (editRate?.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(editRate.imagePreview);
    }
    setEditRate(null);
    setRateActionError("");
  }

  async function updateRate(e) {
    e.preventDefault();
    if (!editRate?.id || updatingRate) return false;

    setUpdatingRate(true);
    clearRateFeedback();

    try {
      const formData = new FormData();
      formData.append("cardName", editRate.cardName);
      formData.append("cardRate", editRate.cardRate);
      formData.append("category", editRate.category);
      formData.append("country", editRate.country);
      if (editRate.image) formData.append("card_picture", editRate.image);

      const response = await api.patch(`/updateCard/${editRate.id}`, formData);
      const updatedRate = response.data?.rate
        ? formatRateCard(response.data.rate)
        : null;
      if (updatedRate) {
        setRates((current) =>
          current.map((rate) => (rate.id === updatedRate.id ? updatedRate : rate)),
        );
      }
      if (editRate.imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(editRate.imagePreview);
      }
      setEditRate(null);
      setRateMessage(response.data?.message || "Card updated successfully.");
      return true;
    } catch (requestError) {
      setRateActionError(
        requestError.response?.data?.message || "Unable to update this card.",
      );
      return false;
    } finally {
      setUpdatingRate(false);
    }
  }

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersSummary, setUsersSummary] = useState({
    total: 0,
    admins: 0,
    active: 0,
    verified: 0,
  });
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersMessage, setUsersMessage] = useState("");

  function clearUsersFeedback() {
    setUsersError("");
    setUsersMessage("");
  }

  async function getUsers(filters = {}) {
    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await api.get("/admin/users", { params: filters });
      setUsers(response.data?.users || []);
      setUsersSummary(response.data?.summary || usersSummary);
      setUsersPagination(response.data?.pagination || usersPagination);
      return response.data;
    } catch (requestError) {
      setUsersError(
        requestError.response?.data?.message || "Unable to load users.",
      );
      return null;
    } finally {
      setUsersLoading(false);
    }
  }

  async function getUserById(id) {
    setUserLoading(true);
    setUsersError("");

    try {
      const response = await api.get(`/admin/users/${id}`);
      const payload = {
        ...response.data?.user,
        supportTickets: response.data?.supportTickets || [],
        unavailableSections: response.data?.unavailableSections || [],
      };
      setSelectedUser(payload);
      return payload;
    } catch (requestError) {
      setUsersError(
        requestError.response?.data?.message || "Unable to load this user.",
      );
      setSelectedUser(null);
      return null;
    } finally {
      setUserLoading(false);
    }
  }

  async function createUser(userInput) {
    setUserLoading(true);
    clearUsersFeedback();

    try {
      const formData = new FormData();
      Object.entries(userInput).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      const response = await api.post("/admin/users", formData);
      setUsersMessage(response.data?.message || "User created successfully.");
      return response.data?.user || null;
    } catch (requestError) {
      setUsersError(
        requestError.response?.data?.message || "Unable to create user.",
      );
      return null;
    } finally {
      setUserLoading(false);
    }
  }

  async function updateUser(id, changes) {
    setUserLoading(true);
    clearUsersFeedback();

    try {
      const response = await api.patch(`/admin/users/${id}`, changes);
      const updatedUser = response.data?.user;
      setSelectedUser((current) =>
        current?.id === updatedUser?.id ? { ...current, ...updatedUser } : current,
      );
      setUsers((current) =>
        current.map((user) => (user.id === updatedUser?.id ? updatedUser : user)),
      );
      setUsersMessage(response.data?.message || "User updated successfully.");
      return updatedUser || null;
    } catch (requestError) {
      setUsersError(
        requestError.response?.data?.message || "Unable to update user.",
      );
      return null;
    } finally {
      setUserLoading(false);
    }
  }

  async function updateUserRole(id, role) {
    setUserLoading(true);
    clearUsersFeedback();

    try {
      const response = await api.patch(`/admin/users/${id}/role`, { role });
      const updatedUser = response.data?.user;
      setSelectedUser((current) =>
        current?.id === updatedUser?.id ? { ...current, ...updatedUser } : current,
      );
      setUsers((current) =>
        current.map((user) => (user.id === updatedUser?.id ? updatedUser : user)),
      );
      setUsersMessage(response.data?.message || "User role updated.");
      return updatedUser || null;
    } catch (requestError) {
      setUsersError(
        requestError.response?.data?.message || "Unable to update user role.",
      );
      return null;
    } finally {
      setUserLoading(false);
    }
  }

  async function updateUserStatus(id, status) {
    setUserLoading(true);
    clearUsersFeedback();

    try {
      const response = await api.patch(`/admin/users/${id}/status`, { status });
      const updatedUser = response.data?.user;
      setSelectedUser((current) =>
        current?.id === updatedUser?.id ? { ...current, ...updatedUser } : current,
      );
      setUsers((current) =>
        current.map((user) => (user.id === updatedUser?.id ? updatedUser : user)),
      );
      setUsersMessage(response.data?.message || "Account status updated.");
      return updatedUser || null;
    } catch (requestError) {
      setUsersError(
        requestError.response?.data?.message ||
          "Unable to update account status.",
      );
      return null;
    } finally {
      setUserLoading(false);
    }
  }

  async function deleteUser(id) {
    setUserLoading(true);
    clearUsersFeedback();

    try {
      const response = await api.delete(`/admin/users/${id}`);
      setUsers((current) => current.filter((user) => user.id !== id));
      setSelectedUser((current) => (current?.id === id ? null : current));
      setUsersMessage(response.data?.message || "User deleted successfully.");
      return true;
    } catch (requestError) {
      setUsersError(
        requestError.response?.data?.message || "Unable to delete user.",
      );
      return false;
    } finally {
      setUserLoading(false);
    }
  }

  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [supportPagination, setSupportPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  function clearSupportFeedback() {
    setSupportError("");
    setSupportMessage("");
  }

  async function getSupportTickets(filters = {}, options = {}) {
    if (!options.silent) setSupportLoading(true);
    setSupportError("");
    try {
      const response = await api.get("/admin/support/tickets", {
        params: filters,
      });
      setSupportTickets(response.data?.tickets || []);
      setSupportPagination(response.data?.pagination || supportPagination);
      return response.data;
    } catch (requestError) {
      setSupportError(
        requestError.response?.data?.message ||
          "Unable to load support tickets.",
      );
      return null;
    } finally {
      if (!options.silent) setSupportLoading(false);
    }
  }

  async function getSupportTicketById(id, options = {}) {
    if (!options.silent) setSupportLoading(true);
    setSupportError("");
    try {
      const response = await api.get(`/admin/support/tickets/${id}`);
      setSelectedTicket(response.data?.ticket || null);
      setTicketMessages(response.data?.messages || []);
      return response.data;
    } catch (requestError) {
      setSupportError(
        requestError.response?.data?.message ||
          "Unable to load the support ticket.",
      );
      setSelectedTicket(null);
      return null;
    } finally {
      if (!options.silent) setSupportLoading(false);
    }
  }

  async function updateSupportTicket(id, changes) {
    setSupportLoading(true);
    clearSupportFeedback();
    try {
      const response = await api.patch(`/admin/support/tickets/${id}`, changes);
      const updatedTicket = response.data?.ticket;
      setSelectedTicket((current) =>
        current?.id === updatedTicket?.id
          ? { ...current, ...updatedTicket }
          : current,
      );
      setSupportTickets((current) =>
        current.map((ticket) =>
          ticket.id === updatedTicket?.id ? { ...ticket, ...updatedTicket } : ticket,
        ),
      );
      setSupportMessage(response.data?.message || "Support ticket updated.");
      return updatedTicket || null;
    } catch (requestError) {
      setSupportError(
        requestError.response?.data?.message ||
          "Unable to update the support ticket.",
      );
      return null;
    } finally {
      setSupportLoading(false);
    }
  }

  async function replyToSupportTicket(id, message) {
    setSupportLoading(true);
    clearSupportFeedback();
    try {
      const response = await api.post(`/admin/support/tickets/${id}/messages`, {
        message,
      });
      setSupportMessage(response.data?.message || "Reply sent successfully.");
      await getSupportTicketById(id);
      return true;
    } catch (requestError) {
      setSupportError(
        requestError.response?.data?.message || "Unable to send the reply.",
      );
      return false;
    } finally {
      setSupportLoading(false);
    }
  }

  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [tradePagination, setTradePagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [tradeSummary, setTradeSummary] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    successful: 0,
    rejected: 0,
  });
  const [tradePeriodSummary, setTradePeriodSummary] = useState({
    todayCount: 0,
    todayValue: 0,
    weekCount: 0,
    weekValue: 0,
    monthCount: 0,
    monthValue: 0,
    yearCount: 0,
    yearValue: 0,
  });
  const [tradeUnreadCount, setTradeUnreadCount] = useState(0);
  const [withdrawalUnreadCount, setWithdrawalUnreadCount] = useState(0);
  const resolvedWithdrawalIdsRef = useRef(new Set());
  const [tradeLoading, setTradeLoading] = useState(false);
  const [processingTradeId, setProcessingTradeId] = useState(null);
  const [tradeError, setTradeError] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");

  async function markWithdrawalNotificationsViewed() {
    if (withdrawalUnreadCount <= 0) return true;
    const previous = withdrawalUnreadCount;
    setWithdrawalUnreadCount(0);
    try {
      await api.patch("/admin/withdrawals/viewed");
      return true;
    } catch {
      setWithdrawalUnreadCount(previous);
      return false;
    }
  }

  function clearTradeFeedback() {
    setTradeError("");
    setTradeMessage("");
  }

  async function getTrades(filters = {}, options = {}) {
    if (!options.silent) setTradeLoading(true);
    if (!options.silent) setTradeError("");
    try {
      const response = await api.get("/admin/trades", { params: filters });
      setTrades((response.data?.trades || []).map(formatAdminTrade));
      setTradePagination(response.data?.pagination || tradePagination);
      setTradeSummary(response.data?.summary || tradeSummary);
      setTradePeriodSummary(response.data?.periodSummary || tradePeriodSummary);
      setTradeUnreadCount(Number(response.data?.unreadCount || 0));
      return response.data;
    } catch (requestError) {
      if (!options.silent) setTradeError(requestError.response?.data?.message || "Unable to load submitted trades.");
      return null;
    } finally {
      if (!options.silent) setTradeLoading(false);
    }
  }

  async function getTradeDetails(id) {
    setTradeLoading(true);
    setTradeError("");
    setSelectedTrade(null);
    try {
      const response = await api.get(`/admin/trades/${id}`);
      const formatted = formatAdminTrade(response.data?.trade);
      setSelectedTrade(formatted);
      if (response.data?.wasUnread) {
        setTradeUnreadCount((current) => Math.max(current - 1, 0));
      }
      return formatted;
    } catch (requestError) {
      setTradeError(requestError.response?.data?.message || "Unable to load this trade.");
      setSelectedTrade(null);
      return null;
    } finally {
      setTradeLoading(false);
    }
  }

  async function processTrade(id, action, adminNote = "") {
    if (!id || processingTradeId) return null;
    setProcessingTradeId(id);
    clearTradeFeedback();
    try {
      const response = await api.patch(`/admin/trades/${id}/${action}`, { adminNote });
      const updated = formatAdminTrade(response.data?.trade);
      setSelectedTrade(updated);
      setTrades((current) => current.map((trade) => trade.id === updated.id ? updated : trade));
      setTradeMessage(response.data?.message || "Trade updated successfully.");
      return updated;
    } catch (requestError) {
      setTradeError(requestError.response?.data?.message || "Unable to update this trade.");
      return null;
    } finally {
      setProcessingTradeId(null);
    }
  }

  function markTradeSuccessful(id, adminNote = "") {
    return processTrade(id, "successful", adminNote);
  }

  function markTradeProcessing(id, adminNote = "") {
    return processTrade(id, "processing", adminNote);
  }

  function rejectTrade(id, adminNote = "") {
    return processTrade(id, "reject", adminNote);
  }

  useEffect(() => {
    function handleNewAdminTrade(event) {
      const trade = event.detail;
      if (!trade?.id) return;
      setTradeUnreadCount((current) => current + 1);
      setTrades((current) =>
        current.some((item) => item.id === trade.id)
          ? current
          : [formatAdminTrade(trade), ...current],
      );
    }
    window.addEventListener("tradevault:admin-trade", handleNewAdminTrade);
    return () => window.removeEventListener("tradevault:admin-trade", handleNewAdminTrade);
  }, []);

  useVisibleInterval(async () => {
    const [tradeResponse, withdrawalResponse] = await Promise.allSettled([
      api.get("/admin/trades", { params: { page: 1, limit: 1 } }),
      api.get("/admin/withdrawals", { params: { page: 1, limit: 1 } }),
    ]);
    if (tradeResponse.status === "fulfilled") {
      setTradeUnreadCount(Number(tradeResponse.value.data?.unreadCount || 0));
    }
    if (withdrawalResponse.status === "fulfilled") {
      setWithdrawalUnreadCount(Number(withdrawalResponse.value.data?.unreadCount || 0));
    }
  }, 30_000);

  useEffect(() => {
    let active = true;
    api.get("/admin/withdrawals", { params: { page: 1, limit: 1 } })
      .then((response) => { if (active) setWithdrawalUnreadCount(Number(response.data?.unreadCount || 0)); })
      .catch(() => {});
    function handleWithdrawal(event) {
      if (!event.detail?.id) return;
      if (event.detail.status === "pending") setWithdrawalUnreadCount((current) => current + 1);
      else if (["paid", "rejected"].includes(event.detail.status)) {
        if (resolvedWithdrawalIdsRef.current.has(event.detail.id)) return;
        resolvedWithdrawalIdsRef.current.add(event.detail.id);
        setWithdrawalUnreadCount((current) => Math.max(current - 1, 0));
      }
    }
    function handleImmediateResolution(event) {
      if (!event.detail?.id) return;
      if (resolvedWithdrawalIdsRef.current.has(event.detail.id)) return;
      resolvedWithdrawalIdsRef.current.add(event.detail.id);
      setWithdrawalUnreadCount((current) => Math.max(current - 1, 0));
    }
    window.addEventListener("tradevault:admin-withdrawal-updated", handleWithdrawal);
    window.addEventListener("tradevault:admin-withdrawal-resolved", handleImmediateResolution);
    return () => {
      active = false;
      window.removeEventListener("tradevault:admin-withdrawal-updated", handleWithdrawal);
      window.removeEventListener("tradevault:admin-withdrawal-resolved", handleImmediateResolution);
    };
  }, []);

  return (
    <AdminContext.Provider
      value={{
        rates,
        loading,
        error,
        getRate,
        handleChange,
        rateForm,
        handleImageChange,
        imagePreview,
        addRate,
        deleteCard,
        rateActionError,
        rateMessage,
        clearRateFeedback,
        clearRateForm,
        submitting,
        updatingRate,
        deletingCardId,
        editRate,
        handleEditChange,
        startEditingRate,
        handleEditImageChange,
        closeEditRate,
        updateRate,

        users,
        selectedUser,
        setSelectedUser,
        usersSummary,
        usersPagination,
        usersLoading,
        userLoading,
        usersError,
        usersMessage,
        clearUsersFeedback,
        getUsers,
        getUserById,
        createUser,
        updateUser,
        updateUserRole,
        updateUserStatus,
        deleteUser,

        supportTickets,
        selectedTicket,
        ticketMessages,
        supportPagination,
        supportLoading,
        supportError,
        supportMessage,
        clearSupportFeedback,
        getSupportTickets,
        getSupportTicketById,
        updateSupportTicket,
        replyToSupportTicket,

        trades,
        selectedTrade,
        setSelectedTrade,
        tradePagination,
        tradeSummary,
        tradePeriodSummary,
        tradeUnreadCount,
        withdrawalUnreadCount,
        markWithdrawalNotificationsViewed,
        tradeLoading,
        processingTradeId,
        tradeError,
        tradeMessage,
        clearTradeFeedback,
        getTrades,
        getTradeDetails,
        markTradeProcessing,
        markTradeSuccessful,
        rejectTrade,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
