import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { runScan } from "../src/commands.js";

async function workspace(): Promise<string> {
  return mkdtemp(join(tmpdir(), "runbook-lint-inline-"));
}

describe("inline command quality rules", () => {
  test("flags placeholder-only inline commands as warnings", async () => {
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

- Check scope for api with \`kubectl get pods -n <namespace>\`.
- Verify recovery with \`curl https://api.example.com/health\`.

## Rollback

- Roll back with \`kubectl rollout undo deployment/api -n prod\`.

## Escalation

- Escalate to #platform-oncall within 15 minutes if error rate stays high.

## Risk

- Destructive actions require human confirmation.
`
    );

    const result = await runScan({ root, format: "json", strict: false });

    expect(result.exitCode).toBe(0);
    expect(result.report?.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "command.placeholder",
          severity: "warning"
        })
      ])
    );
  });
});
