export { getFirebaseApp, getFirebaseAuth, isFirebaseConfigured } from "./config";
export {
  getOrCreateAnonId,
  getCurrentIdentity,
  signInAnonymouslyToFirebase,
  sendMagicLinkEmail,
  completeSignInWithEmailLink,
  subscribeEmail,
  signOut,
  onAuthStateChange,
  isEmailSignInLink,
  getSubscribedEmail,
} from "./auth";
export type {
  IdentityState,
  AnonymousIdentity,
  SubscribedIdentity,
  AuthenticatedIdentity,
} from "./types";
export { hasEmail, isAuthenticated, getEmail } from "./types";
