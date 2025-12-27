/**
 * Rules Engine Evaluator
 * Matches scan results against store policy rules
 */

import {
  uniqueEvidence,
  type Evidence,
  type Rule,
  type ScanResult,
  type GateFinding,
  type RuleEvaluationResult,
  type Capability,
  type RiskLevel,
} from "@storepreflight/shared";

// Import the rules directly
import rulesData from "./rules.v1.json";

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
  
  return uniqueEvidence(evidences);
}

/**
 * Check if a rule is triggered by the scan result
 */
function isRuleTriggered(rule: Rule, scan: ScanResult): boolean {
  // Empty trigger means "always applicable" (e.g., screenshot compliance)
  if (!rule.trigger || rule.trigger.length === 0) {
    return true;
  }
  
  // Rule triggers if ALL capabilities in trigger list exist in scan
  return rule.trigger.every((requiredCap) =>
    scan.capabilities.some((detected) => detected.capability === requiredCap)
  );
}

/**
 * Get risk ranking for sorting (lower = more severe)
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
 * @param scan - The scan result from a scanner adapter
 * @param customRules - Optional custom rules array (defaults to bundled rules)
 * @returns Evaluation result with matched findings and summary
 */
export function evaluateRules(
  scan: ScanResult,
  customRules?: Rule[]
): RuleEvaluationResult {
  const rules = customRules ?? (rulesData as Rule[]);
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
    const evidence = triggers.length > 0 
      ? collectEvidence(scan, triggers) 
      : [];

    const requires = {
      video: Boolean(rule.requires?.video),
      screenshots: Boolean(rule.requires?.screenshots),
      reviewerNotes: Boolean(rule.requires?.reviewerNotes),
    };

    // High risk = blocking by default (can evolve later)
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

  // Sort findings: high → medium → low, then alphabetically by ID
  findings.sort((a, b) => {
    const rankDiff = getRiskRank(a.risk) - getRiskRank(b.risk);
    if (rankDiff !== 0) return rankDiff;
    return a.id.localeCompare(b.id);
  });

  // Calculate summary
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

/**
 * Get all rules (for UI display or filtering)
 */
export function getAllRules(): Rule[] {
  return rulesData as Rule[];
}

/**
 * Filter findings by platform
 */
export function filterFindingsByPlatform(
  findings: GateFinding[],
  platform: "google" | "apple"
): GateFinding[] {
  return findings.filter(
    (f) => f.platform === platform || f.platform === "both"
  );
}

/**
 * Get only blocking findings
 */
export function getBlockingFindings(findings: GateFinding[]): GateFinding[] {
  return findings.filter((f) => f.isBlocking);
}
