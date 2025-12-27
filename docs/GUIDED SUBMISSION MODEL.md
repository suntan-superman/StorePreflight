StorePreflight — Guided Submission Model
Submission Companion for App Store Connect & Google Play Console
1. Purpose

The Guided Submission Model turns StorePreflight from a static analyzer into an active submission companion.

It does not automate Apple or Google consoles.
It guides the developer with certainty while they navigate them.

The goal is simple:

Eliminate uncertainty, backtracking, and surprise requirements during submission.

2. Core Design Principle (Non-Negotiable)

❌ Do not attempt to control or automate store UIs
❌ Do not rely on brittle DOM scraping
❌ Do not assume linear workflows

✅ Provide step-aware, evidence-backed guidance
✅ Assume stores change UI but not requirements
✅ Keep the user in control

3. Conceptual Model
Think of this as:

“A GPS for App Submission”

The store is the road

StorePreflight is the turn-by-turn guidance

The developer is driving

4. High-Level Flow
Preflight Scan
   ↓
Rules Evaluated
   ↓
Blocking Gates Identified
   ↓
Guided Submission Mode Enabled
   ↓
User completes store steps with confidence

5. Guided Submission Mode (GSM)
Activation

Enabled when:

Preflight scan is complete

Rules have been evaluated

Store target selected:

Google Play

App Store Connect

6. Guided Step Model (Core Data Structure)

This is the heart of the system.

GuidedStep
export interface GuidedStep {
  id: string;

  store: "google" | "apple";

  sectionPath: string[];
  // Example:
  // ["App Content", "Location Permissions"]

  title: string;
  description: string;

  whyThisExists: string;

  blocking: boolean;

  triggeredByRuleIds: string[];

  instructions: {
    type: "select" | "paste" | "upload" | "verify";
    label: string;
    value?: string;
  }[];

  artifacts?: {
    type: "video" | "screenshot" | "text" | "url";
    required: boolean;
    description: string;
  }[];

  completionCriteria: string[];

  warnings?: string[];
}

7. Guided Flow Container
GuidedSubmissionFlow
export interface GuidedSubmissionFlow {
  store: "google" | "apple";
  appName: string;

  steps: GuidedStep[];

  completionSummary: {
    totalSteps: number;
    blockingSteps: number;
  };
}

8. Example: Google Play — Background Location
{
  id: "GP_LOCATION_BACKGROUND",
  store: "google",
  sectionPath: ["App Content", "Location Permissions"],
  title: "Background Location Access",
  description: "Declare and justify background location usage",
  whyThisExists: "Google requires explicit justification and a walkthrough video for any app accessing location in the background.",
  blocking: true,
  triggeredByRuleIds: ["GOOGLE_BG_LOCATION"],
  instructions: [
    {
      type: "select",
      label: "Does your app access location in the background?",
      value: "Yes"
    },
    {
      type: "paste",
      label: "Paste this justification",
      value: "{{generated.permissionJustification}}"
    }
  ],
  artifacts: [
    {
      type: "video",
      required: true,
      description: "YouTube video showing background location usage"
    }
  ],
  completionCriteria: [
    "Background location selected",
    "Justification pasted",
    "Video URL added"
  ],
  warnings: [
    "Submission will be rejected if video does not clearly show in-app usage."
  ]
}

9. Example: App Store Connect — App Review Notes
{
  id: "ASC_REVIEW_NOTES",
  store: "apple",
  sectionPath: ["App Review", "Review Notes"],
  title: "App Review Notes",
  description: "Provide reviewer guidance and credentials",
  whyThisExists: "Apple reviewers must be able to access all app functionality.",
  blocking: true,
  triggeredByRuleIds: ["AUTHENTICATION"],
  instructions: [
    {
      type: "paste",
      label: "Paste reviewer notes",
      value: "{{generated.reviewerNotes}}"
    }
  ],
  completionCriteria: [
    "Reviewer notes provided"
  ]
}

10. How Rules Feed Guided Steps
Mapping logic
Rule triggered
   ↓
Rule requires reviewerNotes / video / screenshots
   ↓
Guided steps injected into flow
   ↓
Steps ordered by store section


Rules remain the source of truth.
Guided steps are a projection of rules into user action.

11. UI Model (Cursor should scaffold this)
Layout
┌──────────────────────────────┐
│ Guided Submission (Google)   │
├──────────────────────────────┤
│ ▸ App Content                │
│   ▸ App Access               │
│   ▸ Location Permissions ⚠   │
│ ▸ Store Listing              │
│ ▸ Data Safety                │
│ ▸ Review & Publish           │
└──────────────────────────────┘

Step Detail Pane

Title

Why this exists

Instructions with Copy buttons

Artifact checklist

Mark complete checkbox

12. Completion Tracking

Steps are manually marked complete

StorePreflight does not assume

Blocking steps must be completed to reach “Ready”

13. Why This Is Robust

No dependency on store HTML

Survives UI changes

Driven entirely by policy + rules

Easy to update when Apple/Google change requirements

14. MVP Scope (Recommended)
Include:

Google Play guided steps for:

App Access

Location

Data Safety

Screenshots

App Store guided steps for:

App Privacy

Review Notes

Export Compliance

Exclude (for now):

CI automation

Console deep linking

UI change detection

15. How Cursor / Copilot Should Use This

Cursor can:

Scaffold GuidedStep schemas

Generate static flows from rules

Build UI components from this spec

Enforce typing and structure

This document is intentionally machine-friendly.

16. Strategic Value

This feature:

Dramatically reduces developer anxiety

Makes StorePreflight feel “alive”

Justifies paid tiers

Differentiates you from every static scanner

17. Definition of Success

A developer can:

Open StorePreflight

Follow guidance

Submit without surprises

Never search StackOverflow mid-submission

END OF SPEC