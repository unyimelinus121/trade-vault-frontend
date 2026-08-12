import assert from "node:assert/strict";
import test from "node:test";
import { getExternalOrigin } from "../app/api/backend/origin.mjs";

function request(url, headers = {}) {
  return { url, headers: new Headers(headers) };
}

test("uses the public HTTPS origin supplied by the trusted reverse proxy", () => {
  assert.equal(
    getExternalOrigin(request(
      "http://frontend:3000/api/backend/login",
      {
        host: "tradevaultnigeria.com",
        "x-forwarded-proto": "https",
      },
    )),
    "https://tradevaultnigeria.com",
  );
});

test("prefers the forwarded host when one is present", () => {
  assert.equal(
    getExternalOrigin(request(
      "http://frontend:3000/api/backend/login",
      {
        host: "frontend:3000",
        "x-forwarded-host": "tradevaultnigeria.com",
        "x-forwarded-proto": "https",
      },
    )),
    "https://tradevaultnigeria.com",
  );
});

test("uses the request URL for direct local development requests", () => {
  assert.equal(
    getExternalOrigin(request("http://localhost:3000/api/backend/login")),
    "http://localhost:3000",
  );
});
