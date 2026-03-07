import type { TokenCategory } from "@/model/tokens/design-tokens";

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
  color: "Palette tokens shown as reference swatches for contrast and brand balance checks.",
  spacing: "Layout spacing primitives rendered as quick measurement previews.",
  typography: "Type scale and weight decisions shown in representative preview copy.",
  radius: "Corner treatments previewed across cards, tiles, and interactive surfaces.",
  shadow: "Elevation tokens shown as surface studies rather than production components.",
  sizing: "Reusable size primitives for icons, containers, and layout constraints.",
  motion: "Timing tokens represented as simple motion studies for feel and pacing.",
  "z-index": "Layering tokens previewed for overlays, popovers, and compositional depth.",
  opacity: "Transparency utilities displayed as compositing checks.",
  breakpoint: "Responsive thresholds presented as width references for layout planning.",
  other: "Reference tokens that still inform the preview, even without a richer visual."
};

export function isTokenCategoryFilter(value: string | null | undefined): value is TokenCategoryFilter {
  return value === "all" || tokenCategoryDefinitions.some((definition) => definition.key === value);
}
