TASK 1 — Introduce Submission Intent as a Core Type

Goal:
Create a single, canonical definition of why the user is preparing a build.

Why this task exists:
Without a shared type, intent will become a string, then a boolean, then a mess.

Instructions to Cursor:

Create a new type SubmissionIntent with the following values:
- internal_testing
- external_testing
- production

Place it in shared/types/SubmissionIntent.ts.
Ensure it is exported and reused everywhere intent is referenced.

🧭 TASK 2 — Thread Intent Through WizardStep and Engine Inputs

Goal:
Make intent unavoidable — every step knows why it exists.

Why this task exists:
Prevents steps from being reused incorrectly across different goals.

Instructions to Cursor:

Update WizardStep to include an `intent: SubmissionIntent` field.

Update any constructors, factories, or mock data to require intent explicitly.

Fail compilation if intent is missing.

🧭 TASK 3 — Update Rule Engine to Respect Intent

Goal:
Ensure rules only fire when they are actually relevant.

Why this task exists:
This avoids false blockers and builds user trust.

Instructions to Cursor:

Update the Rule interface to include an optional `appliesTo: SubmissionIntent[]`.

Default behavior:
- If appliesTo is undefined, rule applies to all intents.
- If appliesTo is defined, rule only evaluates when intent is included.

Update rule evaluation logic accordingly.

🧭 TASK 4 — Split Guided Submission Maps by Intent

Goal:
Reflect real store workflows instead of a single “submission” fantasy.

Why this task exists:
Google Play internal testing ≠ production
Apple TestFlight ≠ App Store review

Instructions to Cursor:

Refactor guided submission maps to the following structure:

guidedMaps/
  ios/
    internal_testing.ts
    production.ts
  android/
    internal_testing.ts
    production.ts

Remove store listing, screenshots, and marketing steps from internal_testing maps.
Keep compliance, signing, and privacy steps where required.

🧭 TASK 5 — Add Intent Selection as the Wizard Entry Point

Goal:
Set user expectations before they see steps.

Why this task exists:
This eliminates confusion and support questions.

Instructions to Cursor:

Add a Wizard entry screen that asks:
"What are you preparing for?"

Options:
- Internal Testing
- Production Release

Persist the selected intent in wizard state and pass it to all downstream components.

🧭 TASK 6 — Update UI Copy to Reflect Intent Awareness

Goal:
Explain why something is skipped or required.

Why this task exists:
This is where trust is built.

Instructions to Cursor:

Update step descriptions and status messages to explicitly reference intent.

Example:
"Not required for Internal Testing. Will be required for Production."

Ensure skipped steps are visually marked as "Not Required".

🧭 TASK 7 — Add “Promote to Production” Path (Non-Blocking)

Goal:
Turn StorePreflight into a lifecycle tool, not a one-off checker.

Why this task exists:
This creates natural upsell and repeat usage.

Instructions to Cursor:

Add a mechanism to re-run the wizard using the same scan data
but with intent switched from internal_testing to production.

Highlight newly required steps.

🧭 TASK 8 — Update Documentation & Mental Model

Goal:
Keep future contributors (including AI) aligned.

Why this task exists:
This prevents regressions and “why is this here?” confusion.

Instructions to Cursor:

Add a short architecture note explaining:
- Submission Intent
- Why it exists
- How it affects rules and steps

Place it in docs/architecture/submission-intent.md.
