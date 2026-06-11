import type { ReportFormat, RuleFinding, ScanReport } from "./types.js";

export function renderReport(report: ScanReport, format: ReportFormat): string {
  if (format === "json") {
    return `${JSON.stringify(report, null, 2)}\n`;
  }
  if (format === "sarif") {
    return `${JSON.stringify(toSarif(report), null, 2)}\n`;
  }
  return renderMarkdown(report);
}

function renderMarkdown(report: ScanReport): string {
  const lines = [
    "# runbook-lint report",
    "",
    `Root: \`${report.root}\``,
    `Generated: \`${report.generatedAt}\``,
    "",
    "## Summary",
    "",
    `- Files: ${report.summary.files}`,
    `- Errors: ${report.summary.error}`,
    `- Warnings: ${report.summary.warning}`,
    `- Info: ${report.summary.info}`,
    "",
    "## Findings",
    ""
  ];
  for (const finding of report.findings) {
    lines.push(...renderFinding(finding), "");
  }
  if (report.findings.length === 0) {
    lines.push("No findings.");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function renderFinding(finding: RuleFinding): string[] {
  return [
    `### ${finding.ruleId}: ${finding.title}`,
    "",
    `- File: \`${finding.file}\``,
    `- Severity: ${finding.severity}`,
    `- Message: ${finding.message}`,
    finding.evidence ? `- Evidence: ${finding.evidence}` : "- Evidence: none",
    `- Remediation: ${finding.remediation}`
  ];
}

function toSarif(report: ScanReport): unknown {
  const rules = new Map<string, RuleFinding>();
  for (const finding of report.findings) {
    rules.set(finding.ruleId, finding);
  }
  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "runbook-lint",
            informationUri: "https://github.com/maxi-maxima/runbook-lint",
            rules: [...rules.values()].map((finding) => ({
              id: finding.ruleId,
              shortDescription: { text: finding.title },
              fullDescription: { text: finding.remediation },
              properties: { severity: finding.severity }
            }))
          }
        },
        results: report.findings.map((finding) => ({
          ruleId: finding.ruleId,
          level: finding.severity === "error" ? "error" : finding.severity === "warning" ? "warning" : "note",
          message: { text: finding.message },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: finding.file },
                region: { startLine: 1 }
              }
            }
          ]
        }))
      }
    ]
  };
}
