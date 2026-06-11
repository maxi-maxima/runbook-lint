import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { discoverMarkdownFiles } from "../src/discovery.js";

async function workspace(): Promise<string> {
  return mkdtemp(join(tmpdir(), "runbook-lint-discovery-"));
}

describe("discoverMarkdownFiles", () => {
  test("discovers markdown files recursively", async () => {
    const root = await workspace();
    await mkdir(join(root, "runbooks"));
    await writeFile(join(root, "runbooks", "api.md"), "# API");
    await writeFile(join(root, "notes.txt"), "ignore");

    const files = await discoverMarkdownFiles(root);

    expect(files.map((file) => file.replaceAll("\\", "/"))).toEqual([expect.stringContaining("runbooks/api.md")]);
  });

  test("ignores generated and dependency directories", async () => {
    const root = await workspace();
    await mkdir(join(root, "node_modules"), { recursive: true });
    await mkdir(join(root, "reports"), { recursive: true });
    await writeFile(join(root, "node_modules", "bad.md"), "# Ignore");
    await writeFile(join(root, "reports", "bad.md"), "# Ignore");
    await writeFile(join(root, "good.md"), "# Good");

    const files = await discoverMarkdownFiles(root);

    expect(files).toHaveLength(1);
    expect(files[0]).toContain("good.md");
  });
});
