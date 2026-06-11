import { describe, expect, test } from "vitest";
import { evaluateDocuments } from "../src/engine.js";
import { parseRunbook } from "../src/parser.js";

describe("evaluateDocuments", () => {
  test("aggregates findings by severity", () => {
    const report = evaluateDocuments("/repo", [parseRunbook("bad.md", "# Outage\n\nTry fixing it.")]);

    expect(report.summary.files).toBe(1);
    expect(report.summary.error).toBeGreaterThan(0);
    expect(report.findings[0]).toMatchObject({ file: "bad.md" });
  });
});
