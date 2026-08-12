"use client";

import { useState } from "react";

const initialPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export default function useCustomerSupport(api) {
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportPagination, setSupportPagination] = useState(initialPagination);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  function clearSupportFeedback() {
    setSupportError("");
    setSupportMessage("");
  }

  function clearSupportState() {
    setSupportTickets([]);
    setSelectedSupportTicket(null);
    setSupportMessages([]);
    setSupportPagination(initialPagination);
    clearSupportFeedback();
  }

  async function getSupportTickets(filters = {}, options = {}) {
    if (!options.silent) setSupportLoading(true);
    if (!options.silent) setSupportError("");
    try {
      const response = await api.get("/support/tickets", { params: filters });
      setSupportTickets(response.data?.tickets || []);
      setSupportPagination(response.data?.pagination || initialPagination);
      return response.data;
    } catch (requestError) {
      if (!options.silent) setSupportError(requestError.response?.data?.message || "Unable to load support tickets.");
      return null;
    } finally {
      if (!options.silent) setSupportLoading(false);
    }
  }

  async function createSupportTicket(ticket) {
    setSupportLoading(true);
    clearSupportFeedback();
    try {
      const response = await api.post("/support/tickets", ticket);
      const createdTicket = response.data?.ticket || null;
      setSupportMessage(response.data?.message || "Support ticket created.");
      if (createdTicket) {
        setSupportTickets((current) => [createdTicket, ...current]);
      }
      return createdTicket;
    } catch (requestError) {
      setSupportError(requestError.response?.data?.message || "Unable to create the support ticket.");
      return null;
    } finally {
      setSupportLoading(false);
    }
  }

  async function getSupportTicketById(id, options = {}) {
    if (!options.silent) setSupportLoading(true);
    if (!options.silent) setSupportError("");
    try {
      const response = await api.get(`/support/tickets/${id}`);
      setSelectedSupportTicket(response.data?.ticket || null);
      setSupportMessages(response.data?.messages || []);
      return response.data;
    } catch (requestError) {
      if (!options.silent) {
        setSupportError(requestError.response?.data?.message || "Unable to load the support ticket.");
        setSelectedSupportTicket(null);
        setSupportMessages([]);
      }
      return null;
    } finally {
      if (!options.silent) setSupportLoading(false);
    }
  }

  async function replyToSupportTicket(id, message) {
    setSupportLoading(true);
    clearSupportFeedback();
    try {
      const response = await api.post(`/support/tickets/${id}/messages`, { message });
      setSupportMessage(response.data?.message || "Reply sent successfully.");
      await getSupportTicketById(id);
      return true;
    } catch (requestError) {
      setSupportError(requestError.response?.data?.message || "Unable to send the reply.");
      return false;
    } finally {
      setSupportLoading(false);
    }
  }

  return {
    supportTickets,
    selectedSupportTicket,
    supportMessages,
    supportPagination,
    supportLoading,
    supportError,
    supportMessage,
    clearSupportFeedback,
    clearSupportState,
    getSupportTickets,
    createSupportTicket,
    getSupportTicketById,
    replyToSupportTicket,
  };
}
