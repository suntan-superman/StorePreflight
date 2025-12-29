/**
 * Auth Service
 * 
 * Handles Firebase Auth operations:
 * - Anonymous session creation
 * - Email magic link sign-in
 * - Identity state management
 */

import {
  signInAnonymously,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  linkWithCredential,
  EmailAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type ActionCodeSettings,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./config";
import type { IdentityState, AnonymousIdentity, AuthenticatedIdentity } from "./types";

const ANON_ID_KEY = "storepreflight_anon_id";
const EMAIL_FOR_SIGNIN_KEY = "storepreflight_email_for_signin";
const SUBSCRIBED_EMAIL_KEY = "storepreflight_subscribed_email";

/**
 * Generate a local anonymous ID (UUID)
 */
function generateAnonId(): string {
  return crypto.randomUUID();
}

/**
 * Get or create anonymous ID from localStorage
 */
export function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return generateAnonId();

  let anonId = localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    anonId = generateAnonId();
    localStorage.setItem(ANON_ID_KEY, anonId);
  }
  return anonId;
}

/**
 * Get subscribed email from localStorage (if user subscribed but not authenticated)
 */
export function getSubscribedEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SUBSCRIBED_EMAIL_KEY);
}

/**
 * Save subscribed email to localStorage
 */
export function saveSubscribedEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUBSCRIBED_EMAIL_KEY, email);
}

/**
 * Clear subscribed email (after authentication)
 */
export function clearSubscribedEmail(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SUBSCRIBED_EMAIL_KEY);
}

/**
 * Get current identity state
 */
export function getCurrentIdentity(user: User | null): IdentityState {
  const anonId = getOrCreateAnonId();
  const subscribedEmail = getSubscribedEmail();

  // Fully authenticated user
  if (user && user.email) {
    return {
      kind: "authenticated",
      userId: user.uid,
      email: user.email,
      anonId,
    };
  }

  // Anonymous Firebase user or subscribed email
  if (subscribedEmail) {
    return {
      kind: "subscribed",
      anonId,
      email: subscribedEmail,
    };
  }

  // Pure anonymous
  return {
    kind: "anonymous",
    anonId,
  };
}

/**
 * Sign in anonymously to Firebase
 */
export async function signInAnonymouslyToFirebase(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous sign-in failed:", error);
    return null;
  }
}

/**
 * Send magic link email for sign-in
 */
export async function sendMagicLinkEmail(email: string): Promise<boolean> {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.warn("Firebase Auth not configured. Cannot send magic link.");
    return false;
  }

  // Configure the magic link
  const actionCodeSettings: ActionCodeSettings = {
    // URL to redirect back to after clicking the link
    url: typeof window !== "undefined" 
      ? `${window.location.origin}/auth/callback`
      : "http://localhost:3000/auth/callback",
    handleCodeInApp: true,
  };

  console.log("[Auth] Sending magic link to:", email);
  console.log("[Auth] Callback URL:", actionCodeSettings.url);

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Save email for when user returns via the link
    if (typeof window !== "undefined") {
      localStorage.setItem(EMAIL_FOR_SIGNIN_KEY, email);
    }
    
    console.log("[Auth] Magic link sent successfully");
    return true;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("[Auth] Failed to send magic link:", {
      code: firebaseError.code,
      message: firebaseError.message,
      fullError: error,
    });
    // Don't save as subscribed if send failed
    return false;
  }
}

/**
 * Complete sign-in with email link (called on callback page)
 */
export async function completeSignInWithEmailLink(url?: string): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  const signInUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  if (!isSignInWithEmailLink(auth, signInUrl)) {
    return null;
  }

  // Get the email from localStorage
  let email = typeof window !== "undefined" 
    ? localStorage.getItem(EMAIL_FOR_SIGNIN_KEY)
    : null;

  if (!email) {
    // If email not in localStorage, prompt user
    // This can happen if they open the link on a different device
    email = typeof window !== "undefined"
      ? window.prompt("Please enter your email to confirm sign-in:")
      : null;
  }

  if (!email) {
    console.error("No email available for sign-in");
    return null;
  }

  try {
    const result = await signInWithEmailLink(auth, email, signInUrl);

    // Clear the stored email
    if (typeof window !== "undefined") {
      localStorage.removeItem(EMAIL_FOR_SIGNIN_KEY);
      clearSubscribedEmail(); // Also clear subscribed email since they're now authenticated
    }

    return result.user;
  } catch (error) {
    console.error("Failed to complete sign-in:", error);
    return null;
  }
}

/**
 * Subscribe email without creating account (Stage 1 in lifecycle)
 */
export function subscribeEmail(email: string): void {
  saveSubscribedEmail(email);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign out failed:", error);
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    // If Firebase not configured, call callback with null immediately
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

/**
 * Check if the current URL is a sign-in link
 */
export function isEmailSignInLink(url?: string): boolean {
  const auth = getFirebaseAuth();
  if (!auth) return false;

  const checkUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  return isSignInWithEmailLink(auth, checkUrl);
}
