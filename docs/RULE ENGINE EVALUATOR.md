1) Implement Rule Engine Evaluator
Goal

Take a ScanResult (capabilities + evidence) and a rules file (rules.v1.json) and output:

Matched gates (rules whose triggers are satisfied)

Severity/blocking status

Copy/paste payload

Evidence references merged in

Files

packages/rules/rules.v1.json (you already started)

packages/rules/engine.ts

packages/shared/types.ts (add a few types)

Add these types

📁 packages/shared/types.ts (append)

export type Platform = "google" | "apple" | "both";
export type RiskLevel = "low" | "medium" | "high";

export interface Rule {
  id: string;
  platform: Platform;
  trigger: Capability[];           // empty => always applicable (usually assets checks)
  risk: RiskLevel;
  requires?: {
    video?: boolean;
    screenshots?: boolean;
    reviewerNotes?: boolean;
  };
  copy?: {
    appPurpose?: string;
    permissionJustification?: string;
    dataSafety?: string;
    reviewerNotes?: string;
  };
}

export interface GateFinding {
  id: string;
  platform: Platform;
  risk: RiskLevel;
  isBlocking: boolean;             // high risk => blocking by default
  requires: {
    video: boolean;
    screenshots: boolean;
    reviewerNotes: boolean;
  };
  copy: Required<Rule>["copy"];
  triggers: Capability[];
  evidence: Evidence[];            // merged evidence from triggering capabilities
}

export interface RuleEvaluationResult {
  appName: string;
  bundleId: string;
  platformTargets: ("ios" | "android")[];
  findings: GateFinding[];
  summary: {
    blocked: boolean;
    high: number;
    medium: number;
    low: number;
  };
}

Implement evaluator

📁 packages/rules/engine.ts

import fs from "fs";
import path from "path";
import {
  Evidence,
  Rule,
  ScanResult,
  GateFinding,
  RuleEvaluationResult,
  Capability,
} from "../shared/types";

function loadRules(rulesPath: string): Rule[] {
  const raw = fs.readFileSync(rulesPath, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("rules file must be a JSON array");
  return parsed as Rule[];
}

function uniqEvidence(evs: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  const out: Evidence[] = [];
  for (const e of evs) {
    const key = `${e.file}:${e.lines[0]}-${e.lines[1]}:${e.snippet}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(e);
    }
  }
  return out;
}

function capabilityEvidence(scan: ScanResult, caps: Capability[]): Evidence[] {
  const evs: Evidence[] = [];
  for (const cap of caps) {
    const found = scan.capabilities.find(c => c.capability === cap);
    if (found?.evidence?.length) evs.push(...found.evidence);
  }
  return uniqEvidence(evs);
}

function isTriggered(rule: Rule, scan: ScanResult): boolean {
  // empty trigger means "always applicable" (used for asset rules)
  if (!rule.trigger || rule.trigger.length === 0) return true;

  // rule triggers if ALL capabilities in trigger list exist in scan
  return rule.trigger.every(req =>
    scan.capabilities.some(c => c.capability === req)
  );
}

export function evaluateRules(
  scan: ScanResult,
  rulesPath = path.join(__dirname, "rules.v1.json")
): RuleEvaluationResult {
  const rules = loadRules(rulesPath);

  const findings: GateFinding[] = [];

  for (const rule of rules) {
    if (!isTriggered(rule, scan)) continue;

    const triggers = rule.trigger ?? [];
    const evidence = triggers.length ? capabilityEvidence(scan, triggers) : [];

    const requires = {
      video: Boolean(rule.requires?.video),
      screenshots: Boolean(rule.requires?.screenshots),
      reviewerNotes: Boolean(rule.requires?.reviewerNotes),
    };

    const isBlocking = rule.risk === "high"; // simple MVP rule (can evolve later)

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

  const summary = {
    blocked: findings.some(f => f.isBlocking),
    high: findings.filter(f => f.risk === "high").length,
    medium: findings.filter(f => f.risk === "medium").length,
    low: findings.filter(f => f.risk === "low").length,
  };

  // stable ordering: high → medium → low, then id
  findings.sort((a, b) => {
    const rank = (r: string) => (r === "high" ? 0 : r === "medium" ? 1 : 2);
    const d = rank(a.risk) - rank(b.risk);
    if (d !== 0) return d;
    return a.id.localeCompare(b.id);
  });

  return {
    appName: scan.appName,
    bundleId: scan.bundleId,
    platformTargets: scan.platformTargets,
    findings,
    summary,
  };
}
