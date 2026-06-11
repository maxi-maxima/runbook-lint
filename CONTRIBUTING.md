# Contributing

Thanks for improving `runbook-lint`.

## Development

```bash
npm install
npm run check
```

## Rule Guidelines

- Keep rule IDs stable.
- Prefer deterministic text checks over network calls or AI calls.
- Add tests for every rule behavior change.
- Update both English and Chinese docs when user-facing behavior changes.

## Pull Requests

Run `npm run check` before submitting.
