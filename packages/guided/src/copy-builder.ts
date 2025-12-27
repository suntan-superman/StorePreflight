/**
 * StorePreflight Copy Builder
 * 
 * Generates pre-filled copy-paste text blocks from scan results
 * and rule evaluations for use in store submission forms.
 */

import type {
  ScanResult,
  RuleEvaluationResult,
  Capability,
} from "@storepreflight/shared";

import type { GeneratedCopy, StoreTarget } from "./types";

// =============================================================================
// MAIN EXPORT
// =============================================================================

export interface BuildCopyInput {
  /** Target store */
  store: StoreTarget;
  /** Scan results */
  scan: ScanResult;
  /** Rule evaluation results */
  evaluation: RuleEvaluationResult;
  /** Optional overrides for generated copy */
  overrides?: Partial<GeneratedCopy>;
}

/**
 * Build pre-generated copy-paste text blocks from scan and evaluation results
 */
export function buildGeneratedCopy(input: BuildCopyInput): GeneratedCopy {
  const { store, scan, evaluation, overrides = {} } = input;

  const capabilities = new Set(scan.capabilities.map((c) => c.capability));
  const hasAuth = capabilities.has("authentication");
  const hasLocationBg = capabilities.has("location_background");
  const hasLocationFg = capabilities.has("location_foreground");
  const hasAnalytics = capabilities.has("analytics");
  const hasPayments = capabilities.has("payments");
  const hasCamera = capabilities.has("camera");
  const hasMicrophone = capabilities.has("microphone");
  const hasNotifications = capabilities.has("notifications");

  // Build app purpose statement
  const appPurpose = overrides.appPurpose ?? buildAppPurpose(scan, capabilities);

  // Build permission justification
  const permissionJustification =
    overrides.permissionJustification ??
    buildPermissionJustification(scan, capabilities, store);

  // Build data safety summary
  const dataSafetySummary =
    overrides.dataSafetySummary ??
    buildDataSafetySummary(scan, capabilities, store);

  // Reviewer notes - only if auth or background location
  const reviewerNotes =
    overrides.reviewerNotes ??
    (hasAuth || hasLocationBg
      ? buildReviewerNotes(scan, capabilities, evaluation)
      : undefined);

  // Export compliance - standard response for most apps
  const exportCompliance =
    overrides.exportCompliance ?? buildExportCompliance(capabilities);

  return {
    appPurpose,
    permissionJustification,
    dataSafetySummary,
    reviewerNotes,
    exportCompliance,
    privacyPolicyUrl: overrides.privacyPolicyUrl,
    supportUrl: overrides.supportUrl,
    termsUrl: overrides.termsUrl,
    marketingUrl: overrides.marketingUrl,
  };
}

// =============================================================================
// GENERATORS
// =============================================================================

function buildAppPurpose(scan: ScanResult, capabilities: Set<Capability>): string {
  const features: string[] = [];

  if (capabilities.has("authentication")) {
    features.push("user authentication");
  }
  if (capabilities.has("location_foreground") || capabilities.has("location_background")) {
    features.push("location-based services");
  }
  if (capabilities.has("camera")) {
    features.push("camera functionality");
  }
  if (capabilities.has("payments")) {
    features.push("payment processing");
  }
  if (capabilities.has("notifications")) {
    features.push("push notifications");
  }
  if (capabilities.has("analytics")) {
    features.push("usage analytics");
  }

  const featureList = features.length > 0 ? features.join(", ") : "core functionality";

  return `${scan.appName} provides ${featureList} to deliver value to users.`;
}

function buildPermissionJustification(
  scan: ScanResult,
  capabilities: Set<Capability>,
  store: StoreTarget
): string {
  const justifications: string[] = [];

  if (capabilities.has("location_background")) {
    justifications.push(
      store === "google"
        ? "Background location access is required to provide continuous location tracking for the core app functionality even when the app is not actively in use."
        : "Background location is used to provide location-based features that require continuous positioning."
    );
  } else if (capabilities.has("location_foreground")) {
    justifications.push(
      "Location access is used to provide location-based features while the app is in active use."
    );
  }

  if (capabilities.has("camera")) {
    justifications.push("Camera access is used for capturing photos or scanning within the app.");
  }

  if (capabilities.has("microphone")) {
    justifications.push("Microphone access is used for audio recording features.");
  }

  if (capabilities.has("photo_library")) {
    justifications.push("Photo library access allows users to select and upload images.");
  }

  if (capabilities.has("notifications")) {
    justifications.push("Push notifications are used to keep users informed of important updates.");
  }

  return justifications.length > 0
    ? justifications.join(" ")
    : "This app uses standard permissions to provide its core functionality.";
}

function buildDataSafetySummary(
  scan: ScanResult,
  capabilities: Set<Capability>,
  store: StoreTarget
): string {
  const collectedData: string[] = [];
  const usages: string[] = [];

  if (capabilities.has("authentication")) {
    collectedData.push("account information (email, name)");
    usages.push("Account management");
  }

  if (capabilities.has("location_foreground") || capabilities.has("location_background")) {
    collectedData.push("location data");
    usages.push("App functionality");
  }

  if (capabilities.has("analytics")) {
    collectedData.push("usage data and analytics");
    usages.push("Analytics and app improvement");
  }

  if (capabilities.has("payments")) {
    collectedData.push("payment information");
    usages.push("Transaction processing");
  }

  if (collectedData.length === 0) {
    return store === "google"
      ? "This app does not collect any user data."
      : "No data is collected from this app.";
  }

  const dataList = collectedData.join(", ");
  const usageList = usages.join("; ");

  return store === "google"
    ? `Data collected: ${dataList}. Data is used for: ${usageList}. Data is not shared with third parties except as required for app functionality.`
    : `This app collects ${dataList} for the following purposes: ${usageList}.`;
}

function buildReviewerNotes(
  scan: ScanResult,
  capabilities: Set<Capability>,
  evaluation: RuleEvaluationResult
): string {
  const notes: string[] = [];

  notes.push(`App: ${scan.appName}`);
  notes.push(`Bundle ID: ${scan.bundleId}`);
  notes.push("");

  if (capabilities.has("authentication")) {
    notes.push("TEST ACCOUNT CREDENTIALS:");
    notes.push("Username: [PLACEHOLDER - Add test account username]");
    notes.push("Password: [PLACEHOLDER - Add test account password]");
    notes.push("");
    notes.push(
      "This test account has full access to all app features for review purposes."
    );
    notes.push("");
  }

  if (capabilities.has("location_background")) {
    notes.push("BACKGROUND LOCATION USAGE:");
    notes.push(
      "The app uses background location to provide continuous tracking functionality."
    );
    notes.push(
      "To test: Enable location permissions, start tracking, then move the app to background."
    );
    notes.push("");
  }

  if (evaluation.summary.high > 0) {
    notes.push("IMPORTANT NOTES FOR REVIEW:");
    notes.push(
      `This submission has ${evaluation.summary.high} high-priority items that have been addressed.`
    );
  }

  return notes.join("\n");
}

function buildExportCompliance(capabilities: Set<Capability>): string {
  // Most apps use HTTPS which is exempt under ECCN 5D992
  return "This app uses encryption (HTTPS) for secure network communication. This encryption is exempt from export compliance requirements under ECCN 5D992 as it uses standard OS-provided encryption APIs.";
}
