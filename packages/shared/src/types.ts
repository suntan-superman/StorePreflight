/**
 * StorePreflight Shared Types
 * Core type definitions used across all packages
 */

// =============================================================================
// SUBMISSION INTENT
// =============================================================================

/**
 * The developer's goal for a store submission.
 * This is a first-class concept that affects which rules apply
 * and which guided steps are required.
 * 
 * - internal_testing: TestFlight / Google Play Internal Track
 *   Minimal requirements - no store listing, screenshots, or marketing
 * 
 * - external_testing: Open Beta / Google Play External Track
 *   May require some metadata but not full production requirements
 * 
 * - production: Full App Store / Play Store release
 *   All requirements including store listing, screenshots, marketing
 */
export type SubmissionIntent = 
  | "internal_testing"
  | "external_testing"
  | "production";

/**
 * Labels for display in UI
 */
export const SUBMISSION_INTENT_LABELS: Record<SubmissionIntent, string> = {
  internal_testing: "Internal Testing",
  external_testing: "External Testing",
  production: "Production Release",
};

/**
 * Descriptions for each intent
 */
export const SUBMISSION_INTENT_DESCRIPTIONS: Record<SubmissionIntent, string> = {
  internal_testing: "TestFlight or Google Play Internal Track. Minimal setup required.",
  external_testing: "Open Beta or Google Play External Track. Some metadata required.",
  production: "Full App Store or Play Store release. Complete setup required.",
};

// =============================================================================
// CAPABILITIES
// =============================================================================

/**
 * All detectable app capabilities that may trigger store policy gates
 */
export type Capability =
  | "location_foreground"
  | "location_background"
  | "notifications"
  | "camera"
  | "microphone"
  | "photo_library"
  | "file_storage"
  | "maps"
  | "payments"
  | "authentication"
  | "analytics"
  | "background_tasks";

// =============================================================================
// EVIDENCE
// =============================================================================

/**
 * Evidence of a detected capability - file location and code snippet
 */
export interface Evidence {
  /** Absolute or relative file path */
  file: string;
  /** Start and end line numbers [start, end] */
  lines: [number, number];
  /** Code snippet showing the detection */
  snippet: string;
}

/**
 * A detected capability with all supporting evidence
 */
export interface DetectedCapability {
  capability: Capability;
  evidence: Evidence[];
}

// =============================================================================
// SCAN RESULT
// =============================================================================

/**
 * Normalized output from any scanner adapter
 * Framework-agnostic - same structure for Expo, Flutter, etc.
 */
export interface ScanResult {
  /** App display name */
  appName: string;
  /** Bundle identifier (iOS) or package name (Android) */
  bundleId: string;
  /** Target platforms detected */
  platformTargets: ("ios" | "android")[];
  /** All detected capabilities with evidence */
  capabilities: DetectedCapability[];
}

// =============================================================================
// RULES ENGINE TYPES
// =============================================================================

export type Platform = "google" | "apple" | "both";
export type RiskLevel = "low" | "medium" | "high";

/**
 * A store policy rule definition
 */
export interface Rule {
  /** Unique rule identifier e.g. "GOOGLE_BG_LOCATION" */
  id: string;
  /** Which store this rule applies to */
  platform: Platform;
  /** Capabilities that trigger this rule (empty = always applicable) */
  trigger: Capability[];
  /** Risk level - high = blocking */
  risk: RiskLevel;
  /**
   * Which submission intents this rule applies to.
   * If omitted or empty, applies to ALL intents.
   * If specified, only applies when intent matches.
   */
  appliesTo?: SubmissionIntent[];
  /** What artifacts are required */
  requires?: {
    video?: boolean;
    screenshots?: boolean;
    reviewerNotes?: boolean;
  };
  /** Copy-paste ready text for store submissions */
  copy?: {
    appPurpose?: string;
    permissionJustification?: string;
    dataSafety?: string;
    reviewerNotes?: string;
  };
}

/**
 * A matched rule finding with merged evidence
 */
export interface GateFinding {
  /** Rule ID that was triggered */
  id: string;
  /** Platform this finding applies to */
  platform: Platform;
  /** Risk level */
  risk: RiskLevel;
  /** Whether this finding blocks submission */
  isBlocking: boolean;
  /** Required artifacts */
  requires: {
    video: boolean;
    screenshots: boolean;
    reviewerNotes: boolean;
  };
  /** Copy-paste text */
  copy: NonNullable<Rule["copy"]>;
  /** Capabilities that triggered this rule */
  triggers: Capability[];
  /** Merged evidence from all triggering capabilities */
  evidence: Evidence[];
}

/**
 * Complete rule evaluation result
 */
export interface RuleEvaluationResult {
  /** App name from scan */
  appName: string;
  /** Bundle ID from scan */
  bundleId: string;
  /** Target platforms */
  platformTargets: ("ios" | "android")[];
  /** All matched findings sorted by severity */
  findings: GateFinding[];
  /** Summary statistics */
  summary: {
    /** Whether any blocking issues exist */
    blocked: boolean;
    /** Count of high-risk findings */
    high: number;
    /** Count of medium-risk findings */
    medium: number;
    /** Count of low-risk findings */
    low: number;
  };
}

// =============================================================================
// ASSET TYPES
// =============================================================================

/**
 * Screenshot validation result
 */
export interface ScreenshotValidation {
  /** Original file path */
  inputPath: string;
  /** Whether it passes Google Play requirements */
  valid: boolean;
  /** Current dimensions */
  width: number;
  height: number;
  /** Validation messages */
  issues: string[];
}

/**
 * Icon validation result
 */
export interface IconValidation {
  /** Whether icon meets requirements */
  ok: boolean;
  /** Current width */
  width: number | undefined;
  /** Current height */
  height: number | undefined;
  /** Validation message */
  message: string;
}

// =============================================================================
// SUBMISSION PACK TYPES
// =============================================================================

/**
 * Generated submission pack metadata
 */
export interface SubmissionPack {
  /** App name */
  appName: string;
  /** Generation timestamp */
  generatedAt: string;
  /** Path to generated ZIP file */
  zipPath: string;
  /** Contents summary */
  contents: {
    hasReport: boolean;
    copyPasteFiles: string[];
    screenshots: string[];
    hasFeatureGraphic: boolean;
    hasIcon: boolean;
    checklists: string[];
  };
}
