import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { createDemo } from "../src/demo.js";

describe("createDemo", () => {
  test("writes sample runbooks and reports", async () => {
    const out = await mkdtemp(join(tmpdir(), "runbook-lint-demo-"));

    const result = await createDemo(out);

    expect(await readFile(join(result.workspace, "bad-runbook.md"), "utf8")).toContain("Try fixing it");
    expect(await readFile(result.markdownReport, "utf8")).toContain("# runbook-lint report");
    expect(JSON.parse(await readFile(result.jsonReport, "utf8")).findings.length).toBeGreaterThan(0);
    expect(JSON.parse(await readFile(result.sarifReport, "utf8")).version).toBe("2.1.0");
  });
});
