export function getPublicAccessRedirect({ authReady, user, pathname }) {
  const suspendedPath = "/account-suspended";
  const isSuspended = user?.role === "user" && user?.accountStatus === "suspended";
  if (isSuspended && pathname !== suspendedPath) return suspendedPath;
  if (authReady && user?.role === "admin") return "/admin/dashboard";
  if (authReady && pathname === suspendedPath && !isSuspended) {
    return user ? "/" : "/login";
  }
  return null;
}
