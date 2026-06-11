import { builtInRules } from "./rules.js";
import type { RunbookDocument, ScanReport, ScanSummary } from "./types.js";

export function evaluateDocuments(root: string, documents: RunbookDocument[]): ScanReport {
  const findings = documents.flatMap((document) =>
    builtInRules.flatMap((rule) => {
      const finding = rule.evaluate(document);
      return finding ? [finding] : [];
    })
  );
  return {
    root,
    generatedAt: new Date().toISOString(),
    summary: summarize(documents.length, findings),
    findings
  };
}

function summarize(files: number, findings: ScanReport["findings"]): ScanSummary {
  const summary: ScanSummary = { files, info: 0, warning: 0, error: 0 };
  for (const finding of findings) {
    summary[finding.severity] += 1;
  }
  return summary;
}
