/**
 * Guided Submission Integration
 * Bridges browser-scanner output to guided submission engine
 */

import type {
  RuleEvaluationResult,
  GateFinding,
  ScanResult,
  Capability,
} from "@/lib/browser-scanner/types";
import type {
  StoreTarget,
  GeneratedCopy,
  GuidedSubmissionFlow,
  GuidedSession,
  StepProgress,
} from "@storepreflight/guided";

// =============================================================================
// STORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
  GUIDED_SESSIONS: "storepreflight_guided_sessions",
  CURRENT_SESSION: "storepreflight_current_guided_session",
} as const;

// =============================================================================
// COPY GENERATION
// =============================================================================

/**
 * Generate copy-paste text from scan/evaluation results
 * Extracts and enhances copy from matched findings
 */
export function generateCopyFromFindings(
  store: StoreTarget,
  evaluation: RuleEvaluationResult,
  overrides?: Partial<GeneratedCopy>
): GeneratedCopy {
  const storeFindings = evaluation.findings.filter(
    (f) => f.platform === store || f.platform === "both"
  );

  // Collect capabilities from findings
  const capabilities = new Set<Capability>();
  for (const finding of storeFindings) {
    for (const trigger of finding.triggers) {
      capabilities.add(trigger);
    }
  }

  // Build permission justification from findings
  const justifications: string[] = [];
  for (const finding of storeFindings) {
    if (finding.copy?.permissionJustification) {
      justifications.push(finding.copy.permissionJustification);
    }
  }

  // Build reviewer notes from findings
  const reviewerNotesParts: string[] = [];
  reviewerNotesParts.push(`App: ${evaluation.appName}`);
  reviewerNotesParts.push(`Bundle ID: ${evaluation.bundleId}`);
  reviewerNotesParts.push("");

  if (capabilities.has("authentication")) {
    reviewerNotesParts.push("TEST ACCOUNT CREDENTIALS:");
    reviewerNotesParts.push("Username: [PROVIDE TEST USERNAME]");
    reviewerNotesParts.push("Password: [PROVIDE TEST PASSWORD]");
    reviewerNotesParts.push("");
    reviewerNotesParts.push(
      "This test account has full access to all app features for review purposes."
    );
    reviewerNotesParts.push("");
  }

  for (const finding of storeFindings) {
    if (finding.copy?.reviewerNotes) {
      reviewerNotesParts.push(finding.copy.reviewerNotes);
      reviewerNotesParts.push("");
    }
  }

  // Build data safety summary
  const collectedData: string[] = [];
  if (capabilities.has("authentication")) {
    collectedData.push("account information");
  }
  if (capabilities.has("location_foreground") || capabilities.has("location_background")) {
    collectedData.push("location data");
  }
  if (capabilities.has("analytics")) {
    collectedData.push("usage analytics");
  }
  if (capabilities.has("payments")) {
    collectedData.push("payment information");
  }

  const dataSafetySummary =
    collectedData.length > 0
      ? `Data collected: ${collectedData.join(", ")}. Data is used for app functionality and is not shared with third parties except as required for core features.`
      : "This app does not collect personal user data.";

  // Build app purpose
  const features: string[] = [];
  if (capabilities.has("authentication")) features.push("user authentication");
  if (capabilities.has("location_foreground") || capabilities.has("location_background")) {
    features.push("location-based services");
  }
  if (capabilities.has("camera")) features.push("camera functionality");
  if (capabilities.has("payments")) features.push("payment processing");
  if (capabilities.has("notifications")) features.push("push notifications");

  const appPurpose =
    features.length > 0
      ? `${evaluation.appName} provides ${features.join(", ")} to deliver value to users.`
      : `${evaluation.appName} provides core functionality to users.`;

  return {
    appPurpose: overrides?.appPurpose ?? appPurpose,
    permissionJustification:
      overrides?.permissionJustification ??
      (justifications.length > 0
        ? justifications.join(" ")
        : "This app uses standard permissions for its core functionality."),
    reviewerNotes: overrides?.reviewerNotes ?? reviewerNotesParts.join("\n"),
    dataSafetySummary: overrides?.dataSafetySummary ?? dataSafetySummary,
    privacyPolicyUrl: overrides?.privacyPolicyUrl,
    supportUrl: overrides?.supportUrl,
    termsUrl: overrides?.termsUrl,
    marketingUrl: overrides?.marketingUrl,
    exportCompliance:
      overrides?.exportCompliance ??
      "This app uses standard HTTPS/TLS encryption for network communications and qualifies for the encryption exemption.",
  };
}

// =============================================================================
// TYPE MAPPING
// =============================================================================

/**
 * Convert browser-scanner evaluation to guided engine input format
 */
