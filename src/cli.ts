#!/usr/bin/env node
import { createDemo } from "./demo.js";
import { parseFormat, runExplain, runScan } from "./commands.js";

async function main(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);
  if (parsed.command === "help" || parsed.flags.has("help")) {
    process.stdout.write(helpText());
    return 0;
  }
  if (parsed.flags.has("version")) {
    process.stdout.write("0.1.0\n");
    return 0;
  }
  try {
    if (parsed.command === "scan") {
      const result = await runScan({
        root: parsed.positionals[0] ?? ".",
        format: parseFormat(stringFlag(parsed.flags, "format")),
        out: stringFlag(parsed.flags, "out"),
        strict: Boolean(parsed.flags.get("strict"))
      });
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr ? `${result.stderr}\n` : "");
      return result.exitCode;
    }
    if (parsed.command === "demo") {
      const out = stringFlag(parsed.flags, "out") ?? parsed.positionals[0] ?? "reports/demo";
      const result = await createDemo(out);
      process.stdout.write(`Wrote demo workspace and reports to ${result.workspace}\n`);
      return 0;
    }
    if (parsed.command === "explain") {
      const ruleId = parsed.positionals[0];
      if (!ruleId) {
        process.stderr.write("Missing rule id\n");
        return 2;
      }
      const result = await runExplain({ ruleId, root: parsed.positionals[1] ?? "." });
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr ? `${result.stderr}\n` : "");
      return result.exitCode;
    }
    process.stderr.write(`Unknown command: ${parsed.command}\n`);
    return 2;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
}

function parseArgs(argv: string[]): { command: string; positionals: string[]; flags: Map<string, string | boolean> } {
  const [command = "help", ...rest] = argv;
  const flags = new Map<string, string | boolean>();
  const positionals: string[] = [];
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index] ?? "";
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = rest[index + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      index += 1;
    } else {
      flags.set(key, true);
    }
  }
  return { command, positionals, flags };
}

function stringFlag(flags: Map<string, string | boolean>, key: string): string | undefined {
  const value = flags.get(key);
  return typeof value === "string" ? value : undefined;
}

function helpText(): string {
  return `runbook-lint

Usage:
  runbook-lint scan [path] [--format markdown|json|sarif] [--out file] [--strict]
  runbook-lint demo --out reports/demo
  runbook-lint explain <rule-id> [path]
`;
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
