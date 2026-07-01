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

  test("fails when warnings exceed the configured budget", async () => {
    const root = await workspace();
    await writeFile(
      join(root, "api.md"),
      `---
owner: platform
service: api
---
# API outage

Trigger: p95 latency alert fires for api.
Required access: kubectl production context and Grafana.
AI agent guardrail: do not restart production automatically.

## Steps

- Check scope for api with \`kubectl get pods -n prod\`.
- Restart canary only after approval: \`kubectl rollout restart deployment/api -n prod\`.
- Verify recovery with \`curl https://api.example.com/health\`.

## Rollback

- Roll back with \`kubectl rollout undo deployment/api -n prod\`.

## Escalation

- Escalate to #platform-oncall if error rate stays high.

## Risk

- Destructive actions require human confirmation.
`
    );

    const defaultResult = await runScan({ root, format: "json", strict: false });
    const gatedResult = await runScan({ root, format: "json", strict: false, maxWarnings: 0 });

    expect(defaultResult.exitCode).toBe(0);
    expect(gatedResult.exitCode).toBe(1);
    expect(gatedResult.report?.summary).toMatchObject({ error: 0, warning: 1 });
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
