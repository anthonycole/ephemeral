import type { TokenRecord } from "@/features/token-visualizer/document";
import { extractPrimaryFontFamily } from "@/features/token-visualizer/font-utils";

export type SnapshotValue = {
  tokenName: string | null;
  resolvedValue: string;
  displayLabel: string;
};

export type ThemeSnapshot = {
  fonts: {
    sans: SnapshotValue;
    heading: SnapshotValue;
    serif: SnapshotValue;
    mono: SnapshotValue;
  };
  colors: {
    background: SnapshotValue;
    foreground: SnapshotValue;
    muted: SnapshotValue;
    accent: SnapshotValue;
    accentStrong: SnapshotValue;
    border: SnapshotValue;
  };
  counts: {
    total: number;
    colors: number;
    typography: number;
    spacing: number;
    palette: number;
  };
};

function normalizeTokenName(name: string) {
  return name.trim().toLowerCase();
}

function pickTokenName(
  tokenNameMap: Map<string, string>,
  exactNames: string[],
  containsGroups: string[][] = []
) {
  for (const candidate of exactNames) {
    const match = tokenNameMap.get(normalizeTokenName(candidate));

    if (match) {
      return match;
    }
  }

  const tokenEntries = [...tokenNameMap.entries()];

  for (const contains of containsGroups) {
    const match = tokenEntries.find(([tokenName]) => contains.every((part) => tokenName.includes(part)));

    if (match) {
      return match[1];
    }
  }

  return null;
}

function tokenReference(tokenName: string | null, fallbackValue: string) {
  return tokenName ? `var(${tokenName})` : fallbackValue;
}

function snapshotValue(tokenName: string | null, tokenValue: string | null, fallbackValue: string, displayLabel?: string): SnapshotValue {
  return {
    tokenName,
    resolvedValue: tokenValue ?? fallbackValue,
    displayLabel: displayLabel ?? tokenValue ?? fallbackValue
  };
}

function firstFontLabel(value: string) {
  return extractPrimaryFontFamily(value) ?? value.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "") ?? value;
}

function isPaletteToken(token: TokenRecord) {
  return (
    token.category === "color" &&
    !token.name.toLowerCase().includes("shadow") &&
    !token.name.toLowerCase().includes("elevation")
  );
}

