import assert from "node:assert";
import { after, before, describe, it } from "node:test";
import type { Express } from "express";
import { Role } from "@prisma/client";
import type { signAccessToken as SignAccessToken } from "../src/utils/jwt";

let app: Express;
let signAccessToken: typeof SignAccessToken;
let server: any;
let baseUrl: string;

before(async () => {
  process.env.JWT_ACCESS_SECRET ??= "test-secret";
  ({ default: app } = await import("../src/app"));
  ({ signAccessToken } = await import("../src/utils/jwt"));
  server = app.listen(0);
  const address = server.address();
  baseUrl =
    typeof address === "string"
      ? address
      : `http://127.0.0.1:${address?.port ?? 0}`;
});

after(() => {
  server?.close();
});

function makeUrl(path: string) {
  return `${baseUrl}${path}`;
}

function makeToken(role: Role) {
  return signAccessToken({ sub: 1, role });
}

function authHeader(role: Role) {
  return { Authorization: `Bearer ${makeToken(role)}` };
}

describe("authorization guards", () => {
  it("rejects unauthenticated admin analytics requests", async () => {
    const res = await fetch(makeUrl("/api/admin/analytics/top-borrowed"));
    assert.strictEqual(res.status, 401);
  });

  it("rejects non-staff/admin admin analytics requests", async () => {
    const res = await fetch(makeUrl("/api/admin/analytics/top-borrowed"), {
      headers: authHeader(Role.student),
    });
    assert.strictEqual(res.status, 403);
  });

  it("rejects unauthenticated admin job execution", async () => {
    const res = await fetch(
      makeUrl("/api/admin/jobs/run-reservation-expiry"),
      { method: "POST" },
    );
    assert.strictEqual(res.status, 401);
  });

  it("rejects non-staff/admin admin job execution", async () => {
    const res = await fetch(
      makeUrl("/api/admin/jobs/run-reservation-expiry"),
      {
        method: "POST",
        headers: authHeader(Role.student),
      },
    );
    assert.strictEqual(res.status, 403);
  });

  it("rejects unauthenticated returns", async () => {
    const res = await fetch(makeUrl("/api/returns/1"), { method: "POST" });
    assert.strictEqual(res.status, 401);
  });

  it("rejects non-staff/admin returns", async () => {
    const res = await fetch(makeUrl("/api/returns/1"), {
      method: "POST",
      headers: authHeader(Role.student),
    });
    assert.strictEqual(res.status, 403);
  });
});