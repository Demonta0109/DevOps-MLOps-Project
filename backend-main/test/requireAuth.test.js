import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret";
const { requireAuth } = await import("../src/middleware/requireAuth.js");

function mockRes() {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

test("rejects a request with no Authorization header", () => {
  const res = mockRes();
  let nextCalled = false;
  requireAuth({ headers: {} }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Missing authentication token" });
});

test("rejects a request with an invalid token", () => {
  const res = mockRes();
  let nextCalled = false;
  requireAuth(
    { headers: { authorization: "Bearer not-a-real-token" } },
    res,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Invalid or expired token" });
});

test("accepts a request with a valid token and attaches req.user", () => {
  const token = jwt.sign({ sub: "user-1", email: "a@b.com" }, "test-secret");
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.sub, "user-1");
  assert.equal(req.user.email, "a@b.com");
});
