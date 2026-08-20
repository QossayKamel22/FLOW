import { describe, expect, it } from "vitest";
import { friendlyAuthError, friendlyFirestoreError } from "./errors";

function withCode(code: string) {
  return { code };
}

describe("friendlyAuthError", () => {
  it("maps known Firebase auth codes to friendly messages", () => {
    expect(friendlyAuthError(withCode("auth/invalid-email"))).toMatch(/email/i);
    expect(friendlyAuthError(withCode("auth/wrong-password"))).toMatch(/incorrect/i);
    expect(friendlyAuthError(withCode("auth/user-not-found"))).toMatch(/incorrect/i);
    expect(friendlyAuthError(withCode("auth/email-already-in-use"))).toMatch(/already exists/i);
    expect(friendlyAuthError(withCode("auth/popup-blocked"))).toMatch(/popup/i);
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(friendlyAuthError(withCode("auth/some-new-unmapped-code"))).toBe("Something went wrong. Please try again.");
  });

  it("falls back to a generic message when given a non-Firebase error", () => {
    expect(friendlyAuthError(new Error("boom"))).toBe("Something went wrong. Please try again.");
    expect(friendlyAuthError(null)).toBe("Something went wrong. Please try again.");
    expect(friendlyAuthError(undefined)).toBe("Something went wrong. Please try again.");
  });

  it("never leaks the raw Firebase error message", () => {
    const raw = "Firebase: Error (auth/invalid-email).";
    const result = friendlyAuthError({ code: "auth/invalid-email", message: raw });
    expect(result).not.toContain(raw);
  });
});

describe("friendlyFirestoreError", () => {
  it("maps known Firestore codes to friendly messages", () => {
    expect(friendlyFirestoreError(withCode("permission-denied"))).toMatch(/permission/i);
    expect(friendlyFirestoreError(withCode("unavailable"))).toMatch(/connection/i);
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(friendlyFirestoreError(withCode("some-unmapped-code"))).toBe("Something went wrong while saving your data.");
  });

  it("falls back to a generic message when given a non-Firebase error", () => {
    expect(friendlyFirestoreError(new Error("boom"))).toBe("Something went wrong while saving your data.");
  });
});
