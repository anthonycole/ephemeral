import type { TokenRecord } from "@/features/token-visualizer/document";
import { groupTokens, tokenValueForWidth, toMilliseconds } from "@/features/token-visualizer/utils";
import { tokenCategoryDefinitions, tokenCategoryDescriptions } from "@/features/token-catalogue/categories";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const WHEEL_SAFE_COLOR_VALUE_REGEX = /^(#([0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|color\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|var\(--[^)]+\))$/i;

function isWheelSafeColorValue(value: string) {
  return WHEEL_SAFE_COLOR_VALUE_REGEX.test(value.trim());
}

function createColorWheelStops(colorTokens: TokenRecord[]) {
  const wheelTokens = colorTokens.filter((token) => isWheelSafeColorValue(token.value));

  if (wheelTokens.length === 0) {
    return [
      "var(--playground-color-accent) 0% 33.33%",
      "var(--playground-color-fg) 33.33% 66.66%",
      "var(--playground-color-bg) 66.66% 100%"
    ];
  }

  const step = 100 / wheelTokens.length;
  return wheelTokens.map((token, index) => {
    const start = (index * step).toFixed(2);
    const end = ((index + 1) * step).toFixed(2);
    return `${token.value} ${start}% ${end}%`;
  });
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
  if (tokens.length === 0) {
    return "";
  }

  const wheelStyle = escapeHtml(
    `background-color: var(--playground-color-panel); background-image: conic-gradient(${createColorWheelStops(tokens).join(", ")});`
  );
  const rows = tokens
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

  return `
    ${renderSectionStart("color", tokens.length)}
      <div class="tw:playground-sectionBody tw:playground-sectionBody-grid">
        <div class="tw:playground-wheelWrap">
          <div class="tw:playground-wheel" style="${wheelStyle}"></div>
          <p class="tw:playground-copy">Tailwind picks these imported colors up through the runtime token bridge on <code>:root</code>.</p>
        </div>
        <div class="tw:playground-tokenList">${rows}</div>
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
        <h1 class="tw:playground-heading-1">Heading 1</h1>
        <h2 class="tw:playground-heading-2">Heading 2</h2>
        <h3 class="tw:playground-heading-3">Heading 3</h3>
        <h4 class="tw:playground-heading-4">Heading 4</h4>
        <h5 class="tw:playground-heading-5">Heading 5</h5>
        <h6 class="tw:playground-heading-6">Heading 6</h6>
        <p class="tw:playground-copy">Type samples stay intentionally plain so imported font, text, and tracking tokens are easy to judge.</p>
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

  return `
    ${renderSectionStart("spacing", tokens.length)}
      <div class="tw:playground-sectionBody tw:playground-sectionBody-grid">
        <div class="tw:playground-spacing">
          <span class="tw:playground-tokenName">${escapeHtml(primaryToken?.name ?? "No spacing token")}</span>
          <div class="tw:playground-spacingRail">
            <div class="tw:playground-spacingBar" style="${escapeHtml(`width: ${primaryToken?.value ?? "1rem"};`)}"></div>
          </div>
          <span class="tw:playground-tokenValue">${escapeHtml(primaryToken?.value ?? "1rem")}</span>
        </div>
        <div class="tw:playground-stackDemo">
          ${tokens
            .slice(0, 4)
            .map(
              (token) => `
                <div class="tw:playground-stackRow">
                  <span class="tw:playground-tokenName">${escapeHtml(token.name)}</span>
                  <div class="tw:playground-spacingRail">
                    <div class="tw:playground-spacingBar" style="${escapeHtml(`width: ${tokenValueForWidth(token.value)};`)}"></div>
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
      ? "Minimal Tailwind components inheriting your imported color and theme variables."
      : "Minimal Tailwind components ready to inherit imported theme variables.";

  return `
    <section class="tw:playground-section" data-playground-section="theme">
      <div class="tw:playground-sectionHeader">
        <div class="tw:playground-sectionMeta">
          <h2 class="tw:playground-sectionTitle">Theme Application</h2>
          <p class="tw:playground-sectionCopy">${escapeHtml(bodyText)}</p>
        </div>
      </div>
      <div class="tw:playground-stack">
        <article class="tw:playground-card">
          <h3 class="tw:playground-heading-4">Simple card</h3>
          <p class="tw:playground-copy">Tailwind components stay inside the iframe so the parent Radix app never picks up this styling.</p>
        </article>
        <input type="text" class="tw:playground-input" placeholder="Text input" value="Text input" />
        <div class="tw:playground-actions">
          <button type="button" class="tw:playground-button">Secondary</button>
          <button type="button" class="tw:playground-button tw:playground-button-primary">Primary</button>
        </div>
      </div>
    </section>
  `;
}

export function renderPlaygroundShowcases(tokens: TokenRecord[]) {
  const groupedTokens = groupTokens(tokens);
  const sections = tokenCategoryDefinitions
    .map((definition) => {
      const scopedTokens = groupedTokens[definition.key];

      switch (definition.key) {
        case "color":
          return renderColorSection(scopedTokens);
        case "spacing":
          return renderSpacingSection(scopedTokens);
        case "typography":
          return renderTypographySection(scopedTokens);
        case "radius":
          return renderRadiusSection(scopedTokens);
        case "shadow":
          return renderShadowSection(scopedTokens);
        case "sizing":
          return renderSizingSection(scopedTokens);
        case "motion":
          return renderMotionSection(scopedTokens);
        case "z-index":
          return renderZIndexSection(scopedTokens);
        case "opacity":
          return renderOpacitySection(scopedTokens);
        case "breakpoint":
          return renderBreakpointSection(scopedTokens);
        case "other":
          return renderOtherSection(scopedTokens);
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("");

  return `
    <div class="tw:playground-shell">
      <div class="tw:playground-panel">
        ${sections}
        ${renderThemeSection(tokens)}
      </div>
    </div>
  `;
}
