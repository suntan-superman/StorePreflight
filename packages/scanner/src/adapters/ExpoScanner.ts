/**
 * ExpoScanner - Scanner adapter for Expo/React Native projects
 */

import fs from "fs";
import path from "path";
import type { ScannerAdapter } from "./ScannerAdapter.js";
import type { 
  ScanResult, 
  DetectedCapability, 
  Capability, 
  Evidence 
} from "@storepreflight/shared";
import { uniqueEvidence } from "@storepreflight/shared";
import { 
  loadExpoConfig, 
  hasPlugin, 
  type ExpoConfig 
} from "../utils/loadExpoConfig.js";
import { scanSourceForCapabilities } from "../utils/astScan.js";

export class ExpoScanner implements ScannerAdapter {
  id = "expo";

  /**
   * Detect if this is an Expo project
   */
  detectProject(rootPath: string): boolean {
    const markers = [
      "app.json",
      "app.config.js",
      "app.config.ts",
      "app.config.json",
    ];

    for (const marker of markers) {
      const markerPath = path.join(rootPath, marker);
      if (fs.existsSync(markerPath)) {
        // Verify it's an Expo project by checking for expo in app.json
        if (marker === "app.json") {
          try {
            const content = fs.readFileSync(markerPath, "utf-8");
            const parsed = JSON.parse(content);
            if (parsed.expo) return true;
          } catch {
            // Not valid JSON
          }
        } else {
          return true;
        }
      }
    }

    // Also check package.json for expo dependency
    const packageJsonPath = path.join(rootPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const content = fs.readFileSync(packageJsonPath, "utf-8");
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps["expo"]) return true;
      } catch {
        // Not valid JSON
      }
    }

    return false;
  }

  /**
   * Perform full project scan
   */
  async scan(rootPath: string): Promise<ScanResult> {
    const config = loadExpoConfig(rootPath);
    const capabilities: DetectedCapability[] = [];

    // Detect capabilities from config
    this.detectLocationCapabilities(config, capabilities);
    this.detectNotificationCapabilities(config, capabilities);
    this.detectCameraCapabilities(config, capabilities);
    this.detectMicrophoneCapabilities(config, capabilities);
    this.detectAuthenticationCapabilities(config, capabilities);
    this.detectMapsCapabilities(config, capabilities);
    this.detectPaymentCapabilities(config, capabilities);
    this.detectAnalyticsCapabilities(config, capabilities);
    this.detectFileStorageCapabilities(config, capabilities);
    this.detectPhotoLibraryCapabilities(config, capabilities);

    // AST scan for runtime usage
    const astHits = await scanSourceForCapabilities(rootPath);
    
    // Merge AST evidence into capabilities
    for (const [capability, evidence] of astHits) {
      const existing = capabilities.find((c) => c.capability === capability);
      if (existing) {
        existing.evidence.push(...evidence);
        existing.evidence = uniqueEvidence(existing.evidence);
      } else {
        capabilities.push({ capability, evidence });
      }
    }

    // Determine platform targets
    const platformTargets: ("ios" | "android")[] = [];
    if (config.ios || config.ios === undefined) platformTargets.push("ios");
    if (config.android || config.android === undefined) platformTargets.push("android");

    return {
      appName: config.name ?? config.slug ?? "Unknown App",
      bundleId:
        config.ios?.bundleIdentifier ??
        config.android?.package ??
        "unknown.bundle.id",
      platformTargets,
      capabilities,
    };
  }

  // =========================================================================
  // Capability Detection Methods
  // =========================================================================

  private detectLocationCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    // Foreground location
    if (hasPlugin(config, "expo-location")) {
      capabilities.push({
        capability: "location_foreground",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "expo-location plugin detected",
          },
        ],
      });
    }

    // Background location from Android permissions
    const androidPerms = config.android?.permissions ?? [];
    if (androidPerms.includes("ACCESS_BACKGROUND_LOCATION")) {
      capabilities.push({
        capability: "location_background",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "ACCESS_BACKGROUND_LOCATION permission declared",
          },
        ],
      });
    }

    // Check iOS info.plist for location
    const infoPlist = config.ios?.infoPlist ?? {};
    if (infoPlist["NSLocationAlwaysAndWhenInUseUsageDescription"]) {
      const existing = capabilities.find(
        (c) => c.capability === "location_background"
      );
      const ev: Evidence = {
        file: "app.json (ios.infoPlist)",
        lines: [0, 0],
        snippet: "NSLocationAlwaysAndWhenInUseUsageDescription defined",
      };
      if (existing) {
        existing.evidence.push(ev);
      } else {
        capabilities.push({ capability: "location_background", evidence: [ev] });
      }
    }
  }

  private detectNotificationCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    if (hasPlugin(config, "expo-notifications")) {
      capabilities.push({
        capability: "notifications",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "expo-notifications plugin detected",
          },
        ],
      });
    }
  }

  private detectCameraCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    if (hasPlugin(config, "expo-camera")) {
      capabilities.push({
        capability: "camera",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "expo-camera plugin detected",
          },
        ],
      });
    }

    const infoPlist = config.ios?.infoPlist ?? {};
    if (infoPlist["NSCameraUsageDescription"]) {
      const existing = capabilities.find((c) => c.capability === "camera");
      const ev: Evidence = {
        file: "app.json (ios.infoPlist)",
        lines: [0, 0],
        snippet: "NSCameraUsageDescription defined",
      };
      if (existing) {
        existing.evidence.push(ev);
      } else {
        capabilities.push({ capability: "camera", evidence: [ev] });
      }
    }
  }

  private detectMicrophoneCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    if (hasPlugin(config, "expo-av")) {
      capabilities.push({
        capability: "microphone",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "expo-av plugin detected (may include audio recording)",
          },
        ],
      });
    }

    const infoPlist = config.ios?.infoPlist ?? {};
    if (infoPlist["NSMicrophoneUsageDescription"]) {
      const existing = capabilities.find((c) => c.capability === "microphone");
      const ev: Evidence = {
        file: "app.json (ios.infoPlist)",
        lines: [0, 0],
        snippet: "NSMicrophoneUsageDescription defined",
      };
      if (existing) {
        existing.evidence.push(ev);
      } else {
        capabilities.push({ capability: "microphone", evidence: [ev] });
      }
    }
  }

  private detectAuthenticationCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    const plugins = config.plugins ?? [];
    const pluginStr = JSON.stringify(plugins);

    if (
      pluginStr.includes("firebase") ||
      pluginStr.includes("expo-apple-authentication") ||
      pluginStr.includes("expo-auth-session")
    ) {
      capabilities.push({
        capability: "authentication",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "Authentication plugin detected",
          },
        ],
      });
    }

    // Check extra config for firebase
    if (config.extra && JSON.stringify(config.extra).includes("firebase")) {
      const existing = capabilities.find(
        (c) => c.capability === "authentication"
      );
      const ev: Evidence = {
        file: "app.json (extra)",
        lines: [0, 0],
        snippet: "Firebase configuration detected in extra",
      };
      if (existing) {
        existing.evidence.push(ev);
      } else {
        capabilities.push({ capability: "authentication", evidence: [ev] });
      }
    }
  }

  private detectMapsCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    const configStr = JSON.stringify(config);

    if (
      configStr.includes("react-native-maps") ||
      configStr.includes("googleMapsApiKey")
    ) {
      capabilities.push({
        capability: "maps",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "Maps configuration detected",
          },
        ],
      });
    }
  }

  private detectPaymentCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    const plugins = config.plugins ?? [];
    const pluginStr = JSON.stringify(plugins);

    if (
      pluginStr.includes("stripe") ||
      pluginStr.includes("expo-in-app-purchases")
    ) {
      capabilities.push({
        capability: "payments",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "Payment plugin detected",
          },
        ],
      });
    }
  }

  private detectAnalyticsCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    const plugins = config.plugins ?? [];
    const pluginStr = JSON.stringify(plugins);

    if (
      pluginStr.includes("sentry") ||
      pluginStr.includes("firebase-analytics") ||
      pluginStr.includes("expo-firebase-analytics")
    ) {
      capabilities.push({
        capability: "analytics",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "Analytics plugin detected",
          },
        ],
      });
    }
  }

  private detectFileStorageCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    if (
      hasPlugin(config, "expo-file-system") ||
      hasPlugin(config, "expo-document-picker")
    ) {
      capabilities.push({
        capability: "file_storage",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "File system plugin detected",
          },
        ],
      });
    }
  }

  private detectPhotoLibraryCapabilities(
    config: ExpoConfig,
    capabilities: DetectedCapability[]
  ): void {
    if (
      hasPlugin(config, "expo-image-picker") ||
      hasPlugin(config, "expo-media-library")
    ) {
      capabilities.push({
        capability: "photo_library",
        evidence: [
          {
            file: "app.json",
            lines: [0, 0],
            snippet: "Photo library plugin detected",
          },
        ],
      });
    }

    const infoPlist = config.ios?.infoPlist ?? {};
    if (infoPlist["NSPhotoLibraryUsageDescription"]) {
      const existing = capabilities.find(
        (c) => c.capability === "photo_library"
      );
      const ev: Evidence = {
        file: "app.json (ios.infoPlist)",
        lines: [0, 0],
        snippet: "NSPhotoLibraryUsageDescription defined",
      };
      if (existing) {
        existing.evidence.push(ev);
      } else {
        capabilities.push({ capability: "photo_library", evidence: [ev] });
      }
    }
  }
}
