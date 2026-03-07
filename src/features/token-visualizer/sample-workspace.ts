import { importCssDocument } from "@/features/token-visualizer/document";

export const SAMPLE_CSS = `@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Instrument+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap");

:root {
  /* Theme controls */
  --theme-hue: 18;
  --theme-chroma: 0.18;
  --theme-density: 1;
  --theme-radius: 0.7rem;
  --theme-shadow-color: 38 24 18;
  --theme-shadow-alpha: 0.16;
  --theme-font-sans: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
  --theme-font-display: "Fraunces", ui-serif, Georgia, serif;
  --theme-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Semantic color tokens */
  --color-background: oklch(0.982 0.024 var(--theme-hue));
  --color-surface: oklch(0.994 0.012 calc(var(--theme-hue) - 2));
  --color-panel: color-mix(in oklab, var(--color-surface) 80%, white 20%);
  --color-text: oklch(0.25 0.04 calc(var(--theme-hue) - 2));
  --color-muted: oklch(0.57 0.034 calc(var(--theme-hue) + 2));
  --color-border: color-mix(in oklab, var(--color-text) 14%, transparent);
  --color-primary-300: oklch(0.83 calc(var(--theme-chroma) * 0.48) calc(var(--theme-hue) + 6));
  --color-primary-500: oklch(0.66 var(--theme-chroma) calc(var(--theme-hue) + 8));
  --color-primary-600: oklch(0.58 calc(var(--theme-chroma) * 1.04) calc(var(--theme-hue) + 10));
  --color-accent: var(--color-primary-500);
  --color-accent-strong: var(--color-primary-600);
  --color-plum-400: oklch(0.76 0.13 336);
  --color-plum-600: oklch(0.58 0.18 338);
  --color-teal-400: oklch(0.8 0.11 192);
  --color-teal-600: oklch(0.62 0.14 196);
  --color-success-500: oklch(0.74 0.16 162);
  --color-warning-500: oklch(0.84 0.16 84);

  /* Layout scale */
  --space-unit: calc(0.25rem * var(--theme-density));
  --space-1: var(--space-unit);
  --space-2: calc(var(--space-unit) * 2);
  --space-3: calc(var(--space-unit) * 3);
  --space-4: calc(var(--space-unit) * 4);
  --space-6: calc(var(--space-unit) * 6);
  --space-8: calc(var(--space-unit) * 8);

  /* Type system */
  --font-sans: var(--theme-font-sans);
  --font-heading: var(--theme-font-display);
  --font-serif: var(--theme-font-display);
  --font-mono: var(--theme-font-mono);
  --font-size-caption: 0.8rem;
  --font-size-body: 1rem;
  --font-size-lead: 1.125rem;
  --font-size-display: clamp(3.1rem, 7vw, 5.8rem);
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --tracking-tight: -0.03em;
  --leading-tight: 1.15;
  --leading-normal: 1.55;

  /* Surface shape and depth */
  --radius-sm: calc(var(--theme-radius) * 0.45);
  --radius-md: calc(var(--theme-radius) * 0.8);
  --radius-xl: calc(var(--theme-radius) * 1.35);
  --shadow-card: 0 20px 42px rgb(var(--theme-shadow-color) / var(--theme-shadow-alpha));
  --shadow-soft: 0 10px 24px rgb(var(--theme-shadow-color) / calc(var(--theme-shadow-alpha) * 0.7));

  /* Utility tokens */
  --size-icon-lg: 2rem;
  --size-container-sm: 36rem;
  --size-container-md: 48rem;
  --size-container-lg: 64rem;
  --motion-fast: 180ms;
  --motion-slow: 420ms;
  --easing-standard: cubic-bezier(0.22, 1, 0.36, 1);
  --z-index-base: 1;
  --z-index-popover: 1200;
  --opacity-muted: 0.68;
  --breakpoint-sm: 40rem;
  --breakpoint-lg: 68rem;
  --asset-logo-treatment: editorial-warm;
}`;

export const SAMPLE_DOCUMENT = importCssDocument(SAMPLE_CSS);
