"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Grid } from "@radix-ui/themes";
import { useShallow } from "zustand/react/shallow";
import { isTokenCategoryFilter, type TokenCategoryFilter } from "@/features/token-catalogue/categories";
import type { TokenDocument } from "@/features/token-visualizer/document";
import { CommandPalette, type CommandAction } from "@/features/token-visualizer/components/command-palette";
import { CanvasPane } from "@/features/token-visualizer/components/canvas-pane";
import { EditorPane } from "@/features/token-visualizer/components/editor-pane";
import { InspectorPane } from "@/features/token-visualizer/components/inspector-pane";
import { type PersistenceStatus, WorkspaceHeader } from "@/features/token-visualizer/components/workspace-header";
import { parseGoogleFontImports } from "@/features/token-visualizer/font-utils";
import { GoogleFontLinks } from "@/features/token-visualizer/google-font-links";
import { useCanvasPaneState, useEditorPaneState, useHeaderState, useInspectorPaneState } from "@/features/token-visualizer/use-token-workspace";
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
    generatedCss,
    syntaxErrors,
    setEditorCss,
    addGoogleFontImport,
    importEditorCss,
    removeGoogleFontImport,
    resetToSample
  } = useEditorPaneState();
  const { activeCategory, visibleTokens, groupedVisibleTokens, counts, setActiveCategory, setSelectedTokenId, supportsVirtualizedSingleCategory } =
    useCanvasPaneState();
  const { selectedToken, updateToken, addGoogleFontImport: addInspectorGoogleFontImport, closeInspector } = useInspectorPaneState();
  const { document, replaceWorkspace, selectedTokenId } = useTokenStore(
    useShallow((state) => ({
      document: state.document,
      replaceWorkspace: state.replaceWorkspace,
      selectedTokenId: state.selectedTokenId
    }))
  );
  const editorCssDraft = useTokenStore((state) => state.editorCss);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>("loading");
  const [hasLoadedWorkspace, setHasLoadedWorkspace] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
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
  const importedGoogleFonts = useMemo(() => parseGoogleFontImports(document.directives), [document.directives]);

  const gridClassName = selectedToken ? `${styles.workspaceGrid} ${styles.workspaceGridInspectorOpen}` : styles.workspaceGrid;

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

    const routeToken = urlTokenId ? document.tokens.find((token) => token.sourceId === urlTokenId) ?? null : null;

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
  }, [activeCategory, document.tokens, hasLoadedWorkspace, selectedTokenId, setActiveCategory, setSelectedTokenId, urlTokenId]);

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
          };
        };

        if (!isActive) {
          return;
        }

        skipNextSaveRef.current = true;
        replaceWorkspace({
          document: payload.workspace.document,
          editorCss: payload.workspace.editorCss
        });
        setPersistenceStatus("saved");
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
              document
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to save workspace: ${response.status}`);
          }

          if (saveSequenceRef.current === requestId) {
            setPersistenceStatus("saved");
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
  }, [document, editorCssDraft, hasLoadedWorkspace]);

  const commandActions: CommandAction[] = [
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
      id: "load-generated",
      title: "Load generated CSS",
      subtitle: "Copy the generated token CSS back into the editor",
      keywords: ["export", "generated", "editor"],
      run: () => setEditorCss(generatedCss)
    },
    {
      id: "reset-sample",
      title: "Reset sample",
      subtitle: "Replace the current workspace with the sample token set",
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
    }
  ];

  function handleSelectToken(token: (typeof document.tokens)[number]) {
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
      <GoogleFontLinks directives={document.directives} />
      <WorkspaceHeader
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        persistenceStatus={persistenceStatus}
      />
      <Grid className={gridClassName} align="stretch">
        <EditorPane
          editorCss={editorCss}
          importedGoogleFonts={importedGoogleFonts}
          onEditorCssChange={setEditorCss}
          onImportGoogleFont={addGoogleFontImport}
          onImportCss={importEditorCss}
          onLoadGeneratedCss={() => setEditorCss(generatedCss)}
          onRemoveGoogleFont={removeGoogleFontImport}
          onResetToSample={resetToSample}
          syntaxErrors={syntaxErrors}
        />
        <CanvasPane
          activeCategory={activeCategory}
          onActiveCategoryChange={setActiveCategory}
          counts={counts}
          visibleCount={visibleTokens.length}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          groupedVisibleTokens={groupedVisibleTokens}
          onSelectToken={setSelectedTokenId}
          supportsVirtualizedSingleCategory={supportsVirtualizedSingleCategory}
        />
        <InspectorPane
          importedGoogleFonts={importedGoogleFonts}
          onImportGoogleFont={addInspectorGoogleFontImport}
          token={selectedToken}
          onUpdateToken={updateToken}
          onClose={closeInspector}
        />
      </Grid>
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        tokens={document.tokens}
        actions={commandActions}
        onSelectToken={handleSelectToken}
        onSelectCategory={handleSelectCategory}
      />
    </main>
  );
}
