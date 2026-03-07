"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, Button, Flex, Grid } from "@radix-ui/themes";
import { useShallow } from "zustand/react/shallow";
import { isTokenCategoryFilter, type TokenCategoryFilter } from "@/features/token-catalogue/categories";
import { materializeResolvedTheme } from "@/features/token-catalogue/token-materialization";
import { createEffectiveTokenRecord, resolveTheme } from "@/features/token-catalogue/token-resolution";
import type { WorkspaceMeta } from "@/features/token-catalogue/workspace-meta";
import { serializeDocumentToCss, type TokenDocument, type TokenRecord } from "@/features/token-visualizer/document";
import { CommandPalette, type CommandAction } from "@/features/token-visualizer/components/command-palette";
import { CanvasPane } from "@/features/token-visualizer/components/canvas-pane";
import { EditorPane } from "@/features/token-visualizer/components/editor-pane";
import { InspectorPane } from "@/features/token-visualizer/components/inspector-pane";
import { WorkspaceHeaderActions } from "@/features/token-visualizer/components/workspace-header-actions";
import { parseGoogleFontImports } from "@/features/token-visualizer/font-utils";
import { GoogleFontLinks } from "@/features/token-visualizer/google-font-links";
import { useCanvasPaneStateFromTokens, useEditorPaneState, useHeaderState, useInspectorPaneStateFromTokens, type TokenSourceFilter } from "@/features/token-visualizer/use-token-workspace";
import { useWorkspaceShellSlot } from "@/features/token-visualizer/components/workspace-shell-slots";
import { useTokenStore } from "@/features/token-visualizer/store";
import styles from "@/features/token-visualizer/styles.module.css";

const WORKSPACE_ID = "default";

function resolveCategoryFilter(value: string | null): TokenCategoryFilter {
  return isTokenCategoryFilter(value) ? value : "all";
}

