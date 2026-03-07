export const TOKEN_CATEGORIES = [
  "all",
  "color",
  "spacing",
  "typography",
  "radius",
  "shadow",
  "sizing",
  "motion",
  "z-index",
  "opacity",
  "breakpoint",
  "other"
] as const;

export type TokenCategory = (typeof TOKEN_CATEGORIES)[number];

export type ParsedToken = {
  name: string;
  value: string;
  category: Exclude<TokenCategory, "all">;
  scope: string;
  atRules: string[];
};

export type ParsedScopeBlock = {
  scope: string;
  atRules: string[];
};

export type ParsedCssDocument = {
  directives: string[];
  blockOrder: ParsedScopeBlock[];
  tokens: ParsedToken[];
};

export type CssSyntaxError = {
  line: number;
  message: string;
};

const COLOR_VALUE_REGEX = /(#([0-9a-f]{3,8})\b)|(rgba?\()|(hsla?\()|(oklch\()|(oklab\()|(color\()|(lab\()|(lch\()/i;
const SIZE_VALUE_REGEX = /^-?\d*\.?\d+(px|rem|em|vh|vw|ch|%)?$/i;
const CSS_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g;
const THEME_BLOCK_REGEX = /^@theme\b/i;

function splitDirectives(rawCss: string) {
  const directives: string[] = [];
  const bodyLines: string[] = [];

  for (const line of rawCss.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.startsWith("@") && !trimmed.includes("{") && /;\s*$/.test(trimmed)) {
      directives.push(trimmed);
      bodyLines.push("");
      continue;
    }

    bodyLines.push(line);
  }

  return {
    directives,
    body: bodyLines.join("\n")
  };
}

function inferCategory(name: string, value: string): Exclude<TokenCategory, "all"> {
  const lowerName = name.toLowerCase();
  const lowerValue = value.trim().toLowerCase();

  if (/(shadow|elevation)/.test(lowerName) || /(\d+px\s+\d+px)/.test(lowerValue)) {
    return "shadow";
  }

  if (
    COLOR_VALUE_REGEX.test(lowerValue) ||
    /(color|surface|background|foreground|bg|fg|fill|stroke|border|accent|primary|secondary)/.test(lowerName)
  ) {
    return "color";
  }

  if (/(font|line-height|letter-spacing|tracking|text|type|weight)/.test(lowerName)) {
    return "typography";
  }

  if (/(space|spacing|gap|padding|margin|inset)/.test(lowerName) && SIZE_VALUE_REGEX.test(lowerValue)) {
    return "spacing";
  }

  if (/(radius|rounded|corner)/.test(lowerName)) {
    return "radius";
  }

  if (/(blur|perspective)/.test(lowerName)) {
    return "other";
  }

  if (/(width|height|size|container|layout|aspect)/.test(lowerName)) {
    return "sizing";
  }

  if (/(duration|timing|easing|transition|motion|animation|animate|ease)/.test(lowerName)) {
    return "motion";
  }

  if (/(z-index|zindex|layer)/.test(lowerName)) {
    return "z-index";
  }

  if (/(opacity|alpha)/.test(lowerName)) {
    return "opacity";
  }

  if (/(breakpoint|screen|media|viewport)/.test(lowerName)) {
    return "breakpoint";
  }

  if (/(space|spacing|gap|padding|margin|inset)/.test(lowerName)) {
    return "spacing";
  }

  if (SIZE_VALUE_REGEX.test(lowerValue)) {
    return "sizing";
  }

  return "other";
}

export function parseCssTokens(rawCss: string): ParsedToken[] {
  return parseCssDocument(rawCss).tokens;
}

export function parseCssDocument(rawCss: string): ParsedCssDocument {
  const tokens: ParsedToken[] = [];
  const { directives, body } = splitDirectives(rawCss);
  const scanSource = body.replace(CSS_COMMENT_REGEX, "");
  const blockOrder: ParsedScopeBlock[] = [];
  const tokenPattern = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  const seenBlocks = new Set<string>();

  function trackBlock(scope: string, atRules: string[]) {
    const key = `${atRules.join("||")}::${scope}`;

    if (seenBlocks.has(key)) {
      return;
    }

    seenBlocks.add(key);
    blockOrder.push({ scope, atRules });
  }

  function scanBlocks(source: string, inheritedAtRules: string[] = []) {
    let depth = 0;
    let segmentStart = 0;
    let blockStart = -1;
    let headerSource = "";

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];

      if (char === "{") {
        if (depth === 0) {
          headerSource = source.slice(segmentStart, index).trim();
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

      const header = headerSource.trim();
      const body = source.slice(blockStart, index);
      segmentStart = index + 1;
      blockStart = -1;

      if (!header) {
        continue;
      }

      if (header.startsWith("@") && !THEME_BLOCK_REGEX.test(header)) {
        scanBlocks(body, [...inheritedAtRules, header]);
        continue;
      }

      trackBlock(header, inheritedAtRules);

      for (const tokenMatch of body.matchAll(tokenPattern)) {
        const name = `--${tokenMatch[1].trim()}`;
        const value = tokenMatch[2].trim();

        if (!value) {
          continue;
        }

        tokens.push({
          name,
          value,
          category: inferCategory(name, value),
          scope: header,
          atRules: inheritedAtRules
        });
      }
    }
  }

  scanBlocks(scanSource);

  return {
    directives,
    blockOrder,
    tokens
  };
}

export function validateCssSyntax(rawCss: string): CssSyntaxError[] {
  const errors: CssSyntaxError[] = [];
  const lines = rawCss.split("\n");
  let braceDepth = 0;
  let parenDepth = 0;
  let openCustomPropertyLine: number | null = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;

    for (const char of line) {
      if (char === "{") {
        braceDepth += 1;
      } else if (char === "}") {
        braceDepth -= 1;
      } else if (char === "(") {
        parenDepth += 1;
      } else if (char === ")") {
        parenDepth -= 1;
      }
    }

    if (braceDepth < 0) {
      errors.push({ line: lineNumber, message: "Unexpected closing brace `}`." });
      braceDepth = 0;
    }

    if (parenDepth < 0) {
      errors.push({ line: lineNumber, message: "Unexpected closing parenthesis `)`." });
      parenDepth = 0;
    }

    if (!trimmed || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("//")) {
      return;
    }

    if (openCustomPropertyLine !== null) {
      if (/;\s*(\/\*.*\*\/)?\s*$/.test(trimmed)) {
        openCustomPropertyLine = null;
        return;
      }

      if (trimmed.startsWith("--") || trimmed === "}") {
        errors.push({ line: openCustomPropertyLine, message: "Missing semicolon at end of declaration." });
        openCustomPropertyLine = null;
      } else {
        return;
      }
    }

    if (trimmed.startsWith("--")) {
      if (!/^\s*--[a-zA-Z0-9-_]+\s*:/.test(line)) {
        errors.push({ line: lineNumber, message: "Invalid custom property declaration." });
        return;
      }

      if (!/;\s*(\/\*.*\*\/)?\s*$/.test(trimmed)) {
        openCustomPropertyLine = lineNumber;
      }
    }
  });

  if (openCustomPropertyLine !== null) {
    errors.push({ line: openCustomPropertyLine, message: "Missing semicolon at end of declaration." });
  }

  if (braceDepth > 0) {
    errors.push({ line: lines.length, message: "Unclosed `{` block." });
  }

  if (parenDepth > 0) {
    errors.push({ line: lines.length, message: "Unclosed `(` expression." });
  }

  return errors;
}
