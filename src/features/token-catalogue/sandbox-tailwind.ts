import { compile } from "@tailwindcss/node";

const SANDBOX_TAILWIND_SOURCE = `
@import "tailwindcss" prefix(tw);

@layer components {
  .tw\\:sandbox-shell {
    @apply tw:grid tw:min-h-[24rem] tw:place-items-center tw:p-6;
    font-family: var(--sandbox-font-sans);
    color: var(--sandbox-color-fg);
    background: transparent;
  }

  .tw\\:sandbox-panel {
    @apply tw:grid tw:w-full tw:max-w-2xl tw:gap-3 tw:p-2;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--sandbox-color-fg);
    box-shadow: none;
  }

  .tw\\:sandbox-grid {
    @apply tw:grid tw:grid-cols-1 tw:items-start tw:gap-6 tw:md:grid-cols-2;
  }

  .tw\\:sandbox-stack {
    @apply tw:grid tw:w-full tw:content-start tw:items-start tw:gap-4;
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
    @apply tw:grid tw:w-full tw:justify-items-start tw:gap-4;
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
`;

const SANDBOX_TAILWIND_CANDIDATES = [
  "tw:sandbox-shell",
  "tw:sandbox-panel",
  "tw:sandbox-grid",
  "tw:sandbox-stack",
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
  "tw:sandbox-spacingRail",
  "tw:sandbox-spacingBar",
  "tw:sandbox-actions",
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
