StorePreflight
App Store & Google Play Preflight Scanner
Master Architecture, Product & Execution Specification
0. Purpose of This Document

This document is the single source of truth for building StorePreflight.

It defines:

Architecture

ScannerAdapter interface (Expo now, Flutter later)

Rule Pack v1 (20–30 concrete rules)

UI wireframe (textual)

Landing page copy

Pricing & packaging

Design system (green theme)

Non-negotiable engineering constraints

This document is designed to be consumed by:

VS Code + Cursor

GitHub Copilot

Senior engineers executing without ambiguity

1. Product Summary

StorePreflight is a local-first desktop/web application that scans a mobile app codebase and determines exactly what Apple App Store Connect and Google Play Console will require before submission.

It eliminates surprise rejections by:

Detecting permissions and SDK usage

Mapping them to store policy gates

Generating copy-paste-ready answers

Normalizing assets that must pass first upload

Producing a Submission Pack ZIP

2. Supported Scope (MVP)
Frameworks

✅ Expo-managed React Native (MVP)

🟡 Flutter (Phase 2 via adapter)

❌ Bare RN / Native / Unity (future)

Platforms

Apple App Store Connect

Google Play Console

Execution Model

Local scan only

No repo uploads

No cloud dependency

Web UI first, Desktop (Tauri) later

3. High-Level Architecture
┌────────────────────┐
│   Web UI (Next.js) │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Scanner Engine     │
│ (Adapter-based)    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Rules Engine       │
│ (Policy Gates)    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Asset Processor    │
│ (Screenshots etc.) │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Report Generator   │
│ + Submission Pack  │
└────────────────────┘

4. Monorepo Structure
storepreflight/
├─ apps/
│  └─ web/                 # Next.js UI
├─ packages/
│  ├─ scanner/
│  │  ├─ adapters/
│  │  │  ├─ ExpoScanner.ts
│  │  │  ├─ FlutterScanner.ts (stub)
│  │  │  └─ ScannerAdapter.ts
│  │  └─ index.ts
│  ├─ rules/
│  │  ├─ rules.v1.json
│  │  └─ engine.ts
│  ├─ assets/
│  │  └─ imageProcessor.ts
│  ├─ report/
│  │  └─ htmlReport.ts
│  ├─ shared/
│  │  ├─ types.ts
│  │  └─ utils.ts
│  └─ cli/                 # Optional later
├─ docs/
└─ README.md

5. ScannerAdapter Interface (CRITICAL)
Design Principle

All frameworks output the same normalized model.

Rules NEVER depend on framework-specific logic.

ScannerAdapter.ts
export interface ScannerAdapter {
  id: string; // "expo", "flutter", etc.

  detectProject(rootPath: string): boolean;

  scan(rootPath: string): Promise<ScanResult>;
}

Shared Output Model (types.ts)
export type Capability =
  | "location_foreground"
  | "location_background"
  | "notifications"
  | "camera"
  | "microphone"
  | "photo_library"
  | "file_storage"
  | "maps"
  | "payments"
  | "authentication"
  | "analytics"
  | "background_tasks";

export interface Evidence {
  file: string;
  lines: [number, number];
  snippet: string;
}

export interface DetectedCapability {
  capability: Capability;
  evidence: Evidence[];
}

export interface ScanResult {
  appName: string;
  bundleId: string;
  platformTargets: ("ios" | "android")[];
  capabilities: DetectedCapability[];
}

6. Scanner Adapters
ExpoScanner (MVP)

Parses:

app.json / app.config.ts

package.json

AndroidManifest.xml (if exists)

Info.plist (if exists)

Detects:

Expo plugins

Android permissions

iOS usage descriptions

JS/TS usage of APIs (AST scan)

FlutterScanner (Phase 2)

Parses:

pubspec.yaml

AndroidManifest.xml

Info.plist

Detects:

Flutter plugins → capabilities

(Optional) Dart AST later

