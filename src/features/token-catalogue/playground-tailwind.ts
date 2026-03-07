import { compile } from "@tailwindcss/node";

const PLAYGROUND_TAILWIND_SOURCE = `
@import "tailwindcss" prefix(tw);

@layer components {
  .tw\\:playground-shell {
    @apply tw:grid tw:min-h-[16rem] tw:w-full tw:bg-white tw:p-4 tw:text-slate-950;
    font-family: var(--playground-font-sans);
  }

  .tw\\:playground-panel {
    @apply tw:grid tw:w-full tw:gap-5;
  }

  .tw\\:playground-section {
    @apply tw:grid tw:gap-3;
  }

  .tw\\:playground-featureRow {
    @apply tw:grid tw:gap-5 tw:lg:grid-cols-2;
  }

  .tw\\:playground-secondaryGrid {
    @apply tw:grid tw:gap-5;
  }

  .tw\\:playground-column {
    @apply tw:grid tw:gap-5;
  }

  .tw\\:playground-sectionHeader {
    @apply tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-2;
  }

  .tw\\:playground-sectionMeta {
    @apply tw:grid tw:gap-1;
  }

  .tw\\:playground-sectionTitle {
    @apply tw:m-0 tw:text-sm tw:font-semibold tw:leading-5 tw:text-slate-950;
  }

  .tw\\:playground-sectionCopy {
    @apply tw:m-0 tw:text-xs tw:leading-5 tw:text-slate-600;
  }

  .tw\\:playground-sectionBody {
    @apply tw:grid tw:gap-3;
  }

  .tw\\:playground-sectionBodyCompact {
    @apply tw:gap-2;
  }

  .tw\\:playground-sectionBody-grid {
    @apply tw:grid tw:gap-4 tw:lg:grid-cols-[minmax(11rem,13rem)_1fr];
  }

  .tw\\:playground-stack {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:playground-componentGrid {
    @apply tw:grid tw:gap-3 tw:md:grid-cols-3;
  }

  .tw\\:playground-badge {
    @apply tw:inline-flex tw:items-center tw:border tw:border-slate-200 tw:px-1.5 tw:py-0.5 tw:text-[11px] tw:font-medium tw:text-slate-700;
  }

  .tw\\:playground-heading-1 {
    @apply tw:m-0 tw:text-3xl tw:font-semibold tw:leading-tight tw:text-slate-950;
    font-family: var(--playground-font-heading);
  }

  .tw\\:playground-heading-2 {
    @apply tw:m-0 tw:text-2xl tw:font-semibold tw:leading-tight tw:text-slate-950;
    font-family: var(--playground-font-heading);
  }

  .tw\\:playground-heading-3 {
    @apply tw:m-0 tw:text-xl tw:font-semibold tw:leading-tight tw:text-slate-950;
    font-family: var(--playground-font-heading);
  }

  .tw\\:playground-heading-4 {
    @apply tw:m-0 tw:text-lg tw:font-semibold tw:leading-tight tw:text-slate-950;
    font-family: var(--playground-font-heading);
  }

  .tw\\:playground-heading-5 {
    @apply tw:m-0 tw:text-base tw:font-medium tw:leading-tight tw:text-slate-950;
    font-family: var(--playground-font-heading);
  }

  .tw\\:playground-heading-6 {
    @apply tw:m-0 tw:text-sm tw:font-medium tw:leading-tight tw:text-slate-950;
    font-family: var(--playground-font-heading);
  }

  .tw\\:playground-copy {
    @apply tw:m-0 tw:text-xs tw:leading-5 tw:text-slate-700;
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

  .tw\\:playground-colorScaleGroup,
  .tw\\:playground-colorScaleRow,
  .tw\\:playground-colorListCompact,
  .tw\\:playground-tokenList {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:playground-colorScaleHeader,
  .tw\\:playground-stackRowMeta,
  .tw\\:playground-actions {
    @apply tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-2;
  }

  .tw\\:playground-colorScaleTrack {
    @apply tw:grid tw:gap-1 tw:overflow-x-auto;
    grid-template-columns: repeat(var(--playground-scale-columns, 1), minmax(2.5rem, 1fr));
  }

  .tw\\:playground-colorScaleTrackCompact {
    grid-template-columns: repeat(var(--playground-scale-columns, 1), minmax(2rem, 1fr));
  }

  .tw\\:playground-colorScaleTile {
    @apply tw:grid tw:gap-1;
  }

  .tw\\:playground-colorScaleSwatch,
  .tw\\:playground-semanticCard,
  .tw\\:playground-chipCard,
  .tw\\:playground-sizingDemo,
  .tw\\:playground-perspectiveDemo,
  .tw\\:playground-layerDemo,
  .tw\\:playground-card {
    @apply tw:border tw:border-slate-200 tw:bg-white;
  }

  .tw\\:playground-colorScaleSwatch {
    @apply tw:flex tw:min-h-10 tw:items-end tw:p-1;
  }

  .tw\\:playground-semanticGrid {
    @apply tw:grid tw:gap-1.5 tw:sm:grid-cols-2;
  }

  .tw\\:playground-semanticCard {
    @apply tw:grid tw:grid-cols-[2rem_minmax(0,1fr)] tw:gap-1.5 tw:p-1.5;
  }

  .tw\\:playground-semanticCardCompact {
    @apply tw:grid-cols-[1.5rem_minmax(0,1fr)] tw:gap-1 tw:p-1;
  }

  .tw\\:playground-semanticSwatch {
    @apply tw:block tw:h-8 tw:w-8 tw:border tw:border-slate-200;
  }

  .tw\\:playground-semanticMeta,
  .tw\\:playground-tokenMeta {
    @apply tw:grid tw:gap-0.5;
  }

  .tw\\:playground-colorScaleStep,
  .tw\\:playground-tokenName {
    @apply tw:text-[11px] tw:font-medium tw:leading-tight tw:text-slate-950;
  }

  .tw\\:playground-tokenValue {
    @apply tw:text-[11px] tw:leading-tight tw:text-slate-600;
  }

  .tw\\:playground-tokenRow {
    @apply tw:flex tw:items-center tw:gap-2;
  }

  .tw\\:playground-swatch {
    @apply tw:h-3 tw:w-3 tw:shrink-0 tw:border tw:border-slate-200;
  }

  .tw\\:playground-spacing,
  .tw\\:playground-stackDemo {
    @apply tw:grid tw:gap-2;
  }

  .tw\\:playground-spacingScale {
    @apply tw:flex tw:items-center tw:justify-between tw:gap-2;
  }

  .tw\\:playground-stackRow {
    @apply tw:grid tw:gap-1;
  }

  .tw\\:playground-spacingRail,
  .tw\\:playground-breakpointDemo {
    @apply tw:w-full tw:border tw:border-slate-200 tw:bg-slate-50;
  }

  .tw\\:playground-spacingRail {
    @apply tw:h-2;
  }

  .tw\\:playground-spacingBar,
  .tw\\:playground-breakpointBar {
    @apply tw:h-full tw:bg-slate-900;
  }

  .tw\\:playground-chipGrid {
    @apply tw:grid tw:gap-2 tw:sm:grid-cols-2 tw:xl:grid-cols-3;
  }

  .tw\\:playground-chipCard {
    @apply tw:grid tw:gap-2 tw:p-2;
  }

  .tw\\:playground-radiusDemo,
  .tw\\:playground-shadowDemo,
  .tw\\:playground-opacityDemo {
    @apply tw:h-12 tw:w-full tw:border tw:border-slate-200 tw:bg-white;
  }

  .tw\\:playground-shadowText {
    @apply tw:text-base tw:font-semibold tw:text-slate-950;
  }

  .tw\\:playground-effectStage {
    @apply tw:grid tw:min-h-12 tw:w-full tw:place-items-center tw:border tw:border-slate-200 tw:bg-slate-50;
  }

  .tw\\:playground-effectOrb {
    @apply tw:h-6 tw:w-6 tw:rounded-full tw:bg-slate-900;
  }

  .tw\\:playground-blurDemo {
    @apply tw:flex tw:items-center tw:justify-center tw:gap-3;
  }

  .tw\\:playground-blurText {
    @apply tw:text-xs tw:font-medium tw:text-slate-700;
  }

  .tw\\:playground-sizingDemo,
  .tw\\:playground-perspectiveDemo,
  .tw\\:playground-layerDemo {
    @apply tw:grid tw:min-h-12 tw:w-full tw:place-items-center;
  }

  .tw\\:playground-aspectDemo,
  .tw\\:playground-perspectivePlane {
    @apply tw:bg-slate-900;
    width: min(100%, 10rem);
    min-height: 2rem;
  }

  .tw\\:playground-perspectivePlane {
    @apply tw:h-8 tw:w-14;
    transform: rotateX(58deg) rotateZ(-18deg);
  }

  .tw\\:playground-layerBase,
  .tw\\:playground-layerMid,
  .tw\\:playground-layerTop {
    @apply tw:absolute tw:border tw:border-slate-300;
  }

  .tw\\:playground-layerBase {
    inset: 1.1rem 2.5rem auto auto;
    height: 1.75rem;
    width: 3.2rem;
    background: white;
  }

  .tw\\:playground-layerMid {
    inset: 1.5rem auto auto 1.5rem;
    height: 2rem;
    width: 4rem;
    background: rgb(241 245 249);
  }

  .tw\\:playground-layerTop {
    inset: 0.75rem auto auto 3.1rem;
    height: 2.4rem;
    width: 4.5rem;
    background: rgb(15 23 42);
  }

  .tw\\:playground-motion {
    @apply tw:flex tw:flex-wrap tw:items-center tw:gap-3;
  }

  .tw\\:playground-motionOrb {
    @apply tw:h-4 tw:w-4 tw:rounded-full tw:bg-slate-900;
    animation-name: tw-playground-pulse;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .tw\\:playground-button {
    @apply tw:inline-flex tw:items-center tw:justify-center tw:border tw:border-slate-300 tw:bg-white tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-slate-900;
  }

  .tw\\:playground-button-primary {
    @apply tw:border-slate-900 tw:bg-slate-900 tw:text-white;
  }

  .tw\\:playground-card {
    @apply tw:grid tw:gap-2 tw:p-3;
  }

  .tw\\:playground-input {
    @apply tw:w-full tw:border tw:border-slate-300 tw:bg-white tw:px-2.5 tw:py-1.5 tw:text-xs tw:text-slate-900;
  }

  .tw\\:playground-input::placeholder {
    color: rgb(100 116 139);
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
  "tw:playground-sectionBodyCompact",
  "tw:playground-sectionBody-grid",
  "tw:playground-stack",
  "tw:playground-componentGrid",
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
  "tw:playground-colorScaleTrackCompact",
  "tw:playground-colorScaleTile",
  "tw:playground-colorScaleSwatch",
  "tw:playground-colorScaleStep",
  "tw:playground-semanticGrid",
  "tw:playground-semanticCard",
  "tw:playground-semanticCardCompact",
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

export async function getPlaygroundTailwindCss() {
  compiledPlaygroundTailwindCssPromise ??= (async () => {
    const compiler = await compile(PLAYGROUND_TAILWIND_SOURCE, {
      base: process.cwd(),
      onDependency() {}
    });

    return compiler.build(PLAYGROUND_TAILWIND_CANDIDATES);
  })();

  return compiledPlaygroundTailwindCssPromise;
}
