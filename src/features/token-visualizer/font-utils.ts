import type { TokenDocument } from "@/features/token-visualizer/document";

export type ImportedGoogleFont = {
  family: string;
  href: string;
  directive: string;
};

export type FontTokenDefinition = {
  framework: string;
  role: string;
  fallback: string;
};

export const GOOGLE_FONT_SUGGESTIONS = [
  "Inter",
  "Instrument Sans",
  "Manrope",
  "DM Sans",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Work Sans",
  "Source Sans 3",
  "Merriweather",
  "Source Serif 4",
  "Libre Baskerville",
  "Playfair Display",
  "IBM Plex Sans",
  "IBM Plex Serif",
  "IBM Plex Mono",
  "JetBrains Mono",
  "Fira Code",
  "Geist",
  "Outfit",
  "Sora"
] as const;

const GOOGLE_FONTS_HOST_REGEX = /(^|\.)fonts\.googleapis\.com$/i;
const GOOGLE_FONT_IMPORT_REGEX =
  /@import\s+(?:url\(\s*(?:(['"])(.*?)\1|([^)\s]+))\s*\)|(['"])(.*?)\4)\s*;?/i;

const FONT_TOKEN_DEFINITIONS: Array<{
  matcher: RegExp;
  framework: string;
  role: string;
  fallback: string;
}> = [
  { matcher: /^--font-sans$/i, framework: "Tailwind / shadcn", role: "Sans", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--font-serif$/i, framework: "Tailwind / shadcn", role: "Serif", fallback: "ui-serif, Georgia, serif" },
  { matcher: /^--font-mono$/i, framework: "Tailwind / shadcn", role: "Mono", fallback: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  { matcher: /^--chakra-fonts-body$/i, framework: "Chakra", role: "Body", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--chakra-fonts-heading$/i, framework: "Chakra", role: "Heading", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--chakra-fonts-mono$/i, framework: "Chakra", role: "Mono", fallback: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  { matcher: /^--mantine-font-family$/i, framework: "Mantine", role: "Body", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--mantine-font-family-headings$/i, framework: "Mantine", role: "Headings", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--mantine-font-family-monospace$/i, framework: "Mantine", role: "Mono", fallback: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  { matcher: /^--default-font-family$/i, framework: "Radix", role: "Body", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--heading-font-family$/i, framework: "Radix", role: "Heading", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--strong-font-family$/i, framework: "Radix", role: "Strong", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--code-font-family$/i, framework: "Radix", role: "Code", fallback: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  { matcher: /^--em-font-family$/i, framework: "Radix", role: "Emphasis", fallback: "ui-serif, Georgia, serif" },
  { matcher: /^--quote-font-family$/i, framework: "Radix", role: "Quote", fallback: "ui-serif, Georgia, serif" },
  { matcher: /^--font-body(?:-.+)?$/i, framework: "Generic", role: "Body", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--font-heading(?:-.+)?$/i, framework: "Generic", role: "Heading", fallback: "ui-sans-serif, system-ui, sans-serif" },
  { matcher: /^--font-family(?:-.+)?$/i, framework: "Generic", role: "Body", fallback: "ui-sans-serif, system-ui, sans-serif" }
];

function uniqueByFamily(fonts: ImportedGoogleFont[]) {
  const seenFamilies = new Set<string>();

  return fonts.filter((font) => {
    const key = font.family.toLowerCase();

    if (seenFamilies.has(key)) {
      return false;
    }

    seenFamilies.add(key);
    return true;
  });
}

function matchImportUrl(directive: string) {
  const match = directive.match(GOOGLE_FONT_IMPORT_REGEX);
  return match?.[2] ?? match?.[3] ?? match?.[5] ?? null;
}

function isGoogleFontsHref(href: string) {
  try {
    const url = new URL(href);
    return GOOGLE_FONTS_HOST_REGEX.test(url.hostname);
  } catch {
    return false;
  }
}

export function normalizeGoogleFontFamily(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function buildGoogleFontImportHref(family: string) {
  const normalizedFamily = normalizeGoogleFontFamily(family);
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(normalizedFamily).replace(/%20/g, "+")}&display=swap`;
}

export function buildGoogleFontImportDirective(family: string) {
  return `@import url("${buildGoogleFontImportHref(family)}");`;
}

export function parseGoogleFontImports(directives: string[]) {
  const fonts: ImportedGoogleFont[] = [];

  for (const directive of directives) {
    const href = matchImportUrl(directive);

    if (!href || !isGoogleFontsHref(href)) {
      continue;
    }

    let url: URL;

    try {
      url = new URL(href);
    } catch {
      continue;
    }

    for (const familySpec of url.searchParams.getAll("family")) {
      const family = normalizeGoogleFontFamily(familySpec.split(":")[0] ?? "");

      if (!family) {
        continue;
      }

      fonts.push({
        family,
        href: buildGoogleFontImportHref(family),
        directive: buildGoogleFontImportDirective(family)
      });
    }
  }

  return uniqueByFamily(fonts);
}

export function getFontTokenDefinition(tokenName: string): FontTokenDefinition | null {
  const match = FONT_TOKEN_DEFINITIONS.find((definition) => definition.matcher.test(tokenName));

  if (!match) {
    return null;
  }

  return {
    framework: match.framework,
    role: match.role,
    fallback: match.fallback
  };
}

export function extractPrimaryFontFamily(value: string) {
  const firstSegment = value.split(",")[0]?.trim();

  if (!firstSegment || firstSegment.startsWith("var(") || firstSegment.startsWith("--theme(")) {
    return null;
  }

  return firstSegment.replace(/^['"]|['"]$/g, "").trim() || null;
}

export function buildFontFamilyValue(family: string, tokenName: string) {
  const normalizedFamily = normalizeGoogleFontFamily(family);
  const definition = getFontTokenDefinition(tokenName);
  const fallback = definition?.fallback ?? "ui-sans-serif, system-ui, sans-serif";
  return `"${normalizedFamily}", ${fallback}`;
}

function withoutMatchingGoogleFontDirectives(directives: string[], family: string) {
  const normalizedFamily = normalizeGoogleFontFamily(family).toLowerCase();

  return directives.filter((directive) => {
    return !parseGoogleFontImports([directive]).some((font) => font.family.toLowerCase() === normalizedFamily);
  });
}

export function addGoogleFontImportToDocument(document: TokenDocument, family: string): TokenDocument {
  const normalizedFamily = normalizeGoogleFontFamily(family);

  if (!normalizedFamily) {
    return document;
  }

  const directive = buildGoogleFontImportDirective(normalizedFamily);
  const directives = [directive, ...withoutMatchingGoogleFontDirectives(document.directives, normalizedFamily)];

  return {
    ...document,
    directives,
    importedCss: upsertGoogleFontImportInCss(document.importedCss, normalizedFamily)
  };
}

export function removeGoogleFontImportFromDocument(document: TokenDocument, family: string): TokenDocument {
  const normalizedFamily = normalizeGoogleFontFamily(family);

  if (!normalizedFamily) {
    return document;
  }

  return {
    ...document,
    directives: withoutMatchingGoogleFontDirectives(document.directives, normalizedFamily),
    importedCss: removeGoogleFontImportFromCss(document.importedCss, normalizedFamily)
  };
}

export function upsertGoogleFontImportInCss(rawCss: string, family: string) {
  const normalizedFamily = normalizeGoogleFontFamily(family);

  if (!normalizedFamily) {
    return rawCss;
  }

  const directive = buildGoogleFontImportDirective(normalizedFamily);
  const remainingLines = rawCss
    .split("\n")
    .filter((line) => !parseGoogleFontImports([line]).some((font) => font.family.toLowerCase() === normalizedFamily.toLowerCase()));
  const trimmedBody = remainingLines.join("\n").trim();

  return trimmedBody ? `${directive}\n\n${trimmedBody}` : directive;
}

export function removeGoogleFontImportFromCss(rawCss: string, family: string) {
  const normalizedFamily = normalizeGoogleFontFamily(family).toLowerCase();

  return rawCss
    .split("\n")
    .filter((line) => !parseGoogleFontImports([line]).some((font) => font.family.toLowerCase() === normalizedFamily))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
