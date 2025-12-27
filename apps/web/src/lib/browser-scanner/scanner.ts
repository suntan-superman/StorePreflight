/**
 * Browser-based Expo Scanner
 * Scans project files for capabilities using pattern matching
 */

import type {
  FileEntry,
  ScanResult,
  DetectedCapability,
  Capability,
  Evidence,
} from "./types";

/**
 * Pattern definitions for capability detection
 */
interface DetectionPattern {
  capability: Capability;
  patterns: string[];
}

const DETECTION_PATTERNS: DetectionPattern[] = [
  {
    capability: "location_foreground",
    patterns: [
      "requestForegroundPermissionsAsync",
      "getCurrentPositionAsync",
      "watchPositionAsync",
      "expo-location",
      "Geolocation.getCurrentPosition",
      "Geolocation.watchPosition",
    ],
  },
  {
    capability: "location_background",
    patterns: [
      "startLocationUpdatesAsync",
      "stopLocationUpdatesAsync",
      "hasStartedLocationUpdatesAsync",
      "requestBackgroundPermissionsAsync",
      "ACCESS_BACKGROUND_LOCATION",
      "NSLocationAlwaysAndWhenInUseUsageDescription",
    ],
  },
  {
    capability: "background_tasks",
    patterns: [
      "TaskManager.defineTask",
      "expo-task-manager",
      "expo-background-fetch",
      "BackgroundFetch.registerTaskAsync",
      "registerTaskAsync",
    ],
  },
  {
    capability: "notifications",
    patterns: [
      "getExpoPushTokenAsync",
      "scheduleNotificationAsync",
      "setNotificationHandler",
      "expo-notifications",
      "getDevicePushTokenAsync",
      "requestPermissionsAsync",
    ],
  },
  {
    capability: "camera",
    patterns: [
      "expo-camera",
      "CameraView",
      "Camera.requestCameraPermissionsAsync",
      "useCameraPermissions",
      "NSCameraUsageDescription",
    ],
  },
  {
    capability: "microphone",
    patterns: [
      "Audio.requestPermissionsAsync",
      "expo-av",
      "RECORD_AUDIO",
      "useAudioRecorder",
      "Audio.Recording",
      "NSMicrophoneUsageDescription",
    ],
  },
  {
    capability: "photo_library",
    patterns: [
      "expo-image-picker",
      "launchImageLibraryAsync",
      "MediaLibrary.requestPermissionsAsync",
      "expo-media-library",
      "NSPhotoLibraryUsageDescription",
    ],
  },
  {
    capability: "file_storage",
    patterns: [
      "expo-file-system",
      "FileSystem.writeAsStringAsync",
      "FileSystem.downloadAsync",
      "expo-document-picker",
      "DocumentPicker",
    ],
  },
  {
    capability: "maps",
    patterns: [
      "react-native-maps",
      "MapView",
      "googleMapsApiKey",
      "PROVIDER_GOOGLE",
    ],
  },
  {
    capability: "payments",
    patterns: [
      "stripe",
      "@stripe/stripe-react-native",
      "expo-in-app-purchases",
      "react-native-iap",
      "initPaymentSheet",
      "presentPaymentSheet",
    ],
  },
  {
    capability: "authentication",
    patterns: [
      "firebase/auth",
      "signInWithEmailAndPassword",
      "createUserWithEmailAndPassword",
      "expo-apple-authentication",
      "expo-auth-session",
      "@react-native-google-signin",
      "GoogleSignin",
    ],
  },
  {
    capability: "analytics",
    patterns: [
      "@sentry/react-native",
      "sentry-expo",
      "firebase/analytics",
      "logEvent",
      "expo-firebase-analytics",
      "amplitude",
      "mixpanel",
      "Sentry.init",
    ],
  },
];

/**
 * Parse Expo config from app.json content
 */
function parseExpoConfig(content: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(content);
    // Expo config can be wrapped in "expo" key or at root
    return parsed.expo ?? parsed;
  } catch (e) {
    console.warn("Failed to parse app.json:", e);
    return null;
  }
}

/**
 * Parse Expo config from app.config.js content
 * Attempts to extract the config object from JS/TS export
 */
function parseJsConfig(content: string): Record<string, unknown> | null {
  try {
    // Try to extract JSON-like object from the file
    // Look for patterns like: export default { ... } or module.exports = { ... }
    
    // Find the main config object - look for common patterns
    const patterns = [
      /export\s+default\s+(\{[\s\S]*\});?\s*$/m,
      /module\.exports\s*=\s*(\{[\s\S]*\});?\s*$/m,
      /export\s+default\s+\(\s*\)\s*=>\s*\(?\s*(\{[\s\S]*\})\)?;?\s*$/m,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        // Try to parse as JSON (won't work for all JS, but works for simple configs)
        // First, convert JS object syntax to JSON-compatible
        let configStr = match[1];
        
        // Simple conversions - won't handle all cases but catches common ones
        configStr = configStr
          .replace(/(\w+):/g, '"$1":')  // unquoted keys to quoted
          .replace(/'/g, '"')           // single quotes to double
          .replace(/,(\s*[}\]])/g, '$1') // trailing commas
          .replace(/\/\/[^\n]*/g, '')   // remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, ''); // remove multi-line comments
        
        try {
          const parsed = JSON.parse(configStr);
          return parsed.expo ?? parsed;
        } catch {
          // JSON parse failed, continue trying other patterns
        }
      }
    }
    
    // Fallback: extract specific values with regex
    const config: Record<string, unknown> = {};
    
    // Extract name
    const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
    if (nameMatch) config.name = nameMatch[1];
    
    // Extract slug
    const slugMatch = content.match(/slug:\s*["']([^"']+)["']/);
    if (slugMatch) config.slug = slugMatch[1];
    
    // Extract iOS bundleIdentifier
    const bundleIdMatch = content.match(/bundleIdentifier:\s*["']([^"']+)["']/);
    if (bundleIdMatch) {
      config.ios = { bundleIdentifier: bundleIdMatch[1] };
    }
    
    // Extract Android package
    const packageMatch = content.match(/package:\s*["']([^"']+)["']/);
    if (packageMatch) {
      config.android = { package: packageMatch[1] };
    }
    
    if (Object.keys(config).length > 0) {
      console.log("Extracted config via regex:", config);
      return config;
    }
    
    return null;
  } catch (e) {
    console.warn("Failed to parse app.config.js:", e);
    return null;
  }
}

