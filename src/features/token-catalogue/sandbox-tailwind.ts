import { compile } from "@tailwindcss/node";

const SANDBOX_TAILWIND_SOURCE = `
@import "tailwindcss" prefix(tw);

@layer components {
  .tw\\:sandbox-shell {
    @apply tw:grid tw:min-h-[24rem] tw:w-full tw:p-6;
    font-family: var(--sandbox-font-sans);
    color: var(--sandbox-color-fg);
    background: transparent;
  }

  .tw\\:sandbox-panel {
    @apply tw:grid tw:w-full tw:gap-6 tw:p-0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--sandbox-color-fg);
    box-shadow: none;
  }

  .tw\\:sandbox-section {
    @apply tw:grid tw:gap-4;
  }

  .tw\\:sandbox-sectionHeader {
    @apply tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-3;
  }

  .tw\\:sandbox-sectionMeta {
    @apply tw:grid tw:gap-1;
  }

  .tw\\:sandbox-sectionTitle {
    @apply tw:m-0 tw:text-base tw:font-semibold tw:leading-tight;
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-sectionCopy {
    @apply tw:m-0 tw:text-sm tw:leading-6;
    color: var(--sandbox-color-muted);
  }

  .tw\\:sandbox-sectionBody {
    @apply tw:grid tw:gap-4;
  }

  .tw\\:sandbox-sectionBody-grid {
    @apply tw:grid tw:grid-cols-1 tw:items-start tw:gap-6 tw:lg:grid-cols-[minmax(13rem,16rem)_1fr];
  }

  .tw\\:sandbox-stack {
    @apply tw:grid tw:w-full tw:content-start tw:items-start tw:gap-3;
  }

  .tw\\:sandbox-badge {
    @apply tw:inline-flex tw:items-center tw:rounded-full tw:px-2.5 tw:py-1 tw:text-xs tw:font-medium;
    background: color-mix(in oklab, var(--sandbox-color-bg) 88%, var(--sandbox-color-fg) 12%);
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-heading-1 {
    @apply tw:m-0 tw:text-5xl tw:font-semibold tw:leading-none;
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-heading-2 {
    @apply tw:m-0 tw:text-4xl tw:font-semibold tw:leading-tight;
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-heading-3 {
    @apply tw:m-0 tw:text-3xl tw:font-semibold tw:leading-tight;
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-heading-4 {
    @apply tw:m-0 tw:text-2xl tw:font-medium tw:leading-tight;
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-heading-5 {
    @apply tw:m-0 tw:text-xl tw:font-medium tw:leading-tight;
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-heading-6 {
    @apply tw:m-0 tw:text-lg tw:font-medium tw:leading-tight;
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-copy {
    @apply tw:m-0 tw:text-sm tw:leading-6;
    color: var(--sandbox-color-muted);
  }

  .tw\\:sandbox-wheelWrap {
    @apply tw:grid tw:w-full tw:justify-items-start tw:gap-3;
  }

  .tw\\:sandbox-wheel {
    @apply tw:h-44 tw:w-44 tw:justify-self-center tw:rounded-full;
  }

  .tw\\:sandbox-tokenList {
    @apply tw:grid tw:w-full tw:gap-2;
  }

  .tw\\:sandbox-tokenRow {
    @apply tw:flex tw:items-center tw:gap-3;
  }

  .tw\\:sandbox-swatch {
    @apply tw:h-4 tw:w-4 tw:shrink-0 tw:rounded-full;
  }

  .tw\\:sandbox-tokenMeta {
    @apply tw:grid tw:gap-0.5;
  }

  .tw\\:sandbox-tokenName {
    @apply tw:text-xs tw:font-medium tw:leading-tight;
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-tokenValue {
    @apply tw:text-xs tw:leading-tight;
    color: var(--sandbox-color-muted);
  }

  .tw\\:sandbox-spacing {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:sandbox-stackDemo {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:sandbox-stackRow {
    @apply tw:grid tw:gap-1;
  }

  .tw\\:sandbox-spacingRail {
    @apply tw:h-2 tw:w-full;
    border-radius: 999px;
    background: color-mix(in oklab, var(--sandbox-color-bg) 90%, var(--sandbox-color-fg) 10%);
  }

  .tw\\:sandbox-spacingBar {
    @apply tw:h-full;
    min-width: 0.25rem;
    max-width: 100%;
    border-radius: 999px;
    background: var(--sandbox-color-accent);
  }

  .tw\\:sandbox-actions {
    @apply tw:flex tw:flex-wrap tw:gap-3;
  }

  .tw\\:sandbox-chipGrid {
    @apply tw:grid tw:grid-cols-1 tw:gap-3 tw:sm:grid-cols-2 tw:xl:grid-cols-3;
  }

  .tw\\:sandbox-chipCard {
    @apply tw:grid tw:gap-2 tw:p-3;
    border-radius: var(--sandbox-radius-md);
    background: color-mix(in oklab, var(--sandbox-color-bg) 92%, var(--sandbox-color-fg) 8%);
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-radiusDemo {
    @apply tw:h-16 tw:w-full;
    background: color-mix(in oklab, var(--sandbox-color-accent) 18%, var(--sandbox-color-bg) 82%);
  }

  .tw\\:sandbox-shadowDemo {
    @apply tw:h-16 tw:w-full;
    border-radius: var(--sandbox-radius-md);
    background: color-mix(in oklab, var(--sandbox-color-bg) 95%, var(--sandbox-color-fg) 5%);
  }

  .tw\\:sandbox-motion {
    @apply tw:flex tw:flex-wrap tw:items-center tw:gap-4;
  }

  .tw\\:sandbox-motionOrb {
    @apply tw:h-5 tw:w-5 tw:rounded-full;
    background: var(--sandbox-color-accent);
    animation-name: tw-sandbox-pulse;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .tw\\:sandbox-breakpointDemo {
    @apply tw:w-full;
  }

  .tw\\:sandbox-breakpointBar {
    @apply tw:h-2;
    border-radius: 999px;
    background: var(--sandbox-color-accent);
  }

  .tw\\:sandbox-button {
    @apply tw:inline-flex tw:items-center tw:justify-center tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:outline-none;
    border: 0;
    border-radius: var(--sandbox-radius-md);
    background: color-mix(in oklab, var(--sandbox-color-bg) 90%, var(--sandbox-color-fg) 10%);
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-button-primary {
    background: var(--sandbox-color-accent);
    color: var(--sandbox-color-on-accent);
  }

  .tw\\:sandbox-card {
    @apply tw:grid tw:gap-2 tw:p-4;
    border: 0;
    border-radius: var(--sandbox-radius-md);
    background: color-mix(in oklab, var(--sandbox-color-bg) 90%, var(--sandbox-color-fg) 10%);
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-input {
    @apply tw:w-full tw:px-4 tw:py-3 tw:text-sm tw:outline-none;
    border: 0;
    border-radius: var(--sandbox-radius-md);
    background: color-mix(in oklab, var(--sandbox-color-bg) 90%, var(--sandbox-color-fg) 10%);
    color: var(--sandbox-color-fg);
  }

  .tw\\:sandbox-input::placeholder {
    color: var(--sandbox-color-muted);
  }
}

@keyframes tw-sandbox-pulse {
  from {
    transform: translateX(0);
    opacity: 0.7;
  }

  to {
    transform: translateX(0.75rem);
    opacity: 1;
  }
}
`;

