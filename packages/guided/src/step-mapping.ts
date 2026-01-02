/**
 * StorePreflight Step Mapping
 * Maps rule/finding IDs to their corresponding guided step IDs
 * 
 * This enables deep-linking from scan results directly to the
 * relevant guided submission step.
 */

import type { StoreTarget } from "./types";
import { googleGuidedCatalog } from "./catalogs/google";
import { appleGuidedCatalog } from "./catalogs/apple";

// =============================================================================
// TYPES
// =============================================================================

export interface StepMapping {
  /** The guided step ID */
  stepId: string;
  /** Human-readable step title */
  title: string;
  /** Section path in store UI (e.g., ["App Review", "Sign-In Information"]) */
  sectionPath: string[];
  /** Target store */
  store: StoreTarget;
}

export interface DeepLinkInfo {
  /** URL path to guided wizard with query param */
  url: string;
  /** Human-readable section path */
  sectionLabel: string;
  /** Step title */
  stepTitle: string;
  /** Step ID for navigation */
  stepId: string;
  /** Target store */
  store: StoreTarget;
}

// =============================================================================
// MAPPING BUILDERS
// =============================================================================

/**
 * Build mapping from rule IDs to step IDs for a given store catalog
 */
function buildRuleToStepMap(
  catalog: typeof googleGuidedCatalog | typeof appleGuidedCatalog
): Map<string, StepMapping> {
  const map = new Map<string, StepMapping>();

  for (const template of catalog) {
    const mapping: StepMapping = {
      stepId: template.id,
      title: template.title,
      sectionPath: template.sectionPath,
      store: template.store,
    };

    // Map each rule ID that activates this step
    if (template.activatesWhenRuleIds) {
      for (const ruleId of template.activatesWhenRuleIds) {
        // If multiple steps map to same rule, prefer the first (more specific)
        if (!map.has(ruleId)) {
          map.set(ruleId, mapping);
        }
      }
    }
  }

  return map;
}

// Pre-built maps for each store
const googleRuleToStepMap = buildRuleToStepMap(googleGuidedCatalog);
const appleRuleToStepMap = buildRuleToStepMap(appleGuidedCatalog);

// =============================================================================
// ADDITIONAL MANUAL MAPPINGS
// =============================================================================

/**
 * Some rules map to steps even if not explicitly in activatesWhenRuleIds.
 * These are additional mappings based on semantic connection.
 */
const additionalAppleMappings: Record<string, StepMapping> = {
  // Export compliance always maps to ASC_EXPORT_COMPLIANCE
  APPLE_EXPORT_COMPLIANCE: {
    stepId: "ASC_EXPORT_COMPLIANCE",
    title: "Export Compliance",
    sectionPath: ["App Review", "Export Compliance"],
    store: "apple",
  },
  // Privacy policy maps to privacy policy step
  PRIVACY_POLICY_REQUIRED: {
    stepId: "ASC_PRIVACY_POLICY",
    title: "Privacy Policy",
    sectionPath: ["App Privacy"],
    store: "apple",
  },
  // Authentication maps to sign-in step
  APPLE_AUTHENTICATION: {
    stepId: "ASC_SIGN_IN",
    title: "Sign-In Information",
    sectionPath: ["App Review", "Sign-In Information"],
    store: "apple",
  },
  // Background location maps to data collection
  APPLE_BG_LOCATION: {
    stepId: "ASC_DATA_COLLECTION",
    title: "Data Collection",
    sectionPath: ["App Privacy"],
    store: "apple",
  },
  // Foreground location maps to data collection  
  APPLE_FG_LOCATION: {
    stepId: "ASC_DATA_COLLECTION",
    title: "Data Collection",
    sectionPath: ["App Privacy"],
    store: "apple",
  },
  // Payments map to... we'll need to add a step for this
  APPLE_PAYMENTS: {
    stepId: "ASC_SIGN_IN", // Use sign-in for now (payments need review access)
    title: "Sign-In Information",
    sectionPath: ["App Review", "Sign-In Information"],
    store: "apple",
  },
  // Notifications - no specific step needed, but map to data collection
  APPLE_NOTIFICATIONS: {
    stepId: "ASC_DATA_COLLECTION",
    title: "Data Collection",
    sectionPath: ["App Privacy"],
    store: "apple",
  },
  // Camera
  APPLE_CAMERA: {
    stepId: "ASC_DATA_COLLECTION",
    title: "Data Collection",
    sectionPath: ["App Privacy"],
    store: "apple",
  },
  // Microphone
  APPLE_MICROPHONE: {
    stepId: "ASC_DATA_COLLECTION",
    title: "Data Collection",
    sectionPath: ["App Privacy"],
    store: "apple",
  },
  // Photo Library
  APPLE_PHOTO_LIBRARY: {
    stepId: "ASC_DATA_COLLECTION",
    title: "Data Collection",
    sectionPath: ["App Privacy"],
    store: "apple",
  },
  // Background tasks
  APPLE_BACKGROUND_TASKS: {
    stepId: "ASC_REVIEW_NOTES",
    title: "Review Notes",
    sectionPath: ["App Review", "Review Notes"],
    store: "apple",
  },
};

