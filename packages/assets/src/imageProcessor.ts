/**
 * Image Processor for Google Play & App Store Assets
 * Normalizes screenshots, icons, and feature graphics to store requirements
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { ScreenshotValidation, IconValidation } from "@storepreflight/shared";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Google Play screenshot dimensions (portrait) */
const PLAY_SCREENSHOT_WIDTH = 1080;
const PLAY_SCREENSHOT_HEIGHT = 1920;

/** Google Play feature graphic dimensions */
const FEATURE_GRAPHIC_WIDTH = 1024;
const FEATURE_GRAPHIC_HEIGHT = 500;

/** App icon dimensions */
const ICON_SIZE = 512;

/** Maximum file size for screenshots (8MB) */
const MAX_SCREENSHOT_SIZE = 8 * 1024 * 1024;

// =============================================================================
// SCREENSHOT PROCESSING
// =============================================================================

export interface ScreenshotJob {
  /** Array of input image paths */
  inputPaths: string[];
  /** Output directory for processed images */
  outputDir: string;
}

export interface ScreenshotResult {
  /** Original input path */
  inputPath: string;
  /** Processed output path */
  outputPath: string;
  /** Whether processing succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Normalize screenshots to Google Play requirements
 * - 1080 × 1920 PNG
 * - sRGB color space
 * - No alpha channel (flattened to white)
 * - Under 8 MB
 */
export async function normalizeScreenshotsToPlay(
  job: ScreenshotJob
): Promise<ScreenshotResult[]> {
  fs.mkdirSync(job.outputDir, { recursive: true });

  const results: ScreenshotResult[] = [];

  for (const inputPath of job.inputPaths) {
    const baseName = path.basename(inputPath).replace(/\.(png|jpg|jpeg|webp)$/i, "");
    const outputPath = path.join(job.outputDir, `${baseName}_1080x1920.png`);

    try {
      // Load image and flatten alpha channel
      await sharp(inputPath)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .resize(PLAY_SCREENSHOT_WIDTH, PLAY_SCREENSHOT_HEIGHT, {
          fit: "cover",
          position: "centre",
        })
        .png({ compressionLevel: 9, palette: false })
        .toFile(outputPath);

      results.push({
        inputPath,
        outputPath,
        success: true,
      });
    } catch (err) {
      results.push({
        inputPath,
        outputPath,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Validate a screenshot against Google Play requirements
 */
export async function validateScreenshot(
  inputPath: string
): Promise<ScreenshotValidation> {
  try {
    const meta = await sharp(inputPath).metadata();
    const stats = fs.statSync(inputPath);

    const issues: string[] = [];

    if (!meta.width || !meta.height) {
      return {
        inputPath,
        valid: false,
        width: 0,
        height: 0,
        issues: ["Cannot read image dimensions"],
      };
    }

    // Check dimensions
    const aspectRatio = meta.width / meta.height;
    const is9by16 = Math.abs(aspectRatio - 9 / 16) < 0.01;
    const is16by9 = Math.abs(aspectRatio - 16 / 9) < 0.01;

    if (!is9by16 && !is16by9) {
      issues.push(`Aspect ratio ${aspectRatio.toFixed(2)} is not 9:16 or 16:9`);
    }

    // Check minimum dimensions
    const minSide = Math.min(meta.width, meta.height);
    const maxSide = Math.max(meta.width, meta.height);

    if (minSide < 320) {
      issues.push(`Minimum dimension ${minSide}px is below 320px`);
    }
    if (maxSide > 3840) {
      issues.push(`Maximum dimension ${maxSide}px exceeds 3840px`);
    }
    if (minSide < 1080) {
      issues.push(`For promotion eligibility, shortest side should be at least 1080px (currently ${minSide}px)`);
    }

    // Check file size
    if (stats.size > MAX_SCREENSHOT_SIZE) {
      issues.push(`File size ${(stats.size / 1024 / 1024).toFixed(2)}MB exceeds 8MB limit`);
    }

    // Check for alpha channel
    if (meta.hasAlpha) {
      issues.push("Image has alpha channel - will be flattened during processing");
    }

    return {
      inputPath,
      valid: issues.length === 0,
      width: meta.width,
      height: meta.height,
      issues,
    };
  } catch (err) {
    return {
      inputPath,
      valid: false,
      width: 0,
      height: 0,
      issues: [err instanceof Error ? err.message : "Failed to read image"],
    };
  }
}

// =============================================================================
// FEATURE GRAPHIC PROCESSING
// =============================================================================

/**
 * Create a Google Play feature graphic (1024 × 500 JPG)
 */
export async function createFeatureGraphic(
  inputPath: string,
  outputPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await sharp(inputPath)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .resize(FEATURE_GRAPHIC_WIDTH, FEATURE_GRAPHIC_HEIGHT, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(outputPath);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// =============================================================================
// ICON PROCESSING
// =============================================================================

/**
 * Validate an app icon
 */
export async function validateIcon(inputPath: string): Promise<IconValidation> {
  try {
    const meta = await sharp(inputPath).metadata();

    const isCorrectSize = meta.width === ICON_SIZE && meta.height === ICON_SIZE;

    return {
      ok: isCorrectSize,
      width: meta.width,
      height: meta.height,
      message: isCorrectSize
        ? "Icon is 512×512 ✓"
        : `Icon must be exactly 512×512 (currently ${meta.width}×${meta.height})`,
    };
  } catch (err) {
    return {
      ok: false,
      width: undefined,
      height: undefined,
      message: err instanceof Error ? err.message : "Failed to read icon",
    };
  }
}

/**
 * Resize an icon to 512×512
 */
export async function fixIconTo512(
  inputPath: string,
  outputPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await sharp(inputPath)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .resize(ICON_SIZE, ICON_SIZE, {
        fit: "cover",
        position: "centre",
      })
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

export interface AssetProcessingResult {
  screenshots: ScreenshotResult[];
  featureGraphic?: { success: boolean; outputPath?: string; error?: string };
  icon?: { success: boolean; outputPath?: string; error?: string };
}

export interface AssetProcessingJob {
  /** Screenshot paths to process */
  screenshotPaths?: string[];
  /** Feature graphic input path */
  featureGraphicPath?: string;
  /** Icon input path */
  iconPath?: string;
  /** Base output directory */
  outputDir: string;
}

/**
 * Process all assets in one batch operation
 */
export async function processAllAssets(
  job: AssetProcessingJob
): Promise<AssetProcessingResult> {
  const result: AssetProcessingResult = {
    screenshots: [],
  };

  // Process screenshots
  if (job.screenshotPaths && job.screenshotPaths.length > 0) {
    const screenshotOutputDir = path.join(job.outputDir, "screenshots");
    result.screenshots = await normalizeScreenshotsToPlay({
      inputPaths: job.screenshotPaths,
      outputDir: screenshotOutputDir,
    });
  }

  // Process feature graphic
  if (job.featureGraphicPath) {
    const outputPath = path.join(job.outputDir, "feature-graphic.jpg");
    fs.mkdirSync(job.outputDir, { recursive: true });
    const fgResult = await createFeatureGraphic(job.featureGraphicPath, outputPath);
    result.featureGraphic = {
      ...fgResult,
      outputPath: fgResult.success ? outputPath : undefined,
    };
  }

  // Process icon
  if (job.iconPath) {
    const validation = await validateIcon(job.iconPath);
    if (validation.ok) {
      // Icon is already correct, just copy it
      const outputPath = path.join(job.outputDir, "icon-512.png");
      fs.mkdirSync(job.outputDir, { recursive: true });
      fs.copyFileSync(job.iconPath, outputPath);
      result.icon = { success: true, outputPath };
    } else {
      // Fix the icon
      const outputPath = path.join(job.outputDir, "icon-512.png");
      fs.mkdirSync(job.outputDir, { recursive: true });
      const iconResult = await fixIconTo512(job.iconPath, outputPath);
      result.icon = {
        ...iconResult,
        outputPath: iconResult.success ? outputPath : undefined,
      };
    }
  }

  return result;
}
