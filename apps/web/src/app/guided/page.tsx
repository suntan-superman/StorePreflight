"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAllGuidedSessions,
  getCurrentGuidedSession,
  deleteGuidedSession,
} from "@/lib/guided-integration";
import type { GuidedSession } from "@storepreflight/guided";
import type { SubmissionIntent } from "@storepreflight/shared";
import { SUBMISSION_INTENT_LABELS } from "@storepreflight/shared";
import { IntentSelector } from "@/components/guided/IntentSelector";

type StoreTarget = "google" | "apple";

export default function GuidedPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<GuidedSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GuidedSession | null>(null);
  const [hasScanResult, setHasScanResult] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<SubmissionIntent>("production");
  const [selectedStore, setSelectedStore] = useState<StoreTarget | null>(null);

  useEffect(() => {
    setSessions(getAllGuidedSessions());
    setCurrentSession(getCurrentGuidedSession());
    setHasScanResult(!!localStorage.getItem("storepreflight_scan_result"));
  }, []);

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Delete this session? Progress will be lost.")) {
      deleteGuidedSession(sessionId);
      setSessions(getAllGuidedSessions());
      setCurrentSession(getCurrentGuidedSession());
    }
  };

  const handleContinueSession = (session: GuidedSession) => {
    // Set as current session
    localStorage.setItem(
      "storepreflight_current_guided_session",
      JSON.stringify(session)
    );
    router.push(`/guided/${session.store}`);
  };

  const handleStartNewSession = () => {
    if (!selectedStore) return;
    
    // Store the selected intent for the session creation
    localStorage.setItem("storepreflight_selected_intent", selectedIntent);
    router.push(`/guided/${selectedStore}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Guided Submission
      </h1>
      <p className="text-gray-600 mb-8">
        Step-by-step guidance through App Store Connect and Google Play Console with copy-paste text.
      </p>

      {/* Current Session */}
      {currentSession && (
        <div className="card mb-8 border-brand/30 bg-brand/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Continue Current Session
            </h2>
            <div className="flex items-center gap-2">
              <span className="badge badge-google">
                {currentSession.store === "google" ? "Google Play" : "App Store"}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                {SUBMISSION_INTENT_LABELS[currentSession.intent]}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{currentSession.appName}</p>
              <p className="text-sm text-gray-500">{currentSession.bundleId}</p>
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {new Date(currentSession.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleContinueSession(currentSession)}
              className="btn-primary"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Start New */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Start New Submission
        </h2>
        
        {hasScanResult ? (
          <div className="space-y-6">
            {/* Intent Selection */}
            <IntentSelector
              value={selectedIntent}
              onChange={setSelectedIntent}
            />

            {/* Store Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Select target store
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedStore("google")}
                  className={`
                    flex items-center gap-4 p-4 border-2 rounded-lg transition-all text-left
                    ${selectedStore === "google"
                      ? "border-brand bg-brand/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Google Play</h3>
                    <p className="text-sm text-gray-500">Play Console submission</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedStore("apple")}
                  className={`
                    flex items-center gap-4 p-4 border-2 rounded-lg transition-all text-left
                    ${selectedStore === "apple"
                      ? "border-brand bg-brand/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">🍎</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">App Store</h3>
                    <p className="text-sm text-gray-500">App Store Connect submission</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartNewSession}
              disabled={!selectedStore}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-colors
                ${selectedStore
                  ? "bg-brand text-white hover:bg-brand-dark"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {selectedStore
                ? `Start ${selectedStore === "google" ? "Google Play" : "App Store"} Submission →`
                : "Select a store to continue"
              }
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Scan your project first to generate guided submission steps.
            </p>
            <Link href="/scan" className="btn-primary">
              Scan Project
            </Link>
          </div>
        )}
      </div>

      {/* Previous Sessions */}
      {sessions.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Previous Sessions
          </h2>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {session.store === "google" ? "🤖" : "🍎"}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{session.appName}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {SUBMISSION_INTENT_LABELS[session.intent]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()} •{" "}
                      {session.progress.filter((p) => p.completed).length} steps done
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleContinueSession(session)}
                    className="px-3 py-1 text-sm text-brand hover:bg-brand/10 rounded transition-colors"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.sessionId)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select your target store (Google Play or App Store)</li>
          <li>• Follow the step-by-step checklist based on your scan results</li>
          <li>• Copy pre-filled text for store forms</li>
          <li>• Mark steps complete to track your progress</li>
          <li>• Your progress is saved automatically</li>
        </ul>
      </div>
    </div>
  );
}
