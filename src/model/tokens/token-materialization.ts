import type { ParsedScopeBlock } from "@/model/tokens/design-tokens";
import { normalizeTokenDocument, serializeDocumentToCss, type TokenDocument } from "@/model/tokens/document";
import type { ResolvedTheme } from "@/model/tokens/token-resolution";
import { createEffectiveTokenRecord } from "@/model/tokens/token-resolution";

function blockKey(block: ParsedScopeBlock) {
  return `${block.atRules.join("||")}::${block.scope}`;
}

function mergeBlockOrder(authored: TokenDocument, baseline: TokenDocument | null) {
  const merged: ParsedScopeBlock[] = [];
  const seen = new Set<string>();

  for (const block of authored.blockOrder) {
    const key = blockKey(block);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(block);
  }

  for (const block of baseline?.blockOrder ?? []) {
    const key = blockKey(block);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(block);
  }

  return merged;
}

export function materializeResolvedTheme(resolvedTheme: ResolvedTheme): TokenDocument {
  const tokens = resolvedTheme.tokens.map((token, index) => createEffectiveTokenRecord(token, index));
  const directives =
    resolvedTheme.authored.directives.length > 0 ? resolvedTheme.authored.directives : (resolvedTheme.baseline?.directives ?? []);

  return normalizeTokenDocument({
    importedCss: "",
    directives,
    blockOrder: mergeBlockOrder(resolvedTheme.authored, resolvedTheme.baseline),
    tokens
  });
}

export function createHydratedDocumentFromBaseline(baseline: TokenDocument): TokenDocument {
  return normalizeTokenDocument(baseline);
}

export function materializeResolvedCss(resolvedTheme: ResolvedTheme) {
  return serializeDocumentToCss(materializeResolvedTheme(resolvedTheme));
}
