/**
 * StorePreflight Store Console Deep Links
 * 
 * Generates direct links to App Store Connect and Google Play Console
 * sections based on the guided step being viewed.
 * 
 * These links open the actual store console pages where developers
 * need to fill in information.
 */

import type { StoreTarget } from "./types";

// =============================================================================
// TYPES
// =============================================================================

export interface StoreConsoleConfig {
  /** App Store Connect or Play Console app URL */
  appUrl: string;
  /** Extracted App ID */
  appId: string;
  /** Target store */
  store: StoreTarget;
}

export interface StoreConsoleLink {
  /** Full URL to the store console section */
  url: string;
  /** Display label */
  label: string;
  /** Section name in store console */
  section: string;
}

// =============================================================================
// APP STORE CONNECT PATHS
// =============================================================================

/**
 * App Store Connect section paths (appended to base app URL)
 * Base: https://appstoreconnect.apple.com/apps/{APP_ID}
 * 
 * These paths are based on App Store Connect's URL structure as of 2024-2026.
 * Verified against actual App Store Connect URLs.
 */
const APPLE_CONSOLE_PATHS: Record<string, { path: string; section: string }> = {
  // App Information - General tab
  ASC_APP_INFORMATION: {
    path: "/distribution/generalAppInfo",
    section: "General → App Information",
  },
  
  // App Privacy - Privacy section under Distribution
  ASC_PRIVACY_POLICY: {
    path: "/distribution/privacy",
    section: "Distribution → Privacy",
  },
  ASC_DATA_COLLECTION: {
    path: "/distribution/privacy",
    section: "Distribution → Privacy",
  },
  ASC_DATA_USAGE: {
    path: "/distribution/privacy",
    section: "Distribution → Privacy",
  },
  ASC_DATA_TRACKING: {
    path: "/distribution/privacy",
    section: "Distribution → Privacy",
  },
  
  // Pricing & Availability
  ASC_PRICING: {
    path: "/distribution/pricing",
    section: "Distribution → Pricing and Availability",
  },
  ASC_AVAILABILITY: {
    path: "/distribution/pricing",
    section: "Distribution → Pricing and Availability",
  },
  
  // App Review - in the iOS version submission flow
  ASC_SIGN_IN: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → App Review Information",
  },
  ASC_REVIEW_NOTES: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → App Review Information",
  },
  ASC_CONTACT_INFO: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → App Review Information",
  },
  
  // Export Compliance
  ASC_EXPORT_COMPLIANCE: {
    path: "/distribution/encryption",
    section: "Distribution → Encryption",
  },
  
  // Content Rights
  ASC_CONTENT_RIGHTS: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → Content Rights",
  },
  
  // Age Rating
  ASC_AGE_RATING: {
    path: "/distribution/ageRatings",
    section: "Distribution → Age Ratings",
  },
  
  // Version Release
  ASC_RELEASE: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → Version Release",
  },
  ASC_PHASED_RELEASE: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → Phased Release",
  },
  ASC_VERSION_RELEASE: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → Version Release",
  },
  
  // Store Listing - Screenshots & Media
  ASC_SCREENSHOTS: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → Screenshots",
  },
  ASC_APP_PREVIEW: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → App Previews",
  },
  ASC_WHATS_NEW: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → What's New",
  },
  
  // Submit
  ASC_SUBMIT: {
    path: "/distribution/ios/version/inflight",
    section: "iOS App → Submit for Review",
  },
};

// =============================================================================
// GOOGLE PLAY CONSOLE PATHS
// =============================================================================

/**
 * Google Play Console section paths
 * Base: https://play.google.com/console/u/0/developers/{DEV_ID}/app/{APP_ID}
 * 
 * Google Play Console uses a different URL structure with query params.
 */
const GOOGLE_CONSOLE_PATHS: Record<string, { path: string; section: string }> = {
  // App Content
  GP_APP_ACCESS: {
    path: "/app-content/app-access",
    section: "App Content → App Access",
  },
  GP_ACCOUNT_DELETION: {
    path: "/app-content/data-deletion",
    section: "App Content → Data Deletion",
  },
  GP_DATA_SAFETY: {
    path: "/app-content/data-safety",
    section: "App Content → Data Safety",
  },
  GP_PRIVACY_POLICY: {
    path: "/app-content/privacy-policy",
    section: "App Content → Privacy Policy",
  },
  GP_ADS_DECLARATION: {
    path: "/app-content/ads",
    section: "App Content → Ads",
  },
  GP_CONTENT_RATING: {
    path: "/app-content/content-rating",
    section: "App Content → Content Rating",
  },
  GP_TARGET_AUDIENCE: {
    path: "/app-content/target-audience",
    section: "App Content → Target Audience",
  },
  GP_NEWS_APP: {
    path: "/app-content/news",
    section: "App Content → News App",
  },
  GP_COVID_DECLARATION: {
    path: "/app-content/covid",
    section: "App Content → COVID-19 Apps",
  },
  GP_GOVERNMENT_APPS: {
    path: "/app-content/government",
    section: "App Content → Government Apps",
  },
  GP_FINANCIAL_FEATURES: {
    path: "/app-content/financial",
    section: "App Content → Financial Features",
  },
  
  // Permissions
  GP_LOCATION_DECLARATION: {
    path: "/app-content/permissions",
    section: "App Content → Permissions",
  },
  GP_SENSITIVE_PERMISSIONS: {
    path: "/app-content/permissions",
    section: "App Content → Permissions",
  },
  
  // Store Listing
  GP_MAIN_STORE_LISTING: {
    path: "/main-store-listing",
    section: "Store Listing",
  },
  GP_APP_TITLE: {
    path: "/main-store-listing",
    section: "Store Listing → App Name",
  },
  GP_SHORT_DESCRIPTION: {
    path: "/main-store-listing",
    section: "Store Listing → Short Description",
  },
  GP_FULL_DESCRIPTION: {
    path: "/main-store-listing",
    section: "Store Listing → Full Description",
  },
  GP_SCREENSHOTS: {
    path: "/main-store-listing",
    section: "Store Listing → Screenshots",
  },
  GP_FEATURE_GRAPHIC: {
    path: "/main-store-listing",
    section: "Store Listing → Feature Graphic",
  },
  GP_VIDEO: {
    path: "/main-store-listing",
    section: "Store Listing → Video",
  },
  
  // Testing
  GP_INTERNAL_TESTING: {
    path: "/tracks/internal-testing",
    section: "Testing → Internal Testing",
  },
  GP_CLOSED_TESTING: {
    path: "/tracks/closed-testing",
    section: "Testing → Closed Testing",
  },
  GP_OPEN_TESTING: {
    path: "/tracks/open-testing",
    section: "Testing → Open Testing",
  },
  
  // Production
  GP_PRODUCTION: {
    path: "/tracks/production",
    section: "Production",
  },
};

