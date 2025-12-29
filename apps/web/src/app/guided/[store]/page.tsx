"use client";

import { useEffect, useState, useMemo, use, useCallback, useRef } from "react";
import Link from "next/link";
import { useGuidedSubmission } from "@/hooks/useGuidedSubmission";
import { StepList } from "@/components/guided/StepList";
import { StepDetail } from "@/components/guided/StepDetail";
import { ProgressBar } from "@/components/guided/ProgressBar";
import { useToast } from "@/components/Toast";
import type { StoreTarget } from "@storepreflight/guided";
import type { RuleEvaluationResult } from "@/lib/browser-scanner/types";

interface PageProps {
  params: Promise<{ store: string }>;
}

export default function GuidedWizardPage({ params }: PageProps) {
  const { store } = use(params);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [autoStartStatus, setAutoStartStatus] = useState<"pending" | "started" | "done">("pending");
  const autoStartRef = useRef(false);
  const { addToast } = useToast();
  
  // Validate store parameter
  const validStore = store === "google" || store === "apple" ? store : null;
  
  const {
    session,
    flow,
    isLoading,
    toggleStepComplete,
    resetProgress,
    stats,
    isStepComplete,
    startSession,
  } = useGuidedSubmission();

  // Auto-start session if navigating here with a scan result but no matching session
  useEffect(() => {
    // Wait for hook to finish loading
    if (isLoading || !validStore) return;
    
    // Already have a session for this store - we're done
    if (session?.store === validStore) {
      setAutoStartStatus("done");
      return;
    }
    
    // Prevent double-execution with ref (React StrictMode can run effects twice)
    if (autoStartRef.current) return;
    autoStartRef.current = true;
    
    // Try to auto-create session from scan result
    try {
      const storedScan = localStorage.getItem("storepreflight_scan_result");
      if (storedScan) {
        setAutoStartStatus("started");
        const { result: evaluation } = JSON.parse(storedScan) as {
          result: RuleEvaluationResult;
        };
        startSession(validStore as StoreTarget, evaluation);
        // Session state will update, triggering re-render and session?.store check above
      } else {
        // No scan result, nothing to auto-start
        setAutoStartStatus("done");
      }
    } catch (err) {
      console.error("Failed to auto-start session:", err);
      setAutoStartStatus("done");
    }
  }, [validStore, session, isLoading, startSession]);

  // Derive completed step IDs as a Set for StepList
  const completedStepIds = useMemo(() => {
    if (!session) return new Set<string>();
    return new Set(
      session.progress
        .filter((p) => p.completed)
        .map((p) => p.stepId)
    );
  }, [session]);

  // Get generated copy from session
  const generatedCopy = useMemo(() => {
    if (!session) return {};
    // Convert GeneratedCopy to Record<string, string>
    const copy: Record<string, string> = {};
    const genCopy = session.generatedCopy;
    if (genCopy.appPurpose) copy.appPurpose = genCopy.appPurpose;
    if (genCopy.permissionJustification) copy.permissionJustification = genCopy.permissionJustification;
    if (genCopy.reviewerNotes) copy.reviewerNotes = genCopy.reviewerNotes;
    if (genCopy.dataSafetySummary) copy.dataSafetySummary = genCopy.dataSafetySummary;
    if (genCopy.privacyPolicyUrl) copy.privacyPolicyUrl = genCopy.privacyPolicyUrl;
    if (genCopy.exportCompliance) copy.exportCompliance = genCopy.exportCompliance;
    if (genCopy.supportUrl) copy.supportUrl = genCopy.supportUrl;
    if (genCopy.termsUrl) copy.termsUrl = genCopy.termsUrl;
    if (genCopy.marketingUrl) copy.marketingUrl = genCopy.marketingUrl;
    return copy;
  }, [session]);

  // Select first incomplete step on load
  useEffect(() => {
    if (flow && flow.steps.length > 0 && !selectedStepId) {
      // Find first incomplete step
      const firstIncomplete = flow.steps.find(
        (s) => !isStepComplete(s.id)
      );
      const firstStep = flow.steps[0];
      if (firstStep) {
        setSelectedStepId(firstIncomplete?.id || firstStep.id);
      }
    }
  }, [flow, isStepComplete, selectedStepId]);

  // Get current step
  const selectedStep = useMemo(() => {
    if (!flow || !selectedStepId) return null;
    return flow.steps.find((s) => s.id === selectedStepId) || null;
  }, [flow, selectedStepId]);

  // Navigate to next incomplete step after completion
  const handleToggleComplete = () => {
    if (!selectedStep || !flow) return;
    
    const wasCompleted = isStepComplete(selectedStep.id);
    toggleStepComplete(selectedStep.id);
    
    // If marking complete, move to next incomplete
    if (!wasCompleted) {
      const currentIdx = flow.steps.findIndex((s) => s.id === selectedStep.id);
      const nextIncomplete = flow.steps.slice(currentIdx + 1).find(
        (s) => !isStepComplete(s.id) && s.id !== selectedStep.id
      );
      if (nextIncomplete) {
        setSelectedStepId(nextIncomplete.id);
      }
    }
  };

  // Navigate to previous/next step
  const navigateStep = useCallback((direction: "prev" | "next") => {
    if (!flow || !selectedStepId) return;
    const currentIdx = flow.steps.findIndex((s) => s.id === selectedStepId);
    if (currentIdx === -1) return;
    
    const newIdx = direction === "prev" ? currentIdx - 1 : currentIdx + 1;
    if (newIdx >= 0 && newIdx < flow.steps.length) {
      const newStep = flow.steps[newIdx];
      if (newStep) {
        setSelectedStepId(newStep.id);
      }
    }
  }, [flow, selectedStepId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "k":
          e.preventDefault();
          navigateStep("prev");
          break;
        case "ArrowDown":
        case "j":
          e.preventDefault();
          navigateStep("next");
          break;
        case "Enter":
        case " ":
          if (selectedStep && e.key === "Enter") {
            e.preventDefault();
            handleToggleComplete();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateStep, selectedStep, handleToggleComplete]);

  // Reset progress handler
  const handleResetProgress = () => {
    resetProgress();
    setShowResetConfirm(false);
    addToast({
      type: "success",
      title: "Progress Reset",
      message: "All step completions have been cleared",
    });
  };

  // Export checklist as text (for printing)
  const handleExportChecklist = () => {
    if (!flow || !session) return;

    const storeName = validStore === "google" ? "Google Play" : "App Store";
    const lines: string[] = [
      `${storeName} Submission Checklist`,
      `App: ${flow.appName || "Your App"}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      "",
      "=" .repeat(50),
      "",
    ];

    // Group steps by section
    const sections = new Map<string, typeof flow.steps>();
    flow.steps.forEach((step) => {
      const section = step.sectionPath[0] || "Other";
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section)!.push(step);
    });

    sections.forEach((steps, sectionName) => {
      lines.push(`## ${sectionName}`);
      lines.push("");
      steps.forEach((step) => {
        const completed = isStepComplete(step.id);
        const status = completed ? "✓" : "☐";
        const blocking = step.blocking ? " (REQUIRED)" : "";
        lines.push(`${status} ${step.title}${blocking}`);
        if (step.description) {
          lines.push(`   ${step.description}`);
        }
      });
      lines.push("");
    });

    // Add summary
    const safeStats = stats || { completed: 0, total: flow.steps.length };
    lines.push("=" .repeat(50));
    lines.push(`Progress: ${safeStats.completed}/${safeStats.total} steps completed`);

    // Create and download file
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${validStore}-submission-checklist.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: "success",
      title: "Checklist Exported",
      message: "Submission checklist downloaded",
    });
  };

  // Invalid store
  if (!validStore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Store</h1>
          <p className="text-gray-600 mb-4">Please select a valid store to continue.</p>
          <Link href="/guided" className="text-brand hover:underline">
            ← Back to Guided Submission
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission guide...</p>
        </div>
      </div>
    );
  }

  // Check if session store matches URL store
  const sessionMatchesStore = session?.store === validStore;

  // Still attempting to auto-start session (pending or started but session not yet set)
  if (autoStartStatus !== "done" && !sessionMatchesStore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up session...</p>
        </div>
      </div>
    );
  }

  // No session found or wrong store
  if (!flow || !sessionMatchesStore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Active Session</h1>
          <p className="text-gray-600 mb-6">
            You need to run a scan first and start a guided submission session for {validStore === "google" ? "Google Play" : "App Store"}.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/scan"
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
            >
              Run a Scan
            </Link>
            <Link
              href="/guided"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const storeName = validStore === "google" ? "Google Play" : "App Store";
  const blockingRemaining = stats ? (stats.blockingTotal - stats.blockingCompleted) : 0;
  const safeStats = stats || { completed: 0, total: flow.steps.length, blockingTotal: 0, blockingCompleted: 0, percentComplete: 0 };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/guided"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {storeName} Submission Guide
              </h1>
              <p className="text-sm text-gray-500">
                {flow.appName || "Your App"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportChecklist}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export checklist"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reset progress"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Progress summary */}
            <div className="hidden sm:block text-right text-sm">
              <div className="text-gray-900 font-medium">
                {safeStats.completed} of {safeStats.total} steps
              </div>
              {blockingRemaining > 0 && (
                <div className="text-red-600 text-xs">
                  {blockingRemaining} required remaining
                </div>
              )}
            </div>
            
            {/* Completion status */}
            {safeStats.completed === safeStats.total ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ✓ Ready to Submit
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                In Progress
              </span>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 max-w-screen-2xl mx-auto">
          <ProgressBar
            completed={safeStats.completed}
            total={safeStats.total}
            blockingCompleted={safeStats.blockingCompleted}
            blockingTotal={safeStats.blockingTotal}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Step list */}
        <aside className="w-72 flex-shrink-0 hidden md:block">
          <StepList
            steps={flow.steps}
            selectedStepId={selectedStepId}
            completedStepIds={completedStepIds}
            onSelectStep={setSelectedStepId}
          />
        </aside>

        {/* Mobile step selector */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-10 safe-area-inset-bottom">
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => navigateStep("prev")}
              disabled={!flow || flow.steps.findIndex((s) => s.id === selectedStepId) === 0}
              className="p-3 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Step selector */}
            <select
              value={selectedStepId || ""}
              onChange={(e) => setSelectedStepId(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {flow.steps.map((step, idx) => (
                <option key={step.id} value={step.id}>
                  {idx + 1}. {isStepComplete(step.id) ? "✓ " : ""}{step.title}
                </option>
              ))}
            </select>

            {/* Next button */}
            <button
              onClick={() => navigateStep("next")}
              disabled={!flow || flow.steps.findIndex((s) => s.id === selectedStepId) === flow.steps.length - 1}
              className="p-3 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Detail pane */}
        <main className="flex-1 bg-white pb-24 md:pb-0">
          {selectedStep ? (
            <StepDetail
              step={selectedStep}
              isCompleted={isStepComplete(selectedStep.id)}
              onToggleComplete={handleToggleComplete}
              generatedCopy={generatedCopy}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a step to view details
            </div>
          )}
        </main>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="hidden lg:block fixed bottom-4 right-4 bg-gray-900/90 text-white text-xs px-3 py-2 rounded-lg">
        <span className="opacity-70">Navigate:</span>{" "}
        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">↑</kbd>{" "}
        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">↓</kbd>
        <span className="mx-2 opacity-50">|</span>
        <span className="opacity-70">Complete:</span>{" "}
        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Enter</kbd>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset Progress?
            </h3>
            <p className="text-gray-600 mb-6">
              This will clear all step completions. Your generated copy and session data will be preserved.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
