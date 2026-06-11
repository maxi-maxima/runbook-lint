import { describe, expect, test } from "vitest";
import type { ReportFormat, RuleSeverity } from "../src/types.js";

describe("shared types", () => {
  test("allow public string unions", () => {
    const format: ReportFormat = "sarif";
    const severity: RuleSeverity = "error";

    expect([format, severity]).toEqual(["sarif", "error"]);
  });
});
