"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { transformImportedCssForSandbox } from "@/features/token-catalogue/sandbox-runtime-css";
import { renderSandboxShowcases } from "@/features/token-catalogue/sandbox-showcases";
import styles from "@/features/token-catalogue/styles.module.css";

type SandboxPreviewProps = {
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
  const fontSans = pickTokenName(tokenNameMap, ["--font-sans", "--font-body"], [["font", "sans"], ["font", "body"]]);
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
  const radiusMd = pickTokenName(tokenNameMap, ["--radius-md", "--radius-lg", "--radius-xl"], [["radius", "md"], ["radius", "lg"], ["radius", "xl"]]);
  const radiusXl = pickTokenName(tokenNameMap, ["--radius-xl", "--radius-lg", "--radius-md"], [["radius", "xl"], ["radius", "lg"], ["radius", "md"]]);
  const shadowPanel = pickTokenName(tokenNameMap, ["--shadow-lg", "--shadow-md", "--shadow-sm"], [["shadow", "lg"], ["shadow", "md"], ["shadow", "sm"]]);
  const shadowPopover = pickTokenName(tokenNameMap, ["--shadow-xl", "--shadow-lg", "--shadow-md"], [["shadow", "xl"], ["shadow", "lg"], ["shadow", "md"]]);
  const declarations = [
    `  --sandbox-font-sans: ${tokenReference(fontSans, "ui-sans-serif, system-ui, sans-serif")};`,
    `  --sandbox-color-bg: ${tokenReference(colorBackground, "oklch(0.15 0.02 255)")};`,
    `  --sandbox-color-fg: ${tokenReference(colorForeground, "oklch(0.97 0.01 255)")};`,
    `  --sandbox-color-muted: ${tokenReference(colorMuted, "oklch(0.76 0.02 255)")};`,
    `  --sandbox-color-accent: ${tokenReference(colorAccent, "oklch(0.67 0.18 255)")};`,
    `  --sandbox-color-accent-strong: ${tokenReference(colorAccentStrong ?? colorAccent, "oklch(0.6 0.18 255)")};`,
    `  --sandbox-color-border: ${tokenReference(colorBorder, "oklch(0.35 0.03 255)")};`,
    `  --sandbox-radius-md: ${tokenReference(radiusMd, "1rem")};`,
    `  --sandbox-radius-xl: ${tokenReference(radiusXl ?? radiusMd, "1.5rem")};`,
    `  --sandbox-shadow-panel: ${tokenReference(shadowPanel, "0 24px 60px rgb(2 6 23 / 0.45)")};`,
    `  --sandbox-shadow-popover: ${tokenReference(shadowPopover ?? shadowPanel, "0 18px 42px rgb(2 6 23 / 0.32)")};`,
    "  --sandbox-color-shell-end: color-mix(in oklab, var(--sandbox-color-bg) 74%, var(--sandbox-color-accent) 26%);",
    "  --sandbox-color-panel: color-mix(in oklab, var(--sandbox-color-bg) 88%, var(--sandbox-color-fg) 12%);",
    "  --sandbox-color-panel-strong: color-mix(in oklab, var(--sandbox-color-bg) 78%, var(--sandbox-color-fg) 22%);",
    "  --sandbox-color-border-strong: color-mix(in oklab, var(--sandbox-color-border) 72%, var(--sandbox-color-accent) 28%);",
    "  --sandbox-color-accent-soft: color-mix(in oklab, var(--sandbox-color-accent) 16%, transparent);",
    "  --sandbox-color-focus-ring: color-mix(in oklab, var(--sandbox-color-accent) 28%, transparent);",
    "  --sandbox-color-on-accent: color-mix(in oklab, var(--sandbox-color-fg) 84%, white 16%);"
  ];

  return declarations.join("\n");
}

const SANDBOX_RECIPE_CSS = `
html,
body {
  margin: 0;
  min-height: 100%;
  background: transparent;
}

body {
  font-family: var(--sandbox-font-sans);
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

function buildSandboxDocument({ body, stylesheet }: { body: string; stylesheet: string }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${escapeStyleTagContent(stylesheet)}</style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

export function SandboxPreview({ tokens, importedCss, runtimeCss }: SandboxPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(720);
  const tokenDeclarations = useMemo(() => {
    return tokens.map((token) => `  ${token.name}: ${token.value};`).join("\n");
  }, [tokens]);
  const semanticDeclarations = useMemo(() => createSemanticDeclarations(tokens), [tokens]);
  const importedRuntimeCss = useMemo(() => transformImportedCssForSandbox(importedCss, ":root"), [importedCss]);
  const stylesheet = useMemo(() => {
    return `:root {\n${tokenDeclarations}\n${semanticDeclarations ? `\n${semanticDeclarations}` : ""}\n}\n\n${importedRuntimeCss}\n\n${runtimeCss}\n\n${SANDBOX_RECIPE_CSS}`;
  }, [importedRuntimeCss, runtimeCss, semanticDeclarations, tokenDeclarations]);
  const body = useMemo(() => renderSandboxShowcases(tokens), [tokens]);
  const previewDocument = useMemo(() => buildSandboxDocument({ body, stylesheet }), [body, stylesheet]);

  useEffect(() => {
    const iframe = iframeRef.current;
    const documentElement = iframe?.contentDocument?.documentElement;
    const body = iframe?.contentDocument?.body;

    if (!iframe || !documentElement || !body) {
      return;
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

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [previewDocument]);

  return (
    <div className={styles.sandboxHost}>
      <iframe
        ref={iframeRef}
        title="Token sandbox preview"
        className={styles.sandboxFrame}
        srcDoc={previewDocument}
        style={{ height: `${frameHeight}px` }}
      />
    </div>
  );
}
