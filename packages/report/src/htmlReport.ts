/**
 * HTML Report Generator
 * Creates a styled HTML report from rule evaluation results
 */

import type { RuleEvaluationResult, GateFinding } from "@storepreflight/shared";

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Get badge HTML for risk level
 */
function getRiskBadge(risk: string, isBlocking: boolean): string {
  const colors: Record<string, string> = {
    high: isBlocking ? "#dc2626" : "#ea580c",
    medium: "#f59e0b",
    low: "#22c55e",
  };
  const color = colors[risk] ?? "#6b7280";
  const label = isBlocking ? `${risk.toUpperCase()} (BLOCKING)` : risk.toUpperCase();
  
  return `<span style="
    background: ${color};
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  ">${label}</span>`;
}

/**
 * Generate finding HTML section
 */
function generateFindingHtml(finding: GateFinding): string {
  const evidenceHtml = finding.evidence.length > 0
    ? `
      <div style="margin-top: 12px;">
        <strong>Evidence:</strong>
        <ul style="margin: 8px 0; padding-left: 20px;">
          ${finding.evidence.map((e) => `
            <li style="margin: 4px 0;">
              <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${escapeHtml(e.file)}:${e.lines[0]}</code>
              <br>
              <pre style="background: #f8fafc; padding: 8px; margin: 4px 0; border-radius: 4px; overflow-x: auto; font-size: 12px;">${escapeHtml(e.snippet)}</pre>
            </li>
          `).join("")}
        </ul>
      </div>
    `
    : "";

  const copyHtml = Object.entries(finding.copy).length > 0
    ? `
      <div style="margin-top: 12px;">
        <strong>Copy-Paste Text:</strong>
        ${Object.entries(finding.copy).map(([key, value]) => `
          <div style="margin: 8px 0;">
            <div style="font-weight: 500; color: #374151; margin-bottom: 4px;">${escapeHtml(key)}:</div>
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 4px; padding: 12px;">
              <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">${escapeHtml(String(value))}</pre>
            </div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  const requiresItems: string[] = [];
  if (finding.requires.video) requiresItems.push("📹 YouTube demonstration video");
  if (finding.requires.screenshots) requiresItems.push("📸 Screenshots required");
  if (finding.requires.reviewerNotes) requiresItems.push("📝 Reviewer notes required");

  const requiresHtml = requiresItems.length > 0
    ? `
      <div style="margin-top: 12px;">
        <strong>Required Artifacts:</strong>
        <ul style="margin: 8px 0; padding-left: 20px;">
          ${requiresItems.map((item) => `<li style="margin: 4px 0;">${item}</li>`).join("")}
        </ul>
      </div>
    `
    : "";

  return `
    <div style="
      border: 1px solid ${finding.isBlocking ? "#fecaca" : "#e5e7eb"};
      background: ${finding.isBlocking ? "#fef2f2" : "#ffffff"};
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px; color: #111827;">${escapeHtml(finding.id)}</h3>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="
            background: ${finding.platform === "google" ? "#4285f4" : finding.platform === "apple" ? "#000000" : "#6b7280"};
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          ">${finding.platform.toUpperCase()}</span>
          ${getRiskBadge(finding.risk, finding.isBlocking)}
        </div>
      </div>
      ${requiresHtml}
      ${copyHtml}
      ${evidenceHtml}
    </div>
  `;
}

/**
 * Generate complete HTML report
 */
export function generateHtmlReport(result: RuleEvaluationResult): string {
  const timestamp = new Date().toISOString();
  
  const statusColor = result.summary.blocked ? "#dc2626" : "#22c55e";
  const statusText = result.summary.blocked ? "BLOCKING ISSUES FOUND" : "READY FOR SUBMISSION";
  const statusIcon = result.summary.blocked ? "⚠️" : "✅";

  const findingsHtml = result.findings.length > 0
    ? result.findings.map(generateFindingHtml).join("")
    : '<p style="color: #6b7280; text-align: center; padding: 40px;">No findings - your app is ready for submission!</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StorePreflight Report - ${escapeHtml(result.appName)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #111827;
      background: #f9fafb;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 32px;
    }
    .header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: #2E7D32;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }
    h1 { margin: 0; font-size: 24px; }
    h2 { margin: 24px 0 16px; font-size: 18px; }
    .app-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .app-info-item {
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 6px;
    }
    .app-info-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .app-info-value {
      font-weight: 600;
      word-break: break-all;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .summary-card-value {
      font-size: 32px;
      font-weight: 700;
    }
    .summary-card-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    pre {
      font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">✓</div>
        <h1>StorePreflight Report</h1>
      </div>
      <div class="status-badge" style="background: ${statusColor}15; color: ${statusColor};">
        ${statusIcon} ${statusText}
      </div>
    </div>

    <div class="app-info">
      <div class="app-info-item">
        <div class="app-info-label">App Name</div>
        <div class="app-info-value">${escapeHtml(result.appName)}</div>
      </div>
      <div class="app-info-item">
        <div class="app-info-label">Bundle ID</div>
        <div class="app-info-value">${escapeHtml(result.bundleId)}</div>
      </div>
      <div class="app-info-item">
        <div class="app-info-label">Platforms</div>
        <div class="app-info-value">${result.platformTargets.join(", ").toUpperCase()}</div>
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card" style="border-color: #dc2626;">
        <div class="summary-card-value" style="color: #dc2626;">${result.summary.high}</div>
        <div class="summary-card-label">High Risk</div>
      </div>
      <div class="summary-card" style="border-color: #f59e0b;">
        <div class="summary-card-value" style="color: #f59e0b;">${result.summary.medium}</div>
        <div class="summary-card-label">Medium Risk</div>
      </div>
      <div class="summary-card" style="border-color: #22c55e;">
        <div class="summary-card-value" style="color: #22c55e;">${result.summary.low}</div>
        <div class="summary-card-label">Low Risk</div>
      </div>
    </div>

    <h2>Findings (${result.findings.length})</h2>
    ${findingsHtml}

    <div class="footer">
      Generated by StorePreflight on ${timestamp}<br>
      <a href="https://storepreflight.com" style="color: #2E7D32;">storepreflight.com</a>
    </div>
  </div>
</body>
</html>`;
}
