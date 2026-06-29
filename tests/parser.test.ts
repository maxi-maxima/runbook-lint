import { describe, expect, test } from "vitest";
import { parseRunbook } from "../src/parser.js";

describe("parseRunbook", () => {
  test("extracts frontmatter headings unordered lists code blocks and inline commands", () => {
    const doc = parseRunbook(
      "api.md",
      `---
owner: platform
service: api
---
# API outage

Trigger: p95 latency alert fires.

## Steps

- Check dashboard with \`kubectl get pods\`.
* Escalate to #platform-oncall.

\`\`\`bash
kubectl rollout restart deployment/api
\`\`\`
`
    );

    expect(doc.frontmatter).toMatchObject({ owner: "platform", service: "api" });
    expect(doc.title).toBe("API outage");
    expect(doc.headings).toEqual(["API outage", "Steps"]);
    expect(doc.listItems).toEqual([
      "Check dashboard with `kubectl get pods`.",
      "Escalate to #platform-oncall."
    ]);
    expect(doc.codeBlocks).toEqual(["kubectl rollout restart deployment/api"]);
    expect(doc.inlineCommands).toEqual(["kubectl get pods"]);
  });

  test("extracts ordered list items and their inline commands", () => {
    const doc = parseRunbook(
      "api.md",
      `# API outage

1. Check pods with \`kubectl get pods -n prod\`.
2) Verify recovery with \`curl https://api.example.com/health\`.
10. Escalate to #platform-oncall.
`
    );

    expect(doc.listItems).toEqual([
      "Check pods with `kubectl get pods -n prod`.",
      "Verify recovery with `curl https://api.example.com/health`.",
      "Escalate to #platform-oncall."
    ]);
    expect(doc.inlineCommands).toEqual(["kubectl get pods -n prod", "curl https://api.example.com/health"]);
  });
});
