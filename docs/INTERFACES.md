ScannerAdapter Interface (FINAL)

📁 packages/scanner/adapters/ScannerAdapter.ts

import { ScanResult } from "../../shared/types";

export interface ScannerAdapter {
  /**
   * Unique identifier for the adapter
   * e.g. "expo", "flutter"
   */
  id: string;

  /**
   * Determines whether this adapter can scan the given project
   */
  detectProject(rootPath: string): boolean;

  /**
   * Perform a full scan and return a normalized ScanResult
   */
  scan(rootPath: string): Promise<ScanResult>;
}


Design rationale

Keeps adapters pluggable

Rules engine never cares about framework

Enables Flutter later with zero refactor

2️⃣ Shared Types (if not already created)

📁 packages/shared/types.ts

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

3️⃣ ExpoScanner — Architecture & Behavior

📁 packages/scanner/adapters/ExpoScanner.ts

Responsibilities

The ExpoScanner must:

Detect Expo projects

Parse Expo config

Parse permissions

Detect SDK usage

Produce evidence-backed capabilities

No guessing. No heuristics without evidence.

3.1 Detect Expo Project
import fs from "fs";
import path from "path";
import { ScannerAdapter } from "./ScannerAdapter";
import { ScanResult } from "../../shared/types";

export class ExpoScanner implements ScannerAdapter {
  id = "expo";

  detectProject(rootPath: string): boolean {
    return (
      fs.existsSync(path.join(rootPath, "app.json")) ||
      fs.existsSync(path.join(rootPath, "app.config.js")) ||
      fs.existsSync(path.join(rootPath, "app.config.ts"))
    );
  }

  async scan(rootPath: string): Promise<ScanResult> {
    // implemented below
    throw new Error("Not implemented");
  }
}

4️⃣ ExpoScanner.scan() — Step-by-Step Implementation
Step 1 — Load Expo config safely

📁 packages/scanner/utils/loadExpoConfig.ts

import path from "path";
import { getConfig } from "@expo/config";

export function loadExpoConfig(projectRoot: string) {
  const { exp } = getConfig(projectRoot, {
    skipSDKVersionRequirement: true
  });
  return exp;
}

Step 2 — Base ScanResult
import { loadExpoConfig } from "../utils/loadExpoConfig";
import { DetectedCapability, ScanResult } from "../../shared/types";

async scan(rootPath: string): Promise<ScanResult> {
  const exp = loadExpoConfig(rootPath);

  const capabilities: DetectedCapability[] = [];

  const result: ScanResult = {
    appName: exp.name ?? "Unknown App",
    bundleId:
      exp.ios?.bundleIdentifier ??
      exp.android?.package ??
      "unknown.bundle",
    platformTargets: [
      exp.ios ? "ios" : null,
      exp.android ? "android" : null
    ].filter(Boolean) as ("ios" | "android")[],
    capabilities
  };

  // capability detection below

  return result;
}

5️⃣ Capability Detection (FIRST 5 RULES)

We now implement detection for the exact rules you already defined.

5.1 Location (Foreground + Background)
Detect via Expo plugins & permissions
function detectLocation(exp: any, capabilities: DetectedCapability[]) {
  const evidence = [];

  if (exp.plugins?.includes("expo-location")) {
    evidence.push({
      file: "app.json / app.config",
      lines: [0, 0],
      snippet: "expo-location plugin detected"
    });

    capabilities.push({
      capability: "location_foreground",
      evidence
    });
  }

  if (
    exp.android?.permissions?.includes("ACCESS_BACKGROUND_LOCATION")
  ) {
    capabilities.push({
      capability: "location_background",
      evidence: [
        {
          file: "app.json / app.config",
          lines: [0, 0],
          snippet: "ACCESS_BACKGROUND_LOCATION permission declared"
        }
      ]
    });
  }
}

5.2 Notifications
function detectNotifications(exp: any, capabilities: DetectedCapability[]) {
  if (exp.plugins?.includes("expo-notifications")) {
    capabilities.push({
      capability: "notifications",
      evidence: [
        {
          file: "app.json / app.config",
          lines: [0, 0],
          snippet: "expo-notifications plugin detected"
        }
      ]
    });
  }
}

5.3 Authentication (Account Deletion Rule)
function detectAuthentication(exp: any, capabilities: DetectedCapability[]) {
  if (
    exp.extra?.firebase ||
    exp.plugins?.some((p: any) =>
      JSON.stringify(p).includes("firebase")
    )
  ) {
    capabilities.push({
      capability: "authentication",
      evidence: [
        {
          file: "app.json / app.config",
          lines: [0, 0],
          snippet: "Firebase authentication configuration detected"
        }
      ]
    });
  }
}

5.4 Screenshot Compliance (always evaluated)

This is not capability-based — always checked later by Asset Processor.

No scanner detection needed.

6️⃣ Wire It All Together

Inside scan():

detectLocation(exp, capabilities);
detectNotifications(exp, capabilities);
detectAuthentication(exp, capabilities);

7️⃣ Scanner Entry Point

📁 packages/scanner/index.ts

import { ExpoScanner } from "./adapters/ExpoScanner";

export function getScanner(rootPath: string) {
  const scanners = [new ExpoScanner()];

  const scanner = scanners.find(s => s.detectProject(rootPath));

  if (!scanner) {
    throw new Error("No supported project type detected");
  }

  return scanner;
}
