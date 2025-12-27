StorePreflight — Google Play Guided Submission Map
Complete Step-by-Step Submission Companion
1. Purpose

This document defines the authoritative guided submission flow for Google Play Console.

It translates:

Store policies

Detected capabilities

Rule Pack results

Into step-aware, copy-paste-ready guidance that walks developers through submission without surprises.

2. Design Principles

No automation of Play Console

No DOM scraping

No assumptions about UI layout

Guidance follows policy, not UI

User remains in control at all times

3. Top-Level Play Console Sections (Mental Model)

Google Play submission always revolves around:

App Content

Store Listing

Testing

Release

Review & Publish

Guided steps are grouped under these sections.

4. Guided Submission Flow (Google Play)
GuidedSubmissionFlow {
  store: "google",
  steps: GuidedStep[]
}

5. SECTION: App Content
5.1 App Access (Login Required)
{
  id: "GP_APP_ACCESS",
  store: "google",
  sectionPath: ["App Content", "App Access"],
  title: "App Access & Login",
  description: "Declare whether your app requires authentication",
  whyThisExists: "Google reviewers must be able to access all app functionality during review.",
  blocking: true,
  triggeredByRuleIds: ["GOOGLE_ACCOUNT_DELETION", "AUTHENTICATION"],
  instructions: [
    { type: "select", label: "Does your app require users to log in?", value: "Yes" },
    { type: "paste", label: "Paste reviewer login instructions", value: "{{generated.reviewerNotes}}" }
  ],
  completionCriteria: [
    "Login requirement declared",
    "Reviewer credentials provided"
  ],
  warnings: [
    "Missing or invalid credentials will result in rejection."
  ]
}

5.2 App Access — Account Deletion
{
  id: "GP_ACCOUNT_DELETION",
  store: "google",
  sectionPath: ["App Content", "App Access"],
  title: "Account Deletion",
  description: "Confirm in-app account deletion support",
  whyThisExists: "Apps with authentication must allow users to delete their account.",
  blocking: true,
  triggeredByRuleIds: ["GOOGLE_ACCOUNT_DELETION"],
  instructions: [
    { type: "select", label: "Does your app support account deletion?", value: "Yes" },
    { type: "verify", label: "Confirm deletion is available inside the app" }
  ],
  completionCriteria: [
    "Account deletion confirmed"
  ]
}

5.3 Location Permissions (Foreground)
{
  id: "GP_LOCATION_FOREGROUND",
  store: "google",
  sectionPath: ["App Content", "Location Permissions"],
  title: "Foreground Location Access",
  description: "Declare foreground location usage",
  whyThisExists: "Google requires justification for any location access.",
  blocking: true,
  triggeredByRuleIds: ["GOOGLE_FG_LOCATION"],
  instructions: [
    { type: "select", label: "Does your app access location in the foreground?", value: "Yes" },
    { type: "paste", label: "Paste justification", value: "{{generated.permissionJustification}}" }
  ],
  completionCriteria: [
    "Foreground location declared",
    "Justification pasted"
  ]
}

5.4 Location Permissions (Background)
{
  id: "GP_LOCATION_BACKGROUND",
  store: "google",
  sectionPath: ["App Content", "Location Permissions"],
  title: "Background Location Access",
  description: "Declare and justify background location usage",
  whyThisExists: "Background location access requires explicit approval and a walkthrough video.",
  blocking: true,
  triggeredByRuleIds: ["GOOGLE_BG_LOCATION"],
  instructions: [
    { type: "select", label: "Does your app access location in the background?", value: "Yes" },
    { type: "paste", label: "Paste justification", value: "{{generated.permissionJustification}}" }
  ],
  artifacts: [
    {
      type: "video",
      required: true,
      description: "YouTube video showing background location usage inside the app"
    }
  ],
  completionCriteria: [
    "Background location declared",
    "Justification pasted",
    "Video URL added"
  ],
  warnings: [
    "Video must clearly demonstrate in-app usage or approval will be denied."
  ]
}

5.5 Data Safety
{
  id: "GP_DATA_SAFETY",
  store: "google",
  sectionPath: ["App Content", "Data Safety"],
  title: "Data Safety Declaration",
  description: "Declare collected, shared, and protected data",
  whyThisExists: "Google requires transparency around user data usage.",
  blocking: true,
  triggeredByRuleIds: ["ANALYTICS", "LOCATION", "AUTHENTICATION"],
  instructions: [
    { type: "verify", label: "Match Data Safety answers to StorePreflight summary" }
  ],
  completionCriteria: [
    "All Data Safety questions answered"
  ],
  warnings: [
    "Inconsistent answers frequently trigger rejection."
  ]
}

6. SECTION: Store Listing
6.1 App Details
{
  id: "GP_STORE_DETAILS",
  store: "google",
  sectionPath: ["Store Listing", "Main Store Listing"],
  title: "App Details",
  description: "Confirm app name, description, and category",
  whyThisExists: "Store listing metadata must match app functionality.",
  blocking: false,
  triggeredByRuleIds: [],
  instructions: [
    { type: "verify", label: "Ensure descriptions match app behavior" }
  ],
  completionCriteria: [
    "Store details reviewed"
  ]
}

6.2 Screenshots
{
  id: "GP_SCREENSHOTS",
  store: "google",
  sectionPath: ["Store Listing", "Screenshots"],
  title: "Upload Screenshots",
  description: "Upload Play-compliant screenshots",
  whyThisExists: "Invalid screenshots prevent promotion and may block review.",
  blocking: true,
  triggeredByRuleIds: ["GOOGLE_SCREENSHOT_COMPLIANCE"],
  instructions: [
    { type: "upload", label: "Upload normalized screenshots from StorePreflight" }
  ],
  completionCriteria: [
    "Minimum 4 screenshots uploaded",
    "All screenshots meet size requirements"
  ]
}

6.3 Feature Graphic
{
  id: "GP_FEATURE_GRAPHIC",
  store: "google",
  sectionPath: ["Store Listing", "Feature Graphic"],
  title: "Feature Graphic",
  description: "Upload Play feature graphic",
  whyThisExists: "Feature graphic is required for visibility and promotion.",
  blocking: false,
  triggeredByRuleIds: [],
  instructions: [
    { type: "upload", label: "Upload 1024×500 feature graphic" }
  ],
  completionCriteria: [
    "Feature graphic uploaded"
  ]
}

7. SECTION: Testing
7.1 Internal / Closed Testing
{
  id: "GP_TESTING",
  store: "google",
  sectionPath: ["Testing", "Internal Testing"],
  title: "Internal Testing",
  description: "Ensure testing track is active",
  whyThisExists: "Google requires active testing before production.",
  blocking: true,
  triggeredByRuleIds: [],
  instructions: [
    { type: "verify", label: "At least one tester can install the app" }
  ],
  completionCriteria: [
    "Testing track active"
  ]
}

8. SECTION: Review & Publish
8.1 Final Review
{
  id: "GP_REVIEW_PUBLISH",
  store: "google",
  sectionPath: ["Review & Publish"],
  title: "Review & Publish",
  description: "Submit app for review",
  whyThisExists: "Final confirmation before Google review.",
  blocking: false,
  triggeredByRuleIds: [],
  instructions: [
    { type: "verify", label: "All blocking steps completed" },
    { type: "verify", label: "No unresolved warnings remain" }
  ],
  completionCriteria: [
    "Submission sent to Google"
  ]
}

9. Ordering Rules

Steps should be ordered by:

Section

Blocking first

Rule-triggered before generic