7. Rules Engine
Rule Structure
{
  id: string,
  platform: "google" | "apple" | "both",
  trigger: Capability[],
  risk: "low" | "medium" | "high",
  requires: {
    video?: boolean,
    screenshots?: boolean,
    reviewerNotes?: boolean
  },
  copy: {
    appPurpose?: string,
    permissionJustification?: string,
    dataSafety?: string,
    reviewerNotes?: string
  }
}

8. Rule Pack v1 (Initial 24 Rules)
High Risk (Blocking)

Background Location (Google → YouTube video required)

Foreground Location

Notifications permission

Camera access

Microphone access

Photo library access

File storage access

Background services/tasks

Maps usage (Google Maps SDK)

Payments (Stripe / IAP)

Account deletion required (Google)

Authentication (reviewer login required)

Medium Risk

Analytics collection

Crash reporting

Device identifiers

Push notifications content

Data encryption/export compliance (Apple)

WebView usage

External links to payment

Low Risk

App name vs bundle mismatch

Missing privacy policy URL

Missing terms URL

Missing in-app disclosure text

Screenshot dimension mismatch

9. Asset Processor
Screenshot Normalization (Google Play)

Input: any portrait screenshot

Output:

1080 × 1920

PNG

sRGB

No alpha

< 8 MB

Crop:

Remove system bars

Center app UI

Feature Graphic

1024 × 500

JPG preferred

Flatten transparency

Icon Validation

512 × 512

Warn if text detected

10. Submission Pack ZIP
StorePreflight_SubmissionPack_<app>_<date>.zip
├─ reports/
│  └─ storepreflight.html
├─ copy-paste/
│  ├─ google_app_purpose.txt
│  ├─ google_location_justification.txt
│  ├─ data_safety.json
│  └─ reviewer_notes.txt
├─ assets/
│  ├─ google-play/screenshots/
│  ├─ feature-graphic.jpg
│  └─ icon-512.png
└─ checklists/
   ├─ google-play.md
   └─ app-store.md

11. UI Wireframe (Textual)
Screen 1 — Project Select

Button: “Select Project Folder”

Shows detected framework (Expo / Flutter)

Screen 2 — Scan Results

Status badge: Passed / Blocked

Green = safe

Red = blocking gate

Screen 3 — Gate Detail

Gate name

Why it was triggered

Evidence (file + lines)

Copy/paste answers

Required artifacts checklist

Screen 4 — Assets

Screenshot upload

Validation table

“Normalize to Play-safe” button

Screen 5 — Export

“Generate Submission Pack”

Download ZIP

12. Design System

Neutral light background

Dark text

Green (#2E7D32 / similar) for:

Passed gates

Ready states

Primary CTAs

Red only for blocking issues

No flashy gradients

Professional, enterprise tone

13. Landing Page Copy (storepreflight.com)
Hero

StorePreflight
Know what Apple and Google will ask — before they ask.

Preflight your mobile app against App Store Connect and Google Play Console requirements.
No surprises. No guesswork. No rejections.

Problem

Submitting an app shouldn’t feel like navigating a maze.

Apple and Google reveal requirements after you’ve already invested time, money, and energy.

Solution

StorePreflight scans your codebase locally and tells you:

Which permissions trigger review gates

What text you’ll need to paste into the console

Which assets must be resized or recreated

Whether a reviewer video will be required

Before you ever click “Submit”.

Who It’s For

Expo & React Native developers

Flutter developers (coming soon)

Agencies shipping multiple apps

Teams tired of Play Console surprises

CTA

Run StorePreflight before you submit.

14. Pricing & Packaging
Free

Scan summary

Capability detection

Basic warnings

Pro ($29/app or $19/month)

Full Rule Pack

Copy/paste answers

Screenshot normalization

Submission Pack export

Team ($99/month)

Unlimited apps

CI mode (future)

Shared rule updates

Priority support

15. Engineering Non-Negotiables

No hallucinated requirements

No cloud scanning by default

Every gate tied to evidence

Deterministic outputs

Senior-engineer-grade code

16. Definition of MVP Done

Detect background location

Generate Google Play justifications

Normalize screenshots

Export Submission Pack ZIP

UI usable by a non-developer

END OF SPEC