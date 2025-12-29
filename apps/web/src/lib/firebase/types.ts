/**
 * Identity Types
 * 
 * Based on the StorePreflight Identity Lifecycle:
 * Anonymous → Subscribed → Authenticated
 */

/**
 * Anonymous: No login, no email, local-only state
 */
export interface AnonymousIdentity {
  kind: "anonymous";
  anonId: string;
}

/**
 * Subscribed: Email collected, no account yet
 * User wants notifications but hasn't logged in
 */
export interface SubscribedIdentity {
  kind: "subscribed";
  anonId: string;
  email: string;
}

/**
 * Authenticated: Full account via magic link
 */
export interface AuthenticatedIdentity {
  kind: "authenticated";
  userId: string;
  email: string;
  anonId?: string; // Preserved for data migration
}

/**
 * Union of all identity states
 */
export type IdentityState = AnonymousIdentity | SubscribedIdentity | AuthenticatedIdentity;

/**
 * Check if user has provided an email
 */
export function hasEmail(identity: IdentityState): identity is SubscribedIdentity | AuthenticatedIdentity {
  return identity.kind === "subscribed" || identity.kind === "authenticated";
}

/**
 * Check if user is fully authenticated
 */
export function isAuthenticated(identity: IdentityState): identity is AuthenticatedIdentity {
  return identity.kind === "authenticated";
}

/**
 * Get display email if available
 */
export function getEmail(identity: IdentityState): string | undefined {
  if (hasEmail(identity)) {
    return identity.email;
  }
  return undefined;
}
