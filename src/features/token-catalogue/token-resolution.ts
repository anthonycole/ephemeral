import { TOKEN_CATEGORIES, type TokenCategory } from "@/lib/design-tokens";
import type { DiffStatus, TokenDocument, TokenOrigin, TokenRecord } from "@/features/token-visualizer/document";
import { createTokenIdentity, createTokenIdentityKeyFromToken, type TokenIdentity, type TokenIdentityKey } from "@/features/token-catalogue/token-identity";
import type { WorkspaceMeta } from "@/features/token-catalogue/workspace-meta";

export type { DiffStatus, TokenOrigin } from "@/features/token-visualizer/document";

export type ResolvedToken = {
  identity: TokenIdentity;
  identityKey: TokenIdentityKey;
  category: Exclude<TokenCategory, "all">;
  effectiveValue: string;
  authoredValue: string | null;
  baselineValue: string | null;
  origin: TokenOrigin;
  status: DiffStatus;
  authoredToken: TokenRecord | null;
  baselineToken: TokenRecord | null;
};

export type ResolvedTheme = {
  authored: TokenDocument;
  baseline: TokenDocument | null;
  meta: WorkspaceMeta;
  tokens: ResolvedToken[];
  byKey: Map<TokenIdentityKey, ResolvedToken>;
};

export type DiffIndex = {
  tokens: ResolvedToken[];
  countsByStatus: Record<DiffStatus, number>;
  countsByCategory: Record<Exclude<TokenCategory, "all">, Record<DiffStatus, number>>;
};

function emptyStatusCounts(): Record<DiffStatus, number> {
  return {
    unchanged: 0,
    overridden: 0,
    "authored-only": 0,
    "baseline-only": 0,
    conflict: 0
  };
}

function emptyCategoryCounts() {
  return Object.fromEntries(
    TOKEN_CATEGORIES.filter((category): category is Exclude<TokenCategory, "all"> => category !== "all").map((category) => [category, emptyStatusCounts()])
  ) as Record<Exclude<TokenCategory, "all">, Record<DiffStatus, number>>;
}

function categoryForResolved(authoredToken: TokenRecord | null, baselineToken: TokenRecord | null): Exclude<TokenCategory, "all"> {
  return authoredToken?.category ?? baselineToken?.category ?? "other";
}

function compareResolvedTokens(a: ResolvedToken, b: ResolvedToken) {
  const categoryCompare = a.category.localeCompare(b.category);

  if (categoryCompare !== 0) {
    return categoryCompare;
  }

  const nameCompare = a.identity.name.localeCompare(b.identity.name);

  if (nameCompare !== 0) {
    return nameCompare;
  }

  const scopeCompare = a.identity.scope.localeCompare(b.identity.scope);

  if (scopeCompare !== 0) {
    return scopeCompare;
  }

  const atRuleCompare = a.identity.atRules.join("||").localeCompare(b.identity.atRules.join("||"));

  if (atRuleCompare !== 0) {
    return atRuleCompare;
  }

  const authoredIndexCompare = (a.authoredToken?.originalIndex ?? Number.MAX_SAFE_INTEGER) - (b.authoredToken?.originalIndex ?? Number.MAX_SAFE_INTEGER);

  if (authoredIndexCompare !== 0) {
    return authoredIndexCompare;
  }

  return (a.baselineToken?.originalIndex ?? Number.MAX_SAFE_INTEGER) - (b.baselineToken?.originalIndex ?? Number.MAX_SAFE_INTEGER);
}

export function createEffectiveTokenRecord(resolvedToken: ResolvedToken, index: number): TokenRecord {
  const sourceToken = resolvedToken.authoredToken ?? resolvedToken.baselineToken;

  return {
    name: resolvedToken.identity.name,
    value: resolvedToken.effectiveValue,
    category: resolvedToken.category,
    scope: resolvedToken.identity.scope,
    atRules: resolvedToken.identity.atRules,
    id: sourceToken?.id ?? `${resolvedToken.identityKey}-${index}`,
    sourceId: sourceToken?.sourceId ?? resolvedToken.identityKey,
    originalIndex: sourceToken?.originalIndex ?? index,
    origin: resolvedToken.origin,
    status: resolvedToken.status,
    readOnly: resolvedToken.origin !== "authored",
    authoredValue: resolvedToken.authoredValue,
    baselineValue: resolvedToken.baselineValue
  };
}

export function resolveTheme({
  authored,
  baseline,
  meta
}: {
  authored: TokenDocument;
  baseline: TokenDocument | null;
  meta: WorkspaceMeta;
}): ResolvedTheme {
  const authoredByKey = new Map(authored.tokens.map((token) => [createTokenIdentityKeyFromToken(token), token]));
  const baselineByKey = new Map((baseline?.tokens ?? []).map((token) => [createTokenIdentityKeyFromToken(token), token]));
  const keys = new Set([...authoredByKey.keys(), ...baselineByKey.keys()]);
  const tokens = [...keys]
    .map<ResolvedToken>((key) => {
      const authoredToken = authoredByKey.get(key) ?? null;
      const baselineToken = baselineByKey.get(key) ?? null;
      const identity = createTokenIdentity(authoredToken ?? baselineToken!);
      const category = categoryForResolved(authoredToken, baselineToken);

      if (authoredToken && baselineToken) {
        if (authoredToken.value === baselineToken.value) {
          return {
            identity,
            identityKey: key,
            category,
            effectiveValue: authoredToken.value,
            authoredValue: authoredToken.value,
            baselineValue: baselineToken.value,
            origin: "authored",
            status: "unchanged",
            authoredToken,
            baselineToken
          };
        }

        return {
          identity,
          identityKey: key,
          category,
          effectiveValue: authoredToken.value,
          authoredValue: authoredToken.value,
          baselineValue: baselineToken.value,
          origin: "authored",
          status: "overridden",
          authoredToken,
          baselineToken
        };
      }

      if (authoredToken) {
        return {
          identity,
          identityKey: key,
          category,
          effectiveValue: authoredToken.value,
          authoredValue: authoredToken.value,
          baselineValue: null,
          origin: "authored",
          status: "authored-only",
          authoredToken,
          baselineToken: null
        };
      }

      return {
        identity,
        identityKey: key,
        category,
        effectiveValue: baselineToken?.value ?? "",
        authoredValue: null,
        baselineValue: baselineToken?.value ?? null,
        origin: meta.hydrationMode === "inherit" ? "inherited" : "baseline",
        status: "baseline-only",
        authoredToken: null,
        baselineToken
      };
    })
    .sort(compareResolvedTokens);

  return {
    authored,
    baseline,
    meta,
    tokens,
    byKey: new Map(tokens.map((token) => [token.identityKey, token]))
  };
}

export function buildDiffIndex(resolvedTheme: ResolvedTheme): DiffIndex {
  const countsByStatus = emptyStatusCounts();
  const countsByCategory = emptyCategoryCounts();

  for (const token of resolvedTheme.tokens) {
    countsByStatus[token.status] += 1;
    countsByCategory[token.category][token.status] += 1;
  }

  return {
    tokens: resolvedTheme.tokens,
    countsByStatus,
    countsByCategory
  };
}
