"use client";

import { useState, useEffect } from "react";
import { InfoModal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import type { RuleEvaluationResult, GateFinding } from "@/lib/browser-scanner";
import type { ValidatedAsset } from "@/lib/browser-scanner/asset-validator";
import { generateSubmissionPack, type StoredAssets } from "@/lib/submission-pack";

interface StoredScanResult {
  result: RuleEvaluationResult;
  timestamp: string;
}

export default function ExportPage() {
  const [scanResult, setScanResult] = useState<StoredScanResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"html" | "json" | "zip">("html");
  const { addToast } = useToast();

  useEffect(() => {
    // Try to load scan result from localStorage
    const stored = localStorage.getItem("storepreflight_scan_result");
    if (stored) {
      try {
        setScanResult(JSON.parse(stored));
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  const generateHtmlReport = (result: RuleEvaluationResult): string => {
    const now = new Date().toISOString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StorePreflight Report - ${result.appName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #1a1a1a; line-height: 1.5; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .header { background: linear-gradient(135deg, #2E7D32, #4CAF50); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
    .header h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; }
    .meta { display: flex; gap: 2rem; margin-top: 1rem; font-size: 0.875rem; }
    .card { background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card h2 { font-size: 1.125rem; margin-bottom: 1rem; color: #333; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .summary-item { text-align: center; padding: 1rem; border-radius: 8px; }
    .summary-item.high { background: #fee2e2; color: #991b1b; }
    .summary-item.medium { background: #fef3c7; color: #92400e; }
    .summary-item.low { background: #dcfce7; color: #166534; }
    .summary-item .count { font-size: 2rem; font-weight: bold; }
    .finding { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
    .finding.blocking { border-color: #fca5a5; background: #fef2f2; }
    .finding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .finding-id { font-weight: 600; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .badge.high { background: #fee2e2; color: #991b1b; }
    .badge.medium { background: #fef3c7; color: #92400e; }
    .badge.low { background: #dcfce7; color: #166534; }
    .badge.apple { background: #1a1a1a; color: white; }
    .badge.google { background: #dbeafe; color: #1e40af; }
    .badge.both { background: #f3e8ff; color: #6b21a8; }
    .copy-section { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem; margin-top: 0.75rem; }
    .copy-section h4 { font-size: 0.875rem; color: #166534; margin-bottom: 0.5rem; }
    .copy-section p { font-size: 0.875rem; white-space: pre-wrap; }
    .footer { text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; }
    .status { padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; display: inline-block; margin-top: 1rem; }
    .status.blocked { background: #fee2e2; color: #991b1b; }
    .status.ready { background: #dcfce7; color: #166534; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 StorePreflight Report</h1>
      <p>${result.appName} (${result.bundleId})</p>
      <div class="meta">
        <span>Generated: ${new Date(now).toLocaleString()}</span>
        <span>Platforms: iOS & Android</span>
      </div>
      <div class="status ${result.summary.blocked ? 'blocked' : 'ready'}">
        ${result.summary.blocked ? '⚠️ BLOCKING ISSUES FOUND' : '✅ READY FOR SUBMISSION'}
      </div>
    </div>

    <div class="card">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item high">
          <div class="count">${result.summary.high}</div>
          <div>High Risk</div>
        </div>
        <div class="summary-item medium">
          <div class="count">${result.summary.medium}</div>
          <div>Medium Risk</div>
        </div>
        <div class="summary-item low">
          <div class="count">${result.summary.low}</div>
          <div>Low Risk</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Findings (${result.findings.length})</h2>
      ${result.findings.map(f => `
        <div class="finding ${f.isBlocking ? 'blocking' : ''}">
          <div class="finding-header">
            <span class="finding-id">${f.id}</span>
            <div>
              <span class="badge ${f.platform}">${f.platform.toUpperCase()}</span>
              <span class="badge ${f.risk}">${f.risk.toUpperCase()}${f.isBlocking ? ' (BLOCKING)' : ''}</span>
            </div>
          </div>
          ${f.triggers.length > 0 ? `<p style="color:#6b7280;font-size:0.875rem;">Triggers: ${f.triggers.join(', ')}</p>` : ''}
          ${Object.entries(f.copy).length > 0 ? `
            ${Object.entries(f.copy).map(([key, value]) => `
              <div class="copy-section">
                <h4>📋 ${key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</h4>
                <p>${value}</p>
              </div>
            `).join('')}
          ` : ''}
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>Generated by <strong>StorePreflight</strong></p>
      <p>Know what Apple and Google will ask before you submit.</p>
    </div>
  </div>
</body>
</html>`;
  };

  const generateJsonReport = (result: RuleEvaluationResult): string => {
    return JSON.stringify({
      generatedAt: new Date().toISOString(),
      generator: "StorePreflight",
      version: "1.0.0",
      app: {
        name: result.appName,
        bundleId: result.bundleId,
        platforms: result.platformTargets,
      },
      summary: result.summary,
      findings: result.findings,
    }, null, 2);
  };

  const handleExport = async () => {
    if (!scanResult) return;

    setIsGenerating(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === "html") {
        content = generateHtmlReport(scanResult.result);
        filename = `storepreflight-${scanResult.result.appName.toLowerCase().replace(/\s+/g, "-")}-report.html`;
        mimeType = "text/html";
      } else if (exportFormat === "json") {
        content = generateJsonReport(scanResult.result);
        filename = `storepreflight-${scanResult.result.appName.toLowerCase().replace(/\s+/g, "-")}-report.json`;
        mimeType = "application/json";
      } else {
        // ZIP format - generate full submission pack
        const storedAssets = localStorage.getItem("storepreflight_assets");
        let assets: StoredAssets | undefined;
        if (storedAssets) {
          try {
            assets = JSON.parse(storedAssets);
          } catch {
            // Invalid data, ignore
          }
        }

        const pack = await generateSubmissionPack({
          result: scanResult.result,
          assets,
        });

        // Download the ZIP
        const url = URL.createObjectURL(pack.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = pack.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addToast({
          type: "success",
          title: "Submission Pack downloaded",
          message: `${pack.filename} includes report, checklists, and assets`,
        });
        return;
      }

      // Create and download file (HTML/JSON)
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast({
        type: "success",
        title: "Report downloaded",
        message: `${filename} saved to your downloads`,
      });
    } catch (err) {
      console.error("Export error:", err);
      addToast({
        type: "error",
        title: "Export failed",
        message: "Could not generate report",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const findings = scanResult?.result.findings || [];
  const highFindings = findings.filter((f) => f.risk === "high");
  const mediumFindings = findings.filter((f) => f.risk === "medium");
  const lowFindings = findings.filter((f) => f.risk === "low");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Export</h1>
      <p className="text-gray-600 mb-8">
        Generate reports and submission packs for App Store Connect and Google Play Console.
      </p>

      {/* No Scan Result */}
      {!scanResult && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Scan Results
          </h2>
          <p className="text-gray-500 mb-6">
            Scan a project first to generate export reports.
          </p>
          <a href="/scan" className="btn-primary inline-block">
            Go to Scanner
          </a>
        </div>
      )}

      {/* Scan Result Available */}
      {scanResult && (
        <div className="space-y-6">
          {/* Scan Summary Card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {scanResult.result.appName}
                </h2>
                <p className="text-sm text-gray-500">{scanResult.result.bundleId}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Scanned {new Date(scanResult.timestamp).toLocaleString()}
                </p>
              </div>
              <div
                className={`badge text-sm ${
                  scanResult.result.summary.blocked
                    ? "badge-high"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {scanResult.result.summary.blocked ? "⚠️ BLOCKING" : "✅ READY"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{scanResult.result.summary.high}</div>
                <div className="text-sm text-gray-500">High Risk</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-2xl font-bold text-amber-600">{scanResult.result.summary.medium}</div>
                <div className="text-sm text-gray-500">Medium Risk</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{scanResult.result.summary.low}</div>
                <div className="text-sm text-gray-500">Low Risk</div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Export Format
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <ExportOption
                id="html"
                title="HTML Report"
                description="Shareable web report with all findings and copy-paste text"
                icon="📄"
                selected={exportFormat === "html"}
                onSelect={() => setExportFormat("html")}
              />
              <ExportOption
                id="json"
                title="JSON Data"
                description="Machine-readable format for CI/CD integration"
                icon="📦"
                selected={exportFormat === "json"}
                onSelect={() => setExportFormat("json")}
              />
              <ExportOption
                id="zip"
                title="Submission Pack"
                description="ZIP with report, assets, and reviewer notes"
                icon="📁"
                selected={exportFormat === "zip"}
                onSelect={() => setExportFormat("zip")}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleExport}
                disabled={isGenerating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Generating...
                  </span>
                ) : (
                  `Download ${exportFormat.toUpperCase()}`
                )}
              </button>
            </div>
          </div>

          {/* Quick Copy Section */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Copy
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Copy pre-written text directly to paste into App Store Connect or Google Play Console.
            </p>

            <div className="space-y-3">
              {findings.filter(f => Object.keys(f.copy).length > 0).slice(0, 5).map((finding) => (
                <QuickCopyItem key={finding.id} finding={finding} />
              ))}
              {findings.filter(f => Object.keys(f.copy).length > 0).length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No copy-paste text available for current findings.
                </p>
              )}
            </div>
          </div>

          {/* Clear & Rescan */}
          <div className="text-center">
            <button
              onClick={() => {
                localStorage.removeItem("storepreflight_scan_result");
                setScanResult(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear scan results and start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportOption({
  id,
  title,
  description,
  icon,
  selected,
  onSelect,
  disabled,
  badge,
}: {
  id: string;
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`relative p-4 rounded-lg border-2 text-left transition-all ${
        selected
          ? "border-brand bg-green-50"
          : disabled
          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
          {badge}
        </span>
      )}
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-medium text-gray-900">{title}</div>
      <div className="text-sm text-gray-500">{description}</div>
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-brand rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

function QuickCopyItem({ finding }: { finding: GateFinding }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{finding.id}</span>
          <span className={`badge ${finding.platform === "google" ? "badge-google" : finding.platform === "apple" ? "badge-apple" : "bg-purple-100 text-purple-800"}`}>
            {finding.platform.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(finding.copy).map(([key, value]) => (
          <div key={key} className="flex items-start justify-between gap-2 bg-gray-50 rounded p-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500 mb-1">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
              </div>
              <div className="text-sm text-gray-700 truncate">{value}</div>
            </div>
            <button
              onClick={() => handleCopy(key, value)}
              className="text-xs text-brand hover:text-brand-dark font-medium px-2 py-1 bg-white rounded border border-gray-200 hover:border-brand transition-colors flex-shrink-0"
            >
              {copied === key ? "✓ Copied" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
