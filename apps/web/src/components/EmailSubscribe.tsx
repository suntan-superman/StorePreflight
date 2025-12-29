"use client";

/**
 * Email Subscription Component
 * 
 * Shows after meaningful value is delivered (Stage 1 in identity lifecycle).
 * "Want to be notified when store requirements change?"
 */

import { useState } from "react";
import { useIdentity, useHasEmail } from "@/context/IdentityContext";

interface EmailSubscribeProps {
  /** When to show this prompt */
  trigger?: "scan-complete" | "guided-complete" | "export";
  /** Optional custom message */
  message?: string;
  /** Callback after subscription */
  onSubscribe?: () => void;
  /** Whether to show as inline or card */
  variant?: "inline" | "card";
}

export function EmailSubscribe({
  trigger,
  message = "Want to be notified when store requirements change or when we improve this workflow?",
  onSubscribe,
  variant = "card",
}: EmailSubscribeProps) {
  const { subscribe, isConfigured } = useIdentity();
  const hasEmail = useHasEmail();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Don't show if already subscribed or dismissed
  if (hasEmail || isDismissed || isSubmitted) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Subscribe the email
    subscribe(email.trim());
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    onSubscribe?.();
  };

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 text-sm bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <span className="text-blue-600">📧</span>
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-3 py-1.5 text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Notify Me
          </button>
        </form>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-blue-400 hover:text-blue-600"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📧</span>
            <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
          </div>
          <p className="text-gray-600 mb-4">{message}</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="px-6 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Subscribing..." : "Notify Me"}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-3">
            Optional — used only to notify you when requirements change. No spam, unsubscribe anytime.
          </p>
        </div>
        
        <button
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Success message shown after subscribing
 */
export function EmailSubscribeSuccess() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
      <span className="text-green-600">✓</span>
      <p className="text-green-700 text-sm">
        You'll be notified when store requirements change. We won't spam you.
      </p>
    </div>
  );
}
