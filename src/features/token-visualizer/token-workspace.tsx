"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Dialog, Flex, Grid } from "@radix-ui/themes";
import { useShallow } from "zustand/react/shallow";
import { isTokenCategoryFilter, type TokenCategoryFilter } from "@/features/token-catalogue/categories";
import { CommandPalette, type CommandAction } from "@/features/token-visualizer/components/command-palette";
import { CanvasPane } from "@/features/token-visualizer/components/canvas-pane";
import { InspectorPane } from "@/features/token-visualizer/components/inspector-pane";
import { WorkspaceHeaderActions } from "@/features/token-visualizer/components/workspace-header-actions";
import { GoogleFontLinks } from "@/features/token-visualizer/google-font-links";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { useWorkspaceShellSlot } from "@/features/token-visualizer/components/workspace-shell-slots";
import { useTokenStore } from "@/features/token-visualizer/store";
import { useCanvasPaneStateFromTokens, useHeaderState, useInspectorPaneStateFromTokens, type TokenSourceFilter } from "@/features/token-visualizer/use-token-workspace";
import { useWorkspaceRecordState } from "@/features/token-visualizer/use-workspace-record-state";
import styles from "@/features/token-visualizer/styles.module.css";

function resolveCategoryFilter(value: string | null): TokenCategoryFilter {
  return isTokenCategoryFilter(value) ? value : "all";
}

function getCurrentSearchParams(fallback: { toString(): string }) {
  if (typeof window === "undefined") {
    return new URLSearchParams(fallback.toString());
  }

  return new URLSearchParams(window.location.search);
}

