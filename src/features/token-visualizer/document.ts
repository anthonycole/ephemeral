import { parseCssDocument } from "@/lib/design-tokens";
import type { ParsedScopeBlock, ParsedToken, TokenCategory } from "@/lib/design-tokens";

export type TokenRecord = ParsedToken & {
  id: string;
  sourceId: string;
  originalIndex: number;
};

export type TokenDocument = {
  importedCss: string;
  directives: string[];
  blockOrder: ParsedScopeBlock[];
  tokens: TokenRecord[];
};

function sanitizeScope(scope: string) {
  const withoutComments = scope.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
  return withoutComments || ":root";
}

function createTokenId(token: ParsedToken, index: number) {
  return `${(token.atRules ?? []).join("||")}::${token.scope}::${token.name}-${index}`;
}

function createTokenImportKey(token: Pick<ParsedToken, "name" | "scope" | "atRules">) {
  return `${(token.atRules ?? []).join("||")}::${token.scope}::${token.name}`;
}

function createSourceId() {
  return globalThis.crypto?.randomUUID?.() ?? `token-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTokenRecord(token: Partial<TokenRecord>, index: number): TokenRecord {
  const scope = sanitizeScope(token.scope ?? ":root");
  const atRules = Array.isArray(token.atRules) ? token.atRules : [];
  const normalizedToken: TokenRecord = {
    name: token.name ?? `--token-${index}`,
    value: token.value ?? "",
    category: token.category ?? "other",
    scope,
    atRules,
    id: token.id ?? createTokenId({ name: token.name ?? `--token-${index}`, value: token.value ?? "", category: token.category ?? "other", scope, atRules }, index),
    sourceId: token.sourceId ?? createSourceId(),
    originalIndex: typeof token.originalIndex === "number" ? token.originalIndex : index
  };

  return normalizedToken;
}

export function normalizeTokenDocument(document: Partial<TokenDocument>): TokenDocument {
  const tokens = Array.isArray(document.tokens) ? document.tokens.map((token, index) => normalizeTokenRecord(token, index)) : [];
  const blockOrder = Array.isArray(document.blockOrder)
    ? document.blockOrder.map((block) => ({
        scope: sanitizeScope(block.scope ?? ":root"),
        atRules: Array.isArray(block.atRules) ? block.atRules : []
      }))
    : [];

  return {
    importedCss: document.importedCss ?? "",
    directives: Array.isArray(document.directives) ? document.directives : [],
    blockOrder,
    tokens
  };
}

export function importCssDocument(rawCss: string, existingDocument?: Partial<TokenDocument>): TokenDocument {
  const parsedDocument = parseCssDocument(rawCss);
  const existingTokens = Array.isArray(existingDocument?.tokens) ? existingDocument.tokens.map((token, index) => normalizeTokenRecord(token, index)) : [];
  const existingSourceIdsByKey = new Map<string, string[]>();

  for (const token of existingTokens) {
    const key = createTokenImportKey(token);
    const matchingSourceIds = existingSourceIdsByKey.get(key) ?? [];
    matchingSourceIds.push(token.sourceId);
    existingSourceIdsByKey.set(key, matchingSourceIds);
  }

  return {
    importedCss: rawCss,
    directives: parsedDocument.directives,
    blockOrder: parsedDocument.blockOrder,
    tokens: parsedDocument.tokens.map((token, index) => ({
      ...token,
      id: createTokenId(token, index),
      sourceId: existingSourceIdsByKey.get(createTokenImportKey(token))?.shift() ?? createSourceId(),
      originalIndex: index
    }))
  };
}

export function serializeDocumentToCss(document: TokenDocument) {
  const normalizedDocument = normalizeTokenDocument(document);
  const sortedTokens = [...normalizedDocument.tokens].sort((a, b) => a.originalIndex - b.originalIndex);
  const tokensByBlock = new Map<string, TokenRecord[]>();

  function blockKey(scope: string, atRules: string[]) {
    return `${atRules.join("||")}::${scope}`;
  }

  function indent(value: string) {
    return value
      .split("\n")
      .map((line) => (line.length > 0 ? `  ${line}` : line))
      .join("\n");
  }

  for (const token of sortedTokens) {
    const key = blockKey(token.scope, token.atRules);
    const scopedTokens = tokensByBlock.get(key) ?? [];
    scopedTokens.push(token);
    tokensByBlock.set(key, scopedTokens);
  }

  const orderedBlocks = normalizedDocument.blockOrder.filter((block) => tokensByBlock.has(blockKey(block.scope, block.atRules)));

  for (const token of sortedTokens) {
    const key = blockKey(token.scope, token.atRules);

    if (!orderedBlocks.some((block) => blockKey(block.scope, block.atRules) === key)) {
      orderedBlocks.push({ scope: token.scope, atRules: token.atRules });
    }
  }

  const blocks = orderedBlocks.map((block) => {
    const scopedTokens = tokensByBlock.get(blockKey(block.scope, block.atRules)) ?? [];
    const lines = scopedTokens.map((token) => `  ${token.name}: ${token.value};`);
    let content = [block.scope + " {", ...lines, "}"].join("\n");

    for (let index = block.atRules.length - 1; index >= 0; index -= 1) {
      content = [block.atRules[index] + " {", indent(content), "}"].join("\n");
    }

    return content;
  });

  return [...normalizedDocument.directives, ...(normalizedDocument.directives.length > 0 && blocks.length > 0 ? [""] : []), ...blocks].join("\n\n");
}

export function updateDocumentToken(
  document: TokenDocument,
  tokenId: string,
  updates: Partial<Pick<TokenRecord, "name" | "value" | "category">>
): TokenDocument {
  const normalizedDocument = normalizeTokenDocument(document);
  return {
    ...normalizedDocument,
    tokens: normalizedDocument.tokens.map((token) => (token.sourceId === tokenId || token.id === tokenId ? { ...token, ...updates } : token))
  };
}

export function addDocumentToken(
  document: TokenDocument,
  token?: Partial<Pick<TokenRecord, "name" | "value" | "category" | "scope" | "atRules">>
) {
  const normalizedDocument = normalizeTokenDocument(document);
  const existingNames = new Set(normalizedDocument.tokens.map((entry) => entry.name.toLowerCase()));
  const categoryKey = token?.category && token.category !== "other" ? token.category : "token";
  let tokenNumber = normalizedDocument.tokens.length + 1;
  let defaultName = `--${categoryKey}-${tokenNumber}`;

  while (existingNames.has(defaultName.toLowerCase())) {
    tokenNumber += 1;
    defaultName = `--${categoryKey}-${tokenNumber}`;
  }

  const scope = sanitizeScope(token?.scope ?? ":root");
  const atRules = Array.isArray(token?.atRules) ? token.atRules : [];
  const originalIndex = normalizedDocument.tokens.length === 0 ? 0 : Math.max(...normalizedDocument.tokens.map((entry) => entry.originalIndex)) + 1;
  const createdToken = normalizeTokenRecord(
    {
      name: token?.name ?? defaultName,
      value: token?.value ?? "initial",
      category: token?.category ?? "other",
      scope,
      atRules,
      originalIndex
    },
    originalIndex
  );
  const blockExists = normalizedDocument.blockOrder.some((block) => block.scope === scope && JSON.stringify(block.atRules) === JSON.stringify(atRules));

  return {
    document: {
      ...normalizedDocument,
      blockOrder: blockExists ? normalizedDocument.blockOrder : [...normalizedDocument.blockOrder, { scope, atRules }],
      tokens: [...normalizedDocument.tokens, createdToken]
    },
    token: createdToken
  };
}

export function findTokenById(document: TokenDocument, tokenId: string | null) {
  if (!tokenId) {
    return null;
  }

  return normalizeTokenDocument(document).tokens.find((token) => token.sourceId === tokenId || token.id === tokenId) ?? null;
}

export function normalizeCategory(value: string): Exclude<TokenCategory, "all"> {
  return value as Exclude<TokenCategory, "all">;
}
