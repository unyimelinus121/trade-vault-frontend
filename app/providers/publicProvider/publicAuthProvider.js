"use client";

import api from "@/app/api/api";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import useLoginForm from "./forms/use-login-form";
import useRegistrationForm from "./forms/use-registration-form";
import { usePasswordResetActions } from "./passwordResetActions";
import useCustomerSupport from "./use-customer-support";

const PublicAuthContext = createContext(null);
const profileCacheKey = "tradevault_profile";

function readCachedProfile() {
  if (typeof window === "undefined") return null;
  try {
    const cached = JSON.parse(localStorage.getItem(profileCacheKey) || "null");
    return cached?.id && cached?.role ? cached : null;
  } catch {
    return null;
  }
}

function cacheProfile(profile) {
  try {
    if (profile) localStorage.setItem(profileCacheKey, JSON.stringify(profile));
    else localStorage.removeItem(profileCacheKey);
  } catch {}
}

export default function PublicAuth({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(readCachedProfile);
  const [token, setToken] = useState(() => readCachedProfile() ? "restoring-session" : null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const authRequestInFlight = useRef(false);

  function begin() {
    if (authRequestInFlight.current) return false;
    authRequestInFlight.current = true;
    setLoading(true);
    setError("");
    setMessage("");
    return true;
  }

  function finish() {
    authRequestInFlight.current = false;
    setLoading(false);
  }

  function setSession(receivedUser) {
    setUser(receivedUser);
    setToken("cookie-session");
    cacheProfile(receivedUser);
  }

  function clearSession() {
    setUser(null);
    setToken(null);
    cacheProfile(null);
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await api.get("/me");
        if (!response.data?.user) throw new Error("Session unavailable");
        setSession(response.data.user);
      } catch {
        clearSession();
      } finally {
        setAuthReady(true);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    function handleAccountStatus(event) {
      const accountStatus = event.detail?.accountStatus;
      if (!new Set(["active", "suspended", "deactivated"]).has(accountStatus)) return;
      setUser((current) => {
        if (!current) return current;
        const updated = { ...current, accountStatus };
        cacheProfile(updated);
        return updated;
      });
      if (accountStatus === "suspended") router.replace("/account-suspended");
      if (accountStatus === "deactivated") {
        clearSession();
        router.replace("/");
      }
    }
    window.addEventListener("tradevault:account-status", handleAccountStatus);
    return () => window.removeEventListener("tradevault:account-status", handleAccountStatus);
  }, [router]);

  const sharedFormOptions = {
    api,
    router,
    setSession,
    begin,
    finish,
    fail: setError,
    succeed: setMessage,
  };
  const loginFormApi = useLoginForm(sharedFormOptions);
  const registrationFormApi = useRegistrationForm(sharedFormOptions);

  const passwordResetApi = usePasswordResetActions({
    api, begin, finish, fail: setError, succeed: setMessage, clearSession,
  });
  const customerSupportApi = useCustomerSupport(api);

  async function logout() {
    setLogoutLoading(true);
    try {
      if (token) await api.post(user?.role === "admin" ? "/admin/logout" : "/logout");
    } catch {
      // Local session cleanup must still complete if the server session expired.
    } finally {
      customerSupportApi.clearSupportState();
      clearSession();
      setLogoutLoading(false);
      router.replace(user?.role === "admin" ? "/manager/login" : "/");
    }
  }

  return (
    <PublicAuthContext.Provider value={{
      ...loginFormApi,
      ...registrationFormApi,
      user,
      setUser,
      token,
      setToken,
      authReady,
      loading,
      logoutLoading,
      error,
      message,
      setError,
      setMessage,
      ...passwordResetApi,
      ...customerSupportApi,
      logout,
    }}>
      {children}
    </PublicAuthContext.Provider>
  );
}

export function usePublicAuth() {
  const context = useContext(PublicAuthContext);
  if (!context) throw new Error("usePublicAuth must be used inside the PublicAuth provider.");
  return context;
}
