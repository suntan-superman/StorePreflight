StorePreflight — Guided Submission Wizard (UI Shell)
Goals of This Shell

Render guided submission steps (iOS / Android)

Display status, blockers, warnings

Support auto-fix / manual / docs

**Direct Console Links** — One-click navigation to exact App Store Connect / Play Console pages

Be engine-driven, not hardcoded

Work in desktop (Electron/Tauri) and web

---

## 🔗 Direct Console Links Feature

StorePreflight now supports **direct deep linking** to App Store Connect and Google Play Console. Users can configure their app's console URL once, and every guided step will provide a direct link to the relevant page.

### How It Works

1. **Configure Once**: User pastes any URL from their app in App Store Connect (e.g., `https://appstoreconnect.apple.com/apps/1234567890/appstore/ios/submission`)
2. **App ID Extraction**: StorePreflight extracts the App ID automatically
3. **Direct Navigation**: Each step shows an "Open in App Store Connect" button that links directly to:
   - Sign-In Information → App Review submission page
   - Export Compliance → Export compliance page  
   - Privacy Practices → App privacy page
   - Age Rating → Age rating questionnaire
   - And more...

### Privacy & Trust

- **No actions taken**: StorePreflight will never take any actions on the user's behalf
- **Local storage only**: App ID is stored in browser localStorage
- **Guidance only**: Links simply navigate users to the correct page

### Supported Pages (Apple)

| Step | Console Path |
|------|--------------|
| Sign-In Information | `/appstore/reviewsubmission` |
| Export Compliance | `/distribution/exportcompliance` |
| App Privacy | `/appstore/appprivacy` |
| Content Rights | `/distribution/contentrights` |
| Age Rating | `/appstore/ageratingdeclaration` |
| App Information | `/appstore/info` |
| Pricing | `/distribution/pricing` |

### Supported Pages (Google Play)

| Step | Console Path |
|------|--------------|
| Data Safety | `/app-content/data-safety` |
| Content Rating | `/content-rating` |
| Target Audience | `/target-audience` |
| Store Listing | `/store-listing/main-store-listing` |
| Pricing | `/pricing` |

---

1️⃣ Wizard Data Contract (UI-Facing)

The UI only cares about this shape.

// shared/types/WizardStep.ts
export type StepStatus = "pending" | "complete" | "blocked" | "warning";

export interface WizardAction {
  type: "autoFix" | "openDocs" | "markManual";
  label: string;
  payload?: any;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  store: "ios" | "android";
  status: StepStatus;
  ruleFailures?: {
    severity: "blocker" | "warning";
    message: string;
  }[];
  actions: WizardAction[];
}

2️⃣ Wizard Layout (Shell)
Visual Structure
┌───────────────────────────────┐
│ StorePreflight — iOS Wizard   │
├───────────────┬───────────────┤
│ Step List     │ Step Detail   │
│ (Left)        │ (Right)       │
├───────────────┴───────────────┤
│ Status Footer / Actions       │
└───────────────────────────────┘

3️⃣ Wizard Page
// ui/pages/WizardPage.tsx
import { useState } from "react";
import { WizardStep } from "@/shared/types/WizardStep";
import { StepList } from "../wizard/StepList";
import { StepDetail } from "../wizard/StepDetail";

interface Props {
  steps: WizardStep[];
  store: "ios" | "android";
}

export function WizardPage({ steps, store }: Props) {
  const [activeStepId, setActiveStepId] = useState(steps[0]?.id);

  const activeStep = steps.find(s => s.id === activeStepId);

  return (
    <div className="flex h-screen bg-slate-50">
      <StepList
        steps={steps}
        activeStepId={activeStepId}
        onSelect={setActiveStepId}
      />

      <div className="flex-1 p-6 overflow-auto">
        {activeStep && <StepDetail step={activeStep} />}
      </div>
    </div>
  );
}

4️⃣ Step List (Left Panel)
// ui/wizard/StepList.tsx
import { WizardStep } from "@/shared/types/WizardStep";

interface Props {
  steps: WizardStep[];
  activeStepId?: string;
  onSelect: (id: string) => void;
}

export function StepList({ steps, activeStepId, onSelect }: Props) {
  return (
    <div className="w-80 border-r bg-white">
      <div className="p-4 font-semibold text-lg">
        Submission Steps
      </div>

      <ul>
        {steps.map(step => (
          <li
            key={step.id}
            onClick={() => onSelect(step.id)}
            className={`px-4 py-3 cursor-pointer border-l-4 ${
              step.id === activeStepId
                ? "bg-blue-50 border-blue-500"
                : "border-transparent hover:bg-slate-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{step.title}</span>
              <StatusBadge status={step.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    complete: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    pending: "bg-slate-100 text-slate-600"
  };

  return (
    <span className={`text-xs px-2 py-1 rounded ${map[status]}`}>
      {status}
    </span>
  );
}

5️⃣ Step Detail Panel
// ui/wizard/StepDetail.tsx
import { WizardStep } from "@/shared/types/WizardStep";

export function StepDetail({ step }: { step: WizardStep }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{step.title}</h1>
        {step.description && (
          <p className="text-slate-600 mt-1">{step.description}</p>
        )}
      </header>

      {step.ruleFailures?.length > 0 && (
        <div className="space-y-3">
          {step.ruleFailures.map((r, i) => (
            <div
              key={i}
              className={`p-4 rounded border ${
                r.severity === "blocker"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <strong className="block capitalize">
                {r.severity}
              </strong>
              <span>{r.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {step.actions.map(action => (
          <button
            key={action.type}
            className={buttonClass(action.type)}
            onClick={() => handleAction(step, action)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function buttonClass(type: string) {
  switch (type) {
    case "autoFix":
      return "px-4 py-2 bg-blue-600 text-white rounded";
    case "openDocs":
      return "px-4 py-2 bg-slate-200 rounded";
    case "markManual":
      return "px-4 py-2 bg-green-600 text-white rounded";
    default:
      return "px-4 py-2 bg-slate-100 rounded";
  }
}

function handleAction(step: WizardStep, action: any) {
  console.log("Action:", step.id, action);
  // later → dispatch to engine
}

6️⃣ Mock Wiring (Temporary)
// ui/mock/mockSteps.ts
import { WizardStep } from "@/shared/types/WizardStep";

export const mockIOSSteps: WizardStep[] = [
  {
    id: "ios.bundle",
    title: "Bundle Identifier",
    store: "ios",
    status: "complete",
    actions: []
  },
  {
    id: "ios.location",
    title: "Location Usage Disclosure",
    store: "ios",
    status: "blocked",
    ruleFailures: [
      {
        severity: "blocker",
        message: "NSLocationWhenInUseUsageDescription missing"
      }
    ],
    actions: [
      { type: "autoFix", label: "Add to app.config" },
      { type: "openDocs", label: "View Apple Docs" }
    ]
  }
];

