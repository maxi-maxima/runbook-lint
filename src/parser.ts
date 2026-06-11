import type { RunbookDocument } from "./types.js";

export function parseRunbook(path: string, raw: string): RunbookDocument {
  const { frontmatter, body } = parseFrontmatter(raw);
  const lines = body.split(/\r?\n/u);
  const headings: string[] = [];
  const paragraphs: string[] = [];
  const listItems: string[] = [];
  const codeBlocks: string[] = [];
  const inlineCommands: string[] = [];
  let inCode = false;
  let code: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      if (inCode) {
        codeBlocks.push(code.join("\n").trim());
        code = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/u.exec(trimmed);
    if (heading) {
      headings.push(heading[2]?.trim() ?? "");
      continue;
    }
    const list = /^[-*]\s+(.+)$/u.exec(trimmed);
    if (list) {
      const item = list[1]?.trim() ?? "";
      listItems.push(item);
      collectInlineCommands(item, inlineCommands);
      continue;
    }
    if (trimmed.length > 0) {
      paragraphs.push(trimmed);
      collectInlineCommands(trimmed, inlineCommands);
    }
  }

  return {
    path,
    title: headings[0] ?? "",
    frontmatter,
    headings,
    paragraphs,
    listItems,
    codeBlocks: codeBlocks.filter((block) => block.length > 0),
    inlineCommands,
    raw
  };
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  if (!raw.startsWith("---")) {
    return { frontmatter: {}, body: raw };
  }
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/u.exec(raw);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }
  const frontmatter: Record<string, string> = {};
  for (const line of (match[1] ?? "").split(/\r?\n/u)) {
    const separator = line.indexOf(":");
    if (separator > 0) {
      frontmatter[line.slice(0, separator).trim().toLowerCase()] = line.slice(separator + 1).trim();
    }
  }
  return { frontmatter, body: match[2] ?? "" };
}

function collectInlineCommands(text: string, commands: string[]): void {
  const pattern = /`([^`]+)`/gu;
  for (const match of text.matchAll(pattern)) {
    const command = match[1]?.trim();
    if (command) {
      commands.push(command);
    }
  }
}
