import type { TokenCategory } from "@/lib/design-tokens";

export type TokenCategoryKey = Exclude<TokenCategory, "all">;
export type TokenCategoryFilter = TokenCategoryKey | "all";

export const tokenCategoryDefinitions: Array<{ key: TokenCategoryKey; label: string }> = [
  { key: "color", label: "Color" },
  { key: "spacing", label: "Spacing" },
  { key: "typography", label: "Typography" },
  { key: "radius", label: "Radius" },
  { key: "shadow", label: "Shadow" },
  { key: "sizing", label: "Sizing" },
  { key: "motion", label: "Motion" },
  { key: "z-index", label: "Z Index" },
  { key: "opacity", label: "Opacity" },
  { key: "breakpoint", label: "Breakpoint" },
  { key: "other", label: "Other" }
];

export const tokenCategoryDescriptions: Record<TokenCategoryKey, string> = {
  color: "Core brand, surface, and content colors as direct reference swatches.",
  spacing: "Layout spacing primitives rendered as simple measurable bars.",
  typography: "Type scale and weight decisions presented as display-ready samples.",
  radius: "Corner treatments used by components, tiles, and interactive surfaces.",
  shadow: "Elevation tokens shown as static, package-friendly surface previews.",
  sizing: "Reusable size primitives for icons, containers, and layout constraints.",
  motion: "Duration tokens represented as slim animation timings rather than controls.",
  "z-index": "Layering tokens for overlays, popovers, and compositional depth.",
  opacity: "Transparency utilities displayed as compositing examples.",
  breakpoint: "Responsive thresholds presented as widths for docs and Storybook.",
  other: "Reference tokens that still belong in a package, even without a richer visual."
};

export function isTokenCategoryFilter(value: string | null | undefined): value is TokenCategoryFilter {
  return value === "all" || tokenCategoryDefinitions.some((definition) => definition.key === value);
}
