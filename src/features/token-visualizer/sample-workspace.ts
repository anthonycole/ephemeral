import { importCssDocument } from "@/features/token-visualizer/document";

export const SAMPLE_CSS = `@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap");

:root {
  --color-background: #f4ede3;
  --color-surface: #fff9f2;
  --color-text: #201916;
  --color-muted: #72645a;
  --color-border: rgba(86, 67, 54, 0.18);
  --color-primary-500: #b7653c;
  --color-primary-600: #9c522e;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-7: 1.75rem;
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Cormorant Garamond", ui-serif, Georgia, serif;
  --font-serif: "Cormorant Garamond", ui-serif, Georgia, serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --font-size-body: 1rem;
  --font-size-display: clamp(3rem, 7vw, 5.5rem);
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-xl: 1.5rem;
  --shadow-card: 0 18px 40px rgba(48, 31, 20, 0.12);
  --size-icon-lg: 2rem;
  --size-container-md: 48rem;
  --motion-fast: 180ms;
  --motion-slow: 420ms;
  --z-index-base: 1;
  --z-index-popover: 1200;
  --opacity-muted: 0.68;
  --breakpoint-sm: 640px;
  --breakpoint-lg: 1100px;
  --asset-logo-treatment: sunwash;
}`;

export const SAMPLE_DOCUMENT = importCssDocument(SAMPLE_CSS);