export function TokenWorkspace() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useHeaderState();
  const {
    editorCss,
    meta,
    syntaxErrors,
    setEditorCss,
    addGoogleFontImport,
    importEditorCss,
    removeGoogleFontImport,
    resetToSample,
    startInheritedTheme
  } = useEditorPaneState();
  const {
    activeCategory,
    document,
    replaceWorkspace,
    searchQuery: storeSearchQuery,
    selectedTokenId,
    setActiveCategory,
    setSelectedTokenId,
    createToken,
    deleteToken,
    updateToken
  } = useTokenStore(
    useShallow((state) => ({
      activeCategory: state.activeCategory,
      document: state.document,
      replaceWorkspace: state.replaceWorkspace,
      searchQuery: state.searchQuery,
      selectedTokenId: state.selectedTokenId,
    setActiveCategory: state.setActiveCategory,
    setSelectedTokenId: state.setSelectedTokenId,
    createToken: state.createToken,
    deleteToken: state.deleteToken,
    updateToken: state.updateToken
  }))
);
  const editorCssDraft = useTokenStore((state) => state.editorCss);
  const [persistenceStatus, setPersistenceStatus] = useState<"loading" | "saving" | "saved" | "error">("loading");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [hasLoadedWorkspace, setHasLoadedWorkspace] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingDeleteToken, setPendingDeleteToken] = useState<TokenRecord | null>(null);
  const [tokenComposerOpen, setTokenComposerOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<TokenSourceFilter>("all");
  const [baselineDocument, setBaselineDocument] = useState<TokenDocument | null>(null);
  const skipNextSaveRef = useRef(false);
  const saveSequenceRef = useRef(0);
  const initializedCategorySyncRef = useRef(false);
  const previousUrlCategoryRef = useRef<TokenCategoryFilter | null>(null);
  const skipNextCategoryUrlWriteRef = useRef(false);
  const initializedTokenSyncRef = useRef(false);
  const previousUrlTokenRef = useRef<string | null>(null);
  const skipNextTokenUrlWriteRef = useRef(false);
  const urlCategory = resolveCategoryFilter(searchParams.get("category"));
  const urlTokenId = searchParams.get("token");
  const resolvedTheme = useMemo(
    () =>
      resolveTheme({
        authored: document,
        baseline: meta.baselineKey && baselineDocument ? baselineDocument : null,
        meta
      }),
    [baselineDocument, document, meta]
  );
  const effectiveTokens = useMemo(() => resolvedTheme.tokens.map((token, index) => createEffectiveTokenRecord(token, index)), [resolvedTheme.tokens]);
  const effectiveDocument = useMemo(() => {
    if (meta.hydrationMode === "inherit" && baselineDocument) {
      return materializeResolvedTheme(resolvedTheme);
    }

    return {
      ...document,
      tokens: effectiveTokens
    };
  }, [baselineDocument, document, effectiveTokens, meta.hydrationMode, resolvedTheme]);
  const importedGoogleFonts = useMemo(() => parseGoogleFontImports(effectiveDocument.directives), [effectiveDocument.directives]);
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
        onOpenEditor={() => setEditorOpen(true)}
        onTokenComposerOpenChange={setTokenComposerOpen}
        tokenComposerOpen={tokenComposerOpen}
      />
    ),
    statusText: workspaceStatus,
    onOpenCommandPalette: () => setCommandPaletteOpen(true)
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && editorOpen) {
        event.preventDefault();
        setEditorOpen(false);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editorOpen]);

  useEffect(() => {
    const headerAction = searchParams.get("headerAction");

    if (headerAction !== "open-token-composer" && headerAction !== "open-editor") {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("headerAction");

    if (headerAction === "open-token-composer") {
      setTokenComposerOpen(true);
    } else {
      setEditorOpen(true);
    }

    const nextUrl = nextSearchParams.size > 0 ? `${pathname}?${nextSearchParams.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!editorOpen) {
      return;
    }

    const previousOverflow = globalThis.document.body.style.overflow;
    globalThis.document.body.style.overflow = "hidden";

    return () => {
      globalThis.document.body.style.overflow = previousOverflow;
    };
  }, [editorOpen]);

  useEffect(() => {
    let isActive = true;

    async function loadBaseline(nextMeta: WorkspaceMeta) {
      if (!nextMeta.baselineKey) {
        setBaselineDocument(null);
        return;
      }

      try {
        const response = await fetch(`/api/baselines/${nextMeta.baselineKey}`, {
          cache: "force-cache"
        });

        if (!response.ok) {
          throw new Error(`Failed to load baseline: ${response.status}`);
        }

        const payload = (await response.json()) as {
          baseline: {
            document: TokenDocument;
          };
        };

        if (isActive) {
          setBaselineDocument(payload.baseline.document);
        }
      } catch (error) {
        console.error(error);

        if (isActive) {
          setBaselineDocument(null);
        }
      }
    }

    void loadBaseline(meta);

    return () => {
      isActive = false;
    };
  }, [meta]);

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

    const nextSearchParams = new URLSearchParams(searchParams.toString());

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

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (selectedTokenId) {
      nextSearchParams.set("token", selectedTokenId);
    } else {
      nextSearchParams.delete("token");
    }

    previousUrlTokenRef.current = selectedTokenId;
    router.replace(nextSearchParams.size > 0 ? `${pathname}?${nextSearchParams.toString()}` : pathname, { scroll: false });
  }, [hasLoadedWorkspace, pathname, router, searchParams, selectedTokenId, urlTokenId]);

  useEffect(() => {
    let isActive = true;

    async function loadWorkspace() {
      setPersistenceStatus("loading");

      try {
        const response = await fetch(`/api/workspaces/${WORKSPACE_ID}`, {
          cache: "no-store"
        });

        if (response.status === 404) {
          if (isActive) {
            setPersistenceStatus("saved");
            setLastSavedAt(null);
            setHasLoadedWorkspace(true);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load workspace: ${response.status}`);
        }

        const payload = (await response.json()) as {
          workspace: {
            document: TokenDocument;
            editorCss: string;
            meta: WorkspaceMeta;
          };
        };

        if (!isActive) {
          return;
        }

        skipNextSaveRef.current = true;
        replaceWorkspace({
          document: payload.workspace.document,
          editorCss: payload.workspace.editorCss,
          meta: payload.workspace.meta
        });
        setPersistenceStatus("saved");
        setLastSavedAt(null);
      } catch (error) {
        console.error(error);

        if (isActive) {
          setPersistenceStatus("error");
        }
      } finally {
        if (isActive) {
          setHasLoadedWorkspace(true);
        }
      }
    }

    void loadWorkspace();

    return () => {
      isActive = false;
    };
  }, [replaceWorkspace]);

  useEffect(() => {
    if (!hasLoadedWorkspace) {
      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const requestId = saveSequenceRef.current + 1;
      saveSequenceRef.current = requestId;
      setPersistenceStatus("saving");

      void (async () => {
        try {
          const response = await fetch(`/api/workspaces/${WORKSPACE_ID}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              editorCss: editorCssDraft,
              document,
              meta
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to save workspace: ${response.status}`);
          }

          if (saveSequenceRef.current === requestId) {
            setPersistenceStatus("saved");
            setLastSavedAt(Date.now());
          }
        } catch (error) {
          console.error(error);

          if (saveSequenceRef.current === requestId) {
            setPersistenceStatus("error");
          }
        }
      })();
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [document, editorCssDraft, hasLoadedWorkspace, meta]);

  function handleMaterializeDefaults() {
    if (!baselineDocument) {
      return;
    }

    const materializedDocument = materializeResolvedTheme(resolvedTheme);

    skipNextSaveRef.current = true;
    replaceWorkspace({
      document: materializedDocument,
      editorCss: serializeDocumentToCss(materializedDocument),
      meta: {
        ...meta,
        hydrationMode: "materialized"
      }
    });
  }

  const commandActions: CommandAction[] = [
    {
      id: "open-css-editor",
      title: "Open CSS editor",
      subtitle: "Open the full-screen CSS import and export view",
      keywords: ["css", "editor", "import", "export"],
      run: () => setEditorOpen(true)
    },
    {
      id: "open-playground",
      title: "Open playground",
      subtitle: "Open the isolated token playground route",
      keywords: ["playground", "preview", "tokens"],
      run: () => router.push("/playground")
    },
    {
      id: "import-css",
      title: "Import CSS",
      subtitle: syntaxErrors.length > 0 ? "Disabled while the editor has CSS syntax errors" : "Parse the editor CSS into the workspace",
      keywords: ["parse", "sync", "tokens"],
      disabled: syntaxErrors.length > 0,
      run: () => importEditorCss()
    },
    {
      id: "start-inherited-theme",
      title: "Start inherited theme",
      subtitle: "Begin with Tailwind defaults applied as the baseline",
      keywords: ["baseline", "inherit", "defaults", "tailwind"],
      run: () => startInheritedTheme()
    },
    {
      id: "materialize-defaults",
      title: "Materialize defaults",
      subtitle: "Copy inherited baseline tokens into the authored document",
      keywords: ["hydrate", "materialize", "baseline", "defaults"],
      disabled: meta.hydrationMode !== "inherit" || !baselineDocument,
      run: () => handleMaterializeDefaults()
    },
    {
      id: "reset-sample",
      title: "Start over",
      subtitle: "Replace the current workspace with the starter example",
      keywords: ["reset", "sample", "default"],
      run: () => resetToSample()
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

  function handleSelectCategory(category: typeof activeCategory) {
    setActiveCategory(category);
    setSearchQuery("");
  }

  return (
    <main className={styles.workspaceRoot}>
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
          onSelectToken={setSelectedTokenId}
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

      {editorOpen ? (
        <div className={styles.editorOverlay} role="dialog" aria-modal="true" aria-label="CSS import and export">
          <div className={styles.editorOverlayPanel}>
            <EditorPane
              className={styles.editorOverlayPane}
              editorCss={editorCss}
              lastSavedAt={lastSavedAt}
              onClose={() => setEditorOpen(false)}
              onMaterializeDefaults={handleMaterializeDefaults}
              persistenceStatus={persistenceStatus}
              onEditorCssChange={setEditorCss}
              onImportCss={importEditorCss}
              onResetToSample={resetToSample}
              onStartInheritedTheme={startInheritedTheme}
              syntaxErrors={syntaxErrors}
              workspaceMeta={meta}
            />
          </div>
        </div>
      ) : null}
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
