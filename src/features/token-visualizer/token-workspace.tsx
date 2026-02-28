"use client";

import { useEffect, useRef, useState } from "react";
import { Grid } from "@radix-ui/themes";
import { useShallow } from "zustand/react/shallow";
import type { TokenDocument } from "@/features/token-visualizer/document";
import { CommandPalette, type CommandAction } from "@/features/token-visualizer/components/command-palette";
import { CanvasPane } from "@/features/token-visualizer/components/canvas-pane";
import { EditorPane } from "@/features/token-visualizer/components/editor-pane";
import { InspectorPane } from "@/features/token-visualizer/components/inspector-pane";
import { type PersistenceStatus, WorkspaceHeader } from "@/features/token-visualizer/components/workspace-header";
import { useCanvasPaneState, useEditorPaneState, useHeaderState, useInspectorPaneState } from "@/features/token-visualizer/use-token-workspace";
import { useTokenStore } from "@/features/token-visualizer/store";
import styles from "@/features/token-visualizer/styles.module.css";

const WORKSPACE_ID = "default";

export function TokenWorkspace() {
  const { searchQuery, setSearchQuery } = useHeaderState();
  const {
    editorCss,
    generatedCss,
    syntaxErrors,
    setEditorCss,
    importEditorCss,
    resetToSample
  } = useEditorPaneState();
  const { activeCategory, visibleTokens, groupedVisibleTokens, counts, setActiveCategory, setSelectedTokenId, supportsVirtualizedSingleCategory } =
    useCanvasPaneState();
  const { selectedToken, updateToken, closeInspector } = useInspectorPaneState();
  const { document, replaceWorkspace } = useTokenStore(
    useShallow((state) => ({
      document: state.document,
      replaceWorkspace: state.replaceWorkspace
    }))
  );
  const editorCssDraft = useTokenStore((state) => state.editorCss);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>("loading");
  const [hasLoadedWorkspace, setHasLoadedWorkspace] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const skipNextSaveRef = useRef(false);
  const saveSequenceRef = useRef(0);

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
      subtitle: "Move focus to the header search field",
      keywords: ["search", "find", "filter"],
      run: () => {
        window.setTimeout(() => {
          const root = globalThis.document.getElementById("workspace-search");
          const input = root?.querySelector("input") as HTMLInputElement | null;
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
    setSelectedTokenId(token.id);
  }

  function handleSelectCategory(category: typeof activeCategory) {
    setActiveCategory(category);
    setSearchQuery("");
  }

  return (
    <main className={styles.workspaceRoot}>
      <WorkspaceHeader
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        persistenceStatus={persistenceStatus}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      <Grid className={gridClassName} align="stretch">
        <EditorPane
          editorCss={editorCss}
          onEditorCssChange={setEditorCss}
          onImportCss={importEditorCss}
          onLoadGeneratedCss={() => setEditorCss(generatedCss)}
          onResetToSample={resetToSample}
          syntaxErrors={syntaxErrors}
        />
        <CanvasPane
          activeCategory={activeCategory}
          onActiveCategoryChange={setActiveCategory}
          counts={counts}
          visibleCount={visibleTokens.length}
          groupedVisibleTokens={groupedVisibleTokens}
          onSelectToken={setSelectedTokenId}
          supportsVirtualizedSingleCategory={supportsVirtualizedSingleCategory}
        />
        <InspectorPane token={selectedToken} onUpdateToken={updateToken} onClose={closeInspector} />
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
