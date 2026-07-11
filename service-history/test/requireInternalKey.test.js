import { test } from "node:test";
import assert from "node:assert/strict";

process.env.INTERNAL_API_KEY = "test-internal-key";
const { requireInternalKey } = await import("../src/middleware/requireInternalKey.js");

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

test("rejects a request with no X-Internal-Key header", () => {
  const res = mockRes();
  let nextCalled = false;
  requireInternalKey({ headers: {} }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Missing internal key" });
});

test("rejects a request with the wrong key", () => {
  const res = mockRes();
  let nextCalled = false;
  requireInternalKey({ headers: { "x-internal-key": "wrong" } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Invalid internal key" });
});

test("accepts a request with the correct key", () => {
  const res = mockRes();
  let nextCalled = false;
  requireInternalKey(
    { headers: { "x-internal-key": "test-internal-key" } },
    res,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, true);
});
