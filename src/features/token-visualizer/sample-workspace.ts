import { importCssDocument } from "@/features/token-visualizer/document";

export const SAMPLE_CSS = `@import url("https://fonts.googleapis.com/css2?family=Inter&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Source+Serif+4&display=swap");
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap");

:root {
  --color-primary-500: #2563eb;
  --color-surface: #ffffff;
  --color-text: #101828;
  --space-1: 0.25rem;
  --space-4: 1rem;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Source Serif 4", ui-serif, Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --font-size-body: 1rem;
  --font-weight-semibold: 600;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --shadow-card: 0 8px 24px rgba(16, 24, 40, 0.12);
  --size-icon-lg: 2rem;
  --size-container-md: 48rem;
  --motion-fast: 150ms;
  --motion-slow: 320ms;
  --z-index-base: 1;
  --z-index-popover: 1200;
  --opacity-muted: 0.64;
  --breakpoint-sm: 640px;
  --breakpoint-lg: 1024px;
  --asset-logo-treatment: duotone;
}`;

export const SAMPLE_DOCUMENT = importCssDocument(SAMPLE_CSS);
