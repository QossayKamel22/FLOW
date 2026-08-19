/**
 * Translates raw Firebase error codes into short, user-friendly messages.
 * Never surface `error.message` from Firebase directly to the UI.
 */
export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";

  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function friendlyFirestoreError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";

  switch (code) {
    case "permission-denied":
      return "You don't have permission to do that.";
    case "unavailable":
      return "Connection lost. Changes will sync once you're back online.";
    default:
      return "Something went wrong while saving your data.";
  }
}
