/**
 * AST Scanner for JS/TS Source Files
 * Detects runtime API usage that indicates capabilities
 */

import path from "path";
import fg from "fast-glob";
import { Project } from "ts-morph";
import type { Capability, Evidence } from "@storepreflight/shared";

/**
 * Pattern matching rules for capability detection
 */
interface DetectionPattern {
  capability: Capability;
  /** Strings to search for in source code */
  includesAny: string[];
}

const PATTERNS: DetectionPattern[] = [
  {
    capability: "location_foreground",
    includesAny: [
      "requestForegroundPermissionsAsync",
      "getCurrentPositionAsync",
      "watchPositionAsync",
      "Geolocation.getCurrentPosition",
      "Geolocation.watchPosition",
    ],
  },
  {
    capability: "location_background",
    includesAny: [
      "startLocationUpdatesAsync",
      "stopLocationUpdatesAsync",
      "hasStartedLocationUpdatesAsync",
      "requestBackgroundPermissionsAsync",
    ],
  },
  {
    capability: "background_tasks",
    includesAny: [
      "TaskManager.defineTask",
      "expo-task-manager",
      "expo-background-fetch",
      "BackgroundFetch.registerTaskAsync",
    ],
  },
  {
    capability: "notifications",
    includesAny: [
      "getExpoPushTokenAsync",
      "scheduleNotificationAsync",
      "setNotificationHandler",
      "expo-notifications",
      "getDevicePushTokenAsync",
    ],
  },
  {
    capability: "camera",
    includesAny: [
      "expo-camera",
      "CameraView",
      "Camera.requestCameraPermissionsAsync",
      "useCameraPermissions",
    ],
  },
  {
    capability: "microphone",
    includesAny: [
      "Audio.requestPermissionsAsync",
      "expo-av",
      "RECORD_AUDIO",
      "useAudioRecorder",
      "Audio.Recording",
    ],
  },
  {
    capability: "photo_library",
    includesAny: [
      "expo-image-picker",
      "launchImageLibraryAsync",
      "MediaLibrary.requestPermissionsAsync",
      "expo-media-library",
    ],
  },
  {
    capability: "file_storage",
    includesAny: [
      "expo-file-system",
      "FileSystem.writeAsStringAsync",
      "FileSystem.downloadAsync",
      "expo-document-picker",
    ],
  },
  {
    capability: "maps",
    includesAny: [
      "react-native-maps",
      "MapView",
      "googleMapsApiKey",
      "PROVIDER_GOOGLE",
    ],
  },
  {
    capability: "payments",
    includesAny: [
      "stripe",
      "@stripe/stripe-react-native",
      "expo-in-app-purchases",
      "react-native-iap",
      "initPaymentSheet",
    ],
  },
  {
    capability: "authentication",
    includesAny: [
      "firebase/auth",
      "signInWithEmailAndPassword",
      "createUserWithEmailAndPassword",
      "expo-apple-authentication",
      "expo-auth-session",
      "@react-native-google-signin",
    ],
  },
  {
    capability: "analytics",
    includesAny: [
      "@sentry/react-native",
      "sentry-expo",
      "firebase/analytics",
      "logEvent(",
      "expo-firebase-analytics",
      "amplitude",
      "mixpanel",
    ],
  },
];

/**
 * Create an Evidence object from a file match
 */
function createEvidence(
  filePath: string,
  line: number,
  snippet: string
): Evidence {
  return {
    file: filePath,
    lines: [line, line],
    snippet: snippet.slice(0, 200).trim(),
  };
}

/**
 * Scan source files for capability usage patterns
 * @param rootPath - Project root directory
 * @returns Map of capabilities to their evidence
 */
export async function scanSourceForCapabilities(
  rootPath: string
): Promise<Map<Capability, Evidence[]>> {
  // Glob patterns to find source files
  const srcGlobs = [
    "src/**/*.{ts,tsx,js,jsx}",
    "app/**/*.{ts,tsx,js,jsx}",
    "components/**/*.{ts,tsx,js,jsx}",
    "screens/**/*.{ts,tsx,js,jsx}",
    "lib/**/*.{ts,tsx,js,jsx}",
    "hooks/**/*.{ts,tsx,js,jsx}",
    "*.{ts,tsx,js,jsx}",
  ];

  // Find all matching files
  const files = await fg(srcGlobs, {
    cwd: rootPath,
    absolute: true,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
    ],
  });

  if (files.length === 0) {
    return new Map();
  }

  // Create ts-morph project for parsing
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      jsx: 2, // React
    },
  });

  project.addSourceFilesAtPaths(files);

  const hits = new Map<Capability, Evidence[]>();

  // Scan each source file
  for (const sourceFile of project.getSourceFiles()) {
    const text = sourceFile.getFullText();
    const filePath = sourceFile.getFilePath();
    
    // Make path relative for cleaner output
    const relativePath = path.relative(rootPath, filePath);

    // Check each pattern
    for (const pattern of PATTERNS) {
      for (const needle of pattern.includesAny) {
        const idx = text.indexOf(needle);
        if (idx === -1) continue;

        // Get line number using ts-morph
        const pos = sourceFile.getLineAndColumnAtPos(idx);
        const line = pos.line;

        // Extract snippet around the match
        const snippetStart = Math.max(0, idx - 40);
        const snippetEnd = Math.min(text.length, idx + 80);
        const snippet = text.slice(snippetStart, snippetEnd);

        const evidence = createEvidence(relativePath, line, snippet);

        // Add to hits map
        const existing = hits.get(pattern.capability) ?? [];
        existing.push(evidence);
        hits.set(pattern.capability, existing);

        // Only capture first hit per pattern per file (avoid spam)
        break;
      }
    }
  }

  return hits;
}
