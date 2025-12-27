Add AST scanning (JS/TS) for runtime detection
Goal

Don’t just rely on Expo config/plugins. Detect actual runtime usage such as:

Location.startLocationUpdatesAsync → background location behavior

TaskManager.defineTask / expo-background-fetch usage → background tasks

Notifications.getExpoPushTokenAsync → notifications

Camera usage → camera/mic

Approach (practical + fast)

Use ts-morph (clean for TS/JS) and string-match common APIs with evidence line numbers.

Install in packages/scanner

ts-morph

fast-glob

File: AST scan utility

📁 packages/scanner/utils/astScan.ts

import path from "path";
import fg from "fast-glob";
import { Project } from "ts-morph";
import { Evidence, Capability } from "../../shared/types";

type Hit = { capability: Capability; evidence: Evidence };

const PATTERNS: Array<{
  capability: Capability;
  // simple string patterns for MVP; upgrade later with real AST symbol resolution
  includesAny: string[];
}> = [
  {
    capability: "location_foreground",
    includesAny: ["requestForegroundPermissionsAsync", "getCurrentPositionAsync", "watchPositionAsync"],
  },
  {
    capability: "location_background",
    includesAny: ["startLocationUpdatesAsync", "stopLocationUpdatesAsync", "hasStartedLocationUpdatesAsync"],
  },
  {
    capability: "background_tasks",
    includesAny: ["TaskManager.defineTask", "expo-task-manager", "expo-background-fetch", "BackgroundFetch"],
  },
  {
    capability: "notifications",
    includesAny: ["getExpoPushTokenAsync", "scheduleNotificationAsync", "setNotificationHandler", "expo-notifications"],
  },
  {
    capability: "camera",
    includesAny: ["expo-camera", "CameraView", "Camera.requestCameraPermissionsAsync"],
  },
  {
    capability: "microphone",
    includesAny: ["Audio.requestPermissionsAsync", "expo-av", "RECORD_AUDIO"],
  },
  {
    capability: "maps",
    includesAny: ["react-native-maps", "MapView", "googleMapsApiKey"],
  },
  {
    capability: "payments",
    includesAny: ["stripe", "@stripe/stripe-react-native", "in_app_purchase", "expo-in-app-purchases"],
  },
  {
    capability: "authentication",
    includesAny: ["firebase/auth", "signInWithEmailAndPassword", "createUserWithEmailAndPassword", "expo-apple-authentication"],
  },
  {
    capability: "analytics",
    includesAny: ["sentry", "@sentry", "firebase/analytics", "logEvent("],
  },
];

function toEvidence(fileAbs: string, line: number, snippet: string): Evidence {
  return {
    file: fileAbs,
    lines: [line, line],
    snippet: snippet.slice(0, 200),
  };
}

export async function scanSourceForCapabilities(rootPath: string): Promise<Map<Capability, Evidence[]>> {
  const srcGlobs = [
    "src/**/*.{ts,tsx,js,jsx}",
    "app/**/*.{ts,tsx,js,jsx}",
    "components/**/*.{ts,tsx,js,jsx}",
    "*.{ts,tsx,js,jsx}",
  ];

  const files = await fg(srcGlobs, {
    cwd: rootPath,
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.expo/**"],
  });

  const project = new Project({
    // no tsconfig required; good enough for scanning
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths(files);

  const hits = new Map<Capability, Evidence[]>();

  for (const sf of project.getSourceFiles()) {
    const text = sf.getFullText();

    for (const rule of PATTERNS) {
      for (const needle of rule.includesAny) {
        const idx = text.indexOf(needle);
        if (idx === -1) continue;

        // capture nearest line by using ts-morph to compute position
        const pos = sf.getLineAndColumnAtPos(idx);
        const line = pos.line;

        const snippetStart = Math.max(0, idx - 60);
        const snippetEnd = Math.min(text.length, idx + 120);
        const snippet = text.slice(snippetStart, snippetEnd);

        const ev = toEvidence(sf.getFilePath(), line, snippet);

        const arr = hits.get(rule.capability) ?? [];
        arr.push(ev);
        hits.set(rule.capability, arr);

        // avoid spamming; one hit per file per needle is enough for MVP
        break;
      }
    }
  }

  return hits;
}

Integrate AST scan into ExpoScanner

In ExpoScanner.scan() after config-based detection:

call scanSourceForCapabilities(rootPath)

merge evidence into capabilities[] (dedupe)

add capability if found even when plugin not detected

This makes the scanner much more accurate and future-proof.