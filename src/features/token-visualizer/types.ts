import type { ReactElement, SVGProps } from "react";
import type { TokenCategory } from "@/lib/design-tokens";
import type { TokenRecord } from "@/features/token-visualizer/document";

export type TokenGroups = Record<Exclude<TokenCategory, "all">, TokenRecord[]>;
export type TokenCounts = Record<TokenCategory, number>;

export type CategoryIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type CategoryIcon = (props: CategoryIconProps) => ReactElement;

export type CategoryDefinition = {
  key: Exclude<TokenCategory, "all">;
  label: string;
  Icon: CategoryIcon;
};
