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
      "var(--sandbox-color-accent) 0% 33.33%",
      "var(--sandbox-color-fg) 33.33% 66.66%",
      "var(--sandbox-color-bg) 66.66% 100%"
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

function renderSectionStart(category: keyof typeof tokenCategoryDescriptions, tokenCount: number) {
  return `
    <section class="tw:sandbox-section" data-sandbox-section="${escapeHtml(category)}">
      <div class="tw:sandbox-sectionHeader">
        <div class="tw:sandbox-sectionMeta">
          <h2 class="tw:sandbox-sectionTitle">${escapeHtml(tokenCategoryDefinitions.find((definition) => definition.key === category)?.label ?? category)}</h2>
          <p class="tw:sandbox-sectionCopy">${escapeHtml(tokenCategoryDescriptions[category])}</p>
        </div>
        <span class="tw:sandbox-badge">${tokenCount} ${tokenCount === 1 ? "token" : "tokens"}</span>
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
    `background-color: var(--sandbox-color-panel); background-image: conic-gradient(${createColorWheelStops(tokens).join(", ")});`
  );
  const rows = tokens
    .map((token) => {
      const swatchStyle = escapeHtml(`background: ${token.value};`);
      return `
        <div class="tw:sandbox-tokenRow">
          <span class="tw:sandbox-swatch" style="${swatchStyle}"></span>
          <div class="tw:sandbox-tokenMeta">
            <span class="tw:sandbox-tokenName">${escapeHtml(token.name)}</span>
            <span class="tw:sandbox-tokenValue">${escapeHtml(token.value)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    ${renderSectionStart("color", tokens.length)}
      <div class="tw:sandbox-sectionBody tw:sandbox-sectionBody-grid">
        <div class="tw:sandbox-wheelWrap">
          <div class="tw:sandbox-wheel" style="${wheelStyle}"></div>
          <p class="tw:sandbox-copy">Tailwind picks these imported colors up through the runtime token bridge on <code>:root</code>.</p>
        </div>
        <div class="tw:sandbox-tokenList">${rows}</div>
      </div>
    ${renderSectionEnd()}
  `;
}

function renderTypographySection(tokens: TokenRecord[]) {
  if (tokens.length === 0) {
    return "";
  }

  return `
    ${renderSectionStart("typography", tokens.length)}
      <div class="tw:sandbox-stack">
        <h1 class="tw:sandbox-heading-1">Heading 1</h1>
        <h2 class="tw:sandbox-heading-2">Heading 2</h2>
        <h3 class="tw:sandbox-heading-3">Heading 3</h3>
        <h4 class="tw:sandbox-heading-4">Heading 4</h4>
        <h5 class="tw:sandbox-heading-5">Heading 5</h5>
        <h6 class="tw:sandbox-heading-6">Heading 6</h6>
        <p class="tw:sandbox-copy">Type samples stay intentionally plain so imported font, text, and tracking tokens are easy to judge.</p>
      </div>
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
      <div class="tw:sandbox-sectionBody tw:sandbox-sectionBody-grid">
        <div class="tw:sandbox-spacing">
          <span class="tw:sandbox-tokenName">${escapeHtml(primaryToken?.name ?? "No spacing token")}</span>
          <div class="tw:sandbox-spacingRail">
            <div class="tw:sandbox-spacingBar" style="${escapeHtml(`width: ${primaryToken?.value ?? "1rem"};`)}"></div>
          </div>
          <span class="tw:sandbox-tokenValue">${escapeHtml(primaryToken?.value ?? "1rem")}</span>
        </div>
        <div class="tw:sandbox-stackDemo">
          ${tokens
            .slice(0, 4)
            .map(
              (token) => `
                <div class="tw:sandbox-stackRow">
                  <span class="tw:sandbox-tokenName">${escapeHtml(token.name)}</span>
                  <div class="tw:sandbox-spacingRail">
                    <div class="tw:sandbox-spacingBar" style="${escapeHtml(`width: ${tokenValueForWidth(token.value)};`)}"></div>
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
      <div class="tw:sandbox-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:sandbox-chipCard">
                <div class="tw:sandbox-radiusDemo" style="${escapeHtml(`border-radius: ${token.value};`)}"></div>
                <span class="tw:sandbox-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:sandbox-tokenValue">${escapeHtml(token.value)}</span>
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

  return `
    ${renderSectionStart("shadow", tokens.length)}
      <div class="tw:sandbox-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:sandbox-chipCard">
                <div class="tw:sandbox-shadowDemo" style="${escapeHtml(`box-shadow: ${token.value};`)}"></div>
                <span class="tw:sandbox-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:sandbox-tokenValue">${escapeHtml(token.value)}</span>
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
      <div class="tw:sandbox-motion">
        <div
          class="tw:sandbox-motionOrb"
          style="${escapeHtml(`animation-duration: ${durationValue}; animation-timing-function: ${easingValue};`)}"
        ></div>
        <div class="tw:sandbox-tokenMeta">
          <span class="tw:sandbox-tokenName">${escapeHtml(durationToken?.name ?? "--duration")}</span>
          <span class="tw:sandbox-tokenValue">${escapeHtml(durationValue)}${durationMs ? ` / ${durationMs}ms` : ""}</span>
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
      <div class="tw:sandbox-chipGrid">
        ${tokens
          .slice(0, 6)
          .map(
            (token) => `
              <div class="tw:sandbox-chipCard">
                <div class="tw:sandbox-breakpointDemo">
                  <div class="tw:sandbox-breakpointBar" style="${escapeHtml(`width: ${tokenValueForWidth(token.value)};`)}"></div>
                </div>
                <span class="tw:sandbox-tokenName">${escapeHtml(token.name)}</span>
                <span class="tw:sandbox-tokenValue">${escapeHtml(token.value)}</span>
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
    <section class="tw:sandbox-section" data-sandbox-section="theme">
      <div class="tw:sandbox-sectionHeader">
        <div class="tw:sandbox-sectionMeta">
          <h2 class="tw:sandbox-sectionTitle">Theme Application</h2>
          <p class="tw:sandbox-sectionCopy">${escapeHtml(bodyText)}</p>
        </div>
      </div>
      <div class="tw:sandbox-stack">
        <article class="tw:sandbox-card">
          <h3 class="tw:sandbox-heading-4">Simple card</h3>
          <p class="tw:sandbox-copy">Tailwind components stay inside the iframe so the parent Radix app never picks up this styling.</p>
        </article>
        <input type="text" class="tw:sandbox-input" placeholder="Text input" value="Text input" />
        <div class="tw:sandbox-actions">
          <button type="button" class="tw:sandbox-button">Secondary</button>
          <button type="button" class="tw:sandbox-button tw:sandbox-button-primary">Primary</button>
        </div>
      </div>
    </section>
  `;
}

export function renderSandboxShowcases(tokens: TokenRecord[]) {
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
        case "motion":
          return renderMotionSection(scopedTokens);
        case "breakpoint":
          return renderBreakpointSection(scopedTokens);
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("");

  return `
    <div class="tw:sandbox-shell">
      <div class="tw:sandbox-panel">
        ${sections}
        ${renderThemeSection(tokens)}
      </div>
    </div>
  `;
}
