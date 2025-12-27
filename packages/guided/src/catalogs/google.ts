/**
 * Google Play Store Guided Submission Catalog
 * Step templates for Google Play Console submission flow
 * 
 * Based on: GOOGLE PLAY GUIDED SUBMISSION MAP.md
 * Rule IDs from: rules.v1.json
 * 
 * Intent filtering:
 * - internal_testing: Only compliance steps (App Content), no store listing
 * - external_testing: Compliance + minimal store presence
 * - production: Full requirements including marketing assets
 */

import type { SubmissionIntent } from "@storepreflight/shared";
import type { GuidedStepTemplate } from "../types";

/** Steps required for ALL submission intents */
const ALL_INTENTS: SubmissionIntent[] = [
  "internal_testing",
  "external_testing",
  "production",
];

/** Steps only required for external testing and production */
const EXTERNAL_AND_PRODUCTION: SubmissionIntent[] = [
  "external_testing",
  "production",
];

/** Steps only required for production release */
const PRODUCTION_ONLY: SubmissionIntent[] = ["production"];

/**
 * Section ordering for Google Play Console
 * Used for deterministic step ordering
 */
export const GOOGLE_SECTION_ORDER = [
  "App Content",
  "Store Listing",
  "Testing",
  "Review & Publish",
] as const;

