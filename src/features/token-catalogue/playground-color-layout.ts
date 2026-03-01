import type { TokenRecord } from "@/features/token-visualizer/document";

export type PlaygroundColorMode = "scale" | "semantic-grid" | "mixed" | "minimal";

export type ColorScaleFamily = {
  family: string;
  label: string;
  steps: Array<{ step: number; token: TokenRecord }>;
  coverage: number;
};

export type SemanticColorToken = {
  role: string;
  label: string;
  token: TokenRecord;
};

export type PlaygroundColorLayout = {
  mode: PlaygroundColorMode;
  scaleFamilies: ColorScaleFamily[];
  semanticTokens: SemanticColorToken[];
  looseTokens: TokenRecord[];
};

const COLOR_SCALE_REGEX = /^--color-(.+)-(\d{2,3})$/i;
const COLOR_SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SEMANTIC_ROLE_PATTERNS = [
  { role: "background", label: "Background", patterns: [["background"], ["canvas"], ["base"]] },
  { role: "surface", label: "Surface", patterns: [["surface"], ["panel"], ["card"]] },
  { role: "foreground", label: "Foreground", patterns: [["foreground"], ["text"], ["content"], ["ink"]] },
  { role: "muted", label: "Muted", patterns: [["muted"], ["subtle"]] },
  { role: "border", label: "Border", patterns: [["border"], ["outline"], ["line"]] },
  { role: "accent", label: "Accent", patterns: [["accent"], ["brand"], ["primary"]] },
  { role: "accent-strong", label: "Accent Strong", patterns: [["accent", "strong"], ["primary", "strong"], ["brand", "strong"]] },
  { role: "secondary", label: "Secondary", patterns: [["secondary"]] },
  { role: "success", label: "Success", patterns: [["success"]] },
  { role: "warning", label: "Warning", patterns: [["warning"]] },
  { role: "danger", label: "Danger", patterns: [["danger"], ["error"], ["destructive"]] }
] as const;

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function formatFamilyLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isDisplayColorToken(token: TokenRecord) {
  const name = normalizeName(token.name);
  return token.category === "color" && !name.includes("shadow") && !name.includes("elevation");
}

function getColorScaleEntry(token: TokenRecord) {
  const match = token.name.match(COLOR_SCALE_REGEX);

  if (!match) {
    return null;
  }

  const step = Number.parseInt(match[2], 10);

  if (!COLOR_SCALE_STEPS.includes(step)) {
    return null;
  }

  return {
    family: match[1],
    step
  };
}

function chooseMode(scaleFamilies: ColorScaleFamily[], semanticTokens: SemanticColorToken[], colorTokens: TokenRecord[]): PlaygroundColorMode {
  const strongFamilies = scaleFamilies.filter((family) => family.coverage >= 4);
  const usableFamilies = scaleFamilies.filter((family) => family.coverage >= 3);

  if (strongFamilies.length > 0 || usableFamilies.length >= 2) {
    return semanticTokens.length >= 3 && usableFamilies.length > 0 && strongFamilies.length === 0 ? "mixed" : "scale";
  }

  if (usableFamilies.length > 0 && semanticTokens.length >= 3) {
    return "mixed";
  }

  if (semanticTokens.length >= 3) {
    return "semantic-grid";
  }

  return colorTokens.length < 3 ? "minimal" : "semantic-grid";
}

export function analyzePlaygroundColorLayout(tokens: TokenRecord[]): PlaygroundColorLayout {
  const colorTokens = tokens.filter(isDisplayColorToken);
  const familyMap = new Map<string, Map<number, TokenRecord>>();
  const scaleKeys = new Set<string>();

  for (const token of colorTokens) {
    const entry = getColorScaleEntry(token);

    if (!entry) {
      continue;
    }

    const family = familyMap.get(entry.family) ?? new Map<number, TokenRecord>();
    family.set(entry.step, token);
    familyMap.set(entry.family, family);
    scaleKeys.add(token.sourceId);
  }

  const scaleFamilies = [...familyMap.entries()]
    .map(([family, steps]) => ({
      family,
      label: formatFamilyLabel(family),
      steps: COLOR_SCALE_STEPS.map((step) => {
        const token = steps.get(step);
        return token ? { step, token } : null;
      }).filter((entry): entry is { step: number; token: TokenRecord } => entry !== null),
      coverage: steps.size
    }))
    .sort((a, b) => (b.coverage === a.coverage ? a.family.localeCompare(b.family) : b.coverage - a.coverage));

  const usedSemanticKeys = new Set<string>();
  const semanticTokens: SemanticColorToken[] = [];

  for (const definition of SEMANTIC_ROLE_PATTERNS) {
    const match = colorTokens.find((token) => {
      if (scaleKeys.has(token.sourceId) || usedSemanticKeys.has(token.sourceId)) {
        return false;
      }

      const name = normalizeName(token.name);
      return definition.patterns.some((parts) => parts.every((part) => name.includes(part)));
    });

    if (!match) {
      continue;
    }

    usedSemanticKeys.add(match.sourceId);
    semanticTokens.push({
      role: definition.role,
      label: definition.label,
      token: match
    });
  }

  const mode = chooseMode(scaleFamilies, semanticTokens, colorTokens);
  const visibleScaleFamilies =
    mode === "mixed" ? scaleFamilies.filter((family) => family.coverage >= 3).slice(0, 2) : mode === "scale" ? scaleFamilies.filter((family) => family.coverage >= 3) : [];
  const visibleScaleKeys = new Set(visibleScaleFamilies.flatMap((family) => family.steps.map((entry) => entry.token.sourceId)));
  const looseTokens = colorTokens.filter((token) => !visibleScaleKeys.has(token.sourceId) && !usedSemanticKeys.has(token.sourceId));

  return {
    mode,
    scaleFamilies: visibleScaleFamilies,
    semanticTokens,
    looseTokens
  };
}
