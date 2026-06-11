import type { Rule, RuleFinding, RunbookDocument, RuleSeverity } from "./types.js";

export const builtInRules: Rule[] = [
  rule("frontmatter.owner", "Missing owner metadata", "error", "Add owner or team frontmatter.", hasOwner),
  rule("trigger.condition", "Missing trigger condition", "error", "Name the alert, symptom, or incident condition that starts this runbook.", hasTrigger),
  rule("scope.system", "Missing affected system", "error", "Name the service, system, component, or namespace affected by the runbook.", hasScope),
  rule("precheck.access", "Missing access precheck", "warning", "List required access, credentials, tools, or environment before remediation steps.", hasAccess),
  rule("step.command", "Missing exact action command", "error", "Include exact commands or console actions for at least one remediation step.", hasCommand),
  rule("step.verify", "Missing verification step", "error", "Include verification checks that prove recovery or mitigation worked.", hasVerify),
  rule("rollback.path", "Missing rollback path", "error", "Document rollback, undo, or mitigation steps.", hasRollback),
  rule("escalation.contact", "Missing escalation path", "warning", "Name when and where to escalate, including team, channel, or on-call path.", hasEscalation),
  rule("risk.destructive", "Missing destructive action warning", "warning", "Mark destructive or irreversible operations and require human confirmation.", hasRisk),
  rule("agent.guardrail", "Missing AI agent guardrail", "warning", "State what an AI agent must not do automatically.", hasAgentGuardrail)
];

function rule(
  id: string,
  title: string,
  severity: RuleSeverity,
  remediation: string,
  predicate: (document: RunbookDocument) => boolean
): Rule {
  return {
    id,
    title,
    severity,
    description: title,
    remediation,
    evaluate(document) {
      if (predicate(document)) {
        return null;
      }
      return finding(document, id, title, severity, remediation);
    }
  };
}

function finding(document: RunbookDocument, ruleId: string, title: string, severity: RuleSeverity, remediation: string): RuleFinding {
  return {
    ruleId,
    title,
    severity,
    file: document.path,
    message: `${title} in ${document.path}`,
    evidence: document.title || firstText(document),
    remediation
  };
}

function hasOwner(document: RunbookDocument): boolean {
  return Boolean(document.frontmatter.owner || document.frontmatter.team);
}

function hasTrigger(document: RunbookDocument): boolean {
  return includesAny(document, ["trigger", "alert", "fires", "symptom", "incident condition"]);
}

function hasScope(document: RunbookDocument): boolean {
  return Boolean(document.frontmatter.service || document.frontmatter.system || includesAny(document, ["service", "system", "component", "namespace", "scope"]));
}

function hasAccess(document: RunbookDocument): boolean {
  return includesAny(document, ["access", "credential", "permission", "environment", "context", "required"]);
}

function hasCommand(document: RunbookDocument): boolean {
  return document.codeBlocks.length > 0 || document.inlineCommands.length > 0 || includesAny(document, ["console action", "dashboard"]);
}

function hasVerify(document: RunbookDocument): boolean {
  return includesAny(document, ["verify", "validation", "health", "recovery", "confirm"]);
}

function hasRollback(document: RunbookDocument): boolean {
  return includesAny(document, ["rollback", "roll back", "undo", "mitigation", "revert"]);
}

function hasEscalation(document: RunbookDocument): boolean {
  return includesAny(document, ["escalate", "on-call", "oncall", "pager", "slack", "#"]);
}

function hasRisk(document: RunbookDocument): boolean {
  return includesAny(document, ["destructive", "irreversible", "human confirmation", "approval", "risk"]);
}

function hasAgentGuardrail(document: RunbookDocument): boolean {
  return includesAny(document, ["ai agent", "agent guardrail", "must not", "do not"]);
}

function includesAny(document: RunbookDocument, terms: string[]): boolean {
  const text = [
    ...Object.values(document.frontmatter),
    ...document.headings,
    ...document.paragraphs,
    ...document.listItems,
    ...document.codeBlocks
  ]
    .join("\n")
    .toLowerCase();
  return terms.some((term) => text.includes(term));
}

function firstText(document: RunbookDocument): string | undefined {
  return document.paragraphs[0] ?? document.listItems[0] ?? document.headings[0];
}
