import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { runExplain, runScan } from "../src/commands.js";

async function workspace(): Promise<string> {
  return mkdtemp(join(tmpdir(), "runbook-lint-commands-"));
}

describe("runScan", () => {
  test("writes markdown and returns one when errors exist", async () => {
    const root = await workspace();
    await writeFile(join(root, "bad.md"), "# Outage\n\nTry fixing it.");
    const out = join(root, "report.md");

    const result = await runScan({ root, format: "markdown", out, strict: false });

    expect(result.exitCode).toBe(1);
    expect(await readFile(out, "utf8")).toContain("# runbook-lint report");
  });

  test("writes JSON output", async () => {
    const root = await workspace();
    await writeFile(join(root, "bad.md"), "# Outage\n\nTry fixing it.");
    const out = join(root, "report.json");

    await runScan({ root, format: "json", out, strict: false });

    expect(JSON.parse(await readFile(out, "utf8")).summary.files).toBe(1);
  });

  test("returns two when target path is unreadable", async () => {
    const root = await workspace();

    const result = await runScan({ root: join(root, "missing"), format: "markdown", strict: false });

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Unable to scan");
  });
});

describe("runExplain", () => {
  test("explains a known rule", async () => {
    const result = await runExplain({ ruleId: "trigger.condition", root: await workspace() });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("trigger.condition");
  });

  test("returns two for unknown rule", async () => {
    const result = await runExplain({ ruleId: "missing.rule", root: await workspace() });

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Unknown rule");
  });
});
