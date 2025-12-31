"use client";

/**
 * Header with identity-aware sign-in/account button
 */

import { useState } from "react";
import { useIdentity, useHasEmail } from "@/context/IdentityContext";
import { getEmail, isFirebaseConfigured } from "@/lib/firebase";

export function Header() {
  const { identity, sendMagicLink, signOut, isLoading } = useIdentity();
  const hasEmail = useHasEmail();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      setError("Sign-in is not available yet. Please try again later.");
      return;
    }

    setIsSending(true);
    const result = await sendMagicLink(email.trim());
    setIsSending(false);

    if (result.success) {
      setIsExistingUser(result.isExistingUser);
      setLinkSent(true);
    } else {
      setError(result.error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowSignInModal(false);
  };

  const userEmail = getEmail(identity);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">✓</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">StorePreflight</span>
            </a>
            <nav className="flex items-center gap-1 sm:gap-2">
              <NavLink href="/demo">Demo</NavLink>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/scan">Scan</NavLink>
              <NavLink href="/guided">Guided</NavLink>
              <NavLink href="/assets">Assets</NavLink>
              <NavLink href="/export">Export</NavLink>
              
              {/* Account/Sign In Button */}
              <div className="ml-2 pl-2 border-l border-gray-200">
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                ) : identity.kind === "authenticated" ? (
                  <button
                    onClick={() => setShowSignInModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title={userEmail}
                  >
                    <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-brand">
                        {userEmail?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{userEmail}</span>
                  </button>
                ) : hasEmail ? (
                  <button
                    onClick={() => setShowSignInModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span>{"\u2709"}</span>
                    <span className="hidden sm:inline">Subscribed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSignInModal(true)}
                    className="px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/5 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {identity.kind === "authenticated" ? (
              // Signed in state
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-brand">
                      {userEmail?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Signed In</h2>
                  <p className="text-gray-600 mt-1">{userEmail}</p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => setShowSignInModal(false)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : linkSent ? (
              // Link sent state
              <>
                <div className="text-center">
                  <div className="text-5xl mb-4">{"\u2709"}</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {isExistingUser ? "Welcome Back!" : "Check Your Email"}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {isExistingUser ? (
                      <>
                        We found your account! A sign-in link has been sent to <strong>{email}</strong>. 
                        Click the link in the email to sign in.
                      </>
                    ) : (
                      <>
                        We sent a sign-in link to <strong>{email}</strong>. Click the link in the email to create your account and sign in.
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setShowSignInModal(false);
                      setLinkSent(false);
                      setEmail("");
                      setIsExistingUser(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              // Sign in form
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
                  <p className="text-gray-600 mt-1">
                    We'll send you a magic link to sign in — no password needed.
                  </p>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSendLink} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    disabled={isSending}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSending || !email.trim()}
                    className="w-full px-4 py-3 font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? "Sending..." : "Send Magic Link"}
                  </button>
                </form>
                <p className="text-xs text-gray-500 text-center mt-4">
                  By signing in, you agree to our <a href="/privacy" className="text-brand hover:underline">Privacy Policy</a>.
                </p>
                <button
                  onClick={() => {
                    setShowSignInModal(false);
                    setError(null);
                  }}
                  className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {children}
    </a>
  );
}
