# runbook-lint Design

Date: 2026-06-12
Status: Approved for implementation

## Goal

`runbook-lint` is a local-first CLI that audits incident runbooks and operational playbooks for human and AI-agent executability. It reads Markdown runbooks, checks whether they contain the operational facts needed during an incident, and emits Markdown, JSON, or SARIF reports.

The project is designed for the emerging AI SRE and agentic incident-response workflow: before an agent can safely follow a runbook, the runbook must have clear triggers, preconditions, exact commands, validation checks, rollback steps, escalation rules, and risk warnings.

## Non-Goals

- Do not duplicate `deny-lens`; this tool does not audit agent permission policy coverage.
- Do not duplicate `secret-surface`, `gha-permission-map`, `packlist-lens`, `screenlint`, or `context-cal`.
- Do not execute production commands or connect to live infrastructure.
- Do not become a generic Markdown style linter.

## Users

- SREs and on-call engineers who maintain incident runbooks.
- Engineering teams preparing runbooks for AI-assisted operations.
- Platform teams that want CI feedback before operational docs drift into vague prose.

## CLI Surface

```text
runbook-lint scan [path] [--format markdown|json|sarif] [--out file] [--strict]
runbook-lint demo --out reports/demo
runbook-lint explain <rule-id> [path]
```

`scan` finds Markdown runbooks, evaluates rule coverage, and writes a report. `demo` creates sample good and bad runbooks. `explain` explains one rule and shows matching evidence from a target path when available.

## Rule Set

The first release ships deterministic rules with stable IDs:

- `frontmatter.owner`: runbook has owner or team metadata.
- `trigger.condition`: runbook names the incident trigger or alert.
- `scope.system`: runbook names the affected service, system, or component.
- `precheck.access`: runbook lists required access, credentials, or environment.
- `step.command`: action steps contain exact commands or console actions.
- `step.verify`: remediation steps include verification checks.
- `rollback.path`: runbook includes rollback or mitigation steps.
- `escalation.contact`: runbook names escalation condition and contact path.
- `risk.destructive`: destructive or irreversible actions are explicitly marked.
- `agent.guardrail`: runbook states what an AI agent must not do automatically.

Rules produce severity `info`, `warning`, or `error`.

## Architecture

### discovery

Find Markdown files under the target path. If the target is a file, evaluate only that file. Ignore `node_modules`, `.git`, `dist`, `coverage`, and `reports`.

### markdown-model

Parse Markdown into a lightweight model:

- frontmatter key-value pairs
- headings
- paragraphs
- list items
- fenced code blocks
- inline command-like snippets

The parser should be dependency-light and deterministic. It does not need full CommonMark fidelity.

### rule-engine

Each rule receives a `RunbookDocument` and returns a finding with rule ID, severity, message, evidence, and remediation.

### reporter

Render reports as Markdown, JSON, and SARIF. Markdown is for maintainers, JSON for automation, SARIF for GitHub code scanning.

### demo

Generate one incomplete runbook and one production-ready runbook, then generate all report formats.

## Data Flow

1. Resolve target path.
2. Discover Markdown files.
3. Parse each file into `RunbookDocument`.
4. Apply built-in rules.
5. Aggregate findings and summary.
6. Render report and set exit code.

## Exit Codes

- `0`: no error-severity findings.
- `1`: one or more error-severity findings.
- `2`: usage error, unreadable path, unsupported output format, or strict-mode parse failure.

## Error Handling

Discovery failures should point to the affected path. Parse ambiguity should become a warning unless `--strict` is enabled. CLI errors should be readable without stack traces unless `DEBUG=runbook-lint` is set.

## Testing

Use Vitest with fixtures for:

- file and directory discovery
- frontmatter parsing
- headings, lists, code blocks, and inline command extraction
- each built-in rule
- Markdown, JSON, and SARIF rendering
- demo generation
- CLI scan and explain behavior

Release gate:

```text
npm run check
node dist/cli.js demo --out reports/demo
npm pack --dry-run --ignore-scripts
```

## Documentation

Ship paired English and Simplified Chinese docs:

- `README.md`
- `README.zh-CN.md`
- `CHANGELOG.md`
- `CHANGELOG.zh-CN.md`
- `CONTRIBUTING.md`
- `CONTRIBUTING.zh-CN.md`
- `SECURITY.md`
- `SECURITY.zh-CN.md`

The README must show an incomplete runbook, a scan command, and a report excerpt.

## Release Shape

The package is a Node.js 20+ TypeScript CLI with no runtime cloud dependency. The public repository will be `https://github.com/maxi-maxima/runbook-lint` unless GitHub reports a name conflict.
