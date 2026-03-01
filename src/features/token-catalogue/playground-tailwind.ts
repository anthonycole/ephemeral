import { compile } from "@tailwindcss/node";

const PLAYGROUND_TAILWIND_SOURCE = `
@import "tailwindcss" prefix(tw);

@layer components {
  .tw\\:playground-shell {
    @apply tw:grid tw:min-h-[24rem] tw:w-full tw:p-6;
    font-family: var(--playground-font-sans);
    color: var(--playground-color-fg);
    background: transparent;
  }

  .tw\\:playground-panel {
    @apply tw:grid tw:w-full tw:gap-6 tw:p-0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--playground-color-fg);
    box-shadow: none;
  }

  .tw\\:playground-section {
    @apply tw:grid tw:gap-4;
  }

  .tw\\:playground-featureRow {
    @apply tw:grid tw:items-start tw:gap-6 tw:lg:grid-cols-2;
  }

  .tw\\:playground-secondaryGrid {
    @apply tw:grid tw:items-start tw:gap-6 tw:xl:grid-cols-2;
  }

  .tw\\:playground-column {
    @apply tw:grid tw:content-start tw:gap-6;
  }

  .tw\\:playground-sectionHeader {
    @apply tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-3;
  }

  .tw\\:playground-sectionMeta {
    @apply tw:grid tw:gap-1;
  }

  .tw\\:playground-sectionTitle {
    @apply tw:m-0 tw:text-base tw:font-semibold tw:leading-tight;
    color: var(--playground-color-fg);
  }

  .tw\\:playground-sectionCopy {
    @apply tw:m-0 tw:text-sm tw:leading-6;
    color: var(--playground-color-muted);
  }

  .tw\\:playground-sectionBody {
    @apply tw:grid tw:gap-4;
  }

  .tw\\:playground-sectionBody-grid {
    @apply tw:grid tw:grid-cols-1 tw:items-start tw:gap-6 tw:lg:grid-cols-[minmax(13rem,16rem)_1fr];
  }

  .tw\\:playground-stack {
    @apply tw:grid tw:w-full tw:content-start tw:items-start tw:gap-3;
  }

  .tw\\:playground-badge {
    @apply tw:inline-flex tw:items-center tw:rounded-full tw:px-2.5 tw:py-1 tw:text-xs tw:font-medium;
    background: color-mix(in oklab, var(--playground-color-bg) 88%, var(--playground-color-fg) 12%);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-heading-1 {
    @apply tw:m-0 tw:text-5xl tw:font-semibold tw:leading-none;
    font-family: var(--playground-font-heading);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-heading-2 {
    @apply tw:m-0 tw:text-4xl tw:font-semibold tw:leading-tight;
    font-family: var(--playground-font-heading);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-heading-3 {
    @apply tw:m-0 tw:text-3xl tw:font-semibold tw:leading-tight;
    font-family: var(--playground-font-heading);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-heading-4 {
    @apply tw:m-0 tw:text-2xl tw:font-medium tw:leading-tight;
    font-family: var(--playground-font-heading);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-heading-5 {
    @apply tw:m-0 tw:text-xl tw:font-medium tw:leading-tight;
    font-family: var(--playground-font-heading);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-heading-6 {
    @apply tw:m-0 tw:text-lg tw:font-medium tw:leading-tight;
    font-family: var(--playground-font-heading);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-copy {
    @apply tw:m-0 tw:text-sm tw:leading-6;
    color: var(--playground-color-muted);
  }

  .tw\\:playground-copy-serif {
    font-family: var(--playground-font-serif);
  }

  .tw\\:playground-copy-mono {
    font-family: var(--playground-font-mono);
  }

  .tw\\:playground-copy-strong {
    font-family: var(--playground-font-strong);
  }

  .tw\\:playground-copy-em {
    font-family: var(--playground-font-em);
  }

  .tw\\:playground-copy-quote {
    font-family: var(--playground-font-quote);
  }

  .tw\\:playground-colorScaleGroup {
    @apply tw:grid tw:gap-4;
  }

  .tw\\:playground-colorScaleRow {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:playground-colorScaleHeader {
    @apply tw:flex tw:items-center tw:justify-between tw:gap-3;
  }

  .tw\\:playground-colorScaleTrack {
    @apply tw:grid tw:gap-2 tw:overflow-x-auto tw:pb-1;
    grid-template-columns: repeat(var(--playground-scale-columns, 1), minmax(3.75rem, 1fr));
  }

  .tw\\:playground-colorScaleTile {
    @apply tw:grid tw:gap-1;
  }

  .tw\\:playground-colorScaleSwatch {
    @apply tw:flex tw:min-h-16 tw:items-end tw:justify-start tw:p-2;
    border: 1px solid color-mix(in oklab, var(--playground-color-fg) 10%, transparent);
    border-radius: calc(var(--playground-radius-md) * 0.75);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.18);
  }

  .tw\\:playground-semanticGrid {
    @apply tw:grid tw:grid-cols-1 tw:gap-3 tw:sm:grid-cols-2;
  }

  .tw\\:playground-semanticCard {
    @apply tw:grid tw:grid-cols-[3rem_minmax(0,1fr)] tw:items-start tw:gap-3 tw:p-3;
    border-radius: calc(var(--playground-radius-md) * 0.85);
    background: color-mix(in oklab, var(--playground-color-bg) 92%, var(--playground-color-fg) 8%);
  }

  .tw\\:playground-semanticSwatch {
    @apply tw:block tw:min-h-12 tw:w-12;
    border-radius: calc(var(--playground-radius-md) * 0.7);
    border: 1px solid color-mix(in oklab, var(--playground-color-fg) 10%, transparent);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.18);
  }

  .tw\\:playground-semanticMeta {
    @apply tw:grid tw:gap-0.5;
  }

  .tw\\:playground-colorScaleStep {
    @apply tw:text-[11px] tw:font-semibold tw:leading-none;
    color: rgb(255 255 255 / 0.92);
    text-shadow: 0 1px 1px rgb(15 23 42 / 0.28);
  }

  .tw\\:playground-colorListCompact {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:playground-colorNote {
    @apply tw:pt-1;
  }

  .tw\\:playground-tokenList {
    @apply tw:grid tw:w-full tw:gap-2;
  }

  .tw\\:playground-tokenRow {
    @apply tw:flex tw:items-center tw:gap-3;
  }

  .tw\\:playground-swatch {
    @apply tw:h-4 tw:w-4 tw:shrink-0 tw:rounded-full;
  }

  .tw\\:playground-tokenMeta {
    @apply tw:grid tw:gap-0.5;
  }

  .tw\\:playground-tokenName {
    @apply tw:text-xs tw:font-medium tw:leading-tight;
    color: var(--playground-color-fg);
  }

  .tw\\:playground-tokenValue {
    @apply tw:text-xs tw:leading-tight;
    color: var(--playground-color-muted);
  }

  .tw\\:playground-spacing {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:playground-stackDemo {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:playground-spacingScale {
    @apply tw:flex tw:items-center tw:justify-between tw:gap-2;
  }

  .tw\\:playground-stackRow {
    @apply tw:grid tw:gap-1;
  }

  .tw\\:playground-stackRowMeta {
    @apply tw:flex tw:items-center tw:justify-between tw:gap-3;
  }

  .tw\\:playground-spacingRail {
    @apply tw:h-2 tw:w-full;
    border-radius: 0;
    background: color-mix(in oklab, var(--playground-color-bg) 90%, var(--playground-color-fg) 10%);
  }

  .tw\\:playground-spacingBar {
    @apply tw:h-full;
    min-width: 0.25rem;
    max-width: 100%;
    border-radius: 0;
    background: var(--playground-color-accent);
  }

  .tw\\:playground-actions {
    @apply tw:flex tw:flex-wrap tw:gap-3;
  }

  .tw\\:playground-chipGrid {
    @apply tw:grid tw:grid-cols-1 tw:gap-3 tw:sm:grid-cols-2 tw:xl:grid-cols-3;
  }

  .tw\\:playground-chipCard {
    @apply tw:grid tw:gap-2 tw:p-3;
    border-radius: var(--playground-radius-md);
    background: color-mix(in oklab, var(--playground-color-bg) 92%, var(--playground-color-fg) 8%);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-radiusDemo {
    @apply tw:h-16 tw:w-full;
    background: color-mix(in oklab, var(--playground-color-accent) 18%, var(--playground-color-bg) 82%);
  }

  .tw\\:playground-shadowDemo {
    @apply tw:h-16 tw:w-full;
    border-radius: var(--playground-radius-md);
    background: color-mix(in oklab, var(--playground-color-bg) 95%, var(--playground-color-fg) 5%);
  }

  .tw\\:playground-shadowText {
    @apply tw:text-lg tw:font-semibold;
    color: var(--playground-color-fg);
  }

  .tw\\:playground-effectStage {
    @apply tw:grid tw:min-h-16 tw:w-full tw:place-items-center tw:overflow-hidden;
    border-radius: var(--playground-radius-md);
    background:
      radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--playground-color-accent) 55%, white 45%) 0, transparent 42%),
      linear-gradient(135deg, color-mix(in oklab, var(--playground-color-bg) 88%, var(--playground-color-fg) 12%), var(--playground-color-panel-strong));
  }

  .tw\\:playground-effectOrb {
    @apply tw:h-8 tw:w-8 tw:rounded-full;
    background: var(--playground-color-accent);
  }

  .tw\\:playground-blurDemo {
    @apply tw:flex tw:items-center tw:justify-center tw:gap-3;
  }

  .tw\\:playground-blurText {
    @apply tw:text-sm tw:font-medium;
    color: var(--playground-color-fg);
  }

  .tw\\:playground-sizingDemo {
    @apply tw:grid tw:min-h-16 tw:w-full tw:place-items-center;
    border-radius: var(--playground-radius-md);
    background: color-mix(in oklab, var(--playground-color-bg) 94%, var(--playground-color-fg) 6%);
  }

  .tw\\:playground-aspectDemo {
    width: min(100%, 10rem);
    min-height: 2.5rem;
    border-radius: calc(var(--playground-radius-md) * 0.8);
    background: linear-gradient(135deg, var(--playground-color-accent), var(--playground-color-accent-strong));
  }

  .tw\\:playground-perspectiveDemo {
    @apply tw:grid tw:h-20 tw:w-full tw:place-items-center;
    border-radius: var(--playground-radius-md);
    background: color-mix(in oklab, var(--playground-color-bg) 94%, var(--playground-color-fg) 6%);
  }

  .tw\\:playground-perspectivePlane {
    @apply tw:h-10 tw:w-16;
    border-radius: calc(var(--playground-radius-md) * 0.75);
    background: linear-gradient(135deg, var(--playground-color-accent), var(--playground-color-accent-strong));
    transform: rotateX(58deg) rotateZ(-18deg);
  }

  .tw\\:playground-opacityDemo {
    @apply tw:h-16 tw:w-full;
    border-radius: var(--playground-radius-md);
    background:
      linear-gradient(90deg, var(--playground-color-accent) 0 50%, color-mix(in oklab, var(--playground-color-bg) 88%, var(--playground-color-fg) 12%) 50% 100%);
  }

  .tw\\:playground-layerDemo {
    @apply tw:relative tw:h-20 tw:w-full;
    border-radius: var(--playground-radius-md);
    background: color-mix(in oklab, var(--playground-color-bg) 94%, var(--playground-color-fg) 6%);
  }

  .tw\\:playground-layerBase,
  .tw\\:playground-layerMid,
  .tw\\:playground-layerTop {
    @apply tw:absolute;
    border-radius: calc(var(--playground-radius-md) * 0.75);
  }

  .tw\\:playground-layerBase {
    inset: 1.5rem 3rem auto auto;
    height: 2.25rem;
    width: 4rem;
    background: color-mix(in oklab, var(--playground-color-fg) 16%, transparent);
  }

  .tw\\:playground-layerMid {
    inset: 2rem auto auto 2rem;
    height: 2.5rem;
    width: 5rem;
    background: color-mix(in oklab, var(--playground-color-accent) 28%, transparent);
  }

  .tw\\:playground-layerTop {
    inset: 1rem auto auto 4rem;
    height: 3rem;
    width: 5.5rem;
    background: var(--playground-color-accent);
  }

  .tw\\:playground-motion {
    @apply tw:flex tw:flex-wrap tw:items-center tw:gap-4;
  }

  .tw\\:playground-motionOrb {
    @apply tw:h-5 tw:w-5 tw:rounded-full;
    background: var(--playground-color-accent);
    animation-name: tw-playground-pulse;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .tw\\:playground-breakpointDemo {
    @apply tw:w-full;
  }

  .tw\\:playground-breakpointBar {
    @apply tw:h-2;
    border-radius: 0;
    background: var(--playground-color-accent);
  }

  .tw\\:playground-button {
    @apply tw:inline-flex tw:items-center tw:justify-center tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:outline-none;
    border: 0;
    border-radius: var(--playground-radius-md);
    background: color-mix(in oklab, var(--playground-color-bg) 90%, var(--playground-color-fg) 10%);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-button-primary {
    background: var(--playground-color-accent);
    color: var(--playground-color-on-accent);
  }

  .tw\\:playground-card {
    @apply tw:grid tw:gap-2 tw:p-4;
    border: 0;
    border-radius: var(--playground-radius-md);
    background: color-mix(in oklab, var(--playground-color-bg) 90%, var(--playground-color-fg) 10%);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-input {
    @apply tw:w-full tw:px-4 tw:py-3 tw:text-sm tw:outline-none;
    border: 0;
    border-radius: var(--playground-radius-md);
    background: color-mix(in oklab, var(--playground-color-bg) 90%, var(--playground-color-fg) 10%);
    color: var(--playground-color-fg);
  }

  .tw\\:playground-input::placeholder {
    color: var(--playground-color-muted);
  }
}

@keyframes tw-playground-pulse {
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

const PLAYGROUND_TAILWIND_CANDIDATES = [
  "tw:playground-shell",
  "tw:playground-panel",
  "tw:playground-section",
  "tw:playground-featureRow",
  "tw:playground-secondaryGrid",
  "tw:playground-column",
  "tw:playground-sectionHeader",
  "tw:playground-sectionMeta",
  "tw:playground-sectionTitle",
  "tw:playground-sectionCopy",
  "tw:playground-sectionBody",
  "tw:playground-sectionBody-grid",
  "tw:playground-stack",
  "tw:playground-badge",
  "tw:playground-heading-1",
  "tw:playground-heading-2",
  "tw:playground-heading-3",
  "tw:playground-heading-4",
  "tw:playground-heading-5",
  "tw:playground-heading-6",
  "tw:playground-copy",
  "tw:playground-copy-serif",
  "tw:playground-copy-mono",
  "tw:playground-copy-strong",
  "tw:playground-copy-em",
  "tw:playground-copy-quote",
  "tw:playground-colorScaleGroup",
  "tw:playground-colorScaleRow",
  "tw:playground-colorScaleHeader",
  "tw:playground-colorScaleTrack",
  "tw:playground-colorScaleTile",
  "tw:playground-colorScaleSwatch",
  "tw:playground-colorScaleStep",
  "tw:playground-semanticGrid",
  "tw:playground-semanticCard",
  "tw:playground-semanticSwatch",
  "tw:playground-semanticMeta",
  "tw:playground-colorListCompact",
  "tw:playground-colorNote",
  "tw:playground-tokenList",
  "tw:playground-tokenRow",
  "tw:playground-swatch",
  "tw:playground-tokenMeta",
  "tw:playground-tokenName",
  "tw:playground-tokenValue",
  "tw:playground-spacing",
  "tw:playground-stackDemo",
  "tw:playground-spacingScale",
  "tw:playground-stackRow",
  "tw:playground-stackRowMeta",
  "tw:playground-spacingRail",
  "tw:playground-spacingBar",
  "tw:playground-actions",
  "tw:playground-chipGrid",
  "tw:playground-chipCard",
  "tw:playground-radiusDemo",
  "tw:playground-shadowDemo",
  "tw:playground-shadowText",
  "tw:playground-effectStage",
  "tw:playground-effectOrb",
  "tw:playground-blurDemo",
  "tw:playground-blurText",
  "tw:playground-sizingDemo",
  "tw:playground-aspectDemo",
  "tw:playground-perspectiveDemo",
  "tw:playground-perspectivePlane",
  "tw:playground-opacityDemo",
  "tw:playground-layerDemo",
  "tw:playground-layerBase",
  "tw:playground-layerMid",
  "tw:playground-layerTop",
  "tw:playground-motion",
  "tw:playground-motionOrb",
  "tw:playground-breakpointDemo",
  "tw:playground-breakpointBar",
  "tw:playground-button",
  "tw:playground-button-primary",
  "tw:playground-card",
  "tw:playground-input"
];

let compiledPlaygroundTailwindCssPromise: Promise<string> | null = null;

async function compilePlaygroundTailwindCss() {
  const compiler = await compile(PLAYGROUND_TAILWIND_SOURCE, {
    base: process.cwd(),
    onDependency() {}
  });

  return compiler.build(PLAYGROUND_TAILWIND_CANDIDATES);
}

export function getPlaygroundTailwindCss() {
  compiledPlaygroundTailwindCssPromise ??= compilePlaygroundTailwindCss();
  return compiledPlaygroundTailwindCssPromise;
}
