import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("CI workflow", () => {
  it("uses action pins that run on the current GitHub Actions runtime", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(workflow).toContain("actions/checkout@v7.0.0");
    expect(workflow).toContain("actions/setup-node@v6.4.0");
    expect(workflow).not.toMatch(/actions\/(?:checkout|setup-node)@v[45]\b/);
  });
});
