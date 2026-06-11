import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { discoverMarkdownFiles } from "./discovery.js";
import { evaluateDocuments } from "./engine.js";
import { parseRunbook } from "./parser.js";
import { renderReport } from "./reporters.js";
import { builtInRules } from "./rules.js";
import type { ReportFormat, ScanReport } from "./types.js";

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  report?: ScanReport;
}

export async function runScan(options: { root: string; format: ReportFormat; out?: string; strict: boolean }): Promise<CommandResult> {
  const root = resolve(options.root);
  let files: string[];
  try {
    files = await discoverMarkdownFiles(root);
  } catch (error) {
    return { exitCode: 2, stdout: "", stderr: `Unable to scan ${root}: ${messageOf(error)}` };
  }

  const documents = [];
  for (const file of files) {
    try {
      documents.push(parseRunbook(file, await readFile(file, "utf8")));
    } catch (error) {
      if (options.strict) {
        return { exitCode: 2, stdout: "", stderr: `Unable to parse ${file}: ${messageOf(error)}` };
      }
    }
  }

  const report = evaluateDocuments(root, documents);
  const output = renderReport(report, options.format);
  if (options.out) {
    await mkdir(dirname(options.out), { recursive: true });
    await writeFile(options.out, output, "utf8");
  }
  return {
    exitCode: report.summary.error > 0 ? 1 : 0,
    stdout: options.out ? `Wrote ${options.out}\n` : output,
    stderr: "",
    report
  };
}

export async function runExplain(options: { ruleId: string; root: string }): Promise<CommandResult> {
  const rule = builtInRules.find((candidate) => candidate.id === options.ruleId);
  if (!rule) {
    return { exitCode: 2, stdout: "", stderr: `Unknown rule: ${options.ruleId}` };
  }
  const result = await runScan({ root: options.root, format: "json", strict: false });
  const matching = result.report?.findings.filter((finding) => finding.ruleId === rule.id) ?? [];
  return {
    exitCode: 0,
    stdout: `${rule.id}: ${rule.title}\nSeverity: ${rule.severity}\n${rule.description}\nRemediation: ${rule.remediation}\nFindings: ${matching.length}\n`,
    stderr: "",
    report: result.report
  };
}

export function parseFormat(value: string | undefined): ReportFormat {
  if (value === undefined) {
    return "markdown";
  }
  if (value === "markdown" || value === "json" || value === "sarif") {
    return value;
  }
  throw new Error(`Unsupported format: ${value}`);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