export function TokenWorkspace() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useHeaderState();
  const {
    activeCategory,
    searchQuery: storeSearchQuery,
    selectedTokenId,
    setActiveCategory,
    setSelectedTokenId,
    createToken,
    deleteToken,
    updateToken,
    addGoogleFontImport,
    removeGoogleFontImport
  } = useTokenStore(
    useShallow((state) => ({
      activeCategory: state.activeCategory,
      searchQuery: state.searchQuery,
      selectedTokenId: state.selectedTokenId,
      setActiveCategory: state.setActiveCategory,
      setSelectedTokenId: state.setSelectedTokenId,
      createToken: state.createToken,
      deleteToken: state.deleteToken,
      updateToken: state.updateToken,
      addGoogleFontImport: state.addGoogleFontImport,
      removeGoogleFontImport: state.removeGoogleFontImport
    }))
  );
  const { effectiveDocument, effectiveTokens, hasLoadedWorkspace, importedGoogleFonts, meta } = useWorkspaceRecordState();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [pendingDeleteToken, setPendingDeleteToken] = useState<TokenRecord | null>(null);
  const [tokenComposerOpen, setTokenComposerOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<TokenSourceFilter>("all");
  const initializedCategorySyncRef = useRef(false);
  const previousUrlCategoryRef = useRef<TokenCategoryFilter | null>(null);
  const skipNextCategoryUrlWriteRef = useRef(false);
  const initializedTokenSyncRef = useRef(false);
  const previousUrlTokenRef = useRef<string | null>(null);
  const skipNextTokenUrlWriteRef = useRef(false);
  const urlCategory = resolveCategoryFilter(searchParams.get("category"));
  const urlTokenId = searchParams.get("token");

  const canvasState = useCanvasPaneStateFromTokens({
    tokens: effectiveTokens,
    activeCategory,
    sourceFilter,
    searchQuery: storeSearchQuery,
    setActiveCategory,
    setSelectedTokenId
  });
  const inspectorState = useInspectorPaneStateFromTokens({
    tokens: effectiveTokens,
    selectedTokenId,
    updateToken,
    addGoogleFontImport,
    setSelectedTokenId
  });
  const { visibleTokens, groupedVisibleTokens, counts, supportsVirtualizedSingleCategory } = canvasState;
  const { selectedToken, addGoogleFontImport: addInspectorGoogleFontImport, closeInspector } = inspectorState;

  const gridClassName = selectedToken ? `${styles.workspaceGrid} ${styles.workspaceGridInspectorOpen}` : styles.workspaceGrid;
  const workspaceStatus =
    meta.hydrationMode === "inherit" && meta.baselineKey === "tailwind-default" ? "Inherited from Tailwind" : "Workspace";

  useWorkspaceShellSlot({
    headerActions: (
      <WorkspaceHeaderActions
        importedGoogleFonts={importedGoogleFonts}
        onCreateToken={(input) => {
          createToken({
            category: input.category,
            name: input.name,
            value: input.value
          });
        }}
        onTokenComposerOpenChange={setTokenComposerOpen}
        tokenComposerOpen={tokenComposerOpen}
      />
    ),
    statusText: workspaceStatus,
    onOpenCommandPalette: () => setCommandPaletteOpen(true)
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const headerAction = searchParams.get("headerAction");
    const activePanel = searchParams.get("panel");

    if (headerAction === "open-editor" || activePanel === "css") {
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.delete("headerAction");
      nextSearchParams.delete("panel");
      const nextUrl = nextSearchParams.size > 0 ? `/workspace/css?${nextSearchParams.toString()}` : "/workspace/css";
      router.replace(nextUrl, { scroll: false });
      return;
    }

    if (headerAction === "open-token-composer") {
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.delete("headerAction");
      setTokenComposerOpen(true);
      const nextUrl = nextSearchParams.size > 0 ? `${pathname}?${nextSearchParams.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const previousUrlCategory = previousUrlCategoryRef.current;
    previousUrlCategoryRef.current = urlCategory;

    if (!initializedCategorySyncRef.current) {
      initializedCategorySyncRef.current = true;

      if (urlCategory !== activeCategory) {
        skipNextCategoryUrlWriteRef.current = true;
        setActiveCategory(urlCategory);
      }

      return;
    }

    if (previousUrlCategory !== null && urlCategory !== previousUrlCategory && urlCategory !== activeCategory) {
      skipNextCategoryUrlWriteRef.current = true;
      setActiveCategory(urlCategory);
    }
  }, [activeCategory, setActiveCategory, urlCategory]);

  useEffect(() => {
    if (!initializedCategorySyncRef.current) {
      return;
    }

    if (skipNextCategoryUrlWriteRef.current) {
      skipNextCategoryUrlWriteRef.current = false;
      return;
    }

    if (urlCategory === activeCategory) {
      return;
    }

    const nextSearchParams = getCurrentSearchParams(searchParams);

    if (activeCategory === "all") {
      nextSearchParams.delete("category");
    } else {
      nextSearchParams.set("category", activeCategory);
    }

    previousUrlCategoryRef.current = activeCategory;
    router.replace(nextSearchParams.size > 0 ? `${pathname}?${nextSearchParams.toString()}` : pathname, { scroll: false });
  }, [activeCategory, pathname, router, searchParams, urlCategory]);

  useEffect(() => {
    if (!hasLoadedWorkspace) {
      return;
    }

    const previousUrlToken = previousUrlTokenRef.current;
    previousUrlTokenRef.current = urlTokenId;

    const routeToken = urlTokenId ? effectiveTokens.find((token) => token.sourceId === urlTokenId) ?? null : null;

    if (!initializedTokenSyncRef.current) {
      initializedTokenSyncRef.current = true;

      if (routeToken) {
        skipNextTokenUrlWriteRef.current = true;
        if (activeCategory !== routeToken.category) {
          setActiveCategory(routeToken.category);
        }
        if (selectedTokenId !== routeToken.sourceId) {
          setSelectedTokenId(routeToken.sourceId);
        }
      }

      return;
    }

    if (previousUrlToken === urlTokenId) {
      return;
    }

    if (routeToken) {
      skipNextTokenUrlWriteRef.current = true;
      if (activeCategory !== routeToken.category) {
        setActiveCategory(routeToken.category);
      }
      if (selectedTokenId !== routeToken.sourceId) {
        setSelectedTokenId(routeToken.sourceId);
      }
      return;
    }

    if (selectedTokenId !== null) {
      skipNextTokenUrlWriteRef.current = true;
      setSelectedTokenId(null);
    }
  }, [activeCategory, effectiveTokens, hasLoadedWorkspace, selectedTokenId, setActiveCategory, setSelectedTokenId, urlTokenId]);

  useEffect(() => {
    if (!hasLoadedWorkspace || !initializedTokenSyncRef.current) {
      return;
    }

    if (skipNextTokenUrlWriteRef.current) {
      skipNextTokenUrlWriteRef.current = false;
      return;
    }

    if (urlTokenId === selectedTokenId) {
      return;
    }

    const nextSearchParams = getCurrentSearchParams(searchParams);

    if (selectedTokenId) {
      nextSearchParams.set("token", selectedTokenId);
    } else {
      nextSearchParams.delete("token");
    }

    previousUrlTokenRef.current = selectedTokenId;
    router.replace(nextSearchParams.size > 0 ? `${pathname}?${nextSearchParams.toString()}` : pathname, { scroll: false });
  }, [hasLoadedWorkspace, pathname, router, searchParams, selectedTokenId, urlTokenId]);

  const commandActions: CommandAction[] = [
    {
      id: "open-playground",
      title: "Open playground",
      subtitle: "Open the token playground inside the workspace",
      keywords: ["playground", "tokens", "preview"],
      run: () => router.push("/workspace/playground")
    },
    {
      id: "open-preview",
      title: "Open preview",
      subtitle: "Open the published token preview",
      keywords: ["preview", "tokens", "publish"],
      run: () => router.push("/workspace/css")
    },
    {
      id: "focus-search",
      title: "Focus search",
      subtitle: "Move focus to the token search field",
      keywords: ["search", "find", "filter"],
      run: () => {
        window.setTimeout(() => {
          const input = globalThis.document.querySelector('[data-workspace-search-field] input') as HTMLInputElement | null;
          input?.focus();
          input?.select();
        }, 0);
      }
    },
    {
      id: "clear-search",
      title: "Clear search",
      subtitle: "Reset the inline token filter",
      keywords: ["search", "clear", "filter"],
      run: () => setSearchQuery("")
    },
    {
      id: "close-inspector",
      title: "Close inspector",
      subtitle: selectedToken ? `Close ${selectedToken.name}` : "Hide the token inspector",
      keywords: ["inspector", "panel", "close"],
      disabled: !selectedToken,
      run: () => closeInspector()
    },
    {
      id: "show-all-categories",
      title: "Show all categories",
      subtitle: "Return the canvas to the all-categories view",
      keywords: ["categories", "all", "canvas"],
      run: () => setActiveCategory("all")
    },
    {
      id: "delete-token",
      title: "Delete token",
      subtitle: selectedToken ? `Delete ${selectedToken.name}` : "Select a token first",
      keywords: ["delete", "remove", "token"],
      disabled: !selectedToken || selectedToken.readOnly,
      run: () => setPendingDeleteToken(selectedToken)
    }
  ];

  function handleDeleteTokenConfirm() {
    if (!pendingDeleteToken || pendingDeleteToken.readOnly) {
      return;
    }

    deleteToken(pendingDeleteToken.sourceId);
    setPendingDeleteToken(null);
  }

  function handleSelectToken(token: TokenRecord) {
    setActiveCategory(token.category);
    setSearchQuery("");
    setSelectedTokenId(token.sourceId);
  }

  function handleSelectTokenById(tokenId: string) {
    const token = effectiveTokens.find((candidate) => candidate.sourceId === tokenId);

    if (!token) {
      return;
    }

    handleSelectToken(token);
  }

  function handleSelectCategory(category: typeof activeCategory) {
    setActiveCategory(category);
    setSearchQuery("");
  }

  return (
    <main className={styles.workspacePaneRoot}>
      <GoogleFontLinks directives={effectiveDocument.directives} />
      <Grid className={gridClassName} align="stretch">
        <CanvasPane
          activeCategory={activeCategory}
          onActiveCategoryChange={setActiveCategory}
          counts={counts}
          visibleCount={visibleTokens.length}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          importedGoogleFonts={importedGoogleFonts}
          onImportGoogleFont={addGoogleFontImport}
          onRemoveGoogleFont={removeGoogleFontImport}
          groupedVisibleTokens={groupedVisibleTokens}
          onSelectToken={handleSelectTokenById}
          supportsVirtualizedSingleCategory={supportsVirtualizedSingleCategory}
        />
        <InspectorPane
          importedGoogleFonts={importedGoogleFonts}
          onCreateOverride={(token) => updateToken(token, {})}
          onImportGoogleFont={addInspectorGoogleFontImport}
          token={selectedToken}
          onUpdateToken={updateToken}
          onRequestDeleteToken={(token) => setPendingDeleteToken(token)}
          onClose={closeInspector}
        />
      </Grid>

      <Dialog.Root open={Boolean(pendingDeleteToken)} onOpenChange={(open) => !open && setPendingDeleteToken(null)}>
        <Dialog.Content>
          <Dialog.Title>Delete token</Dialog.Title>
          <Dialog.Description>{pendingDeleteToken ? `Delete ${pendingDeleteToken.name}?` : "Delete token?"}</Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={() => setPendingDeleteToken(null)}>
              Cancel
            </Button>
            <Button variant="solid" color="red" onClick={handleDeleteTokenConfirm} disabled={!pendingDeleteToken || pendingDeleteToken.readOnly}>
              Delete token
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        tokens={effectiveTokens}
        actions={commandActions}
        onSelectToken={handleSelectToken}
        onSelectCategory={handleSelectCategory}
      />
    </main>
  );
}