const SANDBOX_TAILWIND_CANDIDATES = [
  "tw:sandbox-shell",
  "tw:sandbox-panel",
  "tw:sandbox-section",
  "tw:sandbox-sectionHeader",
  "tw:sandbox-sectionMeta",
  "tw:sandbox-sectionTitle",
  "tw:sandbox-sectionCopy",
  "tw:sandbox-sectionBody",
  "tw:sandbox-sectionBody-grid",
  "tw:sandbox-stack",
  "tw:sandbox-badge",
  "tw:sandbox-heading-1",
  "tw:sandbox-heading-2",
  "tw:sandbox-heading-3",
  "tw:sandbox-heading-4",
  "tw:sandbox-heading-5",
  "tw:sandbox-heading-6",
  "tw:sandbox-copy",
  "tw:sandbox-wheelWrap",
  "tw:sandbox-wheel",
  "tw:sandbox-tokenList",
  "tw:sandbox-tokenRow",
  "tw:sandbox-swatch",
  "tw:sandbox-tokenMeta",
  "tw:sandbox-tokenName",
  "tw:sandbox-tokenValue",
  "tw:sandbox-spacing",
  "tw:sandbox-stackDemo",
  "tw:sandbox-stackRow",
  "tw:sandbox-spacingRail",
  "tw:sandbox-spacingBar",
  "tw:sandbox-actions",
  "tw:sandbox-chipGrid",
  "tw:sandbox-chipCard",
  "tw:sandbox-radiusDemo",
  "tw:sandbox-shadowDemo",
  "tw:sandbox-motion",
  "tw:sandbox-motionOrb",
  "tw:sandbox-breakpointDemo",
  "tw:sandbox-breakpointBar",
  "tw:sandbox-button",
  "tw:sandbox-button-primary",
  "tw:sandbox-card",
  "tw:sandbox-input"
];

let compiledSandboxTailwindCssPromise: Promise<string> | null = null;

async function compileSandboxTailwindCss() {
  const compiler = await compile(SANDBOX_TAILWIND_SOURCE, {
    base: process.cwd(),
    onDependency() {}
  });

  return compiler.build(SANDBOX_TAILWIND_CANDIDATES);
}

export function getSandboxTailwindCss() {
  compiledSandboxTailwindCssPromise ??= compileSandboxTailwindCss();
  return compiledSandboxTailwindCssPromise;
}
