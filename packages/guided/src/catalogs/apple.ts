/**
 * Apple App Store Connect Guided Submission Catalog
 * Step templates for App Store Connect submission flow
 * 
 * Based on: APP STORE GUIDED SUBMISSION MAP.md
 * Rule IDs from: rules.v1.json
 */

import type { GuidedStepTemplate } from "../types";

/**
 * Section ordering for App Store Connect
 * Used for deterministic step ordering
 */
export const APPLE_SECTION_ORDER = [
  "App Information",
  "App Privacy",
  "Pricing & Availability",
  "App Review",
  "Version Release",
  "Submit for Review",
] as const;

export const appleGuidedCatalog: GuidedStepTemplate[] = [
  // ==========================================================================
  // SECTION: App Information
  // ==========================================================================

  {
    id: "ASC_APP_INFORMATION",
    store: "apple",
    sectionPath: ["App Information"],
    title: "App Information",
    description: "Verify app name, category, and bundle ID",
    whyThisExists:
      "Apple uses this information to classify and route your app for review.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "App name matches StorePreflight scan: {{app.appName}}",
      },
      {
        type: "verify",
        label: "Bundle ID matches: {{app.bundleId}}",
      },
      {
        type: "verify",
        label: "Primary category matches app functionality",
      },
      {
        type: "verify",
        label: "Subtitle (if used) is accurate and not keyword-stuffed",
      },
    ],
    completionCriteria: ["App information reviewed and accurate"],
  },

  // ==========================================================================
  // SECTION: App Privacy
  // ==========================================================================

  {
    id: "ASC_PRIVACY_POLICY",
    store: "apple",
    sectionPath: ["App Privacy"],
    title: "Privacy Policy",
    description: "Provide a valid privacy policy URL",
    whyThisExists:
      "Apple requires all apps to have a publicly accessible privacy policy.",
    activatesWhenRuleIds: ["PRIVACY_POLICY_REQUIRED"],
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "paste",
        label: "Paste privacy policy URL",
        valueTemplate: "{{generated.privacyPolicyUrl}}",
      },
      {
        type: "verify",
        label: "Privacy policy is publicly accessible (not behind login)",
      },
      {
        type: "verify",
        label: "Policy describes data collection and usage practices",
      },
    ],
    completionCriteria: ["Privacy policy URL provided and accessible"],
  },

  {
    id: "ASC_DATA_COLLECTION",
    store: "apple",
    sectionPath: ["App Privacy"],
    title: "Data Collection",
    description: "Declare all collected data types",
    whyThisExists:
      "Apple requires transparent disclosure of all collected user data for App Privacy Labels.",
    activatesWhenRuleIds: [
      "APPLE_FG_LOCATION",
      "APPLE_BG_LOCATION",
      "APPLE_AUTHENTICATION",
    ],
    activatesWhenCapabilities: [
      "location_foreground",
      "location_background",
      "authentication",
      "analytics",
    ],
    blockingDefault: true,
    instructions: [
      {
        type: "verify",
        label: "Review StorePreflight Data Summary for detected data types",
      },
      {
        type: "verify",
        label: "Declare all data types collected by your app",
      },
      {
        type: "verify",
        label: "Include data collected by third-party SDKs",
      },
    ],
    completionCriteria: [
      "All data collection types declared",
      "Declarations match actual app behavior",
    ],
    warnings: [
      "Inconsistent declarations are a common cause of rejection.",
      "Apple may verify declarations against actual app behavior.",
    ],
  },

  {
    id: "ASC_DATA_USAGE",
    store: "apple",
    sectionPath: ["App Privacy"],
    title: "Data Usage Purpose",
    description: "Explain why each data type is collected",
    whyThisExists:
      "Apple evaluates whether data collection is justified for app functionality.",
    activatesWhenCapabilities: [
      "location_foreground",
      "location_background",
      "analytics",
      "authentication",
    ],
    blockingDefault: true,
    instructions: [
      {
        type: "verify",
        label: "For each data type, select appropriate usage purpose",
      },
      {
        type: "verify",
        label: "Ensure purposes match detected capabilities",
      },
      {
        type: "verify",
        label: "Declare whether data is linked to user identity",
      },
    ],
    completionCriteria: [
      "Data usage purposes declared for all collected data",
    ],
  },

  {
    id: "ASC_DATA_TRACKING",
    store: "apple",
    sectionPath: ["App Privacy"],
    title: "Tracking Declaration",
    description: "Declare if your app tracks users across apps/websites",
    whyThisExists:
      "Apps that track users must request App Tracking Transparency permission.",
    activatesWhenCapabilities: ["analytics"],
    blockingDefault: true,
    instructions: [
      {
        type: "select",
        label: "Does your app track users for advertising?",
        valueTemplate: "No",
      },
      {
        type: "verify",
        label: "If yes, ATT prompt is implemented in app",
      },
    ],
    completionCriteria: ["Tracking declaration completed"],
    warnings: [
      "Tracking without ATT permission will result in rejection.",
    ],
  },

  // ==========================================================================
  // SECTION: Pricing & Availability
  // ==========================================================================

  {
    id: "ASC_PRICING",
    store: "apple",
    sectionPath: ["Pricing & Availability"],
    title: "Pricing",
    description: "Confirm app pricing model",
    whyThisExists:
      "Apple needs to know how users access your app (free, paid, freemium).",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "Price tier selected (or Free)",
      },
      {
        type: "verify",
        label: "Pricing matches in-app behavior",
      },
    ],
    completionCriteria: ["Pricing configuration reviewed"],
  },

  {
    id: "ASC_AVAILABILITY",
    store: "apple",
    sectionPath: ["Pricing & Availability"],
    title: "Availability",
    description: "Select territories where app will be available",
    whyThisExists: "Controls which App Store regions can download your app.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "Select target territories",
      },
      {
        type: "verify",
        label: "Confirm app complies with local laws in selected territories",
      },
    ],
    completionCriteria: ["Territory availability configured"],
  },

  // ==========================================================================
  // SECTION: App Review
  // ==========================================================================

  {
    id: "ASC_SIGN_IN",
    store: "apple",
    sectionPath: ["App Review", "Sign-In Information"],
    title: "Sign-In Information",
    description: "Provide reviewer access credentials",
    whyThisExists:
      "Apple reviewers must be able to access all app features during review.",
    activatesWhenRuleIds: ["APPLE_AUTHENTICATION"],
    activatesWhenCapabilities: ["authentication"],
    blockingDefault: true,
    instructions: [
      {
        type: "paste",
        label: "Paste reviewer username",
        valueTemplate: "{{generated.reviewerNotes}}",
      },
      {
        type: "verify",
        label: "Test account has access to all features",
      },
      {
        type: "verify",
        label: "Account is not rate-limited or geo-restricted",
      },
    ],
    completionCriteria: [
      "Reviewer credentials provided",
      "Credentials tested and working",
    ],
    warnings: [
      "Invalid credentials will result in immediate rejection.",
      "Provide a dedicated test account, not a personal account.",
    ],
  },

  {
    id: "ASC_REVIEW_NOTES",
    store: "apple",
    sectionPath: ["App Review", "Review Notes"],
    title: "Review Notes",
    description: "Explain app behavior, permissions, and special features",
    whyThisExists:
      "Reviewers rely on notes to understand non-obvious functionality and permissions.",
    activatesWhenRuleIds: ["APPLE_BG_LOCATION", "APPLE_BACKGROUND_TASKS"],
    activatesWhenCapabilities: ["location_background", "background_tasks"],
    blockingDefault: true,
    instructions: [
      {
        type: "paste",
        label: "Paste review notes explaining app behavior",
        valueTemplate: "{{generated.reviewerNotes}}",
      },
      {
        type: "verify",
        label: "Notes explain all permission usage",
      },
      {
        type: "verify",
        label: "Notes describe how to test key features",
      },
    ],
    completionCriteria: ["Review notes provided"],
    warnings: [
      "Thorough notes significantly reduce rejection risk.",
      "Explain any background activity clearly.",
    ],
  },

  {
    id: "ASC_CONTACT_INFO",
    store: "apple",
    sectionPath: ["App Review", "Contact Information"],
    title: "Contact Information",
    description: "Provide contact details for review team",
    whyThisExists:
      "Apple may need to contact you during review for clarification.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "Contact name is accurate",
      },
      {
        type: "verify",
        label: "Phone number is valid and monitored",
      },
      {
        type: "verify",
        label: "Email address is valid and monitored",
      },
    ],
    completionCriteria: ["Contact information verified"],
  },

  {
    id: "ASC_EXPORT_COMPLIANCE",
    store: "apple",
    sectionPath: ["App Review", "Export Compliance"],
    title: "Export Compliance",
    description: "Declare encryption usage for export regulations",
    whyThisExists:
      "Apple must ensure compliance with US export regulations for encryption.",
    activatesWhenRuleIds: ["APPLE_EXPORT_COMPLIANCE"],
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "select",
        label: "Does your app use encryption?",
        valueTemplate: "Yes",
      },
      {
        type: "select",
        label: "Is encryption limited to standard HTTPS/TLS?",
        valueTemplate: "Yes",
      },
      {
        type: "verify",
        label: "If using custom encryption, provide CCATS or exemption documentation",
      },
    ],
    completionCriteria: ["Export compliance questions completed"],
    warnings: [
      "Most apps using only HTTPS qualify for exemption.",
      "Custom encryption algorithms may require additional documentation.",
    ],
  },

  {
    id: "ASC_CONTENT_RIGHTS",
    store: "apple",
    sectionPath: ["App Review", "Content Rights"],
    title: "Content Rights",
    description: "Confirm you have rights to all app content",
    whyThisExists:
      "Apple requires assurance that you own or license all content in your app.",
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "select",
        label: "Do you have rights to all content in your app?",
        valueTemplate: "Yes",
      },
      {
        type: "verify",
        label: "All images, fonts, and media are properly licensed",
      },
    ],
    completionCriteria: ["Content rights confirmed"],
  },

  {
    id: "ASC_AGE_RATING",
    store: "apple",
    sectionPath: ["App Review", "Age Rating"],
    title: "Age Rating",
    description: "Complete age rating questionnaire",
    whyThisExists:
      "Age ratings are required for all apps and affect discoverability.",
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "verify",
        label: "Complete age rating questionnaire accurately",
      },
      {
        type: "verify",
        label: "Answers reflect actual app content",
      },
    ],
    completionCriteria: ["Age rating questionnaire completed"],
  },

  // ==========================================================================
  // SECTION: Version Release
  // ==========================================================================

  {
    id: "ASC_RELEASE",
    store: "apple",
    sectionPath: ["Version Release"],
    title: "Release Options",
    description: "Choose how your app is released after approval",
    whyThisExists: "Controls when users can download the app after approval.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "select",
        label: "Release option",
        valueTemplate: "Automatically release this version",
      },
      {
        type: "verify",
        label: "Confirm release timing matches your launch plan",
      },
    ],
    completionCriteria: ["Release option selected"],
  },

  {
    id: "ASC_PHASED_RELEASE",
    store: "apple",
    sectionPath: ["Version Release"],
    title: "Phased Release",
    description: "Configure phased release for updates",
    whyThisExists:
      "Phased release gradually rolls out updates, allowing you to catch issues early.",
    alwaysInclude: false,
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "Decide whether to use phased release for this update",
      },
    ],
    completionCriteria: ["Phased release decision made"],
  },

  // ==========================================================================
  // SECTION: Submit for Review
  // ==========================================================================

  {
    id: "ASC_SCREENSHOTS",
    store: "apple",
    sectionPath: ["Submit for Review", "Screenshots"],
    title: "Screenshots",
    description: "Upload App Store screenshots for all device sizes",
    whyThisExists:
      "Screenshots are required for app visibility and accurately represent your app.",
    alwaysInclude: true,
    blockingDefault: true,
    instructions: [
      {
        type: "upload",
        label: "Upload 6.7\" display screenshots (iPhone 14 Pro Max)",
      },
      {
        type: "upload",
        label: "Upload 6.5\" display screenshots (iPhone 11 Pro Max)",
      },
      {
        type: "upload",
        label: "Upload 5.5\" display screenshots (iPhone 8 Plus)",
      },
      {
        type: "verify",
        label: "Screenshots show actual app UI",
      },
    ],
    completionCriteria: [
      "Required screenshot sizes uploaded",
      "Screenshots accurately represent app",
    ],
  },

  {
    id: "ASC_APP_PREVIEW",
    store: "apple",
    sectionPath: ["Submit for Review", "App Preview"],
    title: "App Preview Video",
    description: "Upload optional app preview video",
    whyThisExists: "Preview videos can significantly increase conversion rates.",
    alwaysInclude: false,
    blockingDefault: false,
    instructions: [
      {
        type: "upload",
        label: "Upload app preview video (15-30 seconds)",
      },
      {
        type: "verify",
        label: "Video shows actual app functionality",
      },
    ],
    completionCriteria: ["App preview uploaded (optional)"],
  },

  {
    id: "ASC_WHATS_NEW",
    store: "apple",
    sectionPath: ["Submit for Review", "What's New"],
    title: "What's New",
    description: "Describe changes in this version",
    whyThisExists: "Users see this text when updating your app.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "paste",
        label: "Enter release notes describing this version's changes",
      },
      {
        type: "verify",
        label: "Notes are clear and helpful to users",
      },
    ],
    completionCriteria: ["What's New text provided"],
  },

  {
    id: "ASC_SUBMIT",
    store: "apple",
    sectionPath: ["Submit for Review"],
    title: "Submit for Review",
    description: "Final review and submit to Apple",
    whyThisExists: "Final confirmation before Apple review process begins.",
    alwaysInclude: true,
    blockingDefault: false,
    instructions: [
      {
        type: "verify",
        label: "All blocking steps completed",
      },
      {
        type: "verify",
        label: "App icon and screenshots uploaded",
      },
      {
        type: "verify",
        label: "Build selected for submission",
      },
      {
        type: "verify",
        label: "No unresolved issues in App Store Connect",
      },
    ],
    completionCriteria: [
      "All requirements met",
      "App submitted to Apple for review",
    ],
  },
];
