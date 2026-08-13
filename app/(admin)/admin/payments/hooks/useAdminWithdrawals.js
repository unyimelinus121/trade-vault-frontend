"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/app/api/api";
import useVisibleInterval from "@/app/hooks/use-visible-interval";

const emptyPagination = { page: 1, total: 0, totalPages: 1 };

export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingBankAccounts, setPendingBankAccounts] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState(emptyPagination);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [decision, setDecision] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const loadWithdrawals = useCallback(async (options = {}) => {
    if (!options.silent) setLoading(true);
    if (!options.silent) setError("");
    try {
      const response = await api.get("/admin/withdrawals", {
        params: { status: status || undefined, search: appliedSearch || undefined, page, limit: 25 },
      });
      setWithdrawals(response.data?.withdrawals || []);
      setPendingBankAccounts(response.data?.pendingBankAccounts || []);
      setSummary(response.data?.summary || {});
      setPagination(response.data?.pagination || emptyPagination);
    } catch (requestError) {
      if (!options.silent) setError(requestError.response?.data?.message || "Unable to load withdrawals.");
    } finally {
      if (!options.silent) setLoading(false);
    }
  }, [appliedSearch, page, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWithdrawals();
  }, [loadWithdrawals]);

  useVisibleInterval(() => loadWithdrawals({ silent: true }), 30_000);

  useEffect(() => {
    const reload = () => loadWithdrawals();
    window.addEventListener("tradevault:admin-withdrawal-updated", reload);
    return () => window.removeEventListener("tradevault:admin-withdrawal-updated", reload);
  }, [loadWithdrawals]);

  function selectStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  function applySearch(event) {
    event.preventDefault();
    setAppliedSearch(search.trim());
    setPage(1);
  }

  function openDecision(item, action) {
    setError(""); setMessage(""); setAdminNote(""); setDecision({ item, action });
  }

  function closeDecision() {
    if (actionId) return;
    setDecision(null); setAdminNote("");
  }

  async function confirmDecision() {
    if (!decision || actionId) return;
    if (decision.action === "reject" && !adminNote.trim()) {
      setError("Enter a reason before rejecting this withdrawal.");
      return;
    }
    setActionId(decision.item.id); setError("");
    try {
      const response = await api.patch(`/admin/withdrawals/${decision.item.id}/${decision.action}`, { adminNote: adminNote.trim() });
      const updated = response.data?.withdrawal || { id: decision.item.id, status: decision.action === "paid" ? "paid" : "rejected" };
      window.dispatchEvent(new CustomEvent("tradevault:admin-withdrawal-resolved", { detail: updated }));
      setMessage(response.data?.message || "Withdrawal updated successfully.");
      setDecision(null); setAdminNote("");
      await loadWithdrawals();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update this withdrawal.");
    } finally {
      setActionId(null);
    }
  }

  async function reviewBankAccount(id, action) {
    if (actionId) return;
    setActionId(`bank-${id}`); setError(""); setMessage("");
    try {
      const response = await api.patch(`/admin/withdrawals/bank-accounts/${id}/${action}`);
      setPendingBankAccounts((current) => current.filter((item) => item.id !== id));
      setMessage(response.data?.message || "Bank account reviewed.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to review this bank account.");
    } finally { setActionId(null); }
  }

  return { withdrawals, pendingBankAccounts, summary, pagination, status, search, page, loading, actionId, error,
    message, decision, adminNote, setSearch, setPage, setAdminNote, setError,
    loadWithdrawals, selectStatus, applySearch, openDecision, closeDecision, confirmDecision, reviewBankAccount };
}
