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

// Catalogs
export { googleGuidedCatalog, GOOGLE_SECTION_ORDER } from "./catalogs/google";
export { appleGuidedCatalog, APPLE_SECTION_ORDER } from "./catalogs/apple";
