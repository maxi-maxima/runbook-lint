# runbook-lint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish `runbook-lint`, a Node.js CLI that audits incident runbooks for human and AI-agent executability.

**Architecture:** The CLI discovers Markdown files, parses them into a lightweight runbook model, applies deterministic rules, and renders Markdown, JSON, or SARIF reports. It includes a demo generator and release hygiene matching the previous project loop.

**Tech Stack:** Node.js 20+, TypeScript, Vitest, ESLint, npm package CLI, GitHub Actions.

---

## File Structure

- `package.json`: package metadata, CLI bin, scripts, packaged files.
- `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `.gitignore`: project tooling.
- `.github/workflows/ci.yml`: install, check, demo, and package dry run.
- `src/types.ts`: shared document, rule, finding, report, and CLI types.
- `src/discovery.ts`: Markdown file discovery with ignored directories.
- `src/parser.ts`: frontmatter, headings, lists, code blocks, and inline command extraction.
- `src/rules.ts`: built-in runbook quality rules.
- `src/engine.ts`: rule evaluation and summary aggregation.
- `src/reporters.ts`: Markdown, JSON, SARIF renderers.
- `src/commands.ts`: scan and explain orchestration.
- `src/demo.ts`: sample runbook generation and reports.
- `src/cli.ts`: CLI argument parsing and exit handling.
- `tests/*.test.ts`: focused Vitest tests.
- Bilingual docs: `README.md`, `README.zh-CN.md`, `CHANGELOG*`, `CONTRIBUTING*`, `SECURITY*`.

## Tasks

1. Scaffold TypeScript CLI and verify `npm run check`.
2. Write failing tests for discovery and parser, then implement them.
3. Write failing tests for built-in rules and engine, then implement them.
4. Write failing tests for reporters, commands, and demo, then implement them.
5. Add bilingual docs, MIT license, and CI.
6. Run `npm run check`, `node dist/cli.js demo --out reports/demo`, and `npm pack --dry-run --ignore-scripts`.
7. Create public GitHub repo `maxi-maxima/runbook-lint`, push `main`, and verify public sync.

## Verification Commands

```bash
npm run check
node dist/cli.js demo --out reports/demo
npm pack --dry-run --ignore-scripts
git status --short --branch
git ls-remote --heads origin main
```

## Self-Review

- Spec coverage: discovery, parser, rules, engine, reporters, CLI, demo, docs, CI, package verification, and GitHub publish are covered.
- Placeholder scan: no TBD or TODO placeholders.
- Type consistency: shared types are introduced before module use.