/**
 * Extract app metadata from config
 */
function extractAppMetadata(
  files: Map<string, FileEntry>
): { appName: string; bundleId: string; platformTargets: ("ios" | "android")[] } {
  let appName = "Unknown App";
  let bundleId = "unknown.bundle.id";
  const platformTargets: ("ios" | "android")[] = [];
  let config: Record<string, unknown> | null = null;

  // Try app.json first
  const appJson = files.get("app.json");
  if (appJson) {
    console.log("Found app.json, parsing...");
    config = parseExpoConfig(appJson.content);
  }
  
  // Try app.config.js if no app.json
  if (!config) {
    const appConfigJs = files.get("app.config.js");
    if (appConfigJs) {
      console.log("Found app.config.js, parsing...");
      config = parseJsConfig(appConfigJs.content);
    }
  }
  
  // Try app.config.ts if still no config
  if (!config) {
    const appConfigTs = files.get("app.config.ts");
    if (appConfigTs) {
      console.log("Found app.config.ts, parsing...");
      config = parseJsConfig(appConfigTs.content);
    }
  }
  
  if (config) {
    console.log("Parsed config keys:", Object.keys(config));
    
    // Get app name - try multiple locations
    appName = 
      (config.name as string) ?? 
      (config.displayName as string) ?? 
      (config.slug as string) ?? 
      appName;
      
    const ios = config.ios as Record<string, unknown> | undefined;
    const android = config.android as Record<string, unknown> | undefined;
    
    bundleId = 
      (ios?.bundleIdentifier as string) ??
      (android?.package as string) ??
      (config.bundleIdentifier as string) ??
      (config.package as string) ??
      bundleId;
    
    console.log("Extracted app name:", appName, "bundle:", bundleId);
    
    // Assume both platforms unless explicitly disabled
    platformTargets.push("ios", "android");
  } else {
    console.log("No config found. Available files:", Array.from(files.keys()).slice(0, 20));
  }
  
  // Fallback: try package.json
  if (appName === "Unknown App") {
    const packageJson = files.get("package.json");
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content);
        appName = pkg.name ?? appName;
        console.log("Got app name from package.json:", appName);
      } catch {
        // Ignore
      }
    }
  }

  return { appName, bundleId, platformTargets };
}

/**
 * Find line number for a pattern match
 */
function findLineNumber(content: string, pattern: string): number {
  const index = content.indexOf(pattern);
  if (index === -1) return 1;
  
  const lines = content.substring(0, index).split("\n");
  return lines.length;
}

/**
 * Extract snippet around a pattern match
 */
function extractSnippet(content: string, pattern: string): string {
  const index = content.indexOf(pattern);
  if (index === -1) return pattern;
  
  const start = Math.max(0, index - 40);
  const end = Math.min(content.length, index + 80);
  return content.substring(start, end).trim();
}

/**
 * Scan files for capability patterns
 */
function scanForCapabilities(
  files: Map<string, FileEntry>
): DetectedCapability[] {
  const capabilityMap = new Map<Capability, Evidence[]>();

  // Scan each file
  for (const [filePath, file] of files) {
    const content = file.content;

    // Check each detection pattern
    for (const detection of DETECTION_PATTERNS) {
      for (const pattern of detection.patterns) {
        if (content.includes(pattern)) {
          const evidence: Evidence = {
            file: filePath,
            lines: [findLineNumber(content, pattern), findLineNumber(content, pattern)],
            snippet: extractSnippet(content, pattern),
          };

          const existing = capabilityMap.get(detection.capability) ?? [];
          
          // Avoid duplicate evidence from same file for same pattern
          const isDuplicate = existing.some(
            (e) => e.file === filePath && e.snippet.includes(pattern)
          );
          
          if (!isDuplicate) {
            existing.push(evidence);
            capabilityMap.set(detection.capability, existing);
          }
          
          // One match per pattern per file is enough
          break;
        }
      }
    }
  }

  // Convert map to array
  const capabilities: DetectedCapability[] = [];
  for (const [capability, evidence] of capabilityMap) {
    capabilities.push({ capability, evidence });
  }

  return capabilities;
}

/**
 * Main scan function - runs entirely in browser
 */
export function scanProject(files: Map<string, FileEntry>): ScanResult {
  const metadata = extractAppMetadata(files);
  const capabilities = scanForCapabilities(files);

  return {
    ...metadata,
    capabilities,
  };
}
