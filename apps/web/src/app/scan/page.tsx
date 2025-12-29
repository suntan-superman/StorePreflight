"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  isFileSystemAccessSupported,
  selectProjectFolder,
  readProjectFiles,
  scanProject,
  evaluateRules,
  type RuleEvaluationResult,
  type GateFinding,
} from "@/lib/browser-scanner";
import { InfoModal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { EmailSubscribe } from "@/components/EmailSubscribe";
import {
  generateCopyFromFindings,
  createGuidedSession,
  saveGuidedSession,
  mapToGuidedInput,
  getSelectedIntent,
} from "@/lib/guided-integration";
import { buildGuidedFlow } from "@storepreflight/guided";
import type { StoreTarget } from "@storepreflight/guided";

type ScanStatus = "idle" | "selecting" | "scanning" | "complete" | "error";

export default function ScanPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<RuleEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<GateFinding | null>(null);
  const [fileCount, setFileCount] = useState<number>(0);
  const [showPreScanModal, setShowPreScanModal] = useState(false);
  const { addToast } = useToast();

  const handleStartGuided = (store: StoreTarget) => {
    if (!result) return;

    try {
      // Get the selected intent (defaults to production)
      const intent = getSelectedIntent();
      
      // Generate copy and create session
      const generatedCopy = generateCopyFromFindings(store, result);
      const session = createGuidedSession(store, intent, result, generatedCopy);
      saveGuidedSession(session);

      // Navigate to guided page
      router.push(`/guided/${store}`);
    } catch (err) {
      console.error("Failed to start guided submission:", err);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to start guided submission. Please try again.",
      });
    }
  };

  const handleSelectFolder = async () => {
    setStatus("selecting");
    setError(null);
    setResult(null);

    try {
      // Check browser support
      if (!isFileSystemAccessSupported()) {
        throw new Error(
          "Your browser doesn't support folder selection. Please use Chrome, Edge, or another Chromium-based browser."
        );
      }

      // Select folder
      const folderHandle = await selectProjectFolder();
      
      setStatus("scanning");

      // Read project files
      const files = await readProjectFiles(folderHandle);
      setFileCount(files.size);

      if (files.size === 0) {
        throw new Error(
          "No project files found. Make sure you selected an Expo/React Native project folder."
        );
      }

      // Run scanner
      const scanResult = scanProject(files);

      // Evaluate rules
      const evaluation = evaluateRules(scanResult);

      // Save to localStorage for export page
      const timestamp = new Date().toISOString();
      localStorage.setItem("storepreflight_scan_result", JSON.stringify({
        result: evaluation,
        timestamp,
      }));

      // Save to history
      const historyKey = "storepreflight_scan_history";
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
      const newEntry = {
        id: `scan-${Date.now()}`,
        result: evaluation,
        timestamp,
      };
      // Add to front, limit to 10 entries
      const updatedHistory = [newEntry, ...existingHistory].slice(0, 10);
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

      setResult(evaluation);
      setStatus("complete");
      
      // Show success toast
      addToast({
        type: evaluation.summary.blocked ? "warning" : "success",
        title: "Scan Complete",
        message: evaluation.summary.blocked 
          ? `Found ${evaluation.summary.high} high-risk issues` 
          : "Your app is store-ready!",
        duration: 5000,
      });
    } catch (err) {
      console.error("Scan error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
      addToast({
        type: "error",
        title: "Scan Failed",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <div className="max-w-6xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Scan Project</h1>
      <p className="mb-4 text-gray-600">
        Select your Expo or React Native project folder to scan for store requirements.
      </p>
      
      {/* First Run Trust Message */}
      <div className="flex items-center gap-2 px-4 py-2 mb-8 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
        <span>{"\uD83D\uDD12"}</span>
        <span>StorePreflight runs locally. No login required. Your code never leaves your machine.</span>
      </div>

      {/* Browser Support Warning */}
      {typeof window !== "undefined" && !isFileSystemAccessSupported() && (
        <div className="p-4 mb-8 border rounded-lg bg-amber-50 border-amber-200">
          <p className="text-amber-800">
            <strong>Browser not supported:</strong> Folder selection requires Chrome, Edge, or another Chromium-based browser.
          </p>
        </div>
      )}

      {/* Folder Selection */}
      <div className="mb-8 card">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="mb-1 text-lg font-semibold text-gray-900">
              Project Folder
            </h2>
            <p className="text-sm text-gray-500">
              Your files are scanned locally in your browser. Nothing is uploaded.
            </p>
          </div>
          <button
            onClick={() => setShowPreScanModal(true)}
            disabled={status === "selecting" || status === "scanning"}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === "selecting"
              ? "Selecting..."
              : status === "scanning"
              ? "Scanning..."
              : "Select Folder"}
          </button>
        </div>

        {error && (
          <div className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Pre-Scan Info Modal */}
      <InfoModal
        isOpen={showPreScanModal}
        onClose={() => setShowPreScanModal(false)}
        onContinue={handleSelectFolder}
        title="Select Your Project"
        continueText="Choose Folder"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-green-100 rounded-full">
              <span className="text-xl">{"\uD83D\uDD12"}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">100% Private & Secure</h3>
              <p className="text-sm text-gray-500">
                All scanning happens locally in your browser. Your code never leaves your computer.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full">
              <span className="text-xl">📁</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Grant Read Access</h3>
              <p className="text-sm text-gray-500">
                Your browser will ask permission to read your project folder. We only need read access to scan your source files.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">What We Scan</h3>
              <p className="text-sm text-gray-500">
                app.json, app.config.js, package.json, and source files in src/, app/, components/, screens/, lib/, hooks/ folders.
              </p>
            </div>
          </div>

          <div className="p-3 mt-4 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">
              <strong>Tip:</strong> Select your project&apos;s root folder — the one containing your app.json or app.config.js file.
            </p>
          </div>
        </div>
      </InfoModal>

      {/* Scanning Status */}
      {status === "scanning" && (
        <div className="py-12 text-center card">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full animate-spin border-brand border-t-transparent"></div>
          <p className="text-gray-600">Scanning your project...</p>
          {fileCount > 0 && (
            <p className="mt-2 text-sm text-gray-400">Found {fileCount} files</p>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {result.appName}
                </h2>
                <p className="text-sm text-gray-500">{result.bundleId}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Scanned {fileCount} files
                </p>
              </div>
              <div
                className={`badge text-sm ${
                  result.summary.blocked
                    ? "badge-high"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {result.summary.blocked ? "⚠️ BLOCKING ISSUES" : "✅ READY"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <SummaryCard
                count={result.summary.high}
                label="High Risk"
                color="red"
              />
              <SummaryCard
                count={result.summary.medium}
                label="Medium Risk"
                color="amber"
              />
              <SummaryCard
                count={result.summary.low}
                label="Low Risk"
                color="green"
              />
            </div>
          </div>

          {/* Guided Submission CTA */}
          <div className="card bg-gradient-to-r from-brand/5 to-blue-50 border-brand/20">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              🚀 Ready to Submit?
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Start a guided submission flow with step-by-step instructions and copy-paste text for your store listing.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleStartGuided("google")}
                className="flex items-center gap-2 px-4 py-2 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand"
              >
                <span className="text-lg">🤖</span>
                <span className="font-medium text-gray-700">Google Play</span>
              </button>
              <button
                onClick={() => handleStartGuided("apple")}
                className="flex items-center gap-2 px-4 py-2 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand"
              >
                <span className="text-lg">🍎</span>
                <span className="font-medium text-gray-700">App Store</span>
              </button>
            </div>
          </div>

          {/* Detected Capabilities */}
          {result.findings.length > 0 && (
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Detected Capabilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(result.findings.flatMap((f) => f.triggers))
                ).map((cap) => (
                  <span
                    key={cap}
                    className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full"
                  >
                    {cap.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Findings List */}
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Findings ({result.findings.length})
            </h3>

            {result.findings.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No findings — your app is ready for submission!
              </p>
            ) : (
              <div className="space-y-3">
                {result.findings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onClick={() => setSelectedFinding(finding)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Email Subscription - shown after scan completes */}
          <EmailSubscribe
            trigger="scan-complete"
            message="Want to be notified when App Store or Google Play requirements change? We'll let you know if it affects your app."
          />
        </div>
      )}

      {/* Finding Detail Modal */}
      {selectedFinding && (
        <FindingModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </div>
  );
}

function SummaryCard({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    red: "text-red-600 border-red-200",
    amber: "text-amber-600 border-amber-200",
    green: "text-green-600 border-green-200",
  };

  return (
    <div className={`text-center p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className={`text-3xl font-bold ${colorClasses[color]?.split(" ")[0]}`}>
        {count}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function FindingCard({
  finding,
  onClick,
}: {
  finding: GateFinding;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        finding.isBlocking
          ? "border-red-200 bg-red-50 hover:bg-red-100"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{finding.id}</span>
          <span
            className={`badge ${
              finding.platform === "google" ? "badge-google" : "badge-apple"
            }`}
          >
            {finding.platform.toUpperCase()}
          </span>
        </div>
        <span className={`badge badge-${finding.risk}`}>
          {finding.risk.toUpperCase()}
          {finding.isBlocking && " (BLOCKING)"}
        </span>
      </div>
      {finding.triggers.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Triggers: {finding.triggers.join(", ")}
        </p>
      )}
    </button>
  );
}

function FindingModal({
  finding,
  onClose,
}: {
  finding: GateFinding;
  onClose: () => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{finding.id}</h2>
            <button
              onClick={onClose}
              className="text-2xl leading-none text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <span
              className={`badge ${
                finding.platform === "google" ? "badge-google" : "badge-apple"
              }`}
            >
              {finding.platform.toUpperCase()}
            </span>
            <span className={`badge badge-${finding.risk}`}>
              {finding.risk.toUpperCase()}
            </span>
            {finding.isBlocking && (
              <span className="badge badge-high">BLOCKING</span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Required Artifacts */}
          {(finding.requires.video ||
            finding.requires.screenshots ||
            finding.requires.reviewerNotes) && (
            <div>
              <h3 className="mb-2 font-medium text-gray-900">
                Required Artifacts
              </h3>
              <ul className="space-y-1 text-sm">
                {finding.requires.video && (
                  <li className="flex items-center gap-2 text-red-700">
                    <span>📹</span> YouTube demonstration video required
                  </li>
                )}
                {finding.requires.screenshots && (
                  <li className="flex items-center gap-2">
                    <span>📸</span> Screenshots required
                  </li>
                )}
                {finding.requires.reviewerNotes && (
                  <li className="flex items-center gap-2">
                    <span>📝</span> Reviewer notes required
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Copy-Paste Text */}
          {Object.keys(finding.copy).length > 0 && (
            <div>
              <h3 className="mb-2 font-medium text-gray-900">
                Copy-Paste Text
              </h3>
              <div className="space-y-3">
                {Object.entries(finding.copy).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-4 border border-green-200 rounded-lg bg-green-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <button
                        onClick={() => copyToClipboard(key, value)}
                        className="text-xs font-medium text-brand hover:text-brand-dark"
                      >
                        {copiedKey === key ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {finding.evidence.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Evidence</h3>
              <div className="space-y-2">
                {finding.evidence.map((ev, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-gray-50">
                    <code className="text-sm font-medium text-gray-700">
                      {ev.file}:{ev.lines[0]}
                    </code>
                    <pre className="mt-2 overflow-x-auto text-xs text-gray-600 whitespace-pre-wrap">
                      {ev.snippet}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
