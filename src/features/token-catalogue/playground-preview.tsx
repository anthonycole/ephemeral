"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { parseGoogleFontImports } from "@/features/token-visualizer/font-utils";
import { transformImportedCssForPlayground } from "@/features/token-catalogue/playground-runtime-css";
import { renderPlaygroundShowcases } from "@/features/token-catalogue/playground-showcases";
import styles from "@/features/token-catalogue/styles.module.css";

type PlaygroundPreviewProps = {
  directives: string[];
  tokens: TokenRecord[];
  importedCss: string;
  runtimeCss: string;
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

function createSemanticDeclarations(tokens: TokenRecord[]) {
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
    `  --playground-font-sans: ${tokenReference(fontSans, "ui-sans-serif, system-ui, sans-serif")};`,
    `  --playground-font-heading: ${tokenReference(fontHeading ?? fontSans, "ui-sans-serif, system-ui, sans-serif")};`,
    `  --playground-font-strong: ${tokenReference(fontStrong ?? fontHeading ?? fontSans, "ui-sans-serif, system-ui, sans-serif")};`,
    `  --playground-font-serif: ${tokenReference(fontSerif, "ui-serif, Georgia, serif")};`,
    `  --playground-font-em: ${tokenReference(fontEm ?? fontSerif, "ui-serif, Georgia, serif")};`,
    `  --playground-font-quote: ${tokenReference(fontQuote ?? fontSerif, "ui-serif, Georgia, serif")};`,
    `  --playground-font-mono: ${tokenReference(fontMono, 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace')};`,
    `  --playground-color-bg: ${tokenReference(colorBackground, "oklch(0.15 0.02 255)")};`,
    `  --playground-color-fg: ${tokenReference(colorForeground, "oklch(0.97 0.01 255)")};`,
    `  --playground-color-muted: ${tokenReference(colorMuted, "oklch(0.76 0.02 255)")};`,
    `  --playground-color-accent: ${tokenReference(colorAccent, "oklch(0.67 0.18 255)")};`,
    `  --playground-color-accent-strong: ${tokenReference(colorAccentStrong ?? colorAccent, "oklch(0.6 0.18 255)")};`,
    `  --playground-color-border: ${tokenReference(colorBorder, "oklch(0.35 0.03 255)")};`,
    "  --playground-radius-md: 0;",
    "  --playground-radius-xl: 0;",
    `  --playground-shadow-panel: ${tokenReference(shadowPanel, "0 24px 60px rgb(2 6 23 / 0.45)")};`,
    `  --playground-shadow-popover: ${tokenReference(shadowPopover ?? shadowPanel, "0 18px 42px rgb(2 6 23 / 0.32)")};`,
    "  --playground-color-shell-end: color-mix(in oklab, var(--playground-color-bg) 74%, var(--playground-color-accent) 26%);",
    "  --playground-color-panel: color-mix(in oklab, var(--playground-color-bg) 88%, var(--playground-color-fg) 12%);",
    "  --playground-color-panel-strong: color-mix(in oklab, var(--playground-color-bg) 78%, var(--playground-color-fg) 22%);",
    "  --playground-color-border-strong: color-mix(in oklab, var(--playground-color-border) 72%, var(--playground-color-accent) 28%);",
    "  --playground-color-accent-soft: color-mix(in oklab, var(--playground-color-accent) 16%, transparent);",
    "  --playground-color-focus-ring: color-mix(in oklab, var(--playground-color-accent) 28%, transparent);",
    "  --playground-color-on-accent: color-mix(in oklab, var(--playground-color-fg) 84%, white 16%);"
  ];

  return declarations.join("\n");
}

const PLAYGROUND_RECIPE_CSS = `
html,
body {
  margin: 0;
  background: transparent;
}

body {
  font-family: var(--playground-font-sans);
}

code,
pre {
  font-family: var(--playground-font-mono);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
`;

function escapeStyleTagContent(value: string) {
  return value.replace(/<\/style/gi, "<\\/style");
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function buildPlaygroundDocument({ body, stylesheet, googleFontHrefs }: { body: string; stylesheet: string; googleFontHrefs: string[] }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${googleFontHrefs.map((href) => `<link rel="stylesheet" href="${escapeHtmlAttribute(href)}" />`).join("\n    ")}
    <style>${escapeStyleTagContent(stylesheet)}</style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

export function PlaygroundPreview({ directives, tokens, importedCss, runtimeCss }: PlaygroundPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerCleanupRef = useRef<(() => void) | null>(null);
  const [frameHeight, setFrameHeight] = useState(520);
  const tokenDeclarations = useMemo(() => {
    return tokens.map((token) => `  ${token.name}: ${token.value};`).join("\n");
  }, [tokens]);
  const semanticDeclarations = useMemo(() => createSemanticDeclarations(tokens), [tokens]);
  const googleFontHrefs = useMemo(() => parseGoogleFontImports(directives).map((font) => font.href), [directives]);
  const nonGoogleDirectives = useMemo(() => directives.filter((directive) => parseGoogleFontImports([directive]).length === 0), [directives]);
  const importedRuntimeCss = useMemo(() => transformImportedCssForPlayground(importedCss, ":root"), [importedCss]);
  const stylesheet = useMemo(() => {
    const directiveSource = nonGoogleDirectives.join("\n");
    return `${directiveSource ? `${directiveSource}\n\n` : ""}:root {\n${tokenDeclarations}\n${semanticDeclarations ? `\n${semanticDeclarations}` : ""}\n}\n\n${importedRuntimeCss}\n\n${runtimeCss}\n\n${PLAYGROUND_RECIPE_CSS}`;
  }, [importedRuntimeCss, nonGoogleDirectives, runtimeCss, semanticDeclarations, tokenDeclarations]);
  const body = useMemo(() => renderPlaygroundShowcases(tokens), [tokens]);
  const previewDocument = useMemo(() => buildPlaygroundDocument({ body, stylesheet, googleFontHrefs }), [body, googleFontHrefs, stylesheet]);

  const bindFrameMeasurement = useCallback(() => {
    const iframe = iframeRef.current;
    const documentElement = iframe?.contentDocument?.documentElement;
    const body = iframe?.contentDocument?.body;

    if (!iframe || !documentElement || !body) {
      return false;
    }

    const syncHeight = () => {
      const nextHeight = Math.max(documentElement.scrollHeight, body.scrollHeight, 520);
      setFrameHeight(nextHeight);
    };

    syncHeight();
    const timer = window.setTimeout(syncHeight, 48);
    const observer = new ResizeObserver(syncHeight);
    observer.observe(documentElement);
    observer.observe(body);
    const fonts = iframe.contentDocument?.fonts;

    const handleFontsReady = () => {
      syncHeight();
    };

    fonts?.ready.then(handleFontsReady).catch(() => {});
    observerCleanupRef.current?.();
    observerCleanupRef.current = () => {
      window.clearTimeout(timer);
      observer.disconnect();
      observerCleanupRef.current = null;
    };

    return true;
  }, []);

  useEffect(() => {
    setFrameHeight(520);
    observerCleanupRef.current?.();
    bindFrameMeasurement();

    return () => {
      observerCleanupRef.current?.();
    };
  }, [bindFrameMeasurement, previewDocument]);

  return (
    <div className={styles.playgroundHost}>
      <iframe
        ref={iframeRef}
        key={previewDocument}
        title="Token playground preview"
        className={styles.playgroundFrame}
        srcDoc={previewDocument}
        style={{ height: `${frameHeight}px` }}
        onLoad={bindFrameMeasurement}
      />
    </div>
  );
}
