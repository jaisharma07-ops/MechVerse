/**
 * Tiny, safe-ish markdown renderer for chat bubble bodies.
 * Handles: bold, italic, inline code, lists, headings, paragraphs, GFM tables.
 * Escapes raw HTML first to prevent injection.
 *
 * Tables follow the GitHub-Flavored Markdown spec:
 *
 *   | Header A | Header B |
 *   |----------|---------:|
 *   | cell 1   | 100      |
 *
 * The alignment row (`:---`, `:--:`, `---:`) controls per-column text-align.
 * Rendered output uses `.mv-table-wrap` so the page can scroll horizontally
 * on narrow screens instead of overflowing the chat bubble.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Align = "left" | "right" | "center" | null;

function splitRow(line: string): string[] {
  // Trim leading/trailing pipes, then split on un-escaped `|`.
  const trimmed = line.replace(/^\s*\|/, "").replace(/\|\s*$/, "");
  return trimmed.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}

function parseAlignRow(line: string): Align[] | null {
  if (!/[-:]/.test(line)) return null;
  const cells = splitRow(line);
  if (cells.length === 0) return null;
  const aligns: Align[] = [];
  for (const c of cells) {
    if (!/^:?-+:?$/.test(c)) return null;
    const left = c.startsWith(":");
    const right = c.endsWith(":");
    if (left && right) aligns.push("center");
    else if (right) aligns.push("right");
    else if (left) aligns.push("left");
    else aligns.push(null);
  }
  return aligns;
}

/**
 * Detects a GFM-style table starting at `startIndex` in `lines`. Returns
 * the rendered HTML and the index of the first line *after* the table,
 * or null if no table is present at this position.
 */
function tryParseTable(
  lines: string[],
  startIndex: number,
): { html: string; next: number } | null {
  const headerLine = lines[startIndex];
  if (!headerLine?.includes("|")) return null;
  const alignLine = lines[startIndex + 1];
  if (!alignLine?.includes("|")) return null;
  const aligns = parseAlignRow(alignLine.trim());
  if (!aligns) return null;

  const headers = splitRow(headerLine);
  if (headers.length === 0 || headers.length !== aligns.length) return null;

  const bodyRows: string[][] = [];
  let i = startIndex + 2;
  for (; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || !raw.includes("|")) break;
    const cells = splitRow(raw);
    if (cells.length === 0) break;
    // Pad or trim to header width.
    while (cells.length < headers.length) cells.push("");
    if (cells.length > headers.length) cells.length = headers.length;
    bodyRows.push(cells);
  }

  // Need at least one data row for a real table.
  if (bodyRows.length === 0) return null;

  const tdAlign = (idx: number) => {
    const a = aligns[idx];
    return a ? ` style="text-align:${a}"` : "";
  };

  const ths = headers
    .map((h, idx) => `<th${tdAlign(idx)}>${applyInline(h)}</th>`)
    .join("");
  const trs = bodyRows
    .map(
      (row) =>
        "<tr>" +
        row
          .map((c, idx) => `<td${tdAlign(idx)}>${applyInline(c)}</td>`)
          .join("") +
        "</tr>",
    )
    .join("");

  const html =
    `<div class="mv-table-wrap"><table class="mv-table">` +
    `<thead><tr>${ths}</tr></thead>` +
    `<tbody>${trs}</tbody>` +
    `</table></div>`;

  return { html, next: i };
}

/** Inline replacements applied after block parsing. */
function applyInline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function renderMarkdown(input: string): string {
  if (!input) return "";
  const text = escapeHtml(input);
  const lines = text.split(/\r?\n/);
  const out: string[] = [];

  let listType: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${applyInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    // Tables — check BEFORE list/heading parsing so | rows don't get mis-routed.
    if (line.includes("|")) {
      const table = tryParseTable(lines, idx);
      if (table) {
        flushParagraph();
        closeList();
        out.push(table.html);
        idx = table.next - 1; // -1 because the loop will ++ it.
        continue;
      }
    }

    const heading = line.match(/^#{1,3}\s+(.*)/);
    if (heading) {
      flushParagraph();
      closeList();
      out.push(`<h3>${applyInline(heading[1])}</h3>`);
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)/);
    const olMatch = line.match(/^\d+\.\s+(.*)/);

    if (ulMatch) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${applyInline(ulMatch[1])}</li>`);
      continue;
    }
    if (olMatch) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${applyInline(olMatch[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();

  return out.join("");
}
