"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import type { RuleEvaluationResult, GateFinding } from "@/lib/browser-scanner";

interface ScanHistoryEntry {
  id: string;
  result: RuleEvaluationResult;
  timestamp: string;
}

interface ProjectSummary {
  bundleId: string;
  appName: string;
  scans: ScanHistoryEntry[];
  lastScan: ScanHistoryEntry;
  bestStatus: "ready" | "issues";
}

const STORAGE_KEY = "storepreflight_scan_history";

export default function DashboardPage() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ScanHistoryEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"projects" | "history">("projects");
  const { addToast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  // Group scans by project (bundle ID)
  const projects = useMemo<ProjectSummary[]>(() => {
    const projectMap = new Map<string, ScanHistoryEntry[]>();
    
    for (const entry of history) {
      const key = entry.result.bundleId;
      if (!projectMap.has(key)) {
        projectMap.set(key, []);
      }
      projectMap.get(key)!.push(entry);
    }

    return Array.from(projectMap.entries())
      .map(([bundleId, scans]) => {
        scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const lastScan = scans[0];
        if (!lastScan) return null;
        const bestStatus = scans.some((s) => !s.result.summary.blocked) ? "ready" : "issues";
        
        return {
          bundleId,
          appName: lastScan.result.appName,
          scans,
          lastScan,
          bestStatus: bestStatus as "ready" | "issues",
        };
      })
      .filter((p): p is ProjectSummary => p !== null)
      .sort((a, b) => new Date(b.lastScan.timestamp).getTime() - new Date(a.lastScan.timestamp).getTime());
  }, [history]);

  const loadHistory = () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowDeleteConfirm(null);
    addToast({ type: "success", title: "Scan deleted", message: "Removed from history." });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("storepreflight_scan_result");
    setShowDeleteConfirm(null);
    addToast({ type: "success", title: "History cleared", message: "All scans removed." });
  };

  const exportScan = (entry: ScanHistoryEntry) => {
    localStorage.setItem("storepreflight_scan_result", JSON.stringify({
      result: entry.result,
      timestamp: entry.timestamp,
    }));
    addToast({
      type: "success",
      title: "Ready to export",
      message: `${entry.result.appName} loaded. Go to Export page.`,
      duration: 5000,
    });
  };

  // Summary stats
  const totalScans = history.length;
  const appsScanned = projects.length;
  const readyApps = projects.filter((p) => p.bestStatus === "ready").length;
  const lastScanDate = history[0]?.timestamp
    ? new Date(history[0].timestamp).toLocaleDateString()
    : "—";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track store readiness across all your apps</p>
        </div>
        <a href="/scan" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Scan
        </a>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card text-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-5">
              <span className="text-2xl">📱</span>
              <div className="text-3xl font-bold text-brand mt-2">{appsScanned}</div>
              <div className="text-sm text-gray-500">Projects</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-5">
              <span className="text-2xl">🔍</span>
              <div className="text-3xl font-bold text-blue-600 mt-2">{totalScans}</div>
              <div className="text-sm text-gray-500">Total Scans</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-5">
              <span className="text-2xl">✅</span>
              <div className="text-3xl font-bold text-emerald-600 mt-2">{readyApps}</div>
              <div className="text-sm text-gray-500">Store Ready</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <span className="text-2xl">📅</span>
              <div className="text-xl font-bold text-gray-600 mt-2">{lastScanDate}</div>
              <div className="text-sm text-gray-500">Last Scan</div>
            </div>
          </div>

          {/* Empty State */}
          {history.length === 0 && (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📊</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Scan your first Expo or React Native project to see store readiness analysis.
              </p>
              <a href="/scan" className="btn-primary inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Start Your First Scan
              </a>
            </div>
          )}

          {/* Tabs & Content */}
          {history.length > 0 && (
            <>
              {/* Tab Switcher */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "projects"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Projects ({projects.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "history"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All Scans ({history.length})
                  </button>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm("all")}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Projects View */}
              {activeTab === "projects" && (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.bundleId}
                      project={project}
                      onViewScan={(entry) => setSelectedEntry(entry)}
                      onExportScan={exportScan}
                    />
                  ))}
                </div>
              )}

              {/* History View */}
              {activeTab === "history" && (
                <div className="card">
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <HistoryCard
                        key={entry.id}
                        entry={entry}
                        onView={() => setSelectedEntry(entry)}
                        onExport={() => exportScan(entry)}
                        onDelete={() => setShowDeleteConfirm(entry.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onExport={() => {
            exportScan(selectedEntry);
            setSelectedEntry(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          isAll={showDeleteConfirm === "all"}
          onConfirm={() =>
            showDeleteConfirm === "all"
              ? clearHistory()
              : deleteEntry(showDeleteConfirm)
          }
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// Project Card with expandable scan history
function ProjectCard({
  project,
  onViewScan,
  onExportScan,
}: {
  project: ProjectSummary;
  onViewScan: (entry: ScanHistoryEntry) => void;
  onExportScan: (entry: ScanHistoryEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { lastScan, scans, bestStatus } = project;
  const { summary } = lastScan.result;

  return (
    <div className="card overflow-hidden">
      {/* Project Header */}
      <div
        className="flex items-start justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
            bestStatus === "ready" ? "bg-green-100" : "bg-amber-100"
          }`}>
            <span className="text-2xl">{bestStatus === "ready" ? "✅" : "⚠️"}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-lg truncate">
                {project.appName}
              </h3>
              <span
                className={`badge text-xs ${
                  bestStatus === "ready"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {bestStatus === "ready" ? "Store Ready" : "Has Issues"}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{project.bundleId}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{scans.length} scan{scans.length !== 1 ? "s" : ""}</span>
              <span>Last: {new Date(lastScan.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{summary.high}</div>
              <div className="text-xs text-gray-400">High</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">{summary.medium}</div>
              <div className="text-xs text-gray-400">Med</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{summary.low}</div>
              <div className="text-xs text-gray-400">Low</div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg
              className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Scan History */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Scan History</h4>
          <div className="space-y-2">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      scan.result.summary.blocked ? "bg-amber-500" : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {new Date(scan.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {scan.result.summary.high}H / {scan.result.summary.medium}M / {scan.result.summary.low}L
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewScan(scan); }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-white transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onExportScan(scan); }}
                    className="text-xs text-brand hover:text-brand-dark px-2 py-1 rounded hover:bg-white transition-colors"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryCard({
  entry,
  onView,
  onExport,
  onDelete,
}: {
  entry: ScanHistoryEntry;
  onView: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const { result, timestamp } = entry;
  const date = new Date(timestamp);

  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50/50 transition-all group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            result.summary.blocked ? "bg-amber-100" : "bg-green-100"
          }`}
        >
          <span>{result.summary.blocked ? "⚠️" : "✅"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{result.appName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="mx-2">•</span>
            {result.summary.high}H / {result.summary.medium}M / {result.summary.low}L
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onView}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="View Details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button
          onClick={onExport}
          className="p-2 text-gray-400 hover:text-brand hover:bg-green-50 rounded-lg transition-colors"
          title="Export Report"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function EntryDetailModal({
  entry,
  onClose,
  onExport,
}: {
  entry: ScanHistoryEntry;
  onClose: () => void;
  onExport: () => void;
}) {
  const { result, timestamp } = entry;
  const [selectedFinding, setSelectedFinding] = useState<GateFinding | null>(null);

  return (
    <Modal isOpen={true} onClose={onClose} title={result.appName} size="lg">
      <div className="space-y-4">
        {/* Header Info */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-500">{result.bundleId}</p>
            <p className="text-xs text-gray-400">
              Scanned {new Date(timestamp).toLocaleString()}
            </p>
          </div>
          <span
            className={`badge ${
              result.summary.blocked
                ? "badge-high"
                : "bg-green-100 text-green-800"
            }`}
          >
            {result.summary.blocked ? "⚠️ Blocking Issues" : "✅ Ready"}
          </span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">{result.summary.high}</div>
            <div className="text-xs text-gray-500">High</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-xl font-bold text-amber-600">{result.summary.medium}</div>
            <div className="text-xs text-gray-500">Medium</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{result.summary.low}</div>
            <div className="text-xs text-gray-500">Low</div>
          </div>
        </div>

        {/* Findings List */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">
            Findings ({result.findings.length})
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {result.findings.map((finding) => (
              <button
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  finding.isBlocking
                    ? "border-red-200 bg-red-50 hover:bg-red-100"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{finding.id}</span>
                  <div className="flex gap-1">
                    <span className={`badge text-xs ${finding.platform === "google" ? "badge-google" : finding.platform === "apple" ? "badge-apple" : "bg-purple-100 text-purple-800"}`}>
                      {finding.platform.toUpperCase()}
                    </span>
                    <span className={`badge text-xs badge-${finding.risk}`}>
                      {finding.risk.toUpperCase()}
                    </span>
                  </div>
                </div>
                {finding.triggers.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {finding.triggers.join(", ")}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button onClick={onExport} className="btn-primary">
            Export Report
          </button>
        </div>
      </div>

      {/* Nested Finding Detail Modal */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </Modal>
  );
}

function FindingDetailModal({
  finding,
  onClose,
}: {
  finding: GateFinding;
  onClose: () => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { addToast } = useToast();

  const copyToClipboard = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast({ type: "success", title: "Copied!", duration: 2000 });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{finding.id}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <span className={`badge ${finding.platform === "google" ? "badge-google" : finding.platform === "apple" ? "badge-apple" : "bg-purple-100 text-purple-800"}`}>
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

        <div className="p-6 space-y-5">
          {/* Required Artifacts */}
          {(finding.requires.video || finding.requires.screenshots || finding.requires.reviewerNotes) && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Artifacts</h4>
              <ul className="space-y-1.5 text-sm">
                {finding.requires.video && (
                  <li className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded">
                    <span>📹</span> YouTube demonstration video required
                  </li>
                )}
                {finding.requires.screenshots && (
                  <li className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded">
                    <span>📸</span> Screenshots required
                  </li>
                )}
                {finding.requires.reviewerNotes && (
                  <li className="flex items-center gap-2 text-blue-700 bg-blue-50 p-2 rounded">
                    <span>📝</span> Reviewer notes required
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Copy-Paste Text */}
          {Object.keys(finding.copy).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Copy-Paste Text</h4>
              <div className="space-y-3">
                {Object.entries(finding.copy).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-green-50 border border-green-200 rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-2 bg-green-100/50 border-b border-green-200">
                      <span className="text-sm font-medium text-green-800">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (s) => s.toUpperCase())}
                      </span>
                      <button
                        onClick={() => copyToClipboard(key, value)}
                        className="text-xs bg-white text-green-700 hover:bg-green-50 font-medium px-3 py-1 rounded border border-green-300 transition-colors"
                      >
                        {copiedKey === key ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="p-4 text-sm text-gray-700 whitespace-pre-wrap">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No copy text message */}
          {Object.keys(finding.copy).length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p>No pre-written copy available for this finding.</p>
              <p className="text-sm mt-1">Refer to the platform guidelines for details.</p>
            </div>
          )}

          {/* Evidence */}
          {finding.evidence.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Evidence Found</h4>
              <div className="space-y-2">
                {finding.evidence.slice(0, 3).map((ev, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <code className="text-gray-700 font-medium">
                      {ev.file}:{ev.lines[0]}
                    </code>
                    <pre className="mt-2 text-xs text-gray-500 overflow-x-auto">
                      {ev.snippet}
                    </pre>
                  </div>
                ))}
                {finding.evidence.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{finding.evidence.length - 3} more locations
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  isAll,
  onConfirm,
  onCancel,
}: {
  isAll: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl animate-slideUp">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isAll ? "Clear All History?" : "Delete This Scan?"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {isAll
              ? "This will permanently delete all your scan history. This action cannot be undone."
              : "This scan result will be permanently removed from your history."}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              {isAll ? "Clear All" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
