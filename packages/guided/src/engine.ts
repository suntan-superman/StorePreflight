/**
 * StorePreflight Guided Submission Engine
 * 
 * Builds a GuidedSubmissionFlow ("google" | "apple") from:
 * - ScanResult (capabilities + evidence)
 * - RuleEvaluationResult (matched rules / gates)
 * - GeneratedCopy (paste-ready text blocks)
 * - Step catalog (googleGuidedCatalog / appleGuidedCatalog)
 *
 * Notes:
 * - No store UI automation; user marks steps complete manually.
 * - Deterministic ordering.
 * - Missing placeholder values mark steps as blocking and increment missingValues.
 */

import type {
  Capability,
  Evidence,
  RuleEvaluationResult,
  ScanResult,
} from "@storepreflight/shared";

import type {
  StoreTarget,
  GeneratedCopy,
  GuidedStep,
  GuidedStepTemplate,
  GuidedSubmissionFlow,
  GuidedInstruction,
  GuidedArtifact,
  BuildGuidedFlowInput,
  TemplateContext,
} from "./types";

import { googleGuidedCatalog } from "./catalogs/google";
import { appleGuidedCatalog } from "./catalogs/apple";

// =============================================================================
// MAIN EXPORT
// =============================================================================

/**
 * Build a guided submission flow for the specified store
 */
export function buildGuidedFlow(input: BuildGuidedFlowInput): GuidedSubmissionFlow {
  const { store, scan, evaluation, generated } = input;

  // Select catalog
  const catalog: GuidedStepTemplate[] =
    store === "google" ? googleGuidedCatalog : appleGuidedCatalog;

  // Build lookup structures
  const findingIds = new Set(evaluation.findings.map((f) => f.id));
  const capSet = new Set(
    scan.capabilities.map((c) => c.capability)
  );

  // Build evidence lookup by capability
  const evidenceByCap = new Map<Capability, Evidence[]>();
  for (const det of scan.capabilities) {
    evidenceByCap.set(det.capability, det.evidence);
  }

  // Determine active templates
  const activeTemplates = catalog.filter((tpl) =>
    isTemplateActive(tpl, findingIds, capSet)
  );

  // Convert to steps
  const steps: GuidedStep[] = activeTemplates.map((tpl) => {
    const triggeredRuleIds = intersectRuleIds(
      tpl.activatesWhenRuleIds ?? [],
      findingIds
    );

    const triggeredCaps = intersectCapabilities(
      tpl.activatesWhenCapabilities ?? [],
      capSet
    );

    // Determine if any matched findings are blocking
    const matchingFindings = evaluation.findings.filter((f) =>
      triggeredRuleIds.includes(f.id)
    );

    // base blocking logic: template default OR any matched finding blocking
    let blocking =
      Boolean(tpl.blockingDefault) ||
      matchingFindings.some((f) => f.isBlocking);

    // Determine rule-required artifacts (video/screenshots/reviewerNotes)
    const requires = {
      video: matchingFindings.some((f) => f.requires?.video),
      screenshots: matchingFindings.some((f) => f.requires?.screenshots),
      reviewerNotes: matchingFindings.some((f) => f.requires?.reviewerNotes),
    };

    // Resolve templates
    const ctx = buildTemplateContext({ scan, evaluation, generated });

    const missingKeys: string[] = [];

    const instructions: GuidedInstruction[] = tpl.instructions.map((it) => {
      const { value, missing } = resolveTemplateOptional(it.valueTemplate, ctx);
      if (missing.length) missingKeys.push(...missing);

      return {
        type: it.type,
        label: it.label,
        value,
      };
    });

    // Merge artifacts: template artifacts + rule-required artifacts (if missing)
    const artifacts: GuidedArtifact[] = [];

    if (tpl.artifacts?.length) {
      for (const a of tpl.artifacts) {
        const { value, missing } = resolveTemplateOptional(a.valueTemplate, ctx);
        if (missing.length) missingKeys.push(...missing);
        artifacts.push({
          type: a.type,
          required: a.required,
          description: a.description,
          value,
        });
      }
    }

    // Ensure required artifacts present
    if (requires.video && !artifacts.some((a) => a.type === "video")) {
      artifacts.push({
        type: "video",
        required: true,
        description: "YouTube walkthrough video (required by policy)",
      });
    }

    if (requires.screenshots && !artifacts.some((a) => a.type === "screenshot")) {
      artifacts.push({
        type: "screenshot",
        required: true,
        description: "Store screenshots (required by policy)",
      });
    }

    // Ensure reviewer notes exist if required; if missing, mark blocking
    if (requires.reviewerNotes) {
      const hasReviewerPaste = instructions.some(
        (i) => i.type === "paste" && (i.value ?? "").includes("review")
      );
      // even if we can't detect it perfectly, we still require generated.reviewerNotes
      if (!generated.reviewerNotes) {
        missingKeys.push("generated.reviewerNotes");
      }
      if (!hasReviewerPaste) {
        // If template didn't include it, add it to make the step self-sufficient
        instructions.push({
          type: "paste",
          label: "Paste reviewer notes / access instructions",
          value: generated.reviewerNotes ?? "[MISSING: generated.reviewerNotes]",
        });
      }
    }

    // If any placeholders missing, force blocking (safer)
    const uniqueMissing = uniqStrings(missingKeys);
    if (uniqueMissing.length) blocking = true;

    // Evidence: union evidence from triggeredCaps
    const ev: Evidence[] = [];
    for (const cap of triggeredCaps) {
      ev.push(...(evidenceByCap.get(cap) ?? []));
    }

    return {
      id: tpl.id,
      store: tpl.store,
      sectionPath: tpl.sectionPath,
      title: tpl.title,
      description: tpl.description,
      whyThisExists: tpl.whyThisExists,
      blocking,
      triggeredByRuleIds: triggeredRuleIds,
      triggeredByCapabilities: triggeredCaps,
      instructions,
      artifacts: artifacts.length ? artifacts : undefined,
      completionCriteria: tpl.completionCriteria,
      warnings: tpl.warnings,
      evidence: uniqEvidence(ev),
      missingKeys: uniqueMissing,
    };
  });

  // Order steps deterministically
  const ordered = orderSteps(steps);

  const summary = {
    totalSteps: ordered.length,
    blockingSteps: ordered.filter((s) => s.blocking).length,
    missingValues: ordered.reduce((acc, s) => acc + s.missingKeys.length, 0),
  };

  return {
    store,
    appName: scan.appName,
    bundleId: scan.bundleId,
    steps: ordered,
    summary,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function isTemplateActive(
  tpl: GuidedStepTemplate,
  findingIds: Set<string>,
  capSet: Set<Capability>
): boolean {
  if (tpl.alwaysInclude) return true;

  const ruleHit =
    (tpl.activatesWhenRuleIds ?? []).some((id) => findingIds.has(id)) ?? false;

  const capHit =
    (tpl.activatesWhenCapabilities ?? []).some((c) => capSet.has(c)) ?? false;

  return Boolean(ruleHit || capHit);
}

function intersectRuleIds(ruleIds: string[], findingIds: Set<string>): string[] {
  return ruleIds.filter((id) => findingIds.has(id));
}

function intersectCapabilities(
  caps: Capability[],
  capSet: Set<Capability>
): Capability[] {
  return caps.filter((c) => capSet.has(c));
}

function buildTemplateContext(args: {
  scan: ScanResult;
  evaluation: RuleEvaluationResult;
  generated: GeneratedCopy;
}): TemplateContext {
  const { scan, evaluation, generated } = args;

  return {
    app: {
      appName: scan.appName,
      bundleId: scan.bundleId,
      platformTargets: scan.platformTargets,
    },
    evaluation: {
      summary: evaluation.summary,
      findings: evaluation.findings,
    },
    generated,
  };
}

/**
 * Resolve a string template with {{path.to.value}} placeholders.
 * Returns resolved string and a list of missing keys.
 */
function resolveTemplateOptional(
  template: string | undefined,
  ctx: TemplateContext
): { value?: string; missing: string[] } {
  if (!template) return { value: undefined, missing: [] };

  const missing: string[] = [];

  const value = template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey) => {
    const key = String(rawKey).trim();
    const resolved = getPath(ctx, key);
    if (resolved === undefined || resolved === null || resolved === "") {
      missing.push(
        key.startsWith("app.") ||
          key.startsWith("generated.") ||
          key.startsWith("evaluation.")
          ? key
          : `ctx.${key}`
      );
      return `[MISSING: ${key}]`;
    }
    return String(resolved);
  });

  return { value, missing };
}

