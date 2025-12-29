"use client";

/**
 * Auth Callback Page
 * 
 * Handles magic link sign-in completion.
 * User is redirected here after clicking the email link.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeSignInWithEmailLink, isEmailSignInLink } from "@/lib/firebase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      // Check if this is a valid sign-in link
      if (!isEmailSignInLink()) {
        setStatus("error");
        setError("Invalid sign-in link. Please request a new one.");
        return;
      }

      const user = await completeSignInWithEmailLink();

      if (user) {
        setStatus("success");
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setStatus("error");
        setError("Failed to complete sign-in. Please try again.");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-md w-full mx-4 text-center">
        {status === "loading" && (
          <>
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Signing you in...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your sign-in link.
            </p>
            <div className="mt-6">
              <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-gray-600">
              You've successfully signed in. Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign-in Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <a href="/dashboard" className="btn-primary inline-block">
              Go to Dashboard
            </a>
          </>
        )}
      </div>
    </div>
  );
}
