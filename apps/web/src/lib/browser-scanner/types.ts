/**
 * Browser Scanner Types
 * Types for client-side file scanning
 */

export interface FileEntry {
  name: string;
  path: string;
  content: string;
}

export interface ScanContext {
  files: Map<string, FileEntry>;
  rootHandle: FileSystemDirectoryHandle;
}

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

export interface Evidence {
  file: string;
  lines: [number, number];
  snippet: string;
}

export interface DetectedCapability {
  capability: Capability;
  evidence: Evidence[];
}

export interface ScanResult {
  appName: string;
  bundleId: string;
  platformTargets: ("ios" | "android")[];
  capabilities: DetectedCapability[];
}

export type Platform = "google" | "apple" | "both";
export type RiskLevel = "low" | "medium" | "high";

/**
 * Submission intent - determines which steps/rules apply
 */
export type SubmissionIntent = 
  | "internal_testing"
  | "external_testing"
  | "production";

export interface Rule {
  id: string;
  platform: Platform;
  trigger: Capability[];
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
  isBlocking: boolean;
  requires: {
    video: boolean;
    screenshots: boolean;
    reviewerNotes: boolean;
  };
  copy: NonNullable<Rule["copy"]>;
  triggers: Capability[];
  evidence: Evidence[];
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
