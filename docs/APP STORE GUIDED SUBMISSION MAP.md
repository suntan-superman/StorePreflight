StorePreflight — App Store Connect Guided Submission Map
Complete Guided Submission Companion for Apple App Store
1. Purpose

This document defines the authoritative guided submission flow for Apple App Store Connect.

It converts:

Apple review policies

Detected capabilities

StorePreflight rules

Into step-aware, copy-paste-ready guidance that removes ambiguity and prevents rejections.

2. Apple Review Reality (Important Context)

Apple review is:

Less fragmented than Google

More human-driven

Extremely sensitive to missing explanations

Very strict about privacy, access, and reviewer instructions

The goal of this guide is to:

Ensure the reviewer can open the app, understand its purpose, and verify every permission without guessing.

3. Top-Level App Store Connect Sections

Apple submission revolves around these sections:

App Information

App Privacy

Pricing & Availability

App Review

Version Release

Submit for Review

Guided steps are grouped accordingly.

4. Guided Submission Flow (Apple)
GuidedSubmissionFlow {
  store: "apple",
  steps: GuidedStep[]
}

5. SECTION: App Information
5.1 App Details
{
  id: "ASC_APP_INFORMATION",
  store: "apple",
  sectionPath: ["App Information"],
  title: "App Information",
  description: "Verify app name, category, and bundle ID",
  whyThisExists: "Apple uses this information to classify and route your app for review.",
  blocking: false,
  triggeredByRuleIds: [],
  instructions: [
    { type: "verify", label: "App name matches StorePreflight scan" },
    { type: "verify", label: "Primary category matches app functionality" }
  ],
  completionCriteria: [
    "App information reviewed"
  ]
}

6. SECTION: App Privacy
6.1 Privacy Policy URL
{
  id: "ASC_PRIVACY_POLICY",
  store: "apple",
  sectionPath: ["App Privacy"],
  title: "Privacy Policy",
  description: "Provide a valid privacy policy URL",
  whyThisExists: "Apple requires transparency around data usage.",
  blocking: true,
  triggeredByRuleIds: ["PRIVACY_POLICY_REQUIRED"],
  instructions: [
    { type: "paste", label: "Paste privacy policy URL", value: "{{generated.privacyPolicyUrl}}" }
  ],
  completionCriteria: [
    "Privacy policy URL provided"
  ]
}

6.2 Data Collection Declaration
{
  id: "ASC_DATA_COLLECTION",
  store: "apple",
  sectionPath: ["App Privacy"],
  title: "Data Collection",
  description: "Declare collected data types",
  whyThisExists: "Apple requires disclosure of all collected user data.",
  blocking: true,
  triggeredByRuleIds: ["ANALYTICS", "AUTHENTICATION", "LOCATION"],
  instructions: [
    { type: "verify", label: "Match answers to StorePreflight Data Summary" }
  ],
  completionCriteria: [
    "All data collection questions answered"
  ],
  warnings: [
    "Inconsistent answers are a common cause of rejection."
  ]
}

6.3 Data Usage Purpose
{
  id: "ASC_DATA_USAGE",
  store: "apple",
  sectionPath: ["App Privacy"],
  title: "Data Usage Purpose",
  description: "Explain why data is collected",
  whyThisExists: "Apple evaluates whether data collection is justified.",
  blocking: true,
  triggeredByRuleIds: ["ANALYTICS", "LOCATION"],
  instructions: [
    { type: "verify", label: "Ensure purposes match detected capabilities" }
  ],
  completionCriteria: [
    "Data usage purposes declared"
  ]
}

7. SECTION: Pricing & Availability
7.1 Pricing
{
  id: "ASC_PRICING",
  store: "apple",
  sectionPath: ["Pricing & Availability"],
  title: "Pricing",
  description: "Confirm app pricing model",
  whyThisExists: "Apple needs to know how users access your app.",
  blocking: false,
  triggeredByRuleIds: [],
  instructions: [
    { type: "verify", label: "Pricing matches app behavior" }
  ],
  completionCriteria: [
    "Pricing reviewed"
  ]
}

