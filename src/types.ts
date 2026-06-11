export type ReportFormat = "markdown" | "json" | "sarif";

export type RuleSeverity = "info" | "warning" | "error";

export interface RunbookDocument {
  path: string;
  title: string;
  frontmatter: Record<string, string>;
  headings: string[];
  paragraphs: string[];
  listItems: string[];
  codeBlocks: string[];
  inlineCommands: string[];
  raw: string;
}

export interface Rule {
  id: string;
  title: string;
  severity: RuleSeverity;
  description: string;
  remediation: string;
  evaluate(document: RunbookDocument): RuleFinding | null;
}

export interface RuleFinding {
  ruleId: string;
  title: string;
  severity: RuleSeverity;
  file: string;
  message: string;
  evidence?: string;
  remediation: string;
}

export interface ScanSummary {
  files: number;
  info: number;
  warning: number;
  error: number;
}

export interface ScanReport {
  root: string;
  generatedAt: string;
  summary: ScanSummary;
  findings: RuleFinding[];
}
