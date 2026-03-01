"use client";

import { useDeferredValue, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type { TokenCategory } from "@/lib/design-tokens";
import { validateCssSyntax } from "@/lib/design-tokens";
import { findTokenById } from "@/features/token-visualizer/document";
import { getCategoryDefinition } from "@/features/token-visualizer/config";
import { useTokenStore } from "@/features/token-visualizer/store";
import type { TokenCounts } from "@/features/token-visualizer/types";
import { groupTokens } from "@/features/token-visualizer/utils";
import { useDebouncedValue } from "@/features/token-visualizer/use-debounced-value";

export function useHeaderState() {
  return useTokenStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery
    }))
  );
}

export function useEditorPaneState() {
  const editorState = useTokenStore(
    useShallow((state) => ({
      editorCss: state.editorCss,
      generatedCss: state.generatedCss,
      setEditorCss: state.setEditorCss,
      importEditorCss: state.importEditorCss,
      resetToSample: state.resetToSample
    }))
  );
  const deferredEditorCss = useDeferredValue(editorState.editorCss);
  const debouncedEditorCss = useDebouncedValue(deferredEditorCss, 180);
  const syntaxErrors = useMemo(() => validateCssSyntax(debouncedEditorCss), [debouncedEditorCss]);

  return {
    ...editorState,
    syntaxErrors
  };
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
  const { activeCategory, setActiveCategory } = canvasState;
  const deferredSearchQuery = useDeferredValue(canvasState.searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const searchedTokens = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return canvasState.tokens;
    }

    return canvasState.tokens.filter((token) => {
      return (
        token.name.toLowerCase().includes(normalizedQuery) ||
        token.value.toLowerCase().includes(normalizedQuery) ||
        token.scope.toLowerCase().includes(normalizedQuery) ||
        token.atRules.some((atRule) => atRule.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [canvasState.tokens, normalizedQuery]);

  const visibleTokens = useMemo(() => {
    return searchedTokens.filter((token) => canvasState.activeCategory === "all" || token.category === canvasState.activeCategory);
  }, [canvasState.activeCategory, searchedTokens]);

  const groupedVisibleTokens = useMemo(() => groupTokens(visibleTokens), [visibleTokens]);
  const groupedSearchedTokens = useMemo(() => groupTokens(searchedTokens), [searchedTokens]);

  const counts = useMemo<TokenCounts>(() => {
    return {
      all: searchedTokens.length,
      color: groupedSearchedTokens.color.length,
      spacing: groupedSearchedTokens.spacing.length,
      typography: groupedSearchedTokens.typography.length,
      radius: groupedSearchedTokens.radius.length,
      shadow: groupedSearchedTokens.shadow.length,
      sizing: groupedSearchedTokens.sizing.length,
      motion: groupedSearchedTokens.motion.length,
      "z-index": groupedSearchedTokens["z-index"].length,
      opacity: groupedSearchedTokens.opacity.length,
      breakpoint: groupedSearchedTokens.breakpoint.length,
      other: groupedSearchedTokens.other.length
    };
  }, [groupedSearchedTokens, searchedTokens.length]);

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
    setSelectedTokenId: canvasState.setSelectedTokenId,
    supportsVirtualizedSingleCategory: activeCategoryDefinition?.supportsVirtualizedCanvas ?? false
  };
}

export function useInspectorPaneState() {
  const inspectorState = useTokenStore(
    useShallow((state) => ({
      document: state.document,
      selectedTokenId: state.selectedTokenId,
      updateToken: state.updateToken,
      setSelectedTokenId: state.setSelectedTokenId
    }))
  );

  const selectedToken = useMemo(() => findTokenById(inspectorState.document, inspectorState.selectedTokenId), [inspectorState.document, inspectorState.selectedTokenId]);

  useEffect(() => {
    if (!selectedToken && inspectorState.selectedTokenId) {
      inspectorState.setSelectedTokenId(null);
    }
  }, [inspectorState, selectedToken]);

  return {
    selectedToken,
    updateToken: inspectorState.updateToken,
    closeInspector: () => inspectorState.setSelectedTokenId(null)
  };
}
