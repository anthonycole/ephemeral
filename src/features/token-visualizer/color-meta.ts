import type { TokenRecord } from "@/features/token-visualizer/document";

export type ColorNamingSystem = "scale" | "semantic" | "mixed" | "unknown";

export type ColorTokenMeta = {
  family: string | null;
  step: number | null;
  role: string | null;
  variant: string | null;
  namingSystem: ColorNamingSystem;
  groupKey: string;
};

export type GroupedColorTokens = {
  scales: Array<{
    key: string;
    label: string;
    tokens: TokenRecord[];
  }>;
  semantics: Array<{
    key: string;
    label: string;
    tokens: TokenRecord[];
  }>;
  unclassified: TokenRecord[];
};

export type ColorDisplayMode = "scales" | "colors";

const COLOR_PREFIXES = new Set(["color", "colors", "colour", "colours"]);
const NOISE_SEGMENTS = new Set(["token", "tokens", "theme", "palette"]);
const ROLE_ALIASES: Record<string, string> = {
  bg: "background",
  foreground: "text",
  fg: "text",
  copy: "text",
  bordercolor: "border",
  outline: "border",
  fill: "fill",
  stroke: "stroke",
  icon: "icon",
  brand: "brand",
  accent: "brand",
  primary: "brand",
  secondary: "brand",
  tertiary: "brand",
  info: "status",
  success: "status",
  warning: "status",
  danger: "status",
  destructive: "status",
  error: "status",
  positive: "status",
  negative: "status",
  surface: "surface",
  canvas: "surface",
  layer: "surface",
  base: "surface",
  link: "link"
};
const FAMILY_ALIASES: Record<string, string> = {
  grey: "gray",
  coolgray: "gray",
  warmgray: "stone",
  slategray: "slate"
};
const COLOR_FAMILIES = new Set([
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "gray",
  "slate",
  "zinc",
  "neutral",
  "stone",
  "brown",
  "black",
  "white"
]);
const ROLE_PRIORITY = ["brand", "background", "surface", "text", "border", "fill", "stroke", "icon", "status", "link", "other"];

function titleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function normalizeSegment(segment: string) {
  const lower = segment.toLowerCase().replace(/colour/g, "color");

  if (lower in ROLE_ALIASES) {
    return ROLE_ALIASES[lower];
  }

  if (lower in FAMILY_ALIASES) {
    return FAMILY_ALIASES[lower];
  }

  return lower;
}

function tokenizeName(name: string) {
  return name
    .replace(/^--/, "")
    .toLowerCase()
    .replace(/colour/g, "color")
    .split(/[^a-z0-9]+/g)
    .map(normalizeSegment)
    .filter(Boolean)
    .filter((segment) => !NOISE_SEGMENTS.has(segment));
}

function parseStep(segment: string) {
  if (!/^\d{2,4}$/.test(segment)) {
    return null;
  }

  const value = Number.parseInt(segment, 10);
  return Number.isNaN(value) ? null : value;
}

function findRole(segments: string[]) {
  return segments.find((segment) => segment in ROLE_ALIASES || ROLE_PRIORITY.includes(segment)) ?? null;
}

function findFamily(segments: string[]) {
  return segments.find((segment) => COLOR_FAMILIES.has(segment)) ?? null;
}

function compareTokens(a: TokenRecord, b: TokenRecord) {
  return a.name.localeCompare(b.name) || a.scope.localeCompare(b.scope) || a.originalIndex - b.originalIndex;
}

export function parseColorTokenMeta(token: TokenRecord): ColorTokenMeta {
  const rawSegments = tokenizeName(token.name);
  const segments = rawSegments.filter((segment) => !COLOR_PREFIXES.has(segment));
  const stepSegment = [...segments].reverse().find((segment) => parseStep(segment) !== null) ?? null;
  const step = stepSegment ? parseStep(stepSegment) : null;
  const family = findFamily(segments);
  const role = findRole(segments);
  const variantParts = segments.filter((segment) => segment !== family && segment !== role && parseStep(segment) === null);
  const variant = variantParts.length > 0 ? variantParts.join("-") : null;

  if (family && step !== null && role) {
    return {
      family,
      step,
      role,
      variant,
      namingSystem: "mixed",
      groupKey: role
    };
  }

  if (family) {
    return {
      family,
      step,
      role,
      variant,
      namingSystem: "scale",
      groupKey: family
    };
  }

  if (role) {
    return {
      family,
      step,
      role,
      variant,
      namingSystem: "semantic",
      groupKey: role
    };
  }

  return {
    family: null,
    step: null,
    role: null,
    variant: null,
    namingSystem: "unknown",
    groupKey: "unclassified"
  };
}

export function groupColorTokens(tokens: TokenRecord[]): GroupedColorTokens {
  const scaleGroups = new Map<string, TokenRecord[]>();
  const semanticGroups = new Map<string, TokenRecord[]>();
  const unclassified: TokenRecord[] = [];

  for (const token of tokens) {
    const meta = parseColorTokenMeta(token);

    if (meta.namingSystem === "scale") {
      const group = scaleGroups.get(meta.groupKey) ?? [];
      group.push(token);
      scaleGroups.set(meta.groupKey, group);
      continue;
    }

    if (meta.namingSystem === "semantic" || meta.namingSystem === "mixed") {
      const groupKey = meta.role ?? meta.groupKey;
      const group = semanticGroups.get(groupKey) ?? [];
      group.push(token);
      semanticGroups.set(groupKey, group);
      continue;
    }

    unclassified.push(token);
  }

  const scales = [...scaleGroups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupedTokens]) => ({
      key,
      label: titleCase(key),
      tokens: [...groupedTokens].sort((left, right) => {
        const leftStep = parseColorTokenMeta(left).step ?? Number.MAX_SAFE_INTEGER;
        const rightStep = parseColorTokenMeta(right).step ?? Number.MAX_SAFE_INTEGER;
        return leftStep - rightStep || compareTokens(left, right);
      })
    }));

  const semantics = [...semanticGroups.entries()]
    .sort(([left], [right]) => {
      const leftIndex = ROLE_PRIORITY.indexOf(left);
      const rightIndex = ROLE_PRIORITY.indexOf(right);
      const normalizedLeft = leftIndex === -1 ? ROLE_PRIORITY.length : leftIndex;
      const normalizedRight = rightIndex === -1 ? ROLE_PRIORITY.length : rightIndex;
      return normalizedLeft - normalizedRight || left.localeCompare(right);
    })
    .map(([key, groupedTokens]) => ({
      key,
      label: titleCase(key),
      tokens: [...groupedTokens].sort(compareTokens)
    }));

  return {
    scales,
    semantics,
    unclassified: [...unclassified].sort(compareTokens)
  };
}

export function resolveColorDisplayMode(grouped: GroupedColorTokens): ColorDisplayMode {
  const scaleCount = grouped.scales.reduce((total, group) => total + group.tokens.length, 0);
  const colorCount = grouped.semantics.reduce((total, group) => total + group.tokens.length, 0) + grouped.unclassified.length;

  if (scaleCount > 0 && scaleCount >= colorCount) {
    return "scales";
  }

  return "colors";
}
