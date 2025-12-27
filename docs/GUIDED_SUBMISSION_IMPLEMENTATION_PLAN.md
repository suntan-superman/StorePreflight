# Guided Submission Implementation Plan

After reviewing all the attached documents, here's a comprehensive plan to implement the Guided Submission system.

---

## Executive Summary

The Guided Submission feature transforms StorePreflight from a **static analyzer** into an **active submission companion**. It provides step-by-step guidance through App Store Connect and Google Play Console, with copy-paste text, artifact checklists, and completion tracking.

---

## Current State Analysis

| Component | Status | Location |
|-----------|--------|----------|
| Types | ✅ Complete | `packages/guided/src/types.ts` |
| Engine | ✅ Complete | `packages/guided/src/engine.ts` |
| Copy Builder | ✅ Complete | `packages/guided/src/copy-builder.ts` |
| Catalogs | ✅ Complete | `packages/guided/src/catalogs/google.ts`, `apple.ts` |
| Package | ✅ Complete | `packages/guided/package.json` |
| UI Wizard | ❌ Not built | — |
| Integration | ❌ Not wired | — |

---

## Implementation Phases

### **Phase 1: Foundation & Types** (Priority: Critical)

**Goal:** Establish complete type system and ensure engine is fully functional.

| Task | Description |
|------|-------------|
| 1.1 | Consolidate all types into `packages/guided/types.ts` |
| 1.2 | Ensure `GeneratedCopy` interface covers all copy fields from rules |
| 1.3 | Add `StepCompletionState` type for tracking |
| 1.4 | Complete engine's `resolveTemplate` function |
| 1.5 | Add `buildGeneratedCopy()` helper that extracts copy from findings |
| 1.6 | Unit test engine with mock scan/evaluation data |

**Types to define:**
```typescript
// Core flow types
GuidedStep, GuidedSubmissionFlow, GuidedStepTemplate

// Copy generation
GeneratedCopy, CopyContext

// Completion tracking  
StepCompletionState, WizardSessionState

// UI-facing
WizardStep, WizardAction, StepStatus
```

---

### **Phase 2: Catalog Enhancement** (Priority: High)

**Goal:** Expand catalogs to cover all steps from the submission maps.

| Task | Description |
|------|-------------|
| 2.1 | Add missing Google steps from `GOOGLE PLAY GUIDED SUBMISSION MAP.md` |
| 2.2 | Add missing Apple steps from `APP STORE GUIDED SUBMISSION MAP.md` |
| 2.3 | Map all rule IDs to step triggers |
| 2.4 | Map all capabilities to step triggers |
| 2.5 | Define section ordering constants |

**Google Play Steps to Add/Enhance:**
- GP_APP_ACCESS ✅
- GP_ACCOUNT_DELETION ✅
- GP_LOCATION_FOREGROUND ✅
- GP_LOCATION_BACKGROUND ✅
- GP_DATA_SAFETY ✅
- GP_SCREENSHOTS ✅
- GP_FEATURE_GRAPHIC ✅
- GP_TESTING (new)
- GP_REVIEW_PUBLISH ✅

**Apple Steps to Add/Enhance:**
- ASC_APP_INFORMATION ✅
- ASC_PRIVACY_POLICY ✅
- ASC_DATA_COLLECTION ✅
- ASC_DATA_USAGE (new)
- ASC_PRICING (new)
- ASC_SIGN_IN ✅
- ASC_REVIEW_NOTES ✅
- ASC_EXPORT_COMPLIANCE ✅
- ASC_CONTENT_RIGHTS ✅
- ASC_RELEASE (new)
- ASC_SUBMIT ✅

---

### **Phase 3: Integration Layer** (Priority: High)

**Goal:** Wire guided engine to browser scanner output.

| Task | Description |
|------|-------------|
| 3.1 | Create `useGuidedSubmission` hook in web app |
| 3.2 | Build `generateCopyFromFindings()` function |
| 3.3 | Map browser-scanner types to guided engine types |
| 3.4 | Store guided flow in localStorage alongside scan results |
| 3.5 | Add "Guided Submission" button to scan results page |

**Data Flow:**
```
ScanResult (browser-scanner)
    ↓
RuleEvaluationResult (browser-scanner)
    ↓
generateCopyFromFindings()
    ↓
buildGuidedFlow(store, scan, evaluation, generatedCopy)
    ↓
GuidedSubmissionFlow
    ↓
WizardPage (UI)
```

---

### **Phase 4: UI Implementation** (Priority: High)

**Goal:** Build the Guided Submission Wizard UI.

| Task | Description |
|------|-------------|
| 4.1 | Create `/guided` route with store selection |
| 4.2 | Build `WizardPage` layout (sidebar + detail pane) |
| 4.3 | Build `StepList` component with section grouping |
| 4.4 | Build `StepDetail` component with instructions |
| 4.5 | Add `CopyButton` component for paste instructions |
| 4.6 | Add artifact checklist (video/screenshot indicators) |
| 4.7 | Implement completion tracking with localStorage |
| 4.8 | Add progress summary bar |

**UI Layout:**
```
┌──────────────────────────────────────────────────────┐
│ Guided Submission — Google Play         Progress: 4/9│
├─────────────────┬────────────────────────────────────┤
│ Step List       │ Step Detail                        │
│                 │                                    │
│ ▸ App Content   │ ┌────────────────────────────────┐ │
│   ✅ App Access │ │ Background Location Access     │ │
│   ⚠️ Location   │ │                                │ │
│   • Data Safety │ │ Why this exists:               │ │
│                 │ │ Google requires explicit...    │ │
│ ▸ Store Listing │ │                                │ │
│   • Screenshots │ │ Instructions:                  │ │
│   • Feature     │ │ ☐ Select "Yes" for background │ │
│                 │ │ ☐ Paste justification [Copy]  │ │
│ ▸ Review        │ │                                │ │
│   • Submit      │ │ Required Artifacts:            │ │
│                 │ │ 📹 YouTube video (required)   │ │
│                 │ │                                │ │
│                 │ │ [Mark Complete]               │ │
│                 │ └────────────────────────────────┘ │
├─────────────────┴────────────────────────────────────┤
│ ⚠️ 2 blocking steps remaining                        │
└──────────────────────────────────────────────────────┘
```

