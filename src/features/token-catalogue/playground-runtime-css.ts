const THEME_BLOCK_REGEX = /^@theme\b/i;
const KEYFRAMES_BLOCK_REGEX = /^@(-[\w]+-)?keyframes\b/i;
const UTILITY_BLOCK_REGEX = /^@utility\s+([a-zA-Z0-9-_]+)/i;
const RECURSIVE_AT_RULE_REGEX = /^@(media|supports|layer|container|scope)\b/i;
const STATEMENT_AT_RULE_REGEX = /@[^{;]+;/g;
const ROOT_SELECTOR_REGEX = /:root\b/g;
const HOST_SELECTOR_REGEX = /:host\b/g;

type CssBlock = {
  header: string;
  body: string;
};

type CssChunk =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "block";
      block: CssBlock;
    };

function splitTopLevelCss(source: string): CssChunk[] {
  const chunks: CssChunk[] = [];
  let depth = 0;
  let segmentStart = 0;
  let blockStart = -1;
  let headerSource = "";

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === "{") {
      if (depth === 0) {
        const rawSegment = source.slice(segmentStart, index);
        const lastStatementBoundary = rawSegment.lastIndexOf(";");
        const text = lastStatementBoundary >= 0 ? rawSegment.slice(0, lastStatementBoundary + 1) : "";
        const headerSegment = lastStatementBoundary >= 0 ? rawSegment.slice(lastStatementBoundary + 1) : rawSegment;

        if (text.trim().length > 0) {
          chunks.push({ type: "text", value: text });
        }

        headerSource = headerSegment.trim();
        blockStart = index + 1;
      }

      depth += 1;
      continue;
    }

    if (char !== "}") {
      continue;
    }

    depth -= 1;

    if (depth !== 0 || blockStart === -1) {
      continue;
    }

    chunks.push({
      type: "block",
      block: {
        header: headerSource.trim(),
        body: source.slice(blockStart, index)
      }
    });

    segmentStart = index + 1;
    blockStart = -1;
    headerSource = "";
  }

  const trailingText = source.slice(segmentStart);

  if (trailingText.trim().length > 0) {
    chunks.push({ type: "text", value: trailingText });
  }

  return chunks;
}

function extractAtRuleStatements(source: string) {
  return [...source.matchAll(STATEMENT_AT_RULE_REGEX)].map((match) => match[0].trim()).filter(Boolean);
}

function rewriteSelectors(selector: string, hostSelector: string) {
  return selector.replace(ROOT_SELECTOR_REGEX, hostSelector);
}

function splitDeclarations(body: string) {
  const declarations: string[] = [];
  let parenDepth = 0;
  let current = "";

  for (const char of body) {
    if (char === "(") {
      parenDepth += 1;
    } else if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
    }

    current += char;

    if (char === ";" && parenDepth === 0) {
      declarations.push(current);
      current = "";
    }
  }

  if (current.trim().length > 0) {
    declarations.push(current);
  }

  return declarations.map((declaration) => declaration.trim()).filter(Boolean);
}

function stripCustomPropertiesFromRuleBody(body: string) {
  const keptDeclarations = splitDeclarations(body).filter((declaration) => !declaration.startsWith("--"));
  return keptDeclarations.join("\n");
}

function transformStylesheet(source: string, hostSelector: string): string[] {
  const output: string[] = [];

  for (const chunk of splitTopLevelCss(source)) {
    if (chunk.type === "text") {
      output.push(...extractAtRuleStatements(chunk.value));
      continue;
    }

    output.push(...transformBlock(chunk.block, hostSelector));
  }

  return output;
}

function transformBlock(block: CssBlock, hostSelector: string): string[] {
  const header = block.header.trim();

  if (!header) {
    return [];
  }

  if (THEME_BLOCK_REGEX.test(header)) {
    return transformStylesheet(block.body, hostSelector);
  }

  const utilityMatch = header.match(UTILITY_BLOCK_REGEX);

  if (utilityMatch) {
    const utilityName = utilityMatch[1];
    return [`.${utilityName} {\n${block.body.trim()}\n}`];
  }

  if (KEYFRAMES_BLOCK_REGEX.test(header)) {
    return [`${header} {\n${block.body}\n}`];
  }

  if (RECURSIVE_AT_RULE_REGEX.test(header)) {
    const transformedBody = transformStylesheet(block.body, hostSelector).join("\n\n");
    return [`${header} {\n${transformedBody}\n}`];
  }

  if (header.startsWith("@")) {
    return [`${header} {\n${block.body}\n}`];
  }

  const rewrittenHeader = rewriteSelectors(header, hostSelector);
  const isHostScopedRule = rewrittenHeader.includes(hostSelector) || HOST_SELECTOR_REGEX.test(header) || ROOT_SELECTOR_REGEX.test(header);
  const ruleBody = isHostScopedRule ? stripCustomPropertiesFromRuleBody(block.body) : block.body.trim();

  if (!ruleBody.trim()) {
    return [];
  }

  return [`${rewrittenHeader} {\n${ruleBody}\n}`];
}

export function transformImportedCssForPlayground(rawCss: string, hostSelector = ":host") {
  if (rawCss.trim().length === 0) {
    return "";
  }

  return transformStylesheet(rawCss, hostSelector).filter(Boolean).join("\n\n");
}
