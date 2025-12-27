You are modifying the StorePreflight codebase to introduce a first-class concept called “Submission Intent”.

Submission Intent represents the developer’s goal for a store submission and must be one of:
- internal_testing
- external_testing
- production

This intent must be treated as a core axis across the system, not a UI toggle or optional flag.

Your task is to implement this change end-to-end while preserving existing behavior for production submissions.

========================
PRIMARY OBJECTIVES
========================

1. Introduce a canonical SubmissionIntent type
2. Thread SubmissionIntent through wizard steps, rule evaluation, and guided submission maps
3. Split iOS and Android guided submission flows by intent
4. Update rule evaluation so rules only apply when relevant to the selected intent
5. Update the Wizard UI to require intent selection at the start
6. Ensure internal testing workflows do NOT require production-only metadata
7. Preserve clarity, explicitness, and compile-time safety

========================
STEP-BY-STEP INSTRUCTIONS
========================

STEP 1 — Core Type Definition
- Create a new type SubmissionIntent in:
  shared/types/SubmissionIntent.ts
- Allowed values:
  - "internal_testing"
  - "external_testing"
  - "production"
- Export this type and reuse it everywhere intent is referenced.
- Do NOT use raw strings outside this type.

STEP 2 — WizardStep Contract Update
- Update WizardStep to include a required field:
  intent: SubmissionIntent
- Update all WizardStep constructors, mocks, and factories to require intent explicitly.
- Compilation should fail if intent is missing.

STEP 3 — Rule Engine Awareness
- Update the Rule interface to optionally include:
  appliesTo?: SubmissionIntent[]
- Rule evaluation behavior:
  - If appliesTo is undefined, the rule applies to all intents
  - If appliesTo is defined, only evaluate when intent is included
- Ensure rules related to store listing assets, screenshots, marketing copy, and content ratings apply ONLY to "production"

STEP 4 — Guided Submission Map Refactor
- Refactor guided submission maps into the following structure:

guidedMaps/
  ios/
    internal_testing.ts
    production.ts
  android/
    internal_testing.ts
    production.ts

- Internal testing maps MUST:
  - Exclude store listing screenshots
  - Exclude marketing copy
  - Exclude public store descriptions
- Keep required compliance, signing, and privacy steps where the store requires them even for internal testing.
- Production maps should remain comprehensive.

STEP 5 — Wizard Entry UX
- Add an explicit wizard entry step that asks:
  “What are you preparing for?”
- Options:
  - Internal Testing
  - Production Release
- Persist the selected intent in wizard state and pass it to:
  - Guided submission step generation
  - Rule evaluation
  - Step rendering

STEP 6 — UI Messaging Adjustments
- Update UI copy so skipped or excluded steps clearly explain why.
- Example copy:
  “Not required for Internal Testing. Will be required for Production.”
- Steps that do not apply should be marked as “Not Required”, not “Missing”.

STEP 7 — Promote-to-Production Flow
- Add a mechanism to re-run the wizard using the same scan data
  with intent switched from "internal_testing" to "production".
- Newly required steps should be highlighted.

STEP 8 — Documentation
- Add a short architecture document at:
  docs/architecture/submission-intent.md
- Explain:
  - What Submission Intent is
  - Why it exists
  - How it affects rules and guided steps
- Keep it concise and technical.

========================
CONSTRAINTS & GUIDELINES
========================

- Do NOT introduce boolean flags like `isInternalTesting`
- Do NOT hardcode intent checks in UI components
- Intent must flow through engines and maps, not around them
- Prefer explicit types over inferred behavior
- Keep changes cohesive and minimal per file
- Preserve existing production behavior unless explicitly changed above

========================
EXPECTED OUTCOME
========================

After this change:
- StorePreflight can guide users through internal testing prep for both iOS and Android
- Production-only requirements do not block internal testing
- The system remains deterministic, explainable, and extensible
- Future intents (e.g., CI validation, enterprise audit) can be added cleanly

Proceed carefully and make changes in a logical, dependency-aware order.
