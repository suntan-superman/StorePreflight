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

export default function GuidedPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<GuidedSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GuidedSession | null>(null);
  const [hasScanResult, setHasScanResult] = useState(false);

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
            <span className="badge badge-google">
              {currentSession.store === "google" ? "Google Play" : "App Store"}
            </span>
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
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/guided/google"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-brand hover:bg-brand/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Google Play</h3>
                <p className="text-sm text-gray-500">Play Console submission</p>
              </div>
            </Link>
            
            <Link
              href="/guided/apple"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-brand hover:bg-brand/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">🍎</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">App Store</h3>
                <p className="text-sm text-gray-500">App Store Connect submission</p>
              </div>
            </Link>
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
                    <p className="font-medium text-gray-900">{session.appName}</p>
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
