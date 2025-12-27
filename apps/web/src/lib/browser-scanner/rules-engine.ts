/**
 * Browser-based Rules Engine
 * Evaluates scan results against store policy rules
 */

import type {
  ScanResult,
  Rule,
  GateFinding,
  RuleEvaluationResult,
  Capability,
  Evidence,
  RiskLevel,
} from "./types";
import { rules } from "./rules-data";

/**
 * Collect evidence from scan for specific capabilities
 */
function collectEvidence(
  scan: ScanResult,
  capabilities: Capability[]
): Evidence[] {
  const evidences: Evidence[] = [];

  for (const cap of capabilities) {
    const found = scan.capabilities.find((c) => c.capability === cap);
    if (found?.evidence?.length) {
      evidences.push(...found.evidence);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return evidences.filter((e) => {
    const key = `${e.file}:${e.lines[0]}:${e.snippet}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Check if a rule is triggered by the scan result
 */
function isRuleTriggered(rule: Rule, scan: ScanResult): boolean {
  // Empty trigger means "always applicable"
  if (!rule.trigger || rule.trigger.length === 0) {
    return true;
  }

  // Rule triggers if ALL capabilities in trigger list exist in scan
  return rule.trigger.every((requiredCap) =>
    scan.capabilities.some((detected) => detected.capability === requiredCap)
  );
}

/**
 * Get risk ranking for sorting
 */
function getRiskRank(risk: RiskLevel): number {
  switch (risk) {
    case "high":
      return 0;
    case "medium":
      return 1;
    case "low":
      return 2;
    default:
      return 3;
  }
}

/**
 * Evaluate rules against a scan result
 */
export function evaluateRules(scan: ScanResult): RuleEvaluationResult {
  const findings: GateFinding[] = [];

  for (const rule of rules) {
    // Skip rules that don't match target platforms
    if (rule.platform !== "both") {
      const targetPlatform = rule.platform === "google" ? "android" : "ios";
      if (!scan.platformTargets.includes(targetPlatform)) {
        continue;
      }
    }

    // Check if rule is triggered
    if (!isRuleTriggered(rule, scan)) {
      continue;
    }

    const triggers = rule.trigger ?? [];
    const evidence = triggers.length > 0 ? collectEvidence(scan, triggers) : [];

    const requires = {
      video: Boolean(rule.requires?.video),
      screenshots: Boolean(rule.requires?.screenshots),
      reviewerNotes: Boolean(rule.requires?.reviewerNotes),
    };

    const isBlocking = rule.risk === "high";

    findings.push({
      id: rule.id,
      platform: rule.platform,
      risk: rule.risk,
      isBlocking,
      requires,
      copy: rule.copy ?? {},
      triggers,
      evidence,
    });
  }

  // Sort: high → medium → low, then alphabetically
  findings.sort((a, b) => {
    const rankDiff = getRiskRank(a.risk) - getRiskRank(b.risk);
    if (rankDiff !== 0) return rankDiff;
    return a.id.localeCompare(b.id);
  });

  const summary = {
    blocked: findings.some((f) => f.isBlocking),
    high: findings.filter((f) => f.risk === "high").length,
    medium: findings.filter((f) => f.risk === "medium").length,
    low: findings.filter((f) => f.risk === "low").length,
  };

  return {
    appName: scan.appName,
    bundleId: scan.bundleId,
    platformTargets: scan.platformTargets,
    findings,
    summary,
  };
}