export function mapToGuidedInput(evaluation: RuleEvaluationResult): {
  scan: ScanResult;
  evaluation: RuleEvaluationResult;
} {
  // Reconstruct scan result from evaluation
  const capabilitiesMap = new Map<Capability, GateFinding["evidence"]>();

  for (const finding of evaluation.findings) {
    for (const trigger of finding.triggers) {
      const existing = capabilitiesMap.get(trigger) ?? [];
      capabilitiesMap.set(trigger, [...existing, ...finding.evidence]);
    }
  }

  const scan: ScanResult = {
    appName: evaluation.appName,
    bundleId: evaluation.bundleId,
    platformTargets: evaluation.platformTargets,
    capabilities: Array.from(capabilitiesMap.entries()).map(
      ([capability, evidence]) => ({
        capability,
        evidence,
      })
    ),
  };

  return { scan, evaluation };
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Create a new guided session
 */
export function createGuidedSession(
  store: StoreTarget,
  evaluation: RuleEvaluationResult,
  generatedCopy: GeneratedCopy
): GuidedSession {
  const session: GuidedSession = {
    sessionId: `guided-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    store,
    appName: evaluation.appName,
    bundleId: evaluation.bundleId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: [],
    generatedCopy,
  };

  return session;
}

/**
 * Save guided session to localStorage
 */
export function saveGuidedSession(session: GuidedSession): void {
  // Save as current session
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));

  // Add to sessions list
  const sessions = getAllGuidedSessions();
  const existingIndex = sessions.findIndex(
    (s) => s.sessionId === session.sessionId
  );

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }

  // Keep only last 20 sessions
  const trimmed = sessions.slice(0, 20);
  localStorage.setItem(STORAGE_KEYS.GUIDED_SESSIONS, JSON.stringify(trimmed));
}

/**
 * Load guided session from localStorage
 */
export function loadGuidedSession(sessionId: string): GuidedSession | null {
  const sessions = getAllGuidedSessions();
  return sessions.find((s) => s.sessionId === sessionId) ?? null;
}

/**
 * Get current guided session
 */
export function getCurrentGuidedSession(): GuidedSession | null {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as GuidedSession;
  } catch {
    return null;
  }
}

/**
 * Get all guided sessions
 */
export function getAllGuidedSessions(): GuidedSession[] {
  const stored = localStorage.getItem(STORAGE_KEYS.GUIDED_SESSIONS);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as GuidedSession[];
  } catch {
    return [];
  }
}

/**
 * Delete a guided session
 */
export function deleteGuidedSession(sessionId: string): void {
  const sessions = getAllGuidedSessions();
  const filtered = sessions.filter((s) => s.sessionId !== sessionId);
  localStorage.setItem(STORAGE_KEYS.GUIDED_SESSIONS, JSON.stringify(filtered));

  // Clear current if it matches
  const current = getCurrentGuidedSession();
  if (current?.sessionId === sessionId) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }
}

// =============================================================================
// PROGRESS TRACKING
// =============================================================================

/**
 * Update step progress in a session
 */
export function updateStepProgress(
  session: GuidedSession,
  stepId: string,
  completed: boolean,
  notes?: string
): GuidedSession {
  const existingIndex = session.progress.findIndex((p) => p.stepId === stepId);

  const progress: StepProgress = {
    stepId,
    completed,
    completedAt: completed ? new Date().toISOString() : undefined,
    notes,
  };

  const newProgress =
    existingIndex >= 0
      ? session.progress.map((p, i) => (i === existingIndex ? progress : p))
      : [...session.progress, progress];

  return {
    ...session,
    progress: newProgress,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get completion stats for a session
 */
export function getSessionStats(
  session: GuidedSession,
  flow: GuidedSubmissionFlow
): {
  completed: number;
  total: number;
  blockingCompleted: number;
  blockingTotal: number;
  percentComplete: number;
} {
  const completedIds = new Set(
    session.progress.filter((p) => p.completed).map((p) => p.stepId)
  );

  const completed = completedIds.size;
  const total = flow.steps.length;

  const blockingSteps = flow.steps.filter((s) => s.blocking);
  const blockingCompleted = blockingSteps.filter((s) =>
    completedIds.has(s.id)
  ).length;
  const blockingTotal = blockingSteps.length;

  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    total,
    blockingCompleted,
    blockingTotal,
    percentComplete,
  };
}

/**
 * Check if step is completed
 */
export function isStepCompleted(
  session: GuidedSession,
  stepId: string
): boolean {
  return session.progress.some((p) => p.stepId === stepId && p.completed);
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Get findings for a specific store
 */
export function getStoreFindings(
  evaluation: RuleEvaluationResult,
  store: StoreTarget
): GateFinding[] {
  return evaluation.findings.filter(
    (f) => f.platform === store || f.platform === "both"
  );
}

/**
 * Check if there are blocking issues for a store
 */
export function hasBlockingIssues(
  evaluation: RuleEvaluationResult,
  store: StoreTarget
): boolean {
  const findings = getStoreFindings(evaluation, store);
  return findings.some((f) => f.isBlocking);
}
