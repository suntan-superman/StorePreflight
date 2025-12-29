"use client";

/**
 * Identity Context
 * 
 * Provides identity state throughout the app following the lifecycle:
 * Anonymous → Subscribed → Authenticated
 * 
 * Usage:
 * const { identity, subscribe, sendMagicLink, signOut, isLoading } = useIdentity();
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type IdentityState,
  getCurrentIdentity,
  onAuthStateChange,
  subscribeEmail as saveSubscribedEmail,
  sendMagicLinkEmail,
  signOut as firebaseSignOut,
  isFirebaseConfigured,
  getOrCreateAnonId,
} from "@/lib/firebase";

interface IdentityContextValue {
  /** Current identity state */
  identity: IdentityState;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Whether Firebase is configured */
  isConfigured: boolean;
  /** Subscribe with email (Stage 1 - no account) */
  subscribe: (email: string) => void;
  /** Send magic link for full authentication */
  sendMagicLink: (email: string) => Promise<boolean>;
  /** Sign out */
  signOut: () => Promise<void>;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<IdentityState>(() => ({
    kind: "anonymous",
    anonId: typeof window !== "undefined" ? getOrCreateAnonId() : "",
  }));
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isFirebaseConfigured();

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      const newIdentity = getCurrentIdentity(user);
      setIdentity(newIdentity);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const subscribe = useCallback((email: string) => {
    saveSubscribedEmail(email);
    setIdentity((prev) => ({
      kind: "subscribed",
      anonId: prev.kind === "anonymous" || prev.kind === "subscribed" ? prev.anonId : prev.anonId || getOrCreateAnonId(),
      email,
    }));
  }, []);

  const sendMagicLink = useCallback(async (email: string): Promise<boolean> => {
    // Send the magic link first
    const success = await sendMagicLinkEmail(email);
    
    // Only mark as subscribed if email actually sent
    if (success) {
      subscribe(email);
    }
    
    return success;
  }, [subscribe]);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    // Reset to anonymous state
    setIdentity({
      kind: "anonymous",
      anonId: getOrCreateAnonId(),
    });
  }, []);

  return (
    <IdentityContext.Provider
      value={{
        identity,
        isLoading,
        isConfigured,
        subscribe,
        sendMagicLink,
        signOut,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error("useIdentity must be used within an IdentityProvider");
  }
  return context;
}

/**
 * Hook to check if user has email (subscribed or authenticated)
 */
export function useHasEmail(): boolean {
  const { identity } = useIdentity();
  return identity.kind === "subscribed" || identity.kind === "authenticated";
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { identity } = useIdentity();
  return identity.kind === "authenticated";
}
