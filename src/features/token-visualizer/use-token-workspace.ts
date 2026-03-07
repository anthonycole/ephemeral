"use client";

import { useDeferredValue, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type { TokenCategory } from "@/lib/design-tokens";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { getCategoryDefinition } from "@/features/token-visualizer/config";
import { useTokenStore } from "@/features/token-visualizer/store";
import type { TokenCounts } from "@/features/token-visualizer/types";
import { groupTokens } from "@/features/token-visualizer/utils";

export type TokenSourceFilter = "all" | "authored" | "defaults";

export function useHeaderState() {
  return useTokenStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery
    }))
  );
}

export function useCanvasPaneState() {
  const canvasState = useTokenStore(
    useShallow((state) => ({
      tokens: state.document.tokens,
      activeCategory: state.activeCategory,
      searchQuery: state.searchQuery,
      setActiveCategory: state.setActiveCategory,
      setSelectedTokenId: state.setSelectedTokenId
    }))
  );
  return useCanvasPaneStateFromTokens({ ...canvasState, sourceFilter: "all" });
}

export function useCanvasPaneStateFromTokens({
  tokens,
  activeCategory,
  sourceFilter,
  searchQuery,
  setActiveCategory,
  setSelectedTokenId
}: {
  tokens: TokenRecord[];
  activeCategory: TokenCategory;
  sourceFilter: TokenSourceFilter;
  searchQuery: string;
  setActiveCategory: (value: TokenCategory) => void;
  setSelectedTokenId: (value: string | null) => void;
}) {
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const searchedTokens = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return tokens;
    }

    return tokens.filter((token) => {
      return (
        token.name.toLowerCase().includes(normalizedQuery) ||
        token.value.toLowerCase().includes(normalizedQuery) ||
        token.scope.toLowerCase().includes(normalizedQuery) ||
        token.atRules.some((atRule) => atRule.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [normalizedQuery, tokens]);
  const filteredTokens = useMemo(() => {
    if (sourceFilter === "all") {
      return searchedTokens;
    }

    return searchedTokens.filter((token) => {
      const isReadOnly = token.readOnly === true;
      return sourceFilter === "defaults" ? isReadOnly : !isReadOnly;
    });
  }, [searchedTokens, sourceFilter]);

  const visibleTokens = useMemo(() => {
    return filteredTokens.filter((token) => activeCategory === "all" || token.category === activeCategory);
  }, [activeCategory, filteredTokens]);

  const groupedVisibleTokens = useMemo(() => groupTokens(visibleTokens), [visibleTokens]);
  const groupedFilteredTokens = useMemo(() => groupTokens(filteredTokens), [filteredTokens]);

  const counts = useMemo<TokenCounts>(() => {
    return {
      all: filteredTokens.length,
      color: groupedFilteredTokens.color.length,
      spacing: groupedFilteredTokens.spacing.length,
      typography: groupedFilteredTokens.typography.length,
      radius: groupedFilteredTokens.radius.length,
      shadow: groupedFilteredTokens.shadow.length,
      sizing: groupedFilteredTokens.sizing.length,
      motion: groupedFilteredTokens.motion.length,
      "z-index": groupedFilteredTokens["z-index"].length,
      opacity: groupedFilteredTokens.opacity.length,
      breakpoint: groupedFilteredTokens.breakpoint.length,
      other: groupedFilteredTokens.other.length
    };
  }, [filteredTokens.length, groupedFilteredTokens]);

  const activeCategoryDefinition =
    activeCategory === "all" ? null : getCategoryDefinition(activeCategory as Exclude<TokenCategory, "all">);

  useEffect(() => {
    if (activeCategory === "all") {
      return;
    }

    if (counts[activeCategory] === 0) {
      setActiveCategory("all");
    }
  }, [activeCategory, counts, setActiveCategory]);

  return {
    activeCategory,
    counts,
    visibleTokens,
    groupedVisibleTokens,
    setActiveCategory,
    setSelectedTokenId,
    supportsVirtualizedSingleCategory: activeCategoryDefinition?.supportsVirtualizedCanvas ?? false
  };
}

export function useInspectorPaneState() {
  const inspectorState = useTokenStore(
    useShallow((state) => ({
      tokens: state.document.tokens,
      selectedTokenId: state.selectedTokenId,
      updateToken: state.updateToken,
      addGoogleFontImport: state.addGoogleFontImport,
      setSelectedTokenId: state.setSelectedTokenId
    }))
  );
  return useInspectorPaneStateFromTokens(inspectorState);
}

export function useInspectorPaneStateFromTokens({
  tokens,
  selectedTokenId,
  updateToken,
  addGoogleFontImport,
  setSelectedTokenId
}: {
  tokens: TokenRecord[];
  selectedTokenId: string | null;
  updateToken: ReturnType<typeof useTokenStore.getState>["updateToken"];
  addGoogleFontImport: (family: string) => void;
  setSelectedTokenId: (value: string | null) => void;
}) {
  const selectedToken = useMemo(
    () =>
      selectedTokenId
        ? tokens.find((token) => token.sourceId === selectedTokenId || token.id === selectedTokenId) ?? null
        : null,
    [selectedTokenId, tokens]
  );

  useEffect(() => {
    if (!selectedToken && selectedTokenId) {
      setSelectedTokenId(null);
    }
  }, [selectedToken, selectedTokenId, setSelectedTokenId]);

  return {
    selectedToken,
    updateToken,
    addGoogleFontImport,
    closeInspector: () => setSelectedTokenId(null)
  };
}
