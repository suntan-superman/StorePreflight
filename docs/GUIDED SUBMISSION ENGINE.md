StorePreflight — Guided Submission Engine
How Rules Become Guided Steps (Google Play + App Store Connect)
1. Purpose

The Guided Submission Engine converts:

ScanResult (capabilities + evidence)

RuleEvaluationResult (matched policy gates)

Store step maps (Google Play + App Store Connect)

into:

A GuidedSubmissionFlow containing only the steps relevant to the user’s app, populated with copy/paste answers and artifacts, ordered for completion, and tracked as the user marks them done.

2. Inputs & Outputs
Inputs

ScanResult

RuleEvaluationResult

GuidedStepCatalog (static step definitions per store)

GeneratedCopy (text blocks produced from rules + app metadata)

Output

GuidedSubmissionFlow for "google" or "apple"

3. Data Contracts
3.1 Rule Evaluation Result (already defined)

Includes findings with:

id (rule id)

risk

isBlocking

requires.video/screenshots/reviewerNotes

copy fields (appPurpose, permissionJustification, etc.)

3.2 Guided Step Template (Catalog Entry)

Catalog steps are templates that may include placeholders.

export interface GuidedStepTemplate {
  id: string;
  store: "google" | "apple";

  sectionPath: string[];
  title: string;
  description: string;
  whyThisExists: string;

  // Step becomes "active" if ANY of these rules are present in findings
  activatesWhenRuleIds?: string[];

  // Step becomes "active" if ANY of these capabilities are present
  activatesWhenCapabilities?: string[];

  // Optional: always included regardless of triggers
  alwaysInclude?: boolean;

  blockingDefault?: boolean;

  instructions: GuidedInstructionTemplate[];
  artifacts?: GuidedArtifactTemplate[];

  completionCriteria: string[];
  warnings?: string[];
}

3.3 Instructions with placeholders
export interface GuidedInstructionTemplate {
  type: "select" | "paste" | "upload" | "verify";
  label: string;

  // May include placeholders like {{generated.permissionJustification}}
  valueTemplate?: string;
}

3.4 Artifacts with placeholders
export interface GuidedArtifactTemplate {
  type: "video" | "screenshot" | "text" | "url";
  required: boolean;
  description: string;

  // Example: link to local output or checklist
  valueTemplate?: string;
}

4. Placeholder Resolution

Steps may contain templates like:

{{app.appName}}

{{app.bundleId}}

{{generated.permissionJustification}}

{{generated.reviewerNotes}}

Resolution requirements

Placeholders must resolve deterministically

Missing values should render as:

"[MISSING: <key>]" (and mark the step as blocking)

5. Engine Algorithm (Authoritative)
5.1 Select Store Catalog

If store = "google" use Google step templates

If store = "apple" use Apple step templates

5.2 Determine Active Steps

A step is active if:

alwaysInclude === true
OR

activatesWhenRuleIds intersects with RuleEvaluationResult.findings[].id
OR

activatesWhenCapabilities intersects with ScanResult.capabilities[].capability

Important:

Rule-based activation wins (more precise).

Capability activation is a fallback.

5.3 Merge Rule Data Into Steps

For each active step:

Determine if step is blocking:

blocking = step.blockingDefault || anyMatchingFinding.isBlocking

Determine required artifacts:

If any matching rule requires video, step artifacts must include video requirement

If any requires screenshots, step includes screenshot upload requirement

If any requires reviewerNotes, step includes reviewer notes paste requirement

5.4 Populate Instructions

For each instruction:

If instruction.type = "paste"

Resolve valueTemplate using GeneratedCopy

For "select" instructions

Use valueTemplate as recommended selection (e.g., “Yes”)

For "upload"

Provide link/path to the Submission Pack folder (if available)

5.5 Ordering

Steps are ordered by:

Section order (App Content → Store Listing → Testing → Release for Google; Apple’s order for ASC)

Blocking steps first inside each section

Rule-triggered steps before generic steps

Stable sort by step.id

5.6 Output Flow Object

Return:

export interface GuidedSubmissionFlow {
  store: "google" | "apple";
  appName: string;
  bundleId: string;
  steps: GuidedStep[];
  summary: {
    totalSteps: number;
    blockingSteps: number;
    missingValues: number;
  };
}

6. Step Completion Tracking (No Automation)

Completion is manual:

StorePreflight does not attempt to verify console submission

Users check steps off when done

State model
export interface StepCompletionState {
  stepId: string;
  completed: boolean;
  completedAt?: string; // ISO
  notes?: string;
}


Persistence options:

Local file in project .storepreflight/

Or app local storage (web UI)

Must be per-app and per-store

7. Generated Copy Model (Required)

A single normalized object created from:

App metadata

Rules copy fields

Default templates

export interface GeneratedCopy {
  appPurpose?: string;
  permissionJustification?: string;
  reviewerNotes?: string;
  dataSafetySummary?: string;
  privacySummary?: string;
  exportCompliance?: string;
}

Source precedence

Rule copy fields (highest priority)

App-specific templates

Generic defaults (lowest priority)

8. Implementation Plan (Cursor Tasks)
Task A — Build the Catalog

packages/guided/catalog/google.ts

packages/guided/catalog/apple.ts
Each exports an array of GuidedStepTemplate.

Task B — Build the Engine

packages/guided/engine.ts
Functions:

buildGuidedFlow(store, scan, evaluation, generatedCopy): GuidedSubmissionFlow

resolveTemplate(str, ctx): string

Task C — Wire to Web UI

Add a “Guided Submission” button after evaluation

Store selection: Google / Apple

Render:

Left nav (sectionPath grouping)

Step detail pane with copy buttons

Completion checklist

9. Example Catalog Templates (Minimum)
Google: App Access

activatesWhenRuleIds: ["GOOGLE_ACCOUNT_DELETION", "AUTHENTICATION"]

Google: Background Location

activatesWhenRuleIds: ["GOOGLE_BG_LOCATION"]

Google: Screenshots

alwaysInclude: true (because it applies to all apps that are being listed)

Apple: App Privacy

alwaysInclude: true

Apple: Review Notes

activatesWhenRuleIds: ["AUTHENTICATION", "LOCATION"]

10. Critical UX Behaviors

Any step with unresolved placeholders becomes blocking and highlighted

“Copy” button on every paste instruction

Step nav shows:

✅ Completed

⚠ Blocking

• Pending

11. Definition of Done (Engine)

Engine is complete when:

Given a real ScanResult with background location:

Google flow includes Location Background step

Includes video artifact requirement

Includes paste-ready justification

Given a ScanResult with authentication:

Both flows include Reviewer Login step

Output is stable, ordered, and deterministic

END OF DOCUMENT