/**
 * StorePreflight Guided Submission Types
 * Type definitions for the guided submission flow engine
 */

import { Capability, Evidence, SubmissionIntent } from "@storepreflight/shared";

// =============================================================================
// STORE TARGET
// =============================================================================

/**
 * Target store for submission guidance
 */
export type StoreTarget = "google" | "apple";

// =============================================================================
// GENERATED COPY
// =============================================================================

/**
 * Pre-generated copy-paste ready text blocks for store submissions.
 * These are derived from scan results and rule evaluations.
 */
export interface GeneratedCopy {
  /** Brief app purpose statement */
  appPurpose?: string;
  /** Permission justification text */
  permissionJustification?: string;
  /** Reviewer notes / access instructions */
  reviewerNotes?: string;
  /** Data safety/collection summary */
  dataSafetySummary?: string;
  /** Privacy policy URL */
  privacyPolicyUrl?: string;
  /** Export compliance statement */
  exportCompliance?: string;
  /** Support URL */
  supportUrl?: string;
  /** Terms of service URL */
  termsUrl?: string;
  /** Marketing URL */
  marketingUrl?: string;
}

// =============================================================================
// INSTRUCTIONS
// =============================================================================

/**
 * Types of instructions that can appear in a guided step
 */
export type GuidedInstructionType = "select" | "paste" | "upload" | "verify";

/**
 * A single instruction within a guided step (resolved)
 */
export interface GuidedInstruction {
  /** Type of action to perform */
  type: GuidedInstructionType;
  /** Human-readable label */
  label: string;
  /** Resolved value (for paste/select types) */
  value?: string;
}

/**
 * Template for generating instructions (with placeholders)
 */
export interface GuidedInstructionTemplate {
  /** Type of action to perform */
  type: GuidedInstructionType;
  /** Human-readable label */
  label: string;
  /** Template string with {{placeholders}} */
  valueTemplate?: string;
}

// =============================================================================
// ARTIFACTS
// =============================================================================

/**
 * Types of artifacts that may be required
 */
export type GuidedArtifactType = "video" | "screenshot" | "text" | "url";

/**
 * A required or optional artifact for submission (resolved)
 */
export interface GuidedArtifact {
  /** Type of artifact */
  type: GuidedArtifactType;
  /** Whether this artifact is required */
  required: boolean;
  /** Description of what's needed */
  description: string;
  /** Resolved value (URL, text, etc.) */
  value?: string;
}

/**
 * Template for generating artifact requirements (with placeholders)
 */
export interface GuidedArtifactTemplate {
  /** Type of artifact */
  type: GuidedArtifactType;
  /** Whether this artifact is required */
  required: boolean;
  /** Description of what's needed */
  description: string;
  /** Template string with {{placeholders}} */
  valueTemplate?: string;
}

// =============================================================================
// GUIDED STEP
// =============================================================================

/**
 * A fully resolved guided step ready for UI rendering
 */
export interface GuidedStep {
  /** Unique step identifier */
  id: string;
  /** Target store */
  store: StoreTarget;
  /**
   * Which submission intents this step applies to.
   * Inherited from the template but can be filtered at runtime.
   */
  appliesTo: SubmissionIntent[];
  /** Path through store UI sections e.g. ["App Content", "Data Safety"] */
  sectionPath: string[];
  /** Step title */
  title: string;
  /** Brief description */
  description: string;
  /** Explanation of why this step exists */
  whyThisExists: string;

  /** Whether this step blocks submission */
  blocking: boolean;

  /** Rule IDs that caused this step to appear */
  triggeredByRuleIds: string[];
  /** Capabilities that caused this step to appear */
  triggeredByCapabilities: Capability[];

  /** Resolved instructions */
  instructions: GuidedInstruction[];
  /** Required/optional artifacts */
  artifacts?: GuidedArtifact[];

  /** Criteria for marking this step complete */
  completionCriteria: string[];
  /** Warning messages */
  warnings?: string[];

