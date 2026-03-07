import type { ReactNode } from "react";
import type { TokenCategory } from "@/model/tokens/design-tokens";
import type { TokenRecord } from "@/model/tokens/document";
import type { ImportedGoogleFont } from "@/model/tokens/font-utils";
import type { CategoryDefinition, CategoryIcon, CategoryIconProps } from "@/routes/workspace/types";
import {
  BreakpointCanvas,
  ColorCanvas,
  GenericCanvas,
  MotionCanvas,
  OpacityCanvas,
  RadiusCanvas,
  ShadowCanvas,
  SizingCanvas,
  SpacingCanvas,
  TypographyCanvas,
  ZIndexCanvas
} from "@/routes/workspace/components/canvases";

type CanvasRenderOptions = {
  virtualize?: boolean;
  importedGoogleFonts?: ImportedGoogleFont[];
  onImportGoogleFont?: (family: string) => void;
  onRemoveGoogleFont?: (family: string) => void;
};

type CanvasRenderer = (tokens: TokenRecord[], onSelect: (name: string) => void, options?: CanvasRenderOptions) => ReactNode;

type CategoryConfig = CategoryDefinition & {
  render: CanvasRenderer;
  supportsVirtualizedCanvas?: boolean;
};

function BaseIcon({ size = 14, children, ...props }: CategoryIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const ShapesIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <circle cx="7" cy="7" r="3" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <path d="M6 17h5v5H6z" />
    <path d="m17 14 3 5h-6l3-5Z" />
  </BaseIcon>
);

const PaletteIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M12 4a8 8 0 1 0 0 16h1.2a1.8 1.8 0 0 0 0-3.6h-.6A2.6 2.6 0 0 1 10 13.8 2.8 2.8 0 0 1 12.8 11H16a4 4 0 0 0 0-8h-4Z" />
    <circle cx="7.5" cy="10" r="1" />
    <circle cx="10.5" cy="7.5" r="1" />
    <circle cx="14.5" cy="7.5" r="1" />
  </BaseIcon>
);

const SpacingIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M4 12h16" />
    <path d="m7 9-3 3 3 3" />
    <path d="m17 9 3 3-3 3" />
    <rect x="9" y="8" width="6" height="8" rx="1" />
  </BaseIcon>
);

const TextIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M5 6h14" />
    <path d="M12 6v12" />
    <path d="M8 18h8" />
  </BaseIcon>
);

const RadiusIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M6 18V8a2 2 0 0 1 2-2h10" />
    <path d="M6 18h12" />
    <path d="M6 12h6" />
  </BaseIcon>
);

const ShadowIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <rect x="6" y="5" width="10" height="10" rx="2" />
    <path d="M10 19h8" />
    <path d="M15 15v4" />
  </BaseIcon>
);

const SizingIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <rect x="5" y="6" width="14" height="12" rx="2" />
    <path d="M8 9h8" />
    <path d="M8 15h5" />
  </BaseIcon>
);

const MotionIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M3 14c3 0 3-6 6-6s3 8 6 8 3-4 6-4" />
  </BaseIcon>
);

const StackIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <path d="m12 4 7 4-7 4-7-4 7-4Z" />
    <path d="m5 12 7 4 7-4" />
    <path d="m5 16 7 4 7-4" />
  </BaseIcon>
);

const OpacityIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M12 4a8 8 0 1 0 0 16V4Z" />
    <path d="M12 4a8 8 0 0 1 0 16" />
  </BaseIcon>
);

const DevicesIcon: CategoryIcon = (props) => (
  <BaseIcon {...props}>
    <rect x="4" y="6" width="10" height="8" rx="1.5" />
    <rect x="16" y="8" width="4" height="10" rx="1" />
    <path d="M7 18h4" />
  </BaseIcon>
);

export const ALL_CATEGORY_ICON = ShapesIcon;

export const CATEGORY_DEFINITIONS: CategoryConfig[] = [
  { key: "color", label: "Color", Icon: PaletteIcon, render: (tokens, onSelect, options) => <ColorCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true },
  { key: "spacing", label: "Spacing", Icon: SpacingIcon, render: (tokens, onSelect, options) => <SpacingCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true },
  {
    key: "typography",
    label: "Typography",
    Icon: TextIcon,
    render: (tokens, onSelect, options) => (
      <TypographyCanvas
        tokens={tokens}
        onSelect={onSelect}
        virtualize={options?.virtualize}
        importedGoogleFonts={options?.importedGoogleFonts ?? []}
        onImportGoogleFont={options?.onImportGoogleFont}
        onRemoveGoogleFont={options?.onRemoveGoogleFont}
      />
    ),
    supportsVirtualizedCanvas: true
  },
  { key: "radius", label: "Radius", Icon: RadiusIcon, render: (tokens, onSelect) => <RadiusCanvas tokens={tokens} onSelect={onSelect} /> },
  { key: "shadow", label: "Shadow", Icon: ShadowIcon, render: (tokens, onSelect, options) => <ShadowCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true },
  { key: "sizing", label: "Sizing", Icon: SizingIcon, render: (tokens, onSelect, options) => <SizingCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true },
  { key: "motion", label: "Motion", Icon: MotionIcon, render: (tokens, onSelect, options) => <MotionCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true },
  { key: "z-index", label: "Z Index", Icon: StackIcon, render: (tokens, onSelect, options) => <ZIndexCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true },
  { key: "opacity", label: "Opacity", Icon: OpacityIcon, render: (tokens, onSelect, options) => <OpacityCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true },
  { key: "breakpoint", label: "Breakpoint", Icon: DevicesIcon, render: (tokens, onSelect, options) => <BreakpointCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true },
  { key: "other", label: "Other", Icon: ShapesIcon, render: (tokens, onSelect, options) => <GenericCanvas tokens={tokens} onSelect={onSelect} virtualize={options?.virtualize} />, supportsVirtualizedCanvas: true }
];

export function getCategoryDefinition(category: Exclude<TokenCategory, "all">) {
  return CATEGORY_DEFINITIONS.find((definition) => definition.key === category)!;
}