// =============================================================================
// URL PARSING
// =============================================================================

/**
 * Extract App ID from App Store Connect URL
 * Expected format: https://appstoreconnect.apple.com/apps/{APP_ID}/...
 */
export function parseAppleAppUrl(url: string): string | null {
  try {
    const match = url.match(/appstoreconnect\.apple\.com\/apps\/(\d+)/);
    return match && match[1] ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Extract App ID and Developer ID from Google Play Console URL
 * Expected format: https://play.google.com/console/u/0/developers/{DEV_ID}/app/{APP_ID}/...
 */
export function parseGooglePlayUrl(url: string): { devId: string; appId: string } | null {
  try {
    const match = url.match(/play\.google\.com\/console\/.*?\/developers\/(\d+)\/app\/(\d+)/);
    if (match && match[1] && match[2]) {
      return { devId: match[1], appId: match[2] };
    }
    return null;
  } catch {
    return null;
  }
}

// =============================================================================
// LINK GENERATION
// =============================================================================

/**
 * Generate a direct link to App Store Connect for a specific step
 * 
 * @param stepId - The guided step ID (e.g., "ASC_EXPORT_COMPLIANCE")
 * @param appId - The App Store Connect app ID
 * @returns StoreConsoleLink or undefined if no mapping exists
 */
export function getAppleConsoleLink(
  stepId: string,
  appId: string
): StoreConsoleLink | undefined {
  const pathInfo = APPLE_CONSOLE_PATHS[stepId];
  if (!pathInfo) return undefined;

  const baseUrl = `https://appstoreconnect.apple.com/apps/${appId}`;
  
  return {
    url: `${baseUrl}${pathInfo.path}`,
    label: "Open in App Store Connect",
    section: pathInfo.section,
  };
}

/**
 * Generate a direct link to Google Play Console for a specific step
 * 
 * @param stepId - The guided step ID (e.g., "GP_DATA_SAFETY")
 * @param devId - The Google Play developer ID
 * @param appId - The Google Play app ID
 * @returns StoreConsoleLink or undefined if no mapping exists
 */
export function getGoogleConsoleLink(
  stepId: string,
  devId: string,
  appId: string
): StoreConsoleLink | undefined {
  const pathInfo = GOOGLE_CONSOLE_PATHS[stepId];
  if (!pathInfo) return undefined;

  const baseUrl = `https://play.google.com/console/u/0/developers/${devId}/app/${appId}`;
  
  return {
    url: `${baseUrl}${pathInfo.path}`,
    label: "Open in Play Console",
    section: pathInfo.section,
  };
}

/**
 * Get console link for a step based on stored configuration
 * 
 * @param stepId - The guided step ID
 * @param store - Target store ("apple" or "google")
 * @param config - Stored console configuration (app URL, IDs)
 */
export function getConsoleLink(
  stepId: string,
  store: StoreTarget,
  config: { appId: string; devId?: string } | null
): StoreConsoleLink | undefined {
  if (!config) return undefined;

  if (store === "apple") {
    return getAppleConsoleLink(stepId, config.appId);
  } else {
    if (!config.devId) return undefined;
    return getGoogleConsoleLink(stepId, config.devId, config.appId);
  }
}

/**
 * Validate and parse a store console URL
 * Returns the extracted IDs if valid, or null if invalid
 */
export function parseStoreUrl(
  url: string,
  store: StoreTarget
): { appId: string; devId?: string } | null {
  if (store === "apple") {
    const appId = parseAppleAppUrl(url);
    return appId ? { appId } : null;
  } else {
    const result = parseGooglePlayUrl(url);
    return result ? { appId: result.appId, devId: result.devId } : null;
  }
}

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const CONSOLE_CONFIG_KEYS = {
  APPLE: "storepreflight_apple_console_config",
  GOOGLE: "storepreflight_google_console_config",
} as const;
