"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { parseGoogleFontImports } from "@/features/token-visualizer/font-utils";
import { transformImportedCssForPlayground } from "@/features/token-catalogue/playground-runtime-css";
import { renderPlaygroundShowcases } from "@/features/token-catalogue/playground-showcases";
import { createSemanticDeclarations } from "@/features/token-catalogue/theme-snapshot";
import styles from "@/features/token-catalogue/styles.module.css";

type PlaygroundPreviewProps = {
  directives: string[];
  tokens: TokenRecord[];
  importedCss: string;
  runtimeCss: string;
  title?: string;
};

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

export function PlaygroundPreview({ directives, tokens, importedCss, runtimeCss, title = "Token playground preview" }: PlaygroundPreviewProps) {
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
        title={title}
        className={styles.playgroundFrame}
        srcDoc={previewDocument}
        style={{ height: `${frameHeight}px` }}
        onLoad={bindFrameMeasurement}
      />
    </div>
  );
}
