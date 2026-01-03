/**
 * StorePreflight Guided Submission Package
 * Public API exports
 */

// Types
export type {
  StoreTarget,
  GeneratedCopy,
  GuidedInstructionType,
  GuidedInstruction,
  GuidedInstructionTemplate,
  GuidedArtifactType,
  GuidedArtifact,
  GuidedArtifactTemplate,
  GuidedStep,
  GuidedStepTemplate,
  GuidedFlowSummary,
  GuidedSubmissionFlow,
  StepProgress,
  GuidedSession,
  BuildGuidedFlowInput,
  TemplateContext,
} from "./types";

// Engine
export { buildGuidedFlow } from "./engine";

// Copy Builder
export { buildGeneratedCopy } from "./copy-builder";

// Step Mapping (for deep-linking from findings to steps)
export type { StepMapping, DeepLinkInfo } from "./step-mapping";
export {
  getStepMappingForRule,
  getDeepLinkForFinding,
  getDeepLinksForFindings,
  hasGuidedStep,
} from "./step-mapping";

// Store Console Links (direct links to App Store Connect / Play Console)
export type { StoreConsoleConfig, StoreConsoleLink } from "./store-links";
export {
  parseAppleAppUrl,
  parseGooglePlayUrl,
  parseStoreUrl,
  getAppleConsoleLink,
  getGoogleConsoleLink,
  getConsoleLink,
  CONSOLE_CONFIG_KEYS,
} from "./store-links";

// Catalogs
export { googleGuidedCatalog, GOOGLE_SECTION_ORDER } from "./catalogs/google";
export { appleGuidedCatalog, APPLE_SECTION_ORDER } from "./catalogs/apple";