  /** Evidence from scan that supports this step */
  evidence: Evidence[];

  /** Placeholder keys that couldn't be resolved */
  missingKeys: string[];
}

/**
 * Template for defining guided steps in catalogs
 */
export interface GuidedStepTemplate {
  /** Unique step identifier */
  id: string;
  /** Target store */
  store: StoreTarget;
  /**
   * Which submission intents this step applies to.
   * If omitted, defaults to ALL intents.
   * Use ["production"] for store listing, screenshots, marketing.
   * Use ["internal_testing", "external_testing", "production"] for core compliance.
   */
  appliesTo?: SubmissionIntent[];
  /** Path through store UI sections */
  sectionPath: string[];
  /** Step title */
  title: string;
  /** Brief description */
  description: string;
  /** Explanation of why this step exists */
  whyThisExists: string;

  /** Always include this step regardless of triggers */
  alwaysInclude?: boolean;
  /** Rule IDs that activate this step */
  activatesWhenRuleIds?: string[];
  /** Capabilities that activate this step */
  activatesWhenCapabilities?: Capability[];
  /** Default blocking state */
  blockingDefault?: boolean;

  /** Instruction templates */
  instructions: GuidedInstructionTemplate[];
  /** Artifact templates */
  artifacts?: GuidedArtifactTemplate[];

  /** Criteria for marking this step complete */
  completionCriteria: string[];
  /** Warning messages */
  warnings?: string[];
}

// =============================================================================
// GUIDED SUBMISSION FLOW
// =============================================================================

/**
 * Summary statistics for a guided flow
 */
export interface GuidedFlowSummary {
  /** Total number of steps */
  totalSteps: number;
  /** Number of blocking steps */
  blockingSteps: number;
  /** Number of unresolved placeholder values */
  missingValues: number;
}

/**
 * Complete guided submission flow for a store
 */
export interface GuidedSubmissionFlow {
  /** Target store */
  store: StoreTarget;
  /** Submission intent */
  intent: SubmissionIntent;
  /** App name */
  appName: string;
  /** Bundle/package identifier */
  bundleId: string;
  /** Ordered list of steps */
  steps: GuidedStep[];
  /** Summary statistics */
  summary: GuidedFlowSummary;
}

// =============================================================================
// SESSION STATE
// =============================================================================

/**
 * Progress state for a single step
 */
export interface StepProgress {
  /** Step ID */
  stepId: string;
  /** Whether the step is completed */
  completed: boolean;
  /** When the step was completed */
  completedAt?: string;
  /** User notes */
  notes?: string;
}

/**
 * Persisted session state for a guided submission
 */
export interface GuidedSession {
  /** Unique session identifier */
  sessionId: string;
  /** Target store */
  store: StoreTarget;
  /** Submission intent */
  intent: SubmissionIntent;
  /** App name */
  appName: string;
  /** Bundle/package identifier */
  bundleId: string;
  /** Session creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Progress for each step */
  progress: StepProgress[];
  /** Generated copy values */
  generatedCopy: GeneratedCopy;
}

// =============================================================================
// ENGINE INPUT/OUTPUT
// =============================================================================

/**
 * Input parameters for building a guided flow
 */
export interface BuildGuidedFlowInput {
  /** Target store */
  store: StoreTarget;
  /** Submission intent - determines which steps are included */
  intent: SubmissionIntent;
  /** Scan results */
  scan: import("@storepreflight/shared").ScanResult;
  /** Rule evaluation results */
  evaluation: import("@storepreflight/shared").RuleEvaluationResult;
  /** Pre-generated copy */
  generated: GeneratedCopy;
}

/**
 * Context object passed to template resolution
 */
export interface TemplateContext {
  app: {
    appName: string;
    bundleId: string;
    platformTargets: ("ios" | "android")[];
  };
  evaluation: {
    summary: import("@storepreflight/shared").RuleEvaluationResult["summary"];
    findings: import("@storepreflight/shared").GateFinding[];
  };
  generated: GeneratedCopy;
}