function getPath(obj: unknown, pathStr: string): unknown {
  const parts = pathStr
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function uniqStrings(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function uniqEvidence(evs: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  const out: Evidence[] = [];
  for (const e of evs) {
    const key = `${e.file}:${e.lines?.[0]}-${e.lines?.[1]}:${e.snippet}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(e);
    }
  }
  return out;
}

/**
 * Deterministic ordering:
 * 1) Section order (by first element, then second, etc.)
 * 2) Blocking first within same section
 * 3) Rule-triggered first within same section
 * 4) Stable by id
 */
function orderSteps(steps: GuidedStep[]): GuidedStep[] {
  return [...steps].sort((a, b) => {
    const sec = compareSectionPath(a.sectionPath, b.sectionPath);
    if (sec !== 0) return sec;

    if (a.blocking !== b.blocking) return a.blocking ? -1 : 1;

    const aRule = a.triggeredByRuleIds.length > 0;
    const bRule = b.triggeredByRuleIds.length > 0;
    if (aRule !== bRule) return aRule ? -1 : 1;

    return a.id.localeCompare(b.id);
  });
}

function compareSectionPath(a: string[], b: string[]): number {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const av = a[i] ?? "";
    const bv = b[i] ?? "";
    const c = av.localeCompare(bv);
    if (c !== 0) return c;
  }
  return 0;
}
