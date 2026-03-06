import type { TokenCategory } from "@/lib/design-tokens";

export type CreateTokenInput = {
  category: Exclude<TokenCategory, "all">;
  name?: string;
  value: string;
};
