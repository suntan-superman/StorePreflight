# Submission Intent Architecture

## Overview

`SubmissionIntent` is a first-class concept in StorePreflight that differentiates between internal testing, external testing, and production releases. This document describes how intent filtering works across the system.

## Why Submission Intent Matters

Internal testing (TestFlight / Google Play Internal Track) has significantly fewer requirements than production releases:

| Requirement | Internal Testing | External Testing | Production |
|-------------|------------------|------------------|------------|
| Store Listing | ❌ | ✓ | ✓ |
| Screenshots | ❌ | ❌ | ✓ |
| Feature Graphic | ❌ | ❌ | ✓ |
| Privacy Policy | ❌ | ✓ | ✓ |
| Data Safety/Privacy Labels | ❌ | ✓ | ✓ |
| Content Rating | ❌ | ✓ | ✓ |
| Permissions Compliance | ✓ | ✓ | ✓ |
| Export Compliance | ✓ | ✓ | ✓ |

By respecting intent, StorePreflight avoids showing false blockers when developers just want to distribute a test build.

## Type Definition

```typescript
// packages/shared/src/types.ts

export type SubmissionIntent = 
  | "internal_testing"   // TestFlight / Google Play Internal Track
  | "external_testing"   // Open Beta / Google Play External Track
  | "production";        // Full App Store / Play Store release

export const SUBMISSION_INTENT_LABELS: Record<SubmissionIntent, string> = {
  internal_testing: "Internal Testing",
  external_testing: "External Testing",
  production: "Production Release",
};

export const SUBMISSION_INTENT_DESCRIPTIONS: Record<SubmissionIntent, string> = {
  internal_testing: "TestFlight or Google Play Internal Track. Minimal setup required.",
  external_testing: "Open Beta or Google Play External Track. Some metadata required.",
  production: "Full App Store or Play Store release. Complete setup required.",
};
```

## Integration Points

### 1. Rule Filtering

The `Rule` interface now includes an optional `appliesTo` field:

```typescript
// packages/shared/src/types.ts

export interface Rule {
  id: string;
  platform: Platform;
  trigger: Capability[];
  risk: RiskLevel;
  appliesTo?: SubmissionIntent[];  // NEW
  requires?: { ... };
  copy?: { ... };
}
```

When `appliesTo` is:
- **Undefined or empty**: Rule applies to ALL intents
- **Specified**: Rule only applies when intent matches

### 2. Guided Step Templates

The `GuidedStepTemplate` interface includes intent filtering:

```typescript
// packages/guided/src/types.ts

export interface GuidedStepTemplate {
  id: string;
  store: StoreTarget;
  appliesTo?: SubmissionIntent[];  // NEW
  // ... other fields
}
```

### 3. Catalog Organization

Instead of separate files per intent, we use the `appliesTo` field on each step:

```typescript
// packages/guided/src/catalogs/google.ts

const ALL_INTENTS: SubmissionIntent[] = [
  "internal_testing", "external_testing", "production"
];

const EXTERNAL_AND_PRODUCTION: SubmissionIntent[] = [
  "external_testing", "production"
];

const PRODUCTION_ONLY: SubmissionIntent[] = ["production"];

export const googleGuidedCatalog: GuidedStepTemplate[] = [
  {
    id: "GP_LOCATION_BACKGROUND",
    appliesTo: ALL_INTENTS,  // Compliance required for all
    // ...
  },
  {
    id: "GP_DATA_SAFETY",
    appliesTo: EXTERNAL_AND_PRODUCTION,  // Not needed for internal
    // ...
  },
  {
    id: "GP_SCREENSHOTS",
    appliesTo: PRODUCTION_ONLY,  // Only for production release
    // ...
  },
];
```

### 4. Engine Filtering

The `buildGuidedFlow` function filters templates by intent:

```typescript
// packages/guided/src/engine.ts

function isTemplateActive(
  tpl: GuidedStepTemplate,
  findingIds: Set<string>,
  capSet: Set<Capability>,
  intent: SubmissionIntent
): boolean {
  // First check intent filter
  if (tpl.appliesTo?.length && !tpl.appliesTo.includes(intent)) {
    return false;
  }
  // Then check capability/rule triggers...
}
```

### 5. Session Persistence

The `GuidedSession` interface stores the selected intent:

```typescript
// packages/guided/src/types.ts

export interface GuidedSession {
  sessionId: string;
  store: StoreTarget;
  intent: SubmissionIntent;  // NEW
  appName: string;
  bundleId: string;
  // ... other fields
}
```

### 6. UI Integration

The main guided page shows an `IntentSelector` before starting:

```typescript
// apps/web/src/components/guided/IntentSelector.tsx

export function IntentSelector({
  value,
  onChange,
}: {
  value: SubmissionIntent;
  onChange: (intent: SubmissionIntent) => void;
}) {
  // Radio-style selection for intent
}
```

## Intent Selection Flow

```
┌─────────────────────────────────────────────────────┐
│  /guided                                            │
│  ┌─────────────────────────────────────────────┐   │
│  │ What are you submitting for?                │   │
│  │                                             │   │
│  │ ○ 🧪 Internal Testing                       │   │
│  │   TestFlight or Google Play Internal Track  │   │
│  │                                             │   │
│  │ ○ 👥 External Testing                       │   │
│  │   Open Beta or Google Play External Track   │   │
│  │                                             │   │
│  │ ● 🚀 Production Release [Recommended]       │   │
│  │   Full App Store or Play Store release      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────┐ ┌─────────────────┐          │
│  │ 🤖 Google Play  │ │ 🍎 App Store    │          │
│  └─────────────────┘ └─────────────────┘          │
│                                                     │
│  [ Start Google Play Submission → ]                │
└─────────────────────────────────────────────────────┘
```

## Step Count by Intent

### Google Play

| Intent | Steps (typical) |
|--------|-----------------|
| internal_testing | ~6 steps |
| external_testing | ~10 steps |
| production | ~14 steps |

### Apple App Store

| Intent | Steps (typical) |
|--------|-----------------|
| internal_testing | ~4 steps |
| external_testing | ~12 steps |
| production | ~18 steps |

## Benefits

1. **Reduced Friction**: Internal test builds have minimal steps
2. **Accurate Guidance**: Only shows what's actually required
3. **No False Positives**: Avoids blocking on screenshots for TestFlight
4. **Progressive Complexity**: Easy to upgrade from test to production

## Future Considerations

- **Intent Upgrade Path**: Allow changing intent mid-session
- **Rule-Level Intent**: Apply intent filtering to individual rules
- **Custom Intent Presets**: Team-specific requirement sets