export function createSemanticDeclarations(tokens: TokenRecord[]) {
  const tokenNameMap = new Map(tokens.map((token) => [normalizeTokenName(token.name), token.name]));
  const fontSans = pickTokenName(
    tokenNameMap,
    ["--font-sans", "--font-body", "--chakra-fonts-body", "--mantine-font-family", "--default-font-family", "--font-family"],
    [["font", "sans"], ["font", "body"], ["chakra", "fonts", "body"], ["mantine", "font", "family"], ["default", "font", "family"]]
  );
  const fontHeading = pickTokenName(
    tokenNameMap,
    ["--font-heading", "--chakra-fonts-heading", "--mantine-font-family-headings", "--heading-font-family"],
    [["font", "heading"], ["chakra", "fonts", "heading"], ["mantine", "font", "family", "headings"], ["heading", "font", "family"]]
  );
  const fontStrong = pickTokenName(tokenNameMap, ["--strong-font-family"], [["strong", "font", "family"]]);
  const fontSerif = pickTokenName(
    tokenNameMap,
    ["--font-serif", "--em-font-family", "--quote-font-family"],
    [["font", "serif"], ["em", "font", "family"], ["quote", "font", "family"]]
  );
  const fontEm = pickTokenName(tokenNameMap, ["--em-font-family"], [["em", "font", "family"]]);
  const fontQuote = pickTokenName(tokenNameMap, ["--quote-font-family"], [["quote", "font", "family"]]);
  const fontMono = pickTokenName(
    tokenNameMap,
    ["--font-mono", "--chakra-fonts-mono", "--mantine-font-family-monospace", "--code-font-family"],
    [["font", "mono"], ["chakra", "fonts", "mono"], ["mantine", "font", "family", "monospace"], ["code", "font", "family"]]
  );
  const colorBackground = pickTokenName(
    tokenNameMap,
    [
      "--color-background",
      "--color-surface",
      "--color-canvas",
      "--color-base",
      "--color-slate-950",
      "--color-zinc-950",
      "--color-neutral-950",
      "--color-gray-950",
      "--color-white"
    ],
    [["background"], ["surface"], ["canvas"], ["base"], ["slate", "950"], ["white"]]
  );
  const colorForeground = pickTokenName(
    tokenNameMap,
    [
      "--color-foreground",
      "--color-text",
      "--color-content",
      "--color-ink",
      "--color-slate-50",
      "--color-white",
      "--color-slate-950",
      "--color-black"
    ],
    [["foreground"], ["text"], ["content"], ["ink"], ["slate", "50"], ["white"], ["black"]]
  );
  const colorMuted = pickTokenName(
    tokenNameMap,
    ["--color-muted", "--color-subtle", "--color-slate-400", "--color-gray-400", "--color-zinc-400", "--color-neutral-400"],
    [["muted"], ["subtle"], ["slate", "400"], ["gray", "400"], ["zinc", "400"], ["neutral", "400"]]
  );
  const colorAccent = pickTokenName(
    tokenNameMap,
    [
      "--color-brand-500",
      "--color-primary-500",
      "--color-accent-500",
      "--color-blue-500",
      "--color-sky-500",
      "--color-indigo-500",
      "--color-brand",
      "--color-primary",
      "--color-accent"
    ],
    [["brand", "500"], ["primary", "500"], ["accent", "500"], ["blue", "500"], ["sky", "500"], ["indigo", "500"], ["brand"], ["primary"], ["accent"]]
  );
  const colorAccentStrong = pickTokenName(
    tokenNameMap,
    [
      "--color-brand-600",
      "--color-brand-700",
      "--color-primary-600",
      "--color-primary-700",
      "--color-accent-600",
      "--color-accent-700",
      "--color-blue-600",
      "--color-sky-600",
      "--color-indigo-600"
    ],
    [["brand", "600"], ["brand", "700"], ["primary", "600"], ["primary", "700"], ["accent", "600"], ["accent", "700"], ["blue", "600"], ["sky", "600"], ["indigo", "600"]]
  );
  const colorBorder = pickTokenName(
    tokenNameMap,
    ["--color-border", "--color-outline", "--color-line", "--color-slate-700", "--color-gray-700", "--color-zinc-700", "--color-neutral-700"],
    [["border"], ["outline"], ["line"], ["slate", "700"], ["gray", "700"], ["zinc", "700"], ["neutral", "700"]]
  );
  const shadowPanel = pickTokenName(tokenNameMap, ["--shadow-lg", "--shadow-md", "--shadow-sm"], [["shadow", "lg"], ["shadow", "md"], ["shadow", "sm"]]);
  const shadowPopover = pickTokenName(tokenNameMap, ["--shadow-xl", "--shadow-lg", "--shadow-md"], [["shadow", "xl"], ["shadow", "lg"], ["shadow", "md"]]);
  const declarations = [
    `  --playground-font-sans: ${tokenReference(fontSans, '"Avenir Next", "Segoe UI", sans-serif')};`,
    `  --playground-font-heading: ${tokenReference(fontHeading ?? fontSans, '"Iowan Old Style", "Palatino Linotype", serif')};`,
    `  --playground-font-strong: ${tokenReference(fontStrong ?? fontHeading ?? fontSans, '"Avenir Next", "Segoe UI", sans-serif')};`,
    `  --playground-font-serif: ${tokenReference(fontSerif, '"Iowan Old Style", "Palatino Linotype", serif')};`,
    `  --playground-font-em: ${tokenReference(fontEm ?? fontSerif, '"Iowan Old Style", "Palatino Linotype", serif')};`,
    `  --playground-font-quote: ${tokenReference(fontQuote ?? fontSerif, '"Iowan Old Style", "Palatino Linotype", serif')};`,
    `  --playground-font-mono: ${tokenReference(fontMono, '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace')};`,
    `  --playground-color-bg: ${tokenReference(colorBackground, "oklch(0.96 0.02 75)")};`,
    `  --playground-color-fg: ${tokenReference(colorForeground, "oklch(0.24 0.03 45)")};`,
    `  --playground-color-muted: ${tokenReference(colorMuted, "oklch(0.56 0.03 55)")};`,
    `  --playground-color-accent: ${tokenReference(colorAccent, "oklch(0.63 0.13 45)")};`,
    `  --playground-color-accent-strong: ${tokenReference(colorAccentStrong ?? colorAccent, "oklch(0.56 0.14 42)")};`,
    `  --playground-color-border: ${tokenReference(colorBorder, "oklch(0.83 0.02 65)")};`,
    "  --playground-radius-md: 1rem;",
    "  --playground-radius-xl: 1.5rem;",
    `  --playground-shadow-panel: ${tokenReference(shadowPanel, "0 24px 60px rgb(72 49 31 / 0.14)")};`,
    `  --playground-shadow-popover: ${tokenReference(shadowPopover ?? shadowPanel, "0 18px 42px rgb(72 49 31 / 0.12)")};`,
    "  --playground-color-shell-end: color-mix(in oklab, var(--playground-color-bg) 78%, var(--playground-color-accent) 22%);",
    "  --playground-color-panel: color-mix(in oklab, var(--playground-color-bg) 92%, white 8%);",
    "  --playground-color-panel-strong: color-mix(in oklab, var(--playground-color-bg) 84%, var(--playground-color-fg) 16%);",
    "  --playground-color-border-strong: color-mix(in oklab, var(--playground-color-border) 72%, var(--playground-color-accent) 28%);",
    "  --playground-color-accent-soft: color-mix(in oklab, var(--playground-color-accent) 16%, transparent);",
    "  --playground-color-focus-ring: color-mix(in oklab, var(--playground-color-accent) 28%, transparent);",
    "  --playground-color-on-accent: color-mix(in oklab, white 78%, var(--playground-color-fg) 22%);"
  ];

  return declarations.join("\n");
}

