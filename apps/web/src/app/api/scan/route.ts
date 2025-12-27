import { NextRequest, NextResponse } from "next/server";
import { scanProject } from "@storepreflight/scanner";
import { evaluateRules } from "@storepreflight/rules";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectPath } = body;

    if (!projectPath || typeof projectPath !== "string") {
      return NextResponse.json(
        { error: "Project path is required" },
        { status: 400 }
      );
    }

    // Run the scanner
    const scanResult = await scanProject(projectPath);

    // Evaluate rules
    const evaluation = evaluateRules(scanResult);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Scan error:", error);
    
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
