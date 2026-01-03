"use client";

import { useEffect, useState, useMemo, use, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGuidedSubmission } from "@/hooks/useGuidedSubmission";
import { StepList } from "@/components/guided/StepList";
import { StepDetail } from "@/components/guided/StepDetail";
import { ProgressBar } from "@/components/guided/ProgressBar";
import { useToast } from "@/components/Toast";
import type { StoreTarget, DeepLinkInfo, StoreConsoleLink } from "@storepreflight/guided";
import { 
  getDeepLinkForFinding, 
  getConsoleLink, 
  parseStoreUrl,
  CONSOLE_CONFIG_KEYS 
} from "@storepreflight/guided";
import type { RuleEvaluationResult, GateFinding } from "@/lib/browser-scanner/types";

interface PageProps {
  params: Promise<{ store: string }>;
}

/** Finding with its resolved deep link */
interface FindingWithLink {
  finding: GateFinding;
  deepLink: DeepLinkInfo | undefined;
}

/** Stored console configuration */
interface ConsoleConfig {
  appId: string;
  devId?: string;
  appUrl: string;
}

export default function GuidedWizardPage({ params }: PageProps) {
  const { store } = use(params);
  const searchParams = useSearchParams();
  const stepFromQuery = searchParams.get("step"); // Deep-link to specific step
  
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [autoStartStatus, setAutoStartStatus] = useState<"pending" | "started" | "done">("pending");
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);
  const [showFindingsPanel, setShowFindingsPanel] = useState(true);
  const [scanFindings, setScanFindings] = useState<FindingWithLink[]>([]);
  const [showConsoleConfig, setShowConsoleConfig] = useState(false);
  const [consoleConfig, setConsoleConfig] = useState<ConsoleConfig | null>(null);
  const [consoleUrlInput, setConsoleUrlInput] = useState("");
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

  // Load console configuration from localStorage
  useEffect(() => {
    if (!validStore) return;
    
    const storageKey = validStore === "apple" 
      ? CONSOLE_CONFIG_KEYS.APPLE 
      : CONSOLE_CONFIG_KEYS.GOOGLE;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setConsoleConfig(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load console config:", err);
    }
  }, [validStore]);

  // Load findings from scan result and create deep links
  useEffect(() => {
    if (!validStore) return;
    
    try {
      const storedScan = localStorage.getItem("storepreflight_scan_result");
      if (storedScan) {
        const { result: evaluation } = JSON.parse(storedScan) as {
          result: RuleEvaluationResult;
        };
        
        // Filter findings for this store and map with deep links
        const storeFindings = evaluation.findings
          .filter((f) => f.platform === validStore || f.platform === "both")
          .map((finding) => ({
            finding,
            deepLink: getDeepLinkForFinding(finding.id, validStore as StoreTarget),
          }))
          // Sort by risk level (high first)
          .sort((a, b) => {
            const riskOrder = { high: 0, medium: 1, low: 2 };
            return riskOrder[a.finding.risk] - riskOrder[b.finding.risk];
          });
        
        setScanFindings(storeFindings);
      }
    } catch (err) {
      console.error("Failed to load findings:", err);
    }
  }, [validStore]);

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

  // Get console link for current step
  const currentConsoleLink = useMemo<StoreConsoleLink | null>(() => {
    if (!selectedStepId || !validStore || !consoleConfig) return null;
    return getConsoleLink(selectedStepId, validStore as StoreTarget, consoleConfig) || null;
  }, [selectedStepId, validStore, consoleConfig]);

  // Save console configuration
  const handleSaveConsoleConfig = useCallback(() => {
    if (!validStore || !consoleUrlInput.trim()) return;
    
    const parsed = parseStoreUrl(consoleUrlInput.trim(), validStore as StoreTarget);
    if (!parsed) {
      addToast({
        type: "error",
        title: "Invalid URL",
        message: validStore === "apple" 
          ? "Please paste a valid App Store Connect URL (e.g., https://appstoreconnect.apple.com/apps/1234567890/...)"
          : "Please paste a valid Google Play Console URL",
      });
      return;
    }
    
    const config: ConsoleConfig = {
      appId: parsed.appId,
      devId: parsed.devId,
      appUrl: consoleUrlInput.trim(),
    };
    
    const storageKey = validStore === "apple" 
      ? CONSOLE_CONFIG_KEYS.APPLE 
      : CONSOLE_CONFIG_KEYS.GOOGLE;
    
    localStorage.setItem(storageKey, JSON.stringify(config));
    setConsoleConfig(config);
    setShowConsoleConfig(false);
    setConsoleUrlInput("");
    
    addToast({
      type: "success",
      title: "Configuration Saved",
      message: `${validStore === "apple" ? "App Store Connect" : "Play Console"} links are now active!`,
    });
  }, [validStore, consoleUrlInput, addToast]);

  // Handle deep-link from query parameter (e.g., ?step=ASC_EXPORT_COMPLIANCE)
  useEffect(() => {
    if (!flow || !stepFromQuery || deepLinkHandled) return;
    
    // Find the step from query param
    const targetStep = flow.steps.find((s) => s.id === stepFromQuery);
    if (targetStep) {
      setSelectedStepId(targetStep.id);
      setDeepLinkHandled(true);
      
      // Show toast to confirm navigation
      addToast({
        type: "info",
        title: "Navigated to Step",
        message: `${targetStep.sectionPath.join(" → ")}: ${targetStep.title}`,
        duration: 4000,
      });
    }
  }, [flow, stepFromQuery, deepLinkHandled, addToast]);

  // Select first incomplete step on load (if no deep-link)
  useEffect(() => {
    if (flow && flow.steps.length > 0 && !selectedStepId && !stepFromQuery) {
      // Find first incomplete step
      const firstIncomplete = flow.steps.find(
        (s) => !isStepComplete(s.id)
      );
      const firstStep = flow.steps[0];
      if (firstStep) {
        setSelectedStepId(firstIncomplete?.id || firstStep.id);
      }
    }
  }, [flow, isStepComplete, selectedStepId, stepFromQuery]);

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
        {/* Sidebar - Findings Panel + Step list */}
        <aside className="w-72 flex-shrink-0 hidden md:flex md:flex-col border-r border-gray-200 bg-gray-50">
          {/* Configure Console URL Prompt - show if findings exist but console not configured */}
          {scanFindings.length > 0 && !consoleConfig && (
            <div className="flex-shrink-0 border-b border-gray-200 p-3 bg-blue-50">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-lg">🔗</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-900 font-medium">
                    Want direct links to App Store Connect?
                  </p>
                  <p className="text-[10px] text-blue-700 mt-0.5">
                    Configure your app URL to open findings directly in the console.
                  </p>
                  <button
                    onClick={() => setShowConsoleConfig(true)}
                    className="mt-2 text-[10px] font-medium text-blue-700 hover:text-blue-900 underline"
                  >
                    Configure App URL →
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Findings Quick Access Panel */}
          {scanFindings.length > 0 && (
            <div className="flex-shrink-0 border-b border-gray-200">
              <button
                onClick={() => setShowFindingsPanel(!showFindingsPanel)}
                className="w-full px-4 py-3 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <span className="font-medium text-amber-800 text-sm">
                    Your Findings ({scanFindings.length})
                  </span>
                  {consoleConfig && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      🔗 Linked
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-amber-600 transition-transform ${showFindingsPanel ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showFindingsPanel && (
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto bg-white">
                  <p className="text-[10px] text-gray-500 mb-2">
                    {consoleConfig 
                      ? "Click a finding to open App Store Connect →"
                      : "Click a finding to jump to its step →"}
                  </p>
                  {scanFindings.map(({ finding, deepLink }) => {
                    // Get direct console link for this finding's step
                    const findingConsoleLink = deepLink && consoleConfig
                      ? getConsoleLink(deepLink.stepId, validStore as StoreTarget, consoleConfig)
                      : null;
                    
                    return (
                    <button
                      key={finding.id}
                      onClick={() => {
                        // If console is configured, open the direct link first (always)
                        if (findingConsoleLink) {
                          window.open(findingConsoleLink.url, "_blank", "noopener,noreferrer");
                          addToast({
                            type: "success",
                            title: "Opening App Store Connect",
                            message: findingConsoleLink.section,
                            duration: 3000,
                          });
                        }
                        
                        // Also navigate to the step in our wizard if it exists
                        if (deepLink) {
                          const targetStep = flow?.steps.find((s) => s.id === deepLink.stepId);
                          if (targetStep) {
                            setSelectedStepId(targetStep.id);
                          } else if (!findingConsoleLink) {
                            // Only show toast if we didn't open console
                            addToast({
                              type: "warning",
                              title: "Step Not in Current Flow",
                              message: `${deepLink.stepTitle} is not required for your current submission intent`,
                              duration: 3000,
                            });
                          }
                        }
                      }}
                      disabled={!deepLink && !findingConsoleLink}
                      className={`w-full p-2.5 rounded-lg border text-xs text-left transition-all ${
                        finding.risk === "high"
                          ? "border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300"
                          : finding.risk === "medium"
                          ? "border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                      } ${deepLink ? "cursor-pointer" : "cursor-default opacity-60"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {finding.id.replace(/^(APPLE_|GOOGLE_)/, "").replace(/_/g, " ")}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              finding.risk === "high"
                                ? "bg-red-200 text-red-800"
                                : finding.risk === "medium"
                                ? "bg-amber-200 text-amber-800"
                                : "bg-gray-200 text-gray-700"
                            }`}>
                              {finding.risk.toUpperCase()}
                            </span>
                            {finding.isBlocking && (
                              <span className="text-red-600 text-[10px] font-medium">• Blocking</span>
                            )}
                          </div>
                        </div>
                        
                        {deepLink && (
                          <div className="flex-shrink-0 flex items-center gap-1">
                            {findingConsoleLink ? (
                              <span className="text-blue-600 text-[10px] font-medium flex items-center gap-1">
                                Open
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </span>
                            ) : (
                              <span className="text-brand text-[10px] font-medium flex items-center gap-1">
                                <span className="hidden sm:inline">Go</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {deepLink && (
                        <div className="mt-1.5 text-[10px] text-gray-500 flex items-center gap-1">
                          <span>→</span>
                          <span className="font-medium text-gray-700">
                            {findingConsoleLink ? findingConsoleLink.section : deepLink.stepTitle}
                          </span>
                        </div>
                      )}
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Step List */}
          <div className="flex-1 overflow-hidden">
            <StepList
              steps={flow.steps}
              selectedStepId={selectedStepId}
              completedStepIds={completedStepIds}
              onSelectStep={setSelectedStepId}
            />
          </div>
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
              consoleLink={currentConsoleLink}
              onConfigureConsole={() => setShowConsoleConfig(true)}
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

      {/* Console Configuration Modal */}
      {showConsoleConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {validStore === "apple" ? (
                  <span className="text-xl">🍎</span>
                ) : (
                  <span className="text-xl">▶️</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Configure {validStore === "apple" ? "App Store Connect" : "Play Console"} Link
                </h3>
                <p className="text-sm text-gray-500">
                  Paste your app&apos;s console URL to enable direct links
                </p>
              </div>
            </div>
            
            {/* Privacy & Trust Notice */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <span className="text-blue-600 flex-shrink-0">🔒</span>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Why we need this</p>
                  <p className="text-blue-700">
                    We use your app URL solely to generate direct links to the relevant pages in {validStore === "apple" ? "App Store Connect" : "Google Play Console"}. 
                    <strong className="font-semibold"> StorePreflight will never take any actions on your behalf</strong> — this is purely for guidance to help you navigate to the right place.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {validStore === "apple" ? "App Store Connect" : "Google Play Console"} App URL
              </label>
              <input
                type="url"
                value={consoleUrlInput}
                onChange={(e) => setConsoleUrlInput(e.target.value)}
                placeholder={validStore === "apple" 
                  ? "https://appstoreconnect.apple.com/apps/1234567890/..." 
                  : "https://play.google.com/console/u/0/developers/.../app/..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                {validStore === "apple" 
                  ? "Go to App Store Connect, open your app, and copy the URL from your browser's address bar."
                  : "Go to Google Play Console, open your app, and copy the URL from your browser's address bar."}
              </p>
            </div>

            {consoleConfig && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Currently configured: App ID <code className="font-mono bg-green-100 px-1 rounded">{consoleConfig.appId}</code>
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConsoleConfig(false);
                  setConsoleUrlInput("");
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConsoleConfig}
                disabled={!consoleUrlInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