export function createThemeSnapshot(tokens: TokenRecord[]): ThemeSnapshot {
  const tokenNameMap = new Map(tokens.map((token) => [normalizeTokenName(token.name), token.name]));
  const tokenValueMap = new Map(tokens.map((token) => [token.name, token.value]));

  const fontSans = pickTokenName(
    tokenNameMap,
    ["--font-sans", "--font-body", "--chakra-fonts-body", "--mantine-font-family", "--default-font-family", "--font-family"],
    [["font", "sans"], ["font", "body"], ["chakra", "fonts", "body"], ["mantine", "font", "family"], ["default", "font", "family"]]
  );
  const fontHeading = pickTokenName(
    tokenNameMap,
    ["--font-heading", "--chakra-fonts-heading", "--mantine-font-family-headings", "--heading-font-family"],
    [["font", "heading"], ["chakra", "fonts", "heading"], ["mantine", "font", "family", "headings"], ["heading", "font", "family"]]
  );
  const fontSerif = pickTokenName(
    tokenNameMap,
    ["--font-serif", "--em-font-family", "--quote-font-family"],
    [["font", "serif"], ["em", "font", "family"], ["quote", "font", "family"]]
  );
  const fontMono = pickTokenName(
    tokenNameMap,
    ["--font-mono", "--chakra-fonts-mono", "--mantine-font-family-monospace", "--code-font-family"],
    [["font", "mono"], ["chakra", "fonts", "mono"], ["mantine", "font", "family", "monospace"], ["code", "font", "family"]]
  );

  const colorBackground = pickTokenName(
    tokenNameMap,
    [
      "--color-background",
      "--color-surface",
      "--color-canvas",
      "--color-base",
      "--color-slate-950",
      "--color-zinc-950",
      "--color-neutral-950",
      "--color-gray-950",
      "--color-white"
    ],
    [["background"], ["surface"], ["canvas"], ["base"], ["slate", "950"], ["white"]]
  );
  const colorForeground = pickTokenName(
    tokenNameMap,
    [
      "--color-foreground",
      "--color-text",
      "--color-content",
      "--color-ink",
      "--color-slate-50",
      "--color-white",
      "--color-slate-950",
      "--color-black"
    ],
    [["foreground"], ["text"], ["content"], ["ink"], ["slate", "50"], ["white"], ["black"]]
  );
  const colorMuted = pickTokenName(
    tokenNameMap,
    ["--color-muted", "--color-subtle", "--color-slate-400", "--color-gray-400", "--color-zinc-400", "--color-neutral-400"],
    [["muted"], ["subtle"], ["slate", "400"], ["gray", "400"], ["zinc", "400"], ["neutral", "400"]]
  );
  const colorAccent = pickTokenName(
    tokenNameMap,
    [
      "--color-brand-500",
      "--color-primary-500",
      "--color-accent-500",
      "--color-blue-500",
      "--color-sky-500",
      "--color-indigo-500",
      "--color-brand",
      "--color-primary",
      "--color-accent"
    ],
    [["brand", "500"], ["primary", "500"], ["accent", "500"], ["blue", "500"], ["sky", "500"], ["indigo", "500"], ["brand"], ["primary"], ["accent"]]
  );
  const colorAccentStrong = pickTokenName(
    tokenNameMap,
    [
      "--color-brand-600",
      "--color-brand-700",
      "--color-primary-600",
      "--color-primary-700",
      "--color-accent-600",
      "--color-accent-700",
      "--color-blue-600",
      "--color-sky-600",
      "--color-indigo-600"
    ],
    [["brand", "600"], ["brand", "700"], ["primary", "600"], ["primary", "700"], ["accent", "600"], ["accent", "700"], ["blue", "600"], ["sky", "600"], ["indigo", "600"]]
  );
  const colorBorder = pickTokenName(
    tokenNameMap,
    ["--color-border", "--color-outline", "--color-line", "--color-slate-700", "--color-gray-700", "--color-zinc-700", "--color-neutral-700"],
    [["border"], ["outline"], ["line"], ["slate", "700"], ["gray", "700"], ["zinc", "700"], ["neutral", "700"]]
  );

  return {
    fonts: {
      sans: snapshotValue(
        fontSans,
        fontSans ? tokenValueMap.get(fontSans) ?? null : null,
        '"Avenir Next", "Segoe UI", sans-serif',
        firstFontLabel(fontSans ? tokenValueMap.get(fontSans) ?? '"Avenir Next", "Segoe UI", sans-serif' : '"Avenir Next", "Segoe UI", sans-serif')
      ),
      heading: snapshotValue(
        fontHeading ?? fontSans,
        fontHeading ? tokenValueMap.get(fontHeading) ?? null : fontSans ? tokenValueMap.get(fontSans) ?? null : null,
        '"Iowan Old Style", "Palatino Linotype", serif',
        firstFontLabel(
          fontHeading
            ? tokenValueMap.get(fontHeading) ?? '"Iowan Old Style", "Palatino Linotype", serif'
            : fontSans
              ? tokenValueMap.get(fontSans) ?? '"Iowan Old Style", "Palatino Linotype", serif'
              : '"Iowan Old Style", "Palatino Linotype", serif'
        )
      ),
      serif: snapshotValue(
        fontSerif,
        fontSerif ? tokenValueMap.get(fontSerif) ?? null : null,
        '"Iowan Old Style", "Palatino Linotype", serif',
        firstFontLabel(fontSerif ? tokenValueMap.get(fontSerif) ?? '"Iowan Old Style", "Palatino Linotype", serif' : '"Iowan Old Style", "Palatino Linotype", serif')
      ),
      mono: snapshotValue(
        fontMono,
        fontMono ? tokenValueMap.get(fontMono) ?? null : null,
        '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
        firstFontLabel(
          fontMono
            ? tokenValueMap.get(fontMono) ?? '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace'
            : '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace'
        )
      )
    },
    colors: {
      background: snapshotValue(colorBackground, colorBackground ? tokenValueMap.get(colorBackground) ?? null : null, "oklch(0.96 0.02 75)"),
      foreground: snapshotValue(colorForeground, colorForeground ? tokenValueMap.get(colorForeground) ?? null : null, "oklch(0.24 0.03 45)"),
      muted: snapshotValue(colorMuted, colorMuted ? tokenValueMap.get(colorMuted) ?? null : null, "oklch(0.56 0.03 55)"),
      accent: snapshotValue(colorAccent, colorAccent ? tokenValueMap.get(colorAccent) ?? null : null, "oklch(0.63 0.13 45)"),
      accentStrong: snapshotValue(
        colorAccentStrong ?? colorAccent,
        colorAccentStrong ? tokenValueMap.get(colorAccentStrong) ?? null : colorAccent ? tokenValueMap.get(colorAccent) ?? null : null,
        "oklch(0.56 0.14 42)"
      ),
      border: snapshotValue(colorBorder, colorBorder ? tokenValueMap.get(colorBorder) ?? null : null, "oklch(0.83 0.02 65)")
    },
    counts: {
      total: tokens.length,
      colors: tokens.filter((token) => token.category === "color").length,
      typography: tokens.filter((token) => token.category === "typography").length,
      spacing: tokens.filter((token) => token.category === "spacing").length,
      palette: tokens.filter(isPaletteToken).length
    }
  };
}
