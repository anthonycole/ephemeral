"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { transformImportedCssForSandbox } from "@/features/token-catalogue/sandbox-runtime-css";
import styles from "@/features/token-catalogue/styles.module.css";

type SandboxPreviewProps = {
  tokens: TokenRecord[];
  importedCss: string;
  tailwindCss: string;
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
:host {
  display: block;
}
`;

const WHEEL_SAFE_COLOR_VALUE_REGEX = /^(#([0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|color\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|var\(--[^)]+\))$/i;

function isWheelSafeColorValue(value: string) {
  return WHEEL_SAFE_COLOR_VALUE_REGEX.test(value.trim());
}

function createColorWheelStops(colorTokens: TokenRecord[]) {
  const wheelTokens = colorTokens.filter((token) => isWheelSafeColorValue(token.value));

  if (wheelTokens.length === 0) {
    return [
      "var(--sandbox-color-accent) 0% 33.33%",
      "var(--sandbox-color-fg) 33.33% 66.66%",
      "var(--sandbox-color-bg) 66.66% 100%"
    ];
  }

  const step = 100 / wheelTokens.length;
  return wheelTokens.map((token, index) => {
    const start = (index * step).toFixed(2);
    const end = ((index + 1) * step).toFixed(2);
    return `${token.value} ${start}% ${end}%`;
  });
}

function pickSpacingToken(tokens: TokenRecord[]) {
  const spacingTokens = tokens.filter((token) => token.category === "spacing");

  if (spacingTokens.length === 0) {
    return null;
  }

  return (
    spacingTokens.find((token) => /^--(spacing|space)(-|$)/i.test(token.name)) ??
    spacingTokens.find((token) => /-(1|xs|sm)$/i.test(token.name)) ??
    spacingTokens[0]
  );
}

export function SandboxPreview({ tokens, importedCss, tailwindCss }: SandboxPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const tokenDeclarations = useMemo(() => {
    return tokens.map((token) => `  ${token.name}: ${token.value};`).join("\n");
  }, [tokens]);
  const colorTokens = useMemo(() => tokens.filter((token) => token.category === "color"), [tokens]);
  const colorWheelStops = useMemo(() => createColorWheelStops(colorTokens), [colorTokens]);
  const spacingToken = useMemo(() => pickSpacingToken(tokens), [tokens]);
  const semanticDeclarations = useMemo(() => createSemanticDeclarations(tokens), [tokens]);
  const importedRuntimeCss = useMemo(() => transformImportedCssForSandbox(importedCss), [importedCss]);
  const stylesheet = useMemo(() => {
    return `:host {\n${tokenDeclarations}\n${semanticDeclarations ? `\n${semanticDeclarations}` : ""}\n}\n\n${importedRuntimeCss}\n\n${tailwindCss}\n\n${SANDBOX_RECIPE_CSS}`;
  }, [importedRuntimeCss, semanticDeclarations, tailwindCss, tokenDeclarations]);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const root = hostRef.current.shadowRoot ?? hostRef.current.attachShadow({ mode: "open" });
    setShadowRoot(root);
  }, []);

  useEffect(() => {
    if (!shadowRoot) {
      return;
    }

    let styleElement = shadowRoot.querySelector("style[data-sandbox-styles]") as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.setAttribute("data-sandbox-styles", "true");
      shadowRoot.prepend(styleElement);
    }

    styleElement.textContent = stylesheet;
  }, [shadowRoot, stylesheet]);

  return (
    <div className={styles.sandboxHost}>
      <div ref={hostRef} />
      {shadowRoot
        ? createPortal(
            <div className="preview sandbox-preview tw:sandbox-shell" data-sandbox-root="">
              <section className="sandbox-card tw:sandbox-panel" data-sandbox-card="">
                <div className="sandbox-grid tw:sandbox-grid" data-sandbox-grid="">
                  <div className="sandbox-column tw:sandbox-stack" data-sandbox-column="colors">
                    <div className="sandbox-wheelWrap tw:sandbox-wheelWrap" data-sandbox-wheel="">
                      <div
                        className="sandbox-wheel tw:sandbox-wheel"
                        style={{
                          backgroundColor: "var(--sandbox-color-panel)",
                          backgroundImage: `conic-gradient(${colorWheelStops.join(", ")})`
                        }}
                      />
                      <p className="sandbox-copy tw:sandbox-copy" data-sandbox-copy="">
                        Imported color tokens shown as a simple wheel and labeled swatch list.
                      </p>
                    </div>
                    <div className="sandbox-tokenList tw:sandbox-tokenList" data-sandbox-token-list="">
                      {colorTokens.map((token) => (
                        <div key={token.id} className="sandbox-tokenRow tw:sandbox-tokenRow" data-sandbox-token="">
                          <span className="sandbox-swatch tw:sandbox-swatch" style={{ background: token.value }} />
                          <div className="sandbox-tokenMeta tw:sandbox-tokenMeta">
                            <span className="sandbox-tokenName tw:sandbox-tokenName">{token.name}</span>
                            <span className="sandbox-tokenValue tw:sandbox-tokenValue">{token.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="sandbox-column tw:sandbox-stack" data-sandbox-column="components">
                    <h1 className="sandbox-heading tw:sandbox-heading-1" data-sandbox-title="">
                      Heading 1
                    </h1>
                    <h2 className="sandbox-heading tw:sandbox-heading-2">
                      Heading 2
                    </h2>
                    <h3 className="sandbox-heading tw:sandbox-heading-3">
                      Heading 3
                    </h3>
                    <h4 className="sandbox-heading tw:sandbox-heading-4">
                      Heading 4
                    </h4>
                    <h5 className="sandbox-heading tw:sandbox-heading-5">
                      Heading 5
                    </h5>
                    <h6 className="sandbox-heading tw:sandbox-heading-6">
                      Heading 6
                    </h6>
                    <p className="sandbox-copy tw:sandbox-copy" data-sandbox-copy="">
                      Simple type scale preview with one input field.
                    </p>
                    <div className="sandbox-spacing tw:sandbox-spacing" data-sandbox-spacing="">
                      <span className="sandbox-tokenName tw:sandbox-tokenName">
                        {spacingToken?.name ?? "No spacing token"}
                      </span>
                      <div className="sandbox-spacingRail tw:sandbox-spacingRail" data-sandbox-spacing-rail="">
                        <div
                          className="sandbox-spacingBar tw:sandbox-spacingBar"
                          data-sandbox-spacing-bar=""
                          style={{ width: spacingToken?.value ?? "1rem" }}
                        />
                      </div>
                      <span className="sandbox-tokenValue tw:sandbox-tokenValue">
                        {spacingToken?.value ?? "1rem"}
                      </span>
                    </div>
                    <article className="sandbox-card-surface tw:sandbox-card" data-sandbox-card-surface="">
                      <h4 className="sandbox-heading tw:sandbox-heading-4">
                        Simple card
                      </h4>
                      <p className="sandbox-copy tw:sandbox-copy">
                        Flat container using the imported tokens for radius, fill, and text color.
                      </p>
                    </article>
                    <input
                      type="text"
                      className="sandbox-input tw:sandbox-input"
                      data-sandbox-input=""
                      placeholder="Text input"
                      defaultValue="Text input"
                    />
                    <div className="sandbox-actions tw:sandbox-actions" data-sandbox-actions="">
                      <button type="button" className="sandbox-button tw:sandbox-button" data-sandbox-button="">
                        Secondary
                      </button>
                      <button
                        type="button"
                        className="sandbox-button tw:sandbox-button tw:sandbox-button-primary"
                        data-sandbox-button=""
                        data-variant="primary"
                      >
                        Primary
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>,
            shadowRoot
          )
        : null}
    </div>
  );
}
