import { describe, expect, test } from "vitest";
import { renderReport } from "../src/reporters.js";
import type { ScanReport } from "../src/types.js";

const report: ScanReport = {
  root: "/repo",
  generatedAt: "2026-06-12T00:00:00.000Z",
  summary: { files: 1, info: 0, warning: 1, error: 1 },
  findings: [
    {
      ruleId: "trigger.condition",
      title: "Missing trigger condition",
      severity: "error",
      file: "bad.md",
      message: "Missing trigger",
      remediation: "Add trigger."
    }
  ]
};

describe("renderReport", () => {
  test("renders markdown", () => {
    expect(renderReport(report, "markdown")).toContain("# runbook-lint report");
  });

  test("renders JSON", () => {
    expect(JSON.parse(renderReport(report, "json")).summary.error).toBe(1);
  });

  test("renders SARIF", () => {
    const sarif = JSON.parse(renderReport(report, "sarif"));
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0].results[0].ruleId).toBe("trigger.condition");
  });
});