8. SECTION: App Review
8.1 Sign-In Information
{
  id: "ASC_SIGN_IN",
  store: "apple",
  sectionPath: ["App Review", "Sign-In Information"],
  title: "Sign-In Information",
  description: "Provide reviewer access credentials",
  whyThisExists: "Apple reviewers must be able to access all app features.",
  blocking: true,
  triggeredByRuleIds: ["AUTHENTICATION"],
  instructions: [
    { type: "paste", label: "Paste reviewer login instructions", value: "{{generated.reviewerNotes}}" }
  ],
  completionCriteria: [
    "Reviewer credentials provided"
  ],
  warnings: [
    "Invalid credentials will result in rejection."
  ]
}

8.2 App Review Notes
{
  id: "ASC_REVIEW_NOTES",
  store: "apple",
  sectionPath: ["App Review", "Review Notes"],
  title: "Review Notes",
  description: "Explain app behavior and permissions",
  whyThisExists: "Reviewers rely on notes to understand non-obvious functionality.",
  blocking: true,
  triggeredByRuleIds: ["LOCATION", "BACKGROUND_TASKS"],
  instructions: [
    { type: "paste", label: "Paste review notes", value: "{{generated.reviewerNotes}}" }
  ],
  completionCriteria: [
    "Review notes provided"
  ]
}

8.3 Export Compliance
{
  id: "ASC_EXPORT_COMPLIANCE",
  store: "apple",
  sectionPath: ["App Review", "Export Compliance"],
  title: "Export Compliance",
  description: "Declare encryption usage",
  whyThisExists: "Apple must ensure compliance with export regulations.",
  blocking: true,
  triggeredByRuleIds: ["ENCRYPTION"],
  instructions: [
    { type: "select", label: "Does your app use encryption?", value: "Yes" },
    { type: "select", label: "Is encryption exempt?", value: "Yes" }
  ],
  completionCriteria: [
    "Export compliance completed"
  ]
}

8.4 Content Rights
{
  id: "ASC_CONTENT_RIGHTS",
  store: "apple",
  sectionPath: ["App Review", "Content Rights"],
  title: "Content Rights",
  description: "Confirm rights to all content",
  whyThisExists: "Apple requires assurance that you own or license all content.",
  blocking: true,
  triggeredByRuleIds: [],
  instructions: [
    { type: "select", label: "Do you have rights to all content?", value: "Yes" }
  ],
  completionCriteria: [
    "Content rights confirmed"
  ]
}

9. SECTION: Version Release
9.1 Release Options
{
  id: "ASC_RELEASE",
  store: "apple",
  sectionPath: ["Version Release"],
  title: "Release Options",
  description: "Choose how your app is released",
  whyThisExists: "Controls when users can download the app.",
  blocking: false,
  triggeredByRuleIds: [],
  instructions: [
    { type: "verify", label: "Select manual or automatic release" }
  ],
  completionCriteria: [
    "Release option selected"
  ]
}

10. SECTION: Submit for Review
10.1 Final Submission
{
  id: "ASC_SUBMIT",
  store: "apple",
  sectionPath: ["Submit for Review"],
  title: "Submit for Review",
  description: "Send app to Apple for review",
  whyThisExists: "Final confirmation before Apple review.",
  blocking: false,
  triggeredByRuleIds: [],
  instructions: [
    { type: "verify", label: "All blocking steps completed" }
  ],
  completionCriteria: [
    "App submitted to Apple"
  ]
}

11. Ordering Rules

Steps should be ordered by:

Section order

Blocking before non-blocking

Rule-triggered before generic

12. Why This Works

Mirrors Apple’s internal review checklist

Emphasizes reviewer clarity

Reduces back-and-forth rejections

Resilient to UI wording changes

Complements Rule Engine perfectly

13. Definition of Success

A developer using this flow:

Never wonders what Apple expects next

Never submits without reviewer access

Never guesses privacy answers

Passes review on the first try

END OF DOCUMENT