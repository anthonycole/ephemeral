import type { TokenCategory } from "@/model/tokens/design-tokens";
import type { TokenRecord } from "@/model/tokens/document";
import type { TokenGroups } from "@/routes/workspace/types";

export type EditableLengthUnit = "px" | "rem";
export type EditableDurationUnit = "ms" | "s";

const ROOT_FONT_SIZE_PX = 16;
const LENGTH_VALUE_REGEX = /^(-?\d*\.?\d+)(px|rem)?$/i;
const DURATION_VALUE_REGEX = /^(-?\d*\.?\d+)(ms|s)?$/i;

export function createEmptyGroups(): TokenGroups {
  return {
    color: [],
    spacing: [],
    typography: [],
    radius: [],
    shadow: [],
    sizing: [],
    motion: [],
    "z-index": [],
    opacity: [],
    breakpoint: [],
    other: []
  };
}

export function groupTokens(tokens: TokenRecord[]) {
  return tokens.reduce<TokenGroups>((acc, token) => {
    acc[token.category].push(token);
    return acc;
  }, createEmptyGroups());
}

export function tokenValueForWidth(value: string) {
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) {
    return "40%";
  }

  const pxApprox = value.endsWith("rem") ? numeric * 16 : numeric;
  const clamped = Math.max(16, Math.min(220, pxApprox));
  return `${(clamped / 220) * 100}%`;
}

export function numericValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function toMilliseconds(value: string) {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  if (value.trim().endsWith("s")) {
    return parsed * 1000;
  }

  return parsed;
}

export function categoryLabel(category: TokenCategory) {
  return category === "z-index" ? "Z Index" : category[0].toUpperCase() + category.slice(1);
}

export function isDefaultScope(scope: string) {
  const normalized = scope.replace(/\s+/g, " ").trim().toLowerCase();
  return normalized === ":root" || normalized === ":host" || normalized === ":root, :host" || normalized === ":host, :root";
}

export function formatScopeLabel(scope: string) {
  return isDefaultScope(scope) ? "Global" : scope;
}

function isTypographyLengthToken(token: TokenRecord) {
  return token.category === "typography" && /(size|line-height|letter-spacing|tracking)/.test(token.name.toLowerCase());
}

export function parseEditableLength(value: string) {
  const match = value.trim().match(LENGTH_VALUE_REGEX);

  if (!match) {
    return null;
  }

  const amount = Number.parseFloat(match[1]);

  if (Number.isNaN(amount)) {
    return null;
  }

  return {
    amount,
    unit: (match[2]?.toLowerCase() as EditableLengthUnit | undefined) ?? null
  };
}

export function parseEditableDuration(value: string) {
  const match = value.trim().match(DURATION_VALUE_REGEX);

  if (!match) {
    return null;
  }

  const amount = Number.parseFloat(match[1]);

  if (Number.isNaN(amount)) {
    return null;
  }

  return {
    amount,
    unit: (match[2]?.toLowerCase() as EditableDurationUnit | undefined) ?? null
  };
}

export function tokenSupportsLengthUnit(token: TokenRecord) {
  const parsed = parseEditableLength(token.value);

  if (!parsed) {
    return false;
  }

  if (parsed.unit === "px" || parsed.unit === "rem") {
    return true;
  }

  return token.category === "spacing" || token.category === "radius" || token.category === "sizing" || token.category === "breakpoint" || isTypographyLengthToken(token);
}

export function preferredLengthUnit(token: TokenRecord): EditableLengthUnit {
  const parsed = parseEditableLength(token.value);

  if (parsed?.unit === "px" || parsed?.unit === "rem") {
    return parsed.unit;
  }

  return token.category === "breakpoint" ? "px" : "rem";
}

export function tokenSupportsDurationUnit(token: TokenRecord) {
  const parsed = parseEditableDuration(token.value);

  if (!parsed) {
    return false;
  }

  if (parsed.unit === "ms" || parsed.unit === "s") {
    return true;
  }

  return token.category === "motion";
}

export function preferredDurationUnit(token: TokenRecord): EditableDurationUnit {
  const parsed = parseEditableDuration(token.value);

  if (parsed?.unit === "ms" || parsed?.unit === "s") {
    return parsed.unit;
  }

  return "ms";
}

function formatLengthAmount(value: number) {
  if (Number.isInteger(value)) {
    return `${value}`;
  }

  return value.toFixed(4).replace(/\.?0+$/, "");
}

function formatUnitAmount(value: number) {
  if (Number.isInteger(value)) {
    return `${value}`;
  }

  return value.toFixed(4).replace(/\.?0+$/, "");
}

export function convertLengthUnit(amount: number, fromUnit: EditableLengthUnit, toUnit: EditableLengthUnit) {
  if (fromUnit === toUnit) {
    return amount;
  }

  return fromUnit === "rem" ? amount * ROOT_FONT_SIZE_PX : amount / ROOT_FONT_SIZE_PX;
}

export function formatLengthValue(amount: number, unit: EditableLengthUnit) {
  return `${formatLengthAmount(amount)}${unit}`;
}

export function convertDurationUnit(amount: number, fromUnit: EditableDurationUnit, toUnit: EditableDurationUnit) {
  if (fromUnit === toUnit) {
    return amount;
  }

  return fromUnit === "s" ? amount * 1000 : amount / 1000;
}

export function formatDurationValue(amount: number, unit: EditableDurationUnit) {
  return `${formatUnitAmount(amount)}${unit}`;
}
