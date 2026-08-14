"use client";

import { useState } from "react";

const emptyLoginForm = { email: "", password: "" };

export default function useLoginForm({ api, router, setSession, begin, fail, succeed, finish }) {
  const [loginForm, setLoginForm] = useState(emptyLoginForm);

  function handleLogin(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
    fail("");
    succeed("");
  }

  async function authenticate(event, { endpoint, role, destination }) {
    event.preventDefault();
    if (!begin()) return null;
    try {
      const response = await api.post(endpoint, {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });
      const receivedUser = response.data?.user;
      if (!receivedUser || !response.data?.authenticated || receivedUser.role !== role) {
        fail(role === "admin" ? "Unauthorized. Administrator access required." : "Please use a customer account to log in here.");
        return null;
      }
      setSession(receivedUser);
      setLoginForm(emptyLoginForm);
      succeed(response.data?.message || "Login successful.");
      router.replace(receivedUser.accountStatus === "suspended" ? "/account-suspended" : destination);
      return response.data;
    } catch (requestError) {
      fail(requestError.response?.data?.message || "Unable to log in.");
      return null;
    } finally {
      finish();
    }
  }

  function login(event) {
    const requested = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next")
      : null;
    const destination = requested?.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/";
    return authenticate(event, { endpoint: "/login", role: "user", destination });
  }

  function adminLogin(event) {
    return authenticate(event, {
      endpoint: "/admin/login",
      role: "admin",
      destination: "/admin/dashboard",
    });
  }

  return { loginForm, handleLogin, login, adminLogin };
}
