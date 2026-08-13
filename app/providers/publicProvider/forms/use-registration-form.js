"use client";

import { useEffect, useState } from "react";

const emptyRegistrationForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  referralCode: "",
  image: null,
};

export default function useRegistrationForm({ api, router, setSession, begin, fail, succeed, finish }) {
  const [registerForm, setRegisterForm] = useState(emptyRegistrationForm);
  const [verificationCode, setVerificationCode] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  function register(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
    fail("");
    succeed("");
  }

  function handleVerificationCode(event) {
    setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6));
    fail("");
    succeed("");
  }

  function handleImage(event) {
    const image = event.target.files?.[0];
    if (!image) return;
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(image.type)) {
      fail("Please select a JPG, PNG, or WebP profile image.");
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      fail("The profile image must be smaller than 5MB.");
      return;
    }
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setRegisterForm((current) => ({ ...current, image }));
    setImagePreview(URL.createObjectURL(image));
    fail("");
  }

  function removeImage() {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setRegisterForm((current) => ({ ...current, image: null }));
    setImagePreview("");
  }

  async function startRegistration(event) {
    event.preventDefault();
    if (!begin()) return null;
    try {
      const formData = new FormData();
      formData.append("firstName", registerForm.firstName.trim());
      formData.append("lastName", registerForm.lastName.trim());
      formData.append("email", registerForm.email.trim().toLowerCase());
      formData.append("password", registerForm.password);
      if (registerForm.referralCode.trim()) formData.append("referralCode", registerForm.referralCode.trim().toUpperCase());
      if (registerForm.image) formData.append("avatar", registerForm.image);
      const response = await api.post("/register", formData);
      localStorage.setItem("verificationEmail", registerForm.email.trim().toLowerCase());
      setResendCooldown(60);
      succeed(response.data?.message || "Check your email for the verification code.");
      router.push("/verify-code");
      return response.data;
    } catch (requestError) {
      fail(requestError.response?.data?.message || "Unable to create account.");
      return null;
    } finally {
      finish();
    }
  }

  async function resendVerificationCode() {
    const email = localStorage.getItem("verificationEmail");
    if (!email) {
      fail("Your registration email was not found. Please register again.");
      return false;
    }
    if (resendLoading || resendCooldown > 0) return false;
    setResendLoading(true);
    fail("");
    succeed("");
    try {
      const response = await api.post("/resend-verification-code", { email });
      setVerificationCode("");
      setResendCooldown(60);
      succeed(response.data?.message || "A new verification code has been sent.");
      return true;
    } catch (requestError) {
      const retryAfter = Number(requestError.response?.data?.retryAfterSeconds || 0);
      if (retryAfter > 0) setResendCooldown(retryAfter);
      fail(requestError.response?.data?.message || "Unable to send a new verification code.");
      return false;
    } finally {
      setResendLoading(false);
    }
  }

  async function verifyRegistrationCode(event) {
    event.preventDefault();
    const email = localStorage.getItem("verificationEmail");
    if (!email || verificationCode.length !== 6) {
      fail(email ? "Enter the six-digit verification code." : "Your registration email was not found. Please register again.");
      return null;
    }
    if (!begin()) return null;
    try {
      const response = await api.post("/verify-email", {
        email,
        verificationCode,
      });
      if (!response.data?.user || !response.data?.authenticated) {
        fail("Verification completed without a valid session. Please log in.");
        return null;
      }
      setSession(response.data.user);
      localStorage.removeItem("verificationEmail");
      setVerificationCode("");
      setRegisterForm(emptyRegistrationForm);
      removeImage();
      succeed(response.data?.message || "Your account has been verified.");
      router.replace("/");
      return response.data;
    } catch (requestError) {
      fail(requestError.response?.data?.message || "The verification code is invalid or has expired.");
      return null;
    } finally {
      finish();
    }
  }

  return {
    registerForm,
    setRegisterForm,
    register,
    verificationCode,
    setVerificationCode,
    handleVerificationCode,
    verifyRegistrationCode,
    resendVerificationCode,
    resendLoading,
    resendCooldown,
    handleImage,
    removeImage,
    imagePreview,
    startRegistration,
  };
}
