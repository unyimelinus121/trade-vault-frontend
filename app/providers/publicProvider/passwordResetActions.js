export function usePasswordResetActions({ api, begin, finish, fail, succeed, clearSession }) {
  async function requestPasswordReset(email) {
    if (!begin()) return false;
    try {
      const response = await api.post("/forgot-password", { email });
      succeed(response.data?.message || "If the account exists, a reset code has been sent.");
      return true;
    } catch (error) {
      fail(error.response?.data?.message || "Unable to send the reset code.");
      return false;
    } finally {
      finish();
    }
  }

  async function verifyPasswordResetCode({ email, code }) {
    if (!begin()) return null;
    try {
      const response = await api.post("/verify-password-reset-code", { email, code });
      return response.data;
    } catch (error) {
      fail(error.response?.data?.message || "Unable to verify the reset code.");
      return null;
    } finally {
      finish();
    }
  }

  async function completePasswordReset({ resetToken, password }) {
    if (!begin()) return null;
    try {
      const response = await api.post("/reset-password", { token: resetToken, password });
      succeed(response.data?.message || "Password reset successfully.");
      clearSession();
      return response.data;
    } catch (error) {
      fail(error.response?.data?.message || "Unable to reset your password.");
      return null;
    } finally {
      finish();
    }
  }

  return { requestPasswordReset, verifyPasswordResetCode, completePasswordReset };
}
