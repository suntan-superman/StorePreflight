/**
 * Expo Config Loader
 * Safely loads and parses Expo configuration files
 */

import fs from "fs";
import path from "path";

export interface ExpoConfig {
  name?: string;
  slug?: string;
  version?: string;
  ios?: {
    bundleIdentifier?: string;
    infoPlist?: Record<string, unknown>;
  };
  android?: {
    package?: string;
    permissions?: string[];
  };
  plugins?: Array<string | [string, unknown]>;
  extra?: Record<string, unknown>;
}

/**
 * Load Expo config from app.json or app.config.js/ts
 * Falls back to manual JSON parsing if @expo/config fails
 */
export function loadExpoConfig(projectRoot: string): ExpoConfig {
  // Try app.json first (most common)
  const appJsonPath = path.join(projectRoot, "app.json");
  if (fs.existsSync(appJsonPath)) {
    try {
      const content = fs.readFileSync(appJsonPath, "utf-8");
      const parsed = JSON.parse(content);
      // app.json wraps config in "expo" key
      return parsed.expo ?? parsed;
    } catch {
      // Fall through to other methods
    }
  }

  // Try app.config.json
  const appConfigJsonPath = path.join(projectRoot, "app.config.json");
  if (fs.existsSync(appConfigJsonPath)) {
    try {
      const content = fs.readFileSync(appConfigJsonPath, "utf-8");
      return JSON.parse(content);
    } catch {
      // Fall through
    }
  }

  // For app.config.js/ts, we'd need to evaluate them
  // For MVP, just return empty config if we can't load
  // In production, use @expo/config's getConfig()
  
  return {};
}

/**
 * Get plugin names from Expo config
 * Handles both string and [string, options] formats
 */
export function getPluginNames(config: ExpoConfig): string[] {
  if (!config.plugins) return [];

  return config.plugins.map((plugin) => {
    if (typeof plugin === "string") return plugin;
    if (Array.isArray(plugin) && typeof plugin[0] === "string") return plugin[0];
    return "";
  }).filter(Boolean);
}

/**
 * Check if a specific plugin is installed
 */
export function hasPlugin(config: ExpoConfig, pluginName: string): boolean {
  const plugins = getPluginNames(config);
  return plugins.some((p) => p.includes(pluginName));
}
