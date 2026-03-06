import { parse as parseTerrazzoColor } from "@terrazzo/use-color";
import type { TokenCategory } from "@/lib/design-tokens";
import type { EditableDurationUnit, EditableLengthUnit } from "@/features/token-visualizer/utils";

export type TokenComposerUnit = "raw" | EditableLengthUnit | EditableDurationUnit;
export type ColorComposerMode = "hex" | "css";
export type TypographyTokenType = "font-family" | "font-size" | "font-weight" | "line-height" | "letter-spacing" | "text-shadow" | "custom";

export const DEFAULT_TOKEN_CATEGORY: Exclude<TokenCategory, "all"> = "other";
export const DEFAULT_COLOR_VALUE = "#2563eb";
export const DEFAULT_CSS_COLOR_VALUE = "oklch(0.62 0.19 259)";
export const DEFAULT_TYPOGRAPHY_TOKEN_TYPE: TypographyTokenType = "font-size";

function expandShortHex(value: string) {
  return value
    .split("")
    .map((char) => char + char)
    .join("");
}

function clampColorByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function formatHexByte(value: number) {
  return clampColorByte(value).toString(16).padStart(2, "0");
}

function rgbaStringToHex(value: string) {
  const match = value.match(/^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);

  if (!match) {
    return null;
  }

  const red = Number.parseFloat(match[1]);
  const green = Number.parseFloat(match[2]);
  const blue = Number.parseFloat(match[3]);

  if ([red, green, blue].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  const alphaValue = match[4];
  const alpha = !alphaValue
    ? 1
    : alphaValue.endsWith("%")
      ? Number.parseFloat(alphaValue) / 100
      : Number.parseFloat(alphaValue);

  if (Number.isNaN(alpha)) {
    return null;
  }

  const rgbHex = `#${formatHexByte(red)}${formatHexByte(green)}${formatHexByte(blue)}`;
  const alphaHex = formatHexByte(alpha * 255);
  return alphaHex === "ff" ? rgbHex : `${rgbHex}${alphaHex}`;
}

export function normalizeHexColor(value: string) {
  const trimmed = value.trim().toLowerCase();

  if (/^#[\da-f]{3}$/i.test(trimmed)) {
    return `#${expandShortHex(trimmed.slice(1))}`;
  }

  if (/^#[\da-f]{4}$/i.test(trimmed)) {
    return `#${expandShortHex(trimmed.slice(1))}`;
  }

  if (/^#[\da-f]{6}$/i.test(trimmed) || /^#[\da-f]{8}$/i.test(trimmed)) {
    return trimmed;
  }

  if (typeof document !== "undefined") {
    const element = document.createElement("span");
    element.style.color = "";
    element.style.color = trimmed;

    if (element.style.color) {
      return rgbaStringToHex(element.style.color);
    }
  }

  return null;
}

export function supportsTerrazzoColor(value: string) {
  try {
    const parsed = parseTerrazzoColor(value);
    return Boolean(parsed?.original?.space);
  } catch {
    return false;
  }
}

export function getUnitOptions(category: Exclude<TokenCategory, "all">, typographyTokenType: TypographyTokenType) {
  if (category === "spacing" || category === "radius" || category === "sizing" || category === "breakpoint") {
    return ["rem", "px"] as const;
  }

  if (category === "motion") {
    return ["ms", "s"] as const;
  }

  if (category === "typography") {
    if (typographyTokenType === "font-size" || typographyTokenType === "letter-spacing") {
      return ["rem", "px"] as const;
    }

    if (typographyTokenType === "custom") {
      return ["raw", "rem", "px"] as const;
    }

    return ["raw"] as const;
  }

  return ["raw"] as const;
}

export function defaultUnitForCategory(category: Exclude<TokenCategory, "all">, typographyTokenType: TypographyTokenType): TokenComposerUnit {
  if (category === "breakpoint") {
    return "px";
  }

  if (category === "spacing" || category === "radius" || category === "sizing") {
    return "rem";
  }

  if (category === "motion") {
    return "ms";
  }

  if (category === "typography") {
    if (typographyTokenType === "font-size" || typographyTokenType === "letter-spacing") {
      return "rem";
    }

    return "raw";
  }

  return "raw";
}

export function getTypographyTokenName(tokenType: TypographyTokenType) {
  switch (tokenType) {
    case "font-family":
      return "--font-family";
    case "font-size":
      return "--font-size";
    case "font-weight":
      return "--font-weight";
    case "line-height":
      return "--line-height";
    case "letter-spacing":
      return "--letter-spacing";
    case "text-shadow":
      return "--text-shadow";
    default:
      return undefined;
  }
}

export function isLengthUnit(value: TokenComposerUnit): value is EditableLengthUnit {
  return value === "px" || value === "rem";
}

export function isDurationUnit(value: TokenComposerUnit): value is EditableDurationUnit {
  return value === "ms" || value === "s";
}
