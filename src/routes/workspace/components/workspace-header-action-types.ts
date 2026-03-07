import type { TokenCategory } from "@/model/tokens/design-tokens";

export type CreateTokenInput = {
  category: Exclude<TokenCategory, "all">;
  name?: string;
  value: string;
};