---

### **Phase 5: Polish & UX** (Priority: Medium)

| Task | Description |
|------|-------------|
| 5.1 | Add "Guided" to main navigation |
| 5.2 | Toast notifications for copy actions |
| 5.3 | Keyboard navigation (arrow keys, Enter) |
| 5.4 | Mobile-responsive layout |
| 5.5 | "Export Checklist" as printable PDF |
| 5.6 | Persist completion state across sessions |
| 5.7 | Add "Reset Progress" option |
| 5.8 | Show missing placeholder warnings prominently |

---

## File Structure (New/Modified)

```
packages/guided/
├── src/
│   ├── types.ts          # ✅ All guided types (complete)
│   ├── engine.ts         # ✅ Builds GuidedSubmissionFlow
│   ├── copy-builder.ts   # ✅ Generate copy from findings
│   ├── index.ts          # ✅ Public exports
│   └── catalogs/
│       ├── google.ts     # ✅ Google Play steps
│       └── apple.ts      # ✅ Apple App Store steps
├── package.json          # ✅ Package config
├── tsconfig.json         # ✅ TypeScript config
└── dist/                 # ✅ Build output

apps/web/src/
├── app/
│   └── guided/
│       ├── page.tsx      # Store selection page
│       └── [store]/
│           └── page.tsx  # Wizard for google/apple
├── components/
│   └── guided/
│       ├── WizardLayout.tsx
│       ├── StepList.tsx
│       ├── StepDetail.tsx
│       ├── CopyButton.tsx
│       ├── ArtifactChecklist.tsx
│       └── ProgressBar.tsx
├── hooks/
│   └── useGuidedSubmission.ts
└── lib/
    └── guided-integration.ts  # Bridge browser-scanner → guided
```

---

## Dependencies Between Phases

```
Phase 1 (Types/Engine)
    ↓
Phase 2 (Catalogs) ←──── Can run in parallel
    ↓
Phase 3 (Integration)
    ↓
Phase 4 (UI)
    ↓
Phase 5 (Polish)
```

---

## Estimated Effort

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Foundation | 2-3 hours |
| Phase 2: Catalogs | 1-2 hours |
| Phase 3: Integration | 2-3 hours |
| Phase 4: UI | 4-6 hours |
| Phase 5: Polish | 2-3 hours |
| **Total** | **11-17 hours** |

---

## Success Criteria

1. ✅ User can select Google Play or App Store after a scan
2. ✅ Wizard shows only relevant steps based on detected capabilities
3. ✅ Each step has copy-paste text with working Copy button
4. ✅ Blocking steps are clearly marked
5. ✅ Video/screenshot requirements are visible
6. ✅ User can mark steps complete and see progress
7. ✅ Progress persists across browser sessions
8. ✅ Missing placeholders are highlighted as warnings

---

## Implementation Log

### Phase 1: Foundation & Types ✅ COMPLETE (2025-01-17)
- [x] 1.1 Consolidate types → `packages/guided/src/types.ts`
- [x] 1.2 GeneratedCopy interface with all copy fields
- [x] 1.3 StepProgress and GuidedSession types for completion tracking
- [x] 1.4 Complete engine with template resolution
- [x] 1.5 buildGeneratedCopy helper in `copy-builder.ts`
- [x] 1.6 Package builds successfully in monorepo

### Phase 2: Catalog Enhancement ✅ COMPLETE (2025-12-26)
- [x] 2.1 Google steps expanded to 14 steps covering all sections
- [x] 2.2 Apple steps expanded to 18 steps covering all sections  
- [x] 2.3 Rule ID mappings aligned with rules.v1.json
- [x] 2.4 Capability mappings for all detected capabilities
- [x] 2.5 Section ordering constants (GOOGLE_SECTION_ORDER, APPLE_SECTION_ORDER)

### Phase 3: Integration ✅ COMPLETE (2025-12-26)
- [x] 3.1 useGuidedSubmission hook created at `apps/web/src/hooks/useGuidedSubmission.ts`
- [x] 3.2 generateCopyFromFindings in `apps/web/src/lib/guided-integration.ts`
- [x] 3.3 Type mapping (mapToGuidedInput) bridges browser-scanner → guided engine
- [x] 3.4 localStorage persistence for sessions, progress, and generated copy
- [x] 3.5 "Start Guided Submission" buttons added to scan results page

### Phase 4: UI
- [ ] 4.1 /guided route
- [ ] 4.2 WizardPage layout
- [ ] 4.3 StepList component
- [ ] 4.4 StepDetail component
- [ ] 4.5 CopyButton component
- [ ] 4.6 ArtifactChecklist
- [ ] 4.7 Completion tracking
- [ ] 4.8 ProgressBar

### Phase 5: Polish
- [ ] 5.1 Navigation update
- [ ] 5.2 Toast notifications
- [ ] 5.3 Keyboard navigation
- [ ] 5.4 Mobile responsive
- [ ] 5.5 Export checklist
- [ ] 5.6 Session persistence
- [ ] 5.7 Reset progress
- [ ] 5.8 Missing placeholder warnings