const additionalGoogleMappings: Record<string, StepMapping> = {
  // Background location to location declaration
  GOOGLE_BG_LOCATION: {
    stepId: "GP_LOCATION_DECLARATION",
    title: "Location Permission Declaration",
    sectionPath: ["App Content", "Permissions"],
    store: "google",
  },
  // Foreground location
  GOOGLE_FG_LOCATION: {
    stepId: "GP_LOCATION_DECLARATION",
    title: "Location Permission Declaration",
    sectionPath: ["App Content", "Permissions"],
    store: "google",
  },
  // Account deletion
  GOOGLE_ACCOUNT_DELETION: {
    stepId: "GP_ACCOUNT_DELETION",
    title: "Account Deletion",
    sectionPath: ["App Content", "App Access"],
    store: "google",
  },
  // Notifications
  GOOGLE_NOTIFICATIONS: {
    stepId: "GP_DATA_SAFETY",
    title: "Data Safety",
    sectionPath: ["App Content", "Data Safety"],
    store: "google",
  },
  // Camera
  GOOGLE_CAMERA: {
    stepId: "GP_SENSITIVE_PERMISSIONS",
    title: "Sensitive Permissions",
    sectionPath: ["App Content", "Permissions"],
    store: "google",
  },
  // Microphone
  GOOGLE_MICROPHONE: {
    stepId: "GP_SENSITIVE_PERMISSIONS",
    title: "Sensitive Permissions",
    sectionPath: ["App Content", "Permissions"],
    store: "google",
  },
  // Background tasks
  GOOGLE_BACKGROUND_TASKS: {
    stepId: "GP_DATA_SAFETY",
    title: "Data Safety",
    sectionPath: ["App Content", "Data Safety"],
    store: "google",
  },
  // Payments
  GOOGLE_PAYMENTS: {
    stepId: "GP_APP_ACCESS",
    title: "App Access & Login",
    sectionPath: ["App Content", "App Access"],
    store: "google",
  },
  // Privacy policy (both platforms)
  PRIVACY_POLICY_REQUIRED: {
    stepId: "GP_PRIVACY_POLICY",
    title: "Privacy Policy",
    sectionPath: ["App Content", "Privacy Policy"],
    store: "google",
  },
  // Screenshot compliance
  GOOGLE_SCREENSHOT_COMPLIANCE: {
    stepId: "GP_SCREENSHOTS",
    title: "Screenshots",
    sectionPath: ["Store Listing", "Graphics"],
    store: "google",
  },
  // Analytics
  GOOGLE_ANALYTICS: {
    stepId: "GP_DATA_SAFETY",
    title: "Data Safety",
    sectionPath: ["App Content", "Data Safety"],
    store: "google",
  },
  // Photo library
  GOOGLE_PHOTO_LIBRARY: {
    stepId: "GP_SENSITIVE_PERMISSIONS",
    title: "Sensitive Permissions",
    sectionPath: ["App Content", "Permissions"],
    store: "google",
  },
  // File storage
  GOOGLE_FILE_STORAGE: {
    stepId: "GP_DATA_SAFETY",
    title: "Data Safety",
    sectionPath: ["App Content", "Data Safety"],
    store: "google",
  },
  // Maps SDK
  GOOGLE_MAPS_SDK: {
    stepId: "GP_DATA_SAFETY",
    title: "Data Safety",
    sectionPath: ["App Content", "Data Safety"],
    store: "google",
  },
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get the guided step mapping for a given rule/finding ID
 * 
 * @param ruleId - The rule ID (e.g., "APPLE_AUTHENTICATION", "GOOGLE_BG_LOCATION")
 * @param store - Target store ("apple" or "google"). If not provided, infers from rule ID prefix.
 * @returns StepMapping or undefined if no mapping exists
 */
export function getStepMappingForRule(
  ruleId: string,
  store?: StoreTarget
): StepMapping | undefined {
  // Infer store from rule ID prefix if not provided
  const inferredStore = store ?? inferStoreFromRuleId(ruleId);
  
  if (inferredStore === "apple") {
    // Check additional mappings first (more specific)
    if (additionalAppleMappings[ruleId]) {
      return additionalAppleMappings[ruleId];
    }
    return appleRuleToStepMap.get(ruleId);
  } else {
    // Check additional mappings first
    if (additionalGoogleMappings[ruleId]) {
      return additionalGoogleMappings[ruleId];
    }
    return googleRuleToStepMap.get(ruleId);
  }
}

/**
 * Get deep link information for navigating to a guided step from a finding
 * 
 * @param ruleId - The rule ID from the finding
 * @param store - Target store (optional, inferred from rule ID)
 * @returns DeepLinkInfo with URL and display information, or undefined
 */
export function getDeepLinkForFinding(
  ruleId: string,
  store?: StoreTarget
): DeepLinkInfo | undefined {
  const mapping = getStepMappingForRule(ruleId, store);
  if (!mapping) return undefined;

  const sectionLabel = mapping.sectionPath.join(" → ");
  
  return {
    url: `/guided/${mapping.store}?step=${mapping.stepId}`,
    sectionLabel,
    stepTitle: mapping.title,
    stepId: mapping.stepId,
    store: mapping.store,
  };
}

/**
 * Get all deep links for multiple findings (e.g., from scan results)
 * Returns unique links (deduped by stepId per store)
 * 
 * @param ruleIds - Array of rule IDs from findings
 * @param store - Filter to specific store, or get all
 * @returns Array of DeepLinkInfo
 */
export function getDeepLinksForFindings(
  ruleIds: string[],
  store?: StoreTarget
): DeepLinkInfo[] {
  const seen = new Set<string>();
  const links: DeepLinkInfo[] = [];

  for (const ruleId of ruleIds) {
    const link = getDeepLinkForFinding(ruleId, store);
    if (link && !seen.has(`${link.store}:${link.stepId}`)) {
      seen.add(`${link.store}:${link.stepId}`);
      links.push(link);
    }
  }

  return links;
}

/**
 * Infer store from rule ID prefix
 */
function inferStoreFromRuleId(ruleId: string): StoreTarget {
  if (ruleId.startsWith("APPLE_")) return "apple";
  if (ruleId.startsWith("GOOGLE_")) return "google";
  if (ruleId.startsWith("GP_")) return "google";
  if (ruleId.startsWith("ASC_")) return "apple";
  // Default to apple for generic rules like PRIVACY_POLICY_REQUIRED
  return "apple";
}

/**
 * Check if a finding has a corresponding guided step
 */
export function hasGuidedStep(ruleId: string, store?: StoreTarget): boolean {
  return getStepMappingForRule(ruleId, store) !== undefined;
}
