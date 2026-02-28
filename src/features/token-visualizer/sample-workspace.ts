import { importCssDocument } from "@/features/token-visualizer/document";

export const SAMPLE_CSS = `:root {
  --color-primary-500: #2563eb;
  --color-surface: #ffffff;
  --color-text: #101828;
  --space-1: 0.25rem;
  --space-4: 1rem;
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
