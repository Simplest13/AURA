/**
 * Lightweight markdown renderer for AURA chat replies.
 * Supports: headings, bold/italic, inline code, fenced code blocks,
 * bullet/numbered lists, block quotes, and pipe tables.
 * Zero dependencies — safe for React Native Web + native.
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";

interface MarkdownTextProps {
  content: string;
  textColor?: string;
  baseFontSize?: number;
}

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "code"; text: string }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "paragraph"; text: string };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const isTableRow = (line: string) => /^\s*\|.*\|\s*$/.test(line);

  const parseRowCells = (line: string): string[] =>
    line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "code", text: codeLines.join("\n") });
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2].trim() });
      i++;
      continue;
    }

    // Table: current row, next line is separator of dashes
    if (isTableRow(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const header = parseRowCells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(parseRowCells(lines[i]));
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    // Block quote
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    // Lists
    const bulletMatch = line.match(/^\s*[-*•]\s+(.*)$/);
    const orderedMatch = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bulletMatch || orderedMatch) {
      const ordered = Boolean(orderedMatch);
      const items: string[] = [];
      while (i < lines.length) {
        const bm = lines[i].match(/^\s*[-*•]\s+(.*)$/);
        const om = lines[i].match(/^\s*\d+[.)]\s+(.*)$/);
        if (ordered && om) items.push(om[1]);
        else if (!ordered && bm) items.push(bm[1]);
        else break;
        i++;
      }
      blocks.push({ type: "list", items, ordered });
      continue;
    }

    // Paragraph: gather consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !/^(#{1,4})\s/.test(lines[i]) &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    } else {
      i++; // safety
    }
  }

  return blocks;
}

/** Renders **bold**, *italic*, and `code` spans as nested Text. */
function renderInline(text: string, baseColor: string, fontSize: number): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Text key={`t${key++}`}>{text.slice(lastIndex, match.index)}</Text>);
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <Text key={`b${key++}`} style={{ fontWeight: "700" }}>
          {token.slice(2, -2)}
        </Text>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <Text key={`c${key++}`} style={styles.inlineCode}>
          {token.slice(1, -1)}
        </Text>
      );
    } else {
      nodes.push(
        <Text key={`i${key++}`} style={{ fontStyle: "italic" }}>
          {token.slice(1, -1)}
        </Text>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<Text key={`t${key++}`}>{text.slice(lastIndex)}</Text>);
  }
  return nodes.length ? (
    <>{nodes}</>
  ) : (
    <Text key="all">{text}</Text>
  );
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({
  content,
  textColor = colors.text,
  baseFontSize = 14,
}) => {
  const blocks = React.useMemo(() => parseBlocks(content ?? ""), [content]);

  return (
    <View>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            const size =
              block.level === 1
                ? baseFontSize + 4
                : block.level === 2
                ? baseFontSize + 2
                : baseFontSize;
            return (
              <Text
                key={idx}
                style={{
                  color: textColor,
                  fontSize: size,
                  fontWeight: "700",
                  marginTop: idx === 0 ? 0 : 8,
                  marginBottom: 3,
                }}
              >
                {renderInline(block.text, textColor, size)}
              </Text>
            );
          }
          case "code":
            return (
              <View key={idx} style={styles.codeBlock}>
                <Text style={[styles.codeText, { fontSize: baseFontSize - 1 }]}>{block.text}</Text>
              </View>
            );
          case "table":
            return (
              <View key={idx} style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  {block.header.map((h, ci) => (
                    <Text key={ci} style={[styles.tableCell, styles.tableHeaderText, { flex: 1, fontSize: baseFontSize - 1.5 }]}>
                      {h}
                    </Text>
                  ))}
                </View>
                {block.rows.map((row, ri) => (
                  <View key={ri} style={styles.tableRow}>
                    {row.map((cell, ci) => (
                      <Text key={ci} style={[styles.tableCell, { flex: 1, color: textColor, fontSize: baseFontSize - 1.5 }]}>
                        {renderInline(cell, textColor, baseFontSize - 1.5)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          case "quote":
            return (
              <View key={idx} style={styles.quote}>
                <Text style={{ color: colors.textMuted, fontSize: baseFontSize - 0.5, fontStyle: "italic" }}>
                  {renderInline(block.text, colors.textMuted, baseFontSize)}
                </Text>
              </View>
            );
          case "list":
            return (
              <View key={idx} style={{ marginBottom: 4 }}>
                {block.items.map((item, li) => (
                  <View key={li} style={styles.listItem}>
                    <Text style={{ color: colors.primary, fontSize: baseFontSize, width: 16 }}>
                      {block.ordered ? `${li + 1}.` : "•"}
                    </Text>
                    <Text style={{ color: textColor, fontSize: baseFontSize, flex: 1, lineHeight: baseFontSize * 1.45 }}>
                      {renderInline(item, textColor, baseFontSize)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          case "paragraph":
          default:
            return (
              <Text key={idx} style={{ color: textColor, fontSize: baseFontSize, lineHeight: baseFontSize * 1.45, marginBottom: 4 }}>
                {renderInline(block.text, textColor, baseFontSize)}
              </Text>
            );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  codeBlock: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 10,
    marginVertical: 4,
  },
  codeText: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    color: colors.accentStrong,
  },
  inlineCode: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    color: colors.accentStrong,
    backgroundColor: colors.surfaceElevated,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    overflow: "hidden",
    marginVertical: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tableHeaderRow: {
    backgroundColor: colors.surfaceElevated,
  },
  tableCell: {
    padding: 6,
  },
  tableHeaderText: {
    fontWeight: "700",
    color: colors.text,
  },
  quote: {
    borderLeftWidth: 2,
    borderLeftColor: colors.borderLight,
    paddingLeft: 10,
    marginVertical: 4,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
});
