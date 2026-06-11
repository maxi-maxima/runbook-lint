import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { runScan } from "./commands.js";

export interface DemoResult {
  workspace: string;
  markdownReport: string;
  jsonReport: string;
  sarifReport: string;
}

export async function createDemo(outDir: string): Promise<DemoResult> {
  const out = resolve(outDir);
  const workspace = join(out, "workspace");
  await mkdir(workspace, { recursive: true });
  await writeFile(join(workspace, "bad-runbook.md"), "# Checkout outage\n\nTry fixing it. Restart things if needed.\n", "utf8");
  await writeFile(
    join(workspace, "good-runbook.md"),
    `---
owner: platform
service: checkout
---
# Checkout outage

Trigger: checkout error-rate alert fires.
Required access: kubectl production context and Grafana.
AI agent guardrail: do not restart production automatically.

## Steps

- Check scope for checkout with \`kubectl get pods -n prod\`.
- Restart canary only after approval: \`kubectl rollout restart deployment/checkout -n prod\`.
- Verify recovery with \`curl https://checkout.example.com/health\`.

## Rollback

- Roll back with \`kubectl rollout undo deployment/checkout -n prod\`.

## Escalation

- Escalate to #platform-oncall if error rate stays high after 10 minutes.

## Risk

- Destructive actions require human confirmation.
`,
    "utf8"
  );

  const markdownReport = join(out, "runbook-lint-report.md");
  const jsonReport = join(out, "runbook-lint-report.json");
  const sarifReport = join(out, "runbook-lint-report.sarif");
  await runScan({ root: workspace, format: "markdown", out: markdownReport, strict: false });
  await runScan({ root: workspace, format: "json", out: jsonReport, strict: false });
  await runScan({ root: workspace, format: "sarif", out: sarifReport, strict: false });
  return { workspace, markdownReport, jsonReport, sarifReport };
}
