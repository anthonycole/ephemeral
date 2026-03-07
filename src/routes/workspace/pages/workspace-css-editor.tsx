"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Text } from "@radix-ui/themes";
import { useShallow } from "zustand/react/shallow";
import { getDefaultWorkspaceMeta, getLegacyWorkspaceMeta } from "@/model/tokens/workspace-meta";
import { materializeResolvedTheme } from "@/model/tokens/token-materialization";
import { validateCssSyntax } from "@/model/tokens/design-tokens";
import { serializeDocumentToCss } from "@/model/tokens/document";
import { EditorPane, type EditorMode } from "@/routes/workspace/components/editor-pane";
import { useWorkspaceShellSlot } from "@/routes/workspace/components/workspace-shell-slots";
import { useTokenStore } from "@/routes/workspace/state/store";
import { useWorkspaceRecordState } from "@/routes/workspace/hooks/use-workspace-record-state";
import styles from "@/routes/workspace/styles.module.css";

type SaveNotice = {
  tone: "success" | "error";
  message: string;
};

export function WorkspaceCssEditor() {
  const { lastSavedAt, meta, persistenceStatus, replaceWorkspace, resolvedTheme } = useWorkspaceRecordState();
  const { editorCss, generatedCss, importEditorCss, setEditorCss, setWorkspaceMeta } = useTokenStore(
    useShallow((state) => ({
      editorCss: state.editorCss,
      generatedCss: state.generatedCss,
      importEditorCss: state.importEditorCss,
      setEditorCss: state.setEditorCss,
      setWorkspaceMeta: state.setWorkspaceMeta
    }))
  );
  const syntaxErrors = useMemo(() => validateCssSyntax(editorCss), [editorCss]);
  const editorMode: EditorMode = meta.hydrationMode === "inherit" && meta.baselineKey === "tailwind-default" ? "tailwind" : "raw-css";
  const [awaitingSaveResult, setAwaitingSaveResult] = useState(false);
  const [saveNotice, setSaveNotice] = useState<SaveNotice | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);

  useWorkspaceShellSlot({
    headerActions: <></>,
    statusText: "CSS editor"
  });

  useEffect(() => {
    if (!awaitingSaveResult) {
      return;
    }

    if (persistenceStatus === "saved") {
      setAwaitingSaveResult(false);
      setSaveNotice({
        tone: "success",
        message: "CSS saved"
      });
      return;
    }

    if (persistenceStatus === "error") {
      setAwaitingSaveResult(false);
      setSaveNotice({
        tone: "error",
        message: "Save failed"
      });
    }
  }, [awaitingSaveResult, persistenceStatus]);

  useEffect(() => {
    if (!saveNotice) {
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current);
        noticeTimeoutRef.current = null;
      }
      return;
    }

    noticeTimeoutRef.current = window.setTimeout(() => {
      setSaveNotice(null);
      noticeTimeoutRef.current = null;
    }, 2200);

    return () => {
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current);
        noticeTimeoutRef.current = null;
      }
    };
  }, [saveNotice]);

  function handleEditorModeChange(nextMode: EditorMode) {
    if (nextMode === editorMode) {
      return;
    }

    if (nextMode === "tailwind") {
      setWorkspaceMeta(getDefaultWorkspaceMeta());
      return;
    }

    const materializedDocument = materializeResolvedTheme(resolvedTheme);

    replaceWorkspace({
      document: materializedDocument,
      editorCss: serializeDocumentToCss(materializedDocument),
      meta: getLegacyWorkspaceMeta()
    });
  }

  function handleSave() {
    setSaveNotice(null);
    setAwaitingSaveResult(true);
    importEditorCss();
  }

  return (
    <main className={styles.workspacePaneRoot}>
      <EditorPane
        className={styles.editorRoutePane}
        editorCss={editorCss}
        editorMode={editorMode}
        lastSavedAt={lastSavedAt}
        onEditorCssChange={setEditorCss}
        onEditorModeChange={handleEditorModeChange}
        onReset={() => setEditorCss(generatedCss)}
        onSave={handleSave}
        persistenceStatus={persistenceStatus}
        syntaxErrors={syntaxErrors}
      />
      {saveNotice ? (
        <div className={styles.toastViewport} aria-live="polite" aria-atomic="true">
          <div className={`${styles.toastCard} ${saveNotice.tone === "success" ? styles.toastCardSuccess : styles.toastCardError}`}>
            <Text size="2" weight="medium">
              {saveNotice.message}
            </Text>
          </div>
        </div>
      ) : null}
    </main>
  );
}
