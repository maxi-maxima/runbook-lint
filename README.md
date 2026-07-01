<div align="center">

# Runbook Lint

**Audit incident runbooks for human and AI-agent executability.**

[简体中文](README.zh-CN.md)

</div>

`runbook-lint` is a local-first CLI for SRE and incident-response teams. It checks whether Markdown runbooks include the facts needed during an incident: triggers, owner metadata, affected systems, access prechecks, exact commands, verification, rollback, time bounds, escalation, destructive-action warnings, and AI-agent guardrails.

It does not execute production commands or connect to infrastructure.

## Why This Exists

AI-assisted operations are getting practical, but vague runbooks are still dangerous. Before an AI agent or tired on-call engineer follows a runbook, the document must be explicit enough to execute and verify safely.

`runbook-lint` turns that into a CI-friendly check.

## Install

```bash
npm install -g runbook-lint
```

For local development:

```bash
git clone https://github.com/maxi-maxima/runbook-lint.git
cd runbook-lint
npm install
npm run build
```

## Quick Start

```bash
runbook-lint scan docs/runbooks
runbook-lint scan docs/runbooks --format json --out reports/runbook-lint.json
runbook-lint scan docs/runbooks --max-warnings 0
runbook-lint demo --out reports/demo
runbook-lint explain trigger.condition docs/runbooks
```

Use `--max-warnings <count>` when you want CI to fail once warning-level findings exceed your current budget. This lets teams adopt the tool gradually: start with a permissive warning budget, then ratchet it down as runbooks improve.

## Incomplete Runbook Example

```markdown
# Checkout outage

Try fixing it. Restart things if needed.
```

This is not executable under pressure. It lacks ownership, trigger condition, scope, access prechecks, exact commands, verification, rollback, time bounds, escalation, risk labels, and agent guardrails.

## Report Excerpt

```markdown
# runbook-lint report

## Summary

- Files: 1
- Errors: 6
- Warnings: 5

### trigger.condition: Missing trigger condition

- File: `checkout.md`
- Severity: error
- Remediation: Name the alert, symptom, or incident condition that starts this runbook.
```

## Built-In Rules

- `frontmatter.owner`
- `trigger.condition`
- `scope.system`
- `precheck.access`
- `step.command`
- `step.verify`
- `rollback.path`
- `time.bound`
- `escalation.contact`
- `risk.destructive`
- `agent.guardrail`

## Exit Codes

| Code | Meaning |
| --- | --- |
| `0` | No error-severity findings and warning count is within budget. |
| `1` | One or more error-severity findings, or warnings exceeded `--max-warnings`. |
| `2` | Usage error, unreadable path, or unsupported output format. |

## Development

```bash
npm install
npm run check
node dist/cli.js demo --out reports/demo
npm pack --dry-run --ignore-scripts
```

## License

MIT
