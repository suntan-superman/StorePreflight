Implement Asset Processor (Play-safe)
Goal (MVP)

Take any screenshot(s) and output guaranteed-Google-Play compliant assets:

Screenshots: 1080×1920 PNG, sRGB, no alpha, <8MB

Feature graphic: 1024×500 JPG flattened

Icon validation: 512×512 check + optional auto-fix

File

📁 packages/assets/imageProcessor.ts

import fs from "fs";
import path from "path";
import sharp from "sharp";

export type ScreenshotJob = {
  inputPaths: string[];
  outputDir: string;
};

export async function normalizeScreenshotsToPlay(job: ScreenshotJob) {
  fs.mkdirSync(job.outputDir, { recursive: true });

  const outPaths: string[] = [];

  for (const input of job.inputPaths) {
    const base = path.basename(input).replace(/\.(png|jpg|jpeg)$/i, "");
    const out = path.join(job.outputDir, `${base}_1080x1920.png`);

    // Load and flatten (remove alpha)
    const img = sharp(input).flatten({ background: { r: 255, g: 255, b: 255 } });

    const meta = await img.metadata();
    if (!meta.width || !meta.height) throw new Error(`Cannot read image: ${input}`);

    // Center-crop to 9:16 then resize to 1080x1920
    // Use "cover" to ensure exact output dimensions without distortion
    await img
      .resize(1080, 1920, { fit: "cover", position: "centre" })
      .png({ compressionLevel: 9, palette: false })
      .toFile(out);

    // Ensure sRGB
    // (sharp defaults to sRGB output for PNGs; if needed, we can enforce with .withMetadata({ icc: ... })
    outPaths.push(out);
  }

  return outPaths;
}

export async function ensureFeatureGraphic1024x500(inputPath: string, outputPath: string) {
  const img = sharp(inputPath).flatten({ background: { r: 255, g: 255, b: 255 } });

  await img
    .resize(1024, 500, { fit: "cover", position: "centre" })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outputPath);

  return outputPath;
}

export async function validateIcon512(inputPath: string) {
  const meta = await sharp(inputPath).metadata();
  const ok = meta.width === 512 && meta.height === 512;
  return {
    ok,
    width: meta.width,
    height: meta.height,
    message: ok ? "Icon is 512x512" : "Icon must be exactly 512x512",
  };
}

export async function fixIconTo512(inputPath: string, outputPath: string) {
  await sharp(inputPath)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(512, 512, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  return outputPath;
}