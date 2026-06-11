import { describe, expect, test } from "vitest";
import { parseRunbook } from "../src/parser.js";

describe("parseRunbook", () => {
  test("extracts frontmatter headings lists code blocks and inline commands", () => {
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
- Escalate to #platform-oncall.

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
});
