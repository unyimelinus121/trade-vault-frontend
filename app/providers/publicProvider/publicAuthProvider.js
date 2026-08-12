"use client";

import api from "@/app/api/api";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import useLoginForm from "./forms/use-login-form";
import useRegistrationForm from "./forms/use-registration-form";
import { usePasswordResetActions } from "./passwordResetActions";
import useCustomerSupport from "./use-customer-support";

const PublicAuthContext = createContext(null);

export default function PublicAuth({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
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
  }

  function clearSession() {
    setUser(null);
    setToken(null);
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
      if (token) await api.post("/logout");
    } catch {
      // Local session cleanup must still complete if the server session expired.
    } finally {
      customerSupportApi.clearSupportState();
      clearSession();
      setLogoutLoading(false);
      router.replace("/");
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
