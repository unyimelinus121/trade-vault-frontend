"use client";

import api from "@/app/api/api";
import { usePublicAuth } from "@/app/providers/publicProvider/publicAuthProvider";
import { io } from "socket.io-client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSocketOrigin, mergeConversation, mergeMessages, playAdminNotification } from "./chatHelpers";

const ChatContext = createContext(null);

export default function ChatProvider({ children }) {
  const { user, token, authReady } = usePublicAuth();
  const role = user?.role;
  const currentUserId = user?.id;
  const [conversation, setConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [userChatOpen, setUserChatOpen] = useState(false);
  const [userChatDraft, setUserChatDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [newMessageNotice, setNewMessageNotice] = useState(null);
  const socketRef = useRef(null);
  const selectedRef = useRef(null);
  const openRef = useRef(false);
  const adminInboxActiveRef = useRef(false);
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    selectedRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    openRef.current = userChatOpen;
  }, [userChatOpen]);

  const loadUserChat = useCallback(async () => {
    if (role !== "user") return null;
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/chat");
      setConversation(response.data.conversation);
      setMessages(response.data.messages || []);
      return response.data;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your conversation.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [role]);

  const loadAdminConversations = useCallback(async (search = "") => {
    if (role !== "admin") return null;
    try {
      const response = await api.get("/admin/chat/conversations", { params: { search } });
      setConversations(response.data.conversations || []);
      return response.data;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load conversations.");
      return null;
    }
  }, [role]);

  const markRead = useCallback(async (conversationId = null) => {
    try {
      const response = role === "admin"
        ? await api.post(`/admin/chat/conversations/${conversationId}/read`)
        : await api.post("/chat/read");
      const updated = response.data?.conversation;
      if (updated) {
        if (role === "admin") setConversations((current) => mergeConversation(current, updated));
        else setConversation(updated);
      }
      return updated;
    } catch {
      return null;
    }
  }, [role]);

  const loadAdminConversation = useCallback(async (conversationId) => {
    if (!conversationId || role !== "admin") return null;
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/admin/chat/conversations/${conversationId}/messages`);
      setConversation(response.data.conversation);
      setMessages(response.data.messages || []);
      await markRead(conversationId);
      return response.data;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load the conversation.");
      setConversation(null);
      setMessages([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [markRead, role]);

  const selectConversation = useCallback((conversationId) => {
    const previous = selectedRef.current;
    if (previous && socketRef.current) {
      socketRef.current.emit("chat:leave", { conversationId: previous });
    }
    selectedRef.current = conversationId;
    setSelectedConversationId(conversationId);
    setMessages([]);
    socketRef.current?.emit("chat:join", { conversationId });
    return loadAdminConversation(conversationId);
  }, [loadAdminConversation]);

  const openUserChat = useCallback(async (initialMessage = "") => {
    setUserChatDraft(initialMessage);
    setUserChatOpen(true);
    openRef.current = true;
    const data = await loadUserChat();
    if (data?.conversation) await markRead(data.conversation.id);
  }, [loadUserChat, markRead]);

  const closeUserChat = useCallback(() => {
    setUserChatOpen(false);
    openRef.current = false;
  }, []);

  const setAdminInboxActive = useCallback((active) => {
    adminInboxActiveRef.current = active;
  }, []);

  const sendMessage = useCallback(async ({ content, image }) => {
    const trimmed = content?.trim() || "";
    if (!trimmed && !image) return false;
    setSending(true);
    setError("");
    try {
      const formData = new FormData();
      if (trimmed) formData.append("content", trimmed);
      if (image) formData.append("image", image);
      const endpoint = role === "admin"
        ? `/admin/chat/conversations/${selectedRef.current}/messages`
        : "/chat/messages";
      const response = await api.post(endpoint, formData);
      if (response.data?.chatMessage) {
        setMessages((current) => mergeMessages(current, [response.data.chatMessage]));
      }
      if (response.data?.conversation) {
        if (role === "admin") {
          setConversations((current) => mergeConversation(current, response.data.conversation));
        } else {
          setConversation(response.data.conversation);
        }
      }
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send the message.");
      return false;
    } finally {
      setSending(false);
    }
  }, [role]);

  const deleteMessage = useCallback(async (messageId) => {
    setError("");
    try {
      const endpoint = role === "admin"
        ? `/admin/chat/messages/${messageId}`
        : `/chat/messages/${messageId}`;
      const response = await api.delete(endpoint);
      setMessages((current) => current.filter((message) => message.id !== messageId));
      if (response.data?.conversation) {
        if (role === "admin") setConversations((current) => mergeConversation(current, response.data.conversation));
        else setConversation(response.data.conversation);
      }
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete the message.");
      return false;
    }
  }, [role]);

  useEffect(() => {
    if (!authReady || !token || !currentUserId) return;
    let socket;
    let cancelled = false;
    api.post("/socket-token").then((response) => {
      if (cancelled || !response.data?.token) return;
    socket = io(getSocketOrigin(), {
      auth: { token: response.data.token },
      reconnection: true,
      reconnectionDelay: 600,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError("");
      if (role === "admin") {
        loadAdminConversations();
        if (selectedRef.current) {
          socket.emit("chat:join", { conversationId: selectedRef.current });
          loadAdminConversation(selectedRef.current);
        }
      } else {
        // The socket supplies new messages. Load the full thread only when the
        // customer opens chat, avoiding a large request on every page visit.
      }
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("chat:message:new", ({ message, conversation: updatedConversation }) => {
      if (!message || !updatedConversation) return;
      if (role === "user") {
        setConversation(updatedConversation);
        setMessages((current) => mergeMessages(current, [message]));
        if (openRef.current && message.senderType === "admin") markRead(updatedConversation.id);
      } else {
        setConversations((current) => mergeConversation(current, updatedConversation));
        if (selectedRef.current === message.conversationId) {
          setConversation(updatedConversation);
          setMessages((current) => mergeMessages(current, [message]));
          if (message.senderType === "user" && adminInboxActiveRef.current) markRead(message.conversationId);
        }
        if (message.senderType === "user" && message.senderId !== currentUserId) {
          playAdminNotification();
          setNewMessageNotice({
            conversationId: message.conversationId,
            userName: `${updatedConversation.user.firstName} ${updatedConversation.user.lastName}`.trim(),
            preview: message.content || "Sent an image",
          });
          window.clearTimeout(noticeTimerRef.current);
          noticeTimerRef.current = window.setTimeout(() => setNewMessageNotice(null), 6500);
        }
      }
    });

    socket.on("chat:message:deleted", ({ messageId, conversationId, conversation: updatedConversation }) => {
      if (role === "user" || selectedRef.current === conversationId) {
        setMessages((current) => current.filter((message) => message.id !== messageId));
      }
      if (updatedConversation) {
        if (role === "admin") setConversations((current) => mergeConversation(current, updatedConversation));
        else setConversation(updatedConversation);
      }
    });

    socket.on("chat:conversation:updated", (updatedConversation) => {
      if (role === "admin" && updatedConversation) {
        setConversations((current) => mergeConversation(current, updatedConversation));
      }
    });

    socket.on("notification:new", (notification) => {
      if (role === "user" && notification) {
        window.dispatchEvent(
          new CustomEvent("tradevault:notification", { detail: notification }),
        );
      }
    });

    socket.on("admin:trade:new", (trade) => {
      if (role === "admin" && trade) {
        window.dispatchEvent(
          new CustomEvent("tradevault:admin-trade", { detail: trade }),
        );
      }
    });

    socket.on("withdrawal:updated", (withdrawal) => {
      if (role === "user" && withdrawal) {
        window.dispatchEvent(new CustomEvent("tradevault:withdrawal-updated", { detail: withdrawal }));
      }
    });

    socket.on("wallet:updated", (wallet) => {
      if (role === "user" && wallet) {
        window.dispatchEvent(new CustomEvent("tradevault:wallet-updated", { detail: wallet }));
      }
    });

    socket.on("admin:withdrawal:updated", (withdrawal) => {
      if (role === "admin" && withdrawal) {
        window.dispatchEvent(new CustomEvent("tradevault:admin-withdrawal-updated", { detail: withdrawal }));
      }
    });
    }).catch(() => setConnected(false));

    return () => {
      cancelled = true;
      window.clearTimeout(noticeTimerRef.current);
      socket?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [authReady, token, currentUserId, role, loadAdminConversation, loadAdminConversations, loadUserChat, markRead]);

  const unreadCount = useMemo(() => {
    if (role === "admin") {
      return conversations.reduce((total, item) => total + Number(item.adminUnreadCount || 0), 0);
    }
    return Number(conversation?.userUnreadCount || 0);
  }, [conversation?.userUnreadCount, conversations, role]);

  const selectedConversation = role === "admin"
    ? conversations.find((item) => item.id === selectedConversationId) || conversation
    : conversation;

  const value = {
    conversation: selectedConversation,
    conversations,
    messages,
    selectedConversationId,
    userChatOpen,
    userChatDraft,
    loading,
    sending,
    connected,
    error,
    unreadCount,
    newMessageNotice,
    setError,
    setNewMessageNotice,
    setAdminInboxActive,
    loadUserChat,
    loadAdminConversations,
    selectConversation,
    openUserChat,
    closeUserChat,
    sendMessage,
    deleteMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used inside ChatProvider.");
  return context;
}
