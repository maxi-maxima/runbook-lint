import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", "coverage", "reports"]);

export async function discoverMarkdownFiles(target: string): Promise<string[]> {
  const root = resolve(target);
  const info = await stat(root);
  if (info.isFile()) {
    return isMarkdown(root) ? [root] : [];
  }
  const files: string[] = [];
  await walk(root, files);
  return files.sort();
}

async function walk(dir: string, files: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        await walk(join(dir, entry.name), files);
      }
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isFile() && isMarkdown(path)) {
      files.push(path);
    }
  }
}

function isMarkdown(path: string): boolean {
  return /\.mdx?$/iu.test(path);
}
