import type { TokenRecord } from "@/features/token-visualizer/document";
import { groupTokens, parseEditableLength, tokenValueForWidth, toMilliseconds } from "@/features/token-visualizer/utils";
import { tokenCategoryDefinitions, tokenCategoryDescriptions } from "@/features/token-catalogue/categories";
import { analyzePlaygroundColorLayout } from "@/features/token-catalogue/playground-color-layout";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function colorScaleTextColor(step: number) {
  return step >= 500 ? "rgb(255 255 255 / 0.92)" : "rgb(15 23 42 / 0.88)";
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

function spacingValueToPixels(value: string) {
  const parsed = parseEditableLength(value);

  if (!parsed) {
    return null;
  }

  if (parsed.unit === "rem") {
    return parsed.amount * 16;
  }

  return parsed.amount;
}

function spacingScaleMax(tokens: TokenRecord[]) {
  const pixelValues = tokens.map((token) => spacingValueToPixels(token.value)).filter((value): value is number => value !== null && value > 0);

  return pixelValues.length > 0 ? Math.max(...pixelValues) : 16;
}

function spacingWidthForScale(value: string, maxPx: number) {
  const pxValue = spacingValueToPixels(value);

  if (pxValue === null || maxPx <= 0) {
    return tokenValueForWidth(value);
  }

  return `${Math.max(4, (Math.abs(pxValue) / maxPx) * 100)}%`;
}

function formatSpacingScaleLabel(pxValue: number) {
  const rounded = Math.round(pxValue * 10) / 10;

  if (rounded <= 0) {
    return "0";
  }

  if (rounded % 16 === 0) {
    return `${rounded / 16}rem`;
  }

  return `${rounded}px`;
}

function pickToken(tokens: TokenRecord[], patterns: RegExp[]) {
  return patterns.map((pattern) => tokens.find((token) => pattern.test(token.name))).find(Boolean) ?? tokens[0] ?? null;
}

function tokenNameIncludes(token: TokenRecord, fragment: string) {
  return token.name.toLowerCase().includes(fragment);
}

function renderSectionStart(category: keyof typeof tokenCategoryDescriptions, tokenCount: number) {
  return `
    <section class="tw:playground-section" data-playground-section="${escapeHtml(category)}">
      <div class="tw:playground-sectionHeader">
        <div class="tw:playground-sectionMeta">
          <h2 class="tw:playground-sectionTitle">${escapeHtml(tokenCategoryDefinitions.find((definition) => definition.key === category)?.label ?? category)}</h2>
          <p class="tw:playground-sectionCopy">${escapeHtml(tokenCategoryDescriptions[category])}</p>
        </div>
        <span class="tw:playground-badge">${tokenCount} ${tokenCount === 1 ? "token" : "tokens"}</span>
      </div>
  `;
}

function renderSectionEnd() {
  return "</section>";
}

function renderColorSection(tokens: TokenRecord[]) {
  const displayTokens = tokens.filter((token) => !tokenNameIncludes(token, "shadow") && !tokenNameIncludes(token, "elevation"));

  if (displayTokens.length === 0) {
    return "";
  }

  const layout = analyzePlaygroundColorLayout(displayTokens);
  const sectionCopy =
    layout.mode === "scale"
      ? "Palette families shown as tonal steps for quick comparison."
      : layout.mode === "mixed"
        ? "Scale colors and semantic roles shown together so sparse themes still read clearly."
        : layout.mode === "semantic-grid"
          ? "Role colors shown as surfaces, text, borders, and accents."
          : "Available color tokens shown directly without inferred scales.";

  const scaleRows = layout.scaleFamilies
    .map((family) => {
      const tiles = family.steps
        .map(
          ({ step, token }) => `
            <div class="tw:playground-colorScaleTile">
              <div class="tw:playground-colorScaleSwatch" style="${escapeHtml(`background: ${token.value};`)}">
                <span class="tw:playground-colorScaleStep" style="${escapeHtml(`color: ${colorScaleTextColor(step)};`)}">${step}</span>
              </div>
            </div>
          `
        )
        .join("");

      return `
        <div class="tw:playground-colorScaleRow">
          <div class="tw:playground-colorScaleHeader">
            <span class="tw:playground-tokenName">${escapeHtml(family.label)}</span>
            <span class="tw:playground-tokenValue">${family.coverage} mapped steps</span>
          </div>
          <div class="tw:playground-colorScaleTrack" style="${escapeHtml(`--playground-scale-columns: ${family.steps.length};`)}">${tiles}</div>
        </div>
      `;
    })
    .join("");

  const semanticRows = layout.looseTokens
    .slice(0, layout.mode === "minimal" ? 6 : 4)
    .map((token) => {
      const swatchStyle = escapeHtml(`background: ${token.value};`);
      return `
        <div class="tw:playground-tokenRow">
          <span class="tw:playground-swatch" style="${swatchStyle}"></span>
          <div class="tw:playground-tokenMeta">
            <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
            <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
          </div>
        </div>
      `;
    })
    .join("");
  const semanticGrid = layout.semanticTokens
    .map(({ label, token }) => {
      const swatchStyle = escapeHtml(`background: ${token.value};`);
      return `
        <div class="tw:playground-semanticCard">
          <span class="tw:playground-semanticSwatch" style="${swatchStyle}"></span>
          <div class="tw:playground-semanticMeta">
            <span class="tw:playground-tokenName">${escapeHtml(label)}</span>
            <span class="tw:playground-tokenValue">${escapeHtml(token.name)}</span>
            <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    ${renderSectionStart("color", displayTokens.length)}
      <div class="tw:playground-sectionBody">
        ${scaleRows ? `<div class="tw:playground-colorScaleGroup">${scaleRows}</div>` : ""}
        ${layout.mode !== "scale" && semanticGrid ? `<div class="tw:playground-semanticGrid">${semanticGrid}</div>` : ""}
        ${layout.mode !== "scale" && semanticRows ? `<div class="tw:playground-colorListCompact">${semanticRows}</div>` : ""}
        ${
          layout.mode !== "scale" && sectionCopy
            ? `<div class="tw:playground-colorNote"><span class="tw:playground-tokenValue">${escapeHtml(sectionCopy)}</span></div>`
            : ""
        }
      </div>
    ${renderSectionEnd()}
  `;
}

function renderTypographySection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  const weightTokens = tokens.filter((token) => tokenNameIncludes(token, "weight")).slice(0, 4);
  const weightSamples =
    weightTokens.length > 0
      ? `
        <div class="tw:playground-chipGrid">
          ${weightTokens
            .map(
              (token) => `
                <div class="tw:playground-chipCard">
                  <span class="tw:playground-shadowText" style="${escapeHtml(`font-weight: ${token.value};`)}">Weight sample</span>
                  <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                  <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      `
      : "";

  return `
    ${renderSectionStart("typography", tokens.length)}
      <div class="tw:playground-stack">
        <h1 class="tw:playground-heading-1">Campaign landing headline</h1>
        <h2 class="tw:playground-heading-2">Section hierarchy and pacing</h2>
        <h3 class="tw:playground-heading-3">Supporting story blocks</h3>
        <h4 class="tw:playground-heading-4">Compact interface headings</h4>
        <h5 class="tw:playground-heading-5">Navigation and labels</h5>
        <h6 class="tw:playground-heading-6">Metadata and fine print</h6>
        <p class="tw:playground-copy">This is representative preview copy, not final content. It is here to help you evaluate hierarchy, tone, and reading comfort.</p>
        <p class="tw:playground-copy tw:playground-copy-strong"><strong>Strong sample</strong> for calls to action, stat blocks, and key moments.</p>
        <p class="tw:playground-copy tw:playground-copy-em"><em>Emphasis sample</em> for editorial cadence, highlights, and side notes.</p>
        <p class="tw:playground-copy tw:playground-copy-serif">Serif sample for feature intros, pull quotes, and long-form reading.</p>
        <blockquote class="tw:playground-copy tw:playground-copy-quote">Preview quote treatment for testimonials, editorial asides, or hero statements.</blockquote>
        <p class="tw:playground-copy tw:playground-copy-mono">Mono sample for specs, tokens, and interface diagnostics: Aa Bb Cc 0123456789</p>
      </div>
      ${weightSamples}
    ${renderSectionEnd()}
  `;
}

function renderSpacingSection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  const primaryToken = pickSpacingToken(tokens);
  const scaleMax = spacingScaleMax(tokens);
  const scaleMid = scaleMax / 2;
  const comparisonTokens = tokens.filter((token) => token.sourceId !== primaryToken?.sourceId).slice(0, 4);

  return `
    ${renderSectionStart("spacing", tokens.length)}
      <div class="tw:playground-sectionBody tw:playground-sectionBody-grid">
        <div class="tw:playground-spacing">
          <span class="tw:playground-badge">Primary token</span>
          <span class="tw:playground-tokenName">${escapeHtml(primaryToken?.name ?? "No spacing token")}</span>
          <div class="tw:playground-spacingRail">
            <div class="tw:playground-spacingBar" style="${escapeHtml(`width: ${primaryToken?.value ?? "1rem"};`)}"></div>
          </div>
          <span class="tw:playground-tokenValue">${escapeHtml(primaryToken?.value ?? "1rem")}</span>
        </div>
        <div class="tw:playground-stackDemo">
          <div class="tw:playground-spacingScale">
            <span class="tw:playground-tokenValue">${escapeHtml(formatSpacingScaleLabel(0))}</span>
            <span class="tw:playground-tokenValue">${escapeHtml(formatSpacingScaleLabel(scaleMid))}</span>
            <span class="tw:playground-tokenValue">${escapeHtml(formatSpacingScaleLabel(scaleMax))}</span>
          </div>
          ${comparisonTokens
            .map(
              (token) => `
                <div class="tw:playground-stackRow">
                  <div class="tw:playground-stackRowMeta">
                    <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                    <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
                  </div>
                  <div class="tw:playground-spacingRail">
                    <div class="tw:playground-spacingBar" style="${escapeHtml(`width: ${spacingWidthForScale(token.value, scaleMax)};`)}"></div>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    ${renderSectionEnd()}
  `;
}

function renderRadiusSection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  return `
    ${renderSectionStart("radius", tokens.length)}
      <div class="tw:playground-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:playground-chipCard">
                <div class="tw:playground-radiusDemo"></div>
                <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    ${renderSectionEnd()}
  `;
}

function renderShadowSection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  function renderShadowDemo(token: TokenRecord) {
    if (tokenNameIncludes(token, "text-shadow")) {
      return `<div class="tw:playground-effectStage"><span class="tw:playground-shadowText" style="${escapeHtml(`text-shadow: ${token.value};`)}">Shadow</span></div>`;
    }

    if (tokenNameIncludes(token, "drop-shadow")) {
      return `<div class="tw:playground-effectStage"><div class="tw:playground-effectOrb" style="${escapeHtml(`filter: drop-shadow(${token.value});`)}"></div></div>`;
    }

    return `<div class="tw:playground-shadowDemo" style="${escapeHtml(`box-shadow: ${token.value};`)}"></div>`;
  }

  return `
    ${renderSectionStart("shadow", tokens.length)}
      <div class="tw:playground-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:playground-chipCard">
                ${renderShadowDemo(token)}
                <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    ${renderSectionEnd()}
  `;
}

function renderSizingSection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  function renderSizingDemo(token: TokenRecord) {
    if (tokenNameIncludes(token, "aspect")) {
      return `
        <div class="tw:playground-sizingDemo">
          <div class="tw:playground-aspectDemo" style="${escapeHtml(`aspect-ratio: ${token.value};`)}"></div>
        </div>
      `;
    }

    return `
      <div class="tw:playground-sizingDemo">
        <div class="tw:playground-spacingRail">
          <div class="tw:playground-spacingBar" style="${escapeHtml(`width: ${tokenValueForWidth(token.value)};`)}"></div>
        </div>
      </div>
    `;
  }

  return `
    ${renderSectionStart("sizing", tokens.length)}
      <div class="tw:playground-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:playground-chipCard">
                ${renderSizingDemo(token)}
                <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    ${renderSectionEnd()}
  `;
}

function renderMotionSection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  const durationToken = pickToken(tokens, [/duration/i, /animate/i]);
  const easingToken = pickToken(tokens, [/ease/i]);
  const durationValue = durationToken?.value ?? "200ms";
  const easingValue = easingToken?.value ?? "ease";
  const durationMs = toMilliseconds(durationValue) ?? 200;

  return `
    ${renderSectionStart("motion", tokens.length)}
      <div class="tw:playground-motion">
        <div
          class="tw:playground-motionOrb"
          style="${escapeHtml(`animation-duration: ${durationValue}; animation-timing-function: ${easingValue};`)}"
        ></div>
        <div class="tw:playground-tokenMeta">
          <span class="tw:playground-tokenName">${escapeHtml(durationToken?.name ?? "--duration")}</span>
          <span class="tw:playground-tokenValue">${escapeHtml(durationValue)}${durationMs ? ` / ${durationMs}ms` : ""}</span>
        </div>
      </div>
    ${renderSectionEnd()}
  `;
}

