import type { TokenRecord } from "@/features/token-visualizer/document";

export type TokenIdentity = {
  name: string;
  scope: string;
  atRules: string[];
};

export type TokenIdentityKey = string;

export function createTokenIdentity(token: Pick<TokenRecord, "name" | "scope" | "atRules">): TokenIdentity {
  return {
    name: token.name,
    scope: token.scope,
    atRules: token.atRules
  };
}

export function createTokenIdentityKey(identity: TokenIdentity): TokenIdentityKey {
  return `${identity.atRules.join("||")}::${identity.scope}::${identity.name}`;
}

export function createTokenIdentityKeyFromToken(token: Pick<TokenRecord, "name" | "scope" | "atRules">): TokenIdentityKey {
  return createTokenIdentityKey(createTokenIdentity(token));
}