export const googleGuidedCatalog: GuidedStepTemplate[] = [
  // ==========================================================================
  // SECTION: App Content
  // ==========================================================================

  {
    id: "GP_APP_ACCESS",
    store: "google",
    appliesTo: ALL_INTENTS,
    sectionPath: ["App Content", "App Access"],
    title: "App Access & Login",
    description: "Declare whether your app requires authentication",
    whyThisExists:
      "Google reviewers must be able to access all app functionality during review.",
    activatesWhenRuleIds: ["GOOGLE_ACCOUNT_DELETION"],
    activatesWhenCapabilities: ["authentication"],
    blockingDefault: true,
    instructions: [
      {
        type: "select",
        label: "Does your app require users to log in?",
        valueTemplate: "Yes",
      },
      {
        type: "paste",
        label: "Paste reviewer login instructions",
        valueTemplate: "{{generated.reviewerNotes}}",
      },
    ],
    completionCriteria: [
      "Login requirement declared",
      "Reviewer credentials provided",
    ],
    warnings: [
      "Missing or invalid credentials will result in rejection.",
      "Credentials must allow access to all app features.",
    ],
  },

  {
    id: "GP_ACCOUNT_DELETION",
    store: "google",
    appliesTo: ALL_INTENTS,
    sectionPath: ["App Content", "App Access"],
    title: "Account Deletion",
    description: "Confirm in-app account deletion support",
    whyThisExists:
      "Apps with user accounts must allow users to delete their account directly within the app.",
    activatesWhenRuleIds: ["GOOGLE_ACCOUNT_DELETION"],
    activatesWhenCapabilities: ["authentication"],
    blockingDefault: true,
    instructions: [
      {
        type: "select",
        label: "Does your app support account deletion?",
        valueTemplate: "Yes",
      },
      {
        type: "verify",
        label: "Confirm deletion is available inside the app settings",
      },
      {
        type: "verify",
        label: "Confirm deletion removes all user data",
      },
    ],
    completionCriteria: [
      "Account deletion option confirmed in app",
      "Deletion process clearly accessible to users",
    ],
  },

  {
    id: "GP_LOCATION_FOREGROUND",
    store: "google",
    appliesTo: ALL_INTENTS,
    sectionPath: ["App Content", "Location Permissions"],
    title: "Foreground Location Access",
    description: "Declare foreground location usage and provide justification",
    whyThisExists:
      "Google requires justification for any location access to ensure user privacy.",
    activatesWhenRuleIds: ["GOOGLE_FG_LOCATION"],
    activatesWhenCapabilities: ["location_foreground"],
    blockingDefault: true,
    instructions: [
      {
        type: "select",
        label: "Does your app access location in the foreground?",
        valueTemplate: "Yes",
      },
      {
        type: "paste",
        label: "Paste permission justification",
        valueTemplate: "{{generated.permissionJustification}}",
      },
    ],
    completionCriteria: [
      "Foreground location declared",
      "Justification explains core feature usage",
    ],
  },

  {
    id: "GP_LOCATION_BACKGROUND",
    store: "google",
    appliesTo: ALL_INTENTS,
    sectionPath: ["App Content", "Location Permissions"],
    title: "Background Location Access",
    description: "Declare and justify background location usage",
    whyThisExists:
      "Background location access requires explicit Google approval and a walkthrough video demonstrating in-app usage.",
    activatesWhenRuleIds: ["GOOGLE_BG_LOCATION"],
    activatesWhenCapabilities: ["location_background"],
    blockingDefault: true,
    instructions: [
      {
        type: "select",
        label: "Does your app access location in the background?",
        valueTemplate: "Yes",
      },
      {
        type: "paste",
        label: "Paste background location justification",
        valueTemplate: "{{generated.permissionJustification}}",
      },
    ],
    artifacts: [
      {
        type: "video",
        required: true,
        description:
          "YouTube video demonstrating background location usage in-app (unlisted link)",
      },
    ],
    completionCriteria: [
      "Background location declared",
      "Justification clearly explains necessity",
      "Video URL added showing in-app usage",
    ],
    warnings: [
      "Video must clearly demonstrate in-app background usage.",
      "Generic or unclear videos will result in rejection.",
      "Video should show the user flow from enabling to active background tracking.",
    ],
  },

  {
    id: "GP_DATA_SAFETY",
    store: "google",
    appliesTo: EXTERNAL_AND_PRODUCTION,
    sectionPath: ["App Content", "Data Safety"],
    title: "Data Safety Declaration",
    description: "Complete Google's Data Safety form with accurate information",
    whyThisExists:
      "Google requires transparency around user data collection, sharing, and security practices.",
    activatesWhenRuleIds: [
      "GOOGLE_FG_LOCATION",
      "GOOGLE_BG_LOCATION",
      "GOOGLE_ACCOUNT_DELETION",
      "GOOGLE_ANALYTICS",
      "GOOGLE_PAYMENTS",
    ],
    activatesWhenCapabilities: [
      "location_foreground",
      "location_background",
      "authentication",
      "analytics",
      "payments",
    ],
    blockingDefault: true,
    instructions: [
      {
        type: "verify",
        label: "Review StorePreflight Data Summary for detected data types",
      },
      {
        type: "verify",
        label: "Match Data Safety answers to actual app behavior",
      },
      {
        type: "verify",
        label: "Declare all third-party SDKs that collect data",
      },
    ],
    completionCriteria: [
      "All Data Safety questions answered",
      "Answers match app's actual data practices",
    ],
    warnings: [
      "Inconsistent answers are a common cause of rejection.",
      "Undisclosed data collection will trigger policy violations.",
    ],
  },

  {
    id: "GP_CAMERA_PERMISSIONS",
    store: "google",
    appliesTo: ALL_INTENTS,
    sectionPath: ["App Content", "Sensitive Permissions"],
    title: "Camera Permission",
    description: "Declare camera usage and justification",
    whyThisExists: "Camera access requires clear justification for user privacy.",
    activatesWhenRuleIds: ["GOOGLE_CAMERA"],
    activatesWhenCapabilities: ["camera"],
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "Confirm camera is used for core app functionality",
      },
      {
        type: "paste",
        label: "Paste camera permission justification",
        valueTemplate: "{{generated.permissionJustification}}",
      },
    ],
    completionCriteria: ["Camera usage declared and justified"],
  },

  {
    id: "GP_MICROPHONE_PERMISSIONS",
    store: "google",
    appliesTo: ALL_INTENTS,
    sectionPath: ["App Content", "Sensitive Permissions"],
    title: "Microphone Permission",
    description: "Declare microphone usage and justification",
    whyThisExists: "Microphone access requires clear justification for user privacy.",
    activatesWhenRuleIds: ["GOOGLE_MICROPHONE"],
    activatesWhenCapabilities: ["microphone"],
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "Confirm microphone is used for core app functionality",
      },
      {
        type: "paste",
        label: "Paste microphone permission justification",
        valueTemplate: "{{generated.permissionJustification}}",
      },
    ],
    completionCriteria: ["Microphone usage declared and justified"],
  },

  // ==========================================================================
  // SECTION: Store Listing
  // ==========================================================================

  {
    id: "GP_STORE_DETAILS",
    store: "google",
    appliesTo: EXTERNAL_AND_PRODUCTION,
    sectionPath: ["Store Listing", "Main Store Listing"],
    title: "App Details",
    description: "Confirm app name, description, and category",
    whyThisExists:
      "Store listing metadata must accurately represent app functionality.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "App name matches StorePreflight scan: {{app.appName}}",
      },
      {
        type: "verify",
        label: "Short description accurately reflects app purpose",
      },
      {
        type: "verify",
        label: "Full description covers all major features",
      },
      {
        type: "verify",
        label: "App category matches primary functionality",
      },
    ],
    completionCriteria: [
      "Store listing details reviewed and accurate",
    ],
  },

  {
    id: "GP_SCREENSHOTS",
    store: "google",
    appliesTo: PRODUCTION_ONLY,
    sectionPath: ["Store Listing", "Screenshots"],
    title: "Upload Screenshots",
    description: "Upload Play-compliant screenshots",
    whyThisExists:
      "Invalid screenshots can block review and prevent promotion eligibility.",
    activatesWhenRuleIds: ["GOOGLE_SCREENSHOT_COMPLIANCE"],
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "upload",
        label: "Upload phone screenshots (16:9 or 9:16, min 1080px shortest side)",
      },
      {
        type: "verify",
        label: "At least 4 screenshots uploaded for phones",
      },
      {
        type: "verify",
        label: "Screenshots show actual app UI (no misleading images)",
      },
    ],
    completionCriteria: [
      "Minimum 4 screenshots uploaded",
      "All screenshots meet size requirements (320-3840px each side)",
      "Screenshots accurately represent app",
    ],
    warnings: [
      "Screenshots must be 16:9 or 9:16 aspect ratio.",
      "For promotion eligibility, shortest side must be at least 1080px.",
    ],
  },

  {
    id: "GP_FEATURE_GRAPHIC",
    store: "google",
    appliesTo: PRODUCTION_ONLY,
    sectionPath: ["Store Listing", "Feature Graphic"],
    title: "Feature Graphic",
    description: "Upload Play Store feature graphic",
    whyThisExists:
      "Feature graphic is required for visibility in search and promotion.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "upload",
        label: "Upload 1024×500 feature graphic (PNG or JPEG)",
      },
      {
        type: "verify",
        label: "Graphic clearly represents app brand/purpose",
      },
    ],
    completionCriteria: ["Feature graphic uploaded"],
  },

  {
    id: "GP_APP_ICON",
    store: "google",
    appliesTo: EXTERNAL_AND_PRODUCTION,
    sectionPath: ["Store Listing", "App Icon"],
    title: "App Icon",
    description: "Upload high-resolution app icon",
    whyThisExists: "App icon is required for store listing visibility.",
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "upload",
        label: "Upload 512×512 PNG app icon",
      },
      {
        type: "verify",
        label: "Icon has no alpha transparency in background",
      },
    ],
    completionCriteria: ["App icon uploaded and meets requirements"],
  },

  // ==========================================================================
  // SECTION: Testing
  // ==========================================================================

  {
    id: "GP_TESTING",
    store: "google",
    appliesTo: ALL_INTENTS,
    sectionPath: ["Testing", "Internal Testing"],
    title: "Internal Testing",
    description: "Ensure internal testing track is configured",
    whyThisExists:
      "Google recommends testing before production release to catch issues early.",
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "verify",
        label: "Internal testing track created",
      },
      {
        type: "verify",
        label: "At least one tester email added",
      },
      {
        type: "verify",
        label: "Test build uploaded and available for installation",
      },
    ],
    completionCriteria: [
      "Testing track active",
      "Testers can install the app",
    ],
  },

  // ==========================================================================
  // SECTION: Review & Publish
  // ==========================================================================

  {
    id: "GP_CONTENT_RATING",
    store: "google",
    appliesTo: EXTERNAL_AND_PRODUCTION,
    sectionPath: ["Review & Publish", "Content Rating"],
    title: "Content Rating",
    description: "Complete content rating questionnaire",
    whyThisExists:
      "Content ratings are required in all territories and affect app discoverability.",
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "verify",
        label: "Complete IARC content rating questionnaire",
      },
      {
        type: "verify",
        label: "Answers accurately reflect app content",
      },
    ],
    completionCriteria: ["Content rating questionnaire completed"],
  },

  {
    id: "GP_TARGET_AUDIENCE",
    store: "google",
    appliesTo: EXTERNAL_AND_PRODUCTION,
    sectionPath: ["Review & Publish", "Target Audience"],
    title: "Target Audience",
    description: "Declare target age group",
    whyThisExists:
      "Apps must declare whether they target children for COPPA/GDPR compliance.",
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "select",
        label: "Select target age group",
        valueTemplate: "18 and over",
      },
      {
        type: "verify",
        label: "Confirm app does not target children under 13",
      },
    ],
    completionCriteria: ["Target audience declared"],
    warnings: [
      "Apps targeting children have additional requirements.",
      "False declaration can result in app removal.",
    ],
  },

  {
    id: "GP_REVIEW_PUBLISH",
    store: "google",
    appliesTo: PRODUCTION_ONLY,
    sectionPath: ["Review & Publish", "Submit"],
    title: "Review & Publish",
    description: "Final review and submit for Google review",
    whyThisExists: "Final confirmation before Google review process begins.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "All blocking steps completed (check sidebar)",
      },
      {
        type: "verify",
        label: "No unresolved policy issues remain",
      },
      {
        type: "verify",
        label: "Release notes added for this version",
      },
    ],
    completionCriteria: [
      "All requirements met",
      "App submitted to Google for review",
    ],
  },
];