function renderBreakpointSection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  return `
    ${renderSectionStart("breakpoint", tokens.length)}
      <div class="tw:playground-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:playground-chipCard">
                <div class="tw:playground-breakpointDemo">
                  <div class="tw:playground-breakpointBar" style="${escapeHtml(`width: ${tokenValueForWidth(token.value)};`)}"></div>
                </div>
                <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    ${renderSectionEnd()}
  `;
}

function renderZIndexSection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  return `
    ${renderSectionStart("z-index", tokens.length)}
      <div class="tw:playground-chipGrid">
        ${tokens
          .slice(0, 3)
          .map(
            (token) => `
              <div class="tw:playground-chipCard">
                <div class="tw:playground-layerDemo">
                  <div class="tw:playground-layerBase" style="${escapeHtml(`z-index: 1;`)}"></div>
                  <div class="tw:playground-layerMid" style="${escapeHtml(`z-index: 2;`)}"></div>
                  <div class="tw:playground-layerTop" style="${escapeHtml(`z-index: ${token.value};`)}"></div>
                </div>
                <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    ${renderSectionEnd()}
  `;
}

function renderOpacitySection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  return `
    ${renderSectionStart("opacity", tokens.length)}
      <div class="tw:playground-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:playground-chipCard">
                <div class="tw:playground-opacityDemo" style="${escapeHtml(`opacity: ${token.value};`)}"></div>
                <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    ${renderSectionEnd()}
  `;
}

function renderOtherSection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  function renderOtherDemo(token: TokenRecord) {
    if (tokenNameIncludes(token, "blur")) {
      return `
        <div class="tw:playground-effectStage">
          <div class="tw:playground-blurDemo" style="${escapeHtml(`filter: blur(${token.value});`)}">
            <div class="tw:playground-effectOrb"></div>
            <span class="tw:playground-blurText">Blur</span>
          </div>
        </div>
      `;
    }

    if (tokenNameIncludes(token, "perspective")) {
      return `
        <div class="tw:playground-perspectiveDemo" style="${escapeHtml(`perspective: ${token.value};`)}">
          <div class="tw:playground-perspectivePlane"></div>
        </div>
      `;
    }

    return `
      <div class="tw:playground-effectStage">
        <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
      </div>
    `;
  }

  return `
    ${renderSectionStart("other", tokens.length)}
      <div class="tw:playground-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:playground-chipCard">
                ${renderOtherDemo(token)}
                <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:playground-tokenValue">${escapeHtml(token.value)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    ${renderSectionEnd()}
  `;
}

function renderThemeSection(tokens: TokenRecord[]) {
  const colorTokens = tokens.filter((token) => token.category === "color");
  const bodyText =
    colorTokens.length > 0
      ? "A lightweight mock composition that inherits your imported tokens so you can review hierarchy, surfaces, and calls to action in context."
      : "A lightweight mock composition ready to inherit imported tokens for quick design review.";

  return `
    <section class="tw:playground-section" data-playground-section="theme">
      <div class="tw:playground-sectionHeader">
        <div class="tw:playground-sectionMeta">
          <h2 class="tw:playground-sectionTitle">Layout Preview</h2>
          <p class="tw:playground-sectionCopy">${escapeHtml(bodyText)}</p>
        </div>
      </div>
      <div class="tw:playground-stack">
        <article class="tw:playground-card">
          <h3 class="tw:playground-heading-4">Feature callout</h3>
          <p class="tw:playground-copy">Light gathers at the edges, color settles into rhythm, and each line finds its measure.</p>
          <code class="tw:playground-copy tw:playground-copy-mono">font-sans / font-serif / font-mono</code>
        </article>
        <input type="text" class="tw:playground-input" placeholder="Preview input" value="Preview input" />
        <div class="tw:playground-actions">
          <button type="button" class="tw:playground-button">Secondary action</button>
          <button type="button" class="tw:playground-button tw:playground-button-primary">Primary action</button>
        </div>
      </div>
    </section>
  `;
}

export function renderPlaygroundShowcases(tokens: TokenRecord[]) {
  const groupedTokens = groupTokens(tokens);
  const renderedSections = Object.fromEntries(
    tokenCategoryDefinitions.map((definition) => {
      const scopedTokens = groupedTokens[definition.key];

      switch (definition.key) {
        case "color":
          return [definition.key, renderColorSection(scopedTokens)];
        case "spacing":
          return [definition.key, renderSpacingSection(scopedTokens)];
        case "typography":
          return [definition.key, renderTypographySection(scopedTokens)];
        case "radius":
          return [definition.key, renderRadiusSection(scopedTokens)];
        case "shadow":
          return [definition.key, renderShadowSection(scopedTokens)];
        case "sizing":
          return [definition.key, renderSizingSection(scopedTokens)];
        case "motion":
          return [definition.key, renderMotionSection(scopedTokens)];
        case "z-index":
          return [definition.key, renderZIndexSection(scopedTokens)];
        case "opacity":
          return [definition.key, renderOpacitySection(scopedTokens)];
        case "breakpoint":
          return [definition.key, renderBreakpointSection(scopedTokens)];
        case "other":
          return [definition.key, renderOtherSection(scopedTokens)];
        default:
          return [definition.key, ""];
      }
    })
  ) as Record<string, string>;

  const featureRowSections = [renderedSections.color, renderedSections.spacing].filter(Boolean).join("");
  const secondaryColumnSections = [
    renderedSections.typography,
    renderedSections.radius,
    renderedSections.shadow,
    renderedSections.sizing,
    renderedSections.motion,
    renderedSections["z-index"],
    renderedSections.opacity,
    renderedSections.breakpoint,
    renderedSections.other
  ]
    .filter(Boolean)
    .join("");

  return `
    <div class="tw:playground-shell">
      <div class="tw:playground-panel">
        <div class="tw:playground-featureRow">${featureRowSections}</div>
        <div class="tw:playground-secondaryGrid">
          <div class="tw:playground-column">${secondaryColumnSections}</div>
        </div>
        ${renderThemeSection(tokens)}
      </div>
    </div>
  `;
}
