import { describe, expect, test } from "vitest";
import { builtInRules } from "../src/rules.js";
import { parseRunbook } from "../src/parser.js";

const complete = parseRunbook(
  "api.md",
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

- Escalate to #platform-oncall if error rate stays high after 10 minutes.

## Risk

- Destructive actions require human confirmation.
`
);

describe("builtInRules", () => {
  test("ships stable rule ids", () => {
    expect(builtInRules.map((rule) => rule.id)).toEqual([
      "frontmatter.owner",
      "trigger.condition",
      "scope.system",
      "precheck.access",
      "step.command",
      "step.verify",
      "rollback.path",
      "time.bound",
      "escalation.contact",
      "risk.destructive",
      "agent.guardrail",
      "command.placeholder"
    ]);
  });

  test("does not flag a complete runbook", () => {
    const findings = builtInRules.flatMap((rule) => rule.evaluate(complete) ?? []);

    expect(findings).toEqual([]);
  });

  test("flags missing operational facts in a vague runbook", () => {
    const vague = parseRunbook("bad.md", "# Outage\n\nTry fixing it. Restart things if needed.");

    const findings = builtInRules.flatMap((rule) => rule.evaluate(vague) ?? []);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "frontmatter.owner",
      "trigger.condition",
      "scope.system",
      "precheck.access",
      "step.command",
      "step.verify",
      "rollback.path",
      "time.bound",
      "escalation.contact",
      "risk.destructive",
      "agent.guardrail"
    ]);
  });

  test("requires a time bound for otherwise complete runbooks", () => {
    const noTimeBound = parseRunbook(
      "api.md",
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

    const findings = builtInRules.flatMap((rule) => rule.evaluate(noTimeBound) ?? []);

    expect(findings.map((finding) => finding.ruleId)).toEqual(["time.bound"]);
    expect(findings[0]).toMatchObject({
      severity: "warning",
      remediation: "State expected wait times, retry limits, or escalation deadlines for remediation steps."
    });
  });
});
