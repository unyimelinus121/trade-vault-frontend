import assert from "node:assert/strict";
import test from "node:test";
import { getPublicAccessRedirect } from "../app/lib/account-access.mjs";

test("suspended customers are always redirected to the restricted page", () => {
  const user = { role: "user", accountStatus: "suspended" };
  assert.equal(getPublicAccessRedirect({ authReady: true, user, pathname: "/wallet" }), "/account-suspended");
  assert.equal(getPublicAccessRedirect({ authReady: true, user, pathname: "/account-suspended" }), null);
});

test("the restricted page cannot be used without a suspended session", () => {
  assert.equal(getPublicAccessRedirect({ authReady: true, user: null, pathname: "/account-suspended" }), "/login");
  assert.equal(getPublicAccessRedirect({ authReady: true, user: { role: "user", accountStatus: "active" }, pathname: "/account-suspended" }), "/");
});
