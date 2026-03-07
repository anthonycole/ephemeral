"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { materializeResolvedTheme } from "@/model/tokens/token-materialization";
import { createEffectiveTokenRecord, resolveTheme } from "@/model/tokens/token-resolution";
import type { WorkspaceMeta } from "@/model/tokens/workspace-meta";
import type { PersistenceStatus } from "@/routes/workspace/components/workspace-header";
import type { TokenDocument } from "@/model/tokens/document";
import { parseGoogleFontImports } from "@/model/tokens/font-utils";
import { useTokenStore } from "@/routes/workspace/state/store";

const WORKSPACE_ID = "default";

export function useWorkspaceRecordState() {
  const { document, meta, replaceWorkspace } = useTokenStore(
    useShallow((state) => ({
      document: state.document,
      meta: state.meta,
      replaceWorkspace: state.replaceWorkspace
    }))
  );
  const editorCssDraft = useTokenStore((state) => state.editorCss);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>("loading");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [hasLoadedWorkspace, setHasLoadedWorkspace] = useState(false);
  const [baselineDocument, setBaselineDocument] = useState<TokenDocument | null>(null);
  const skipNextSaveRef = useRef(false);
  const saveSequenceRef = useRef(0);

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

  return {
    baselineDocument,
    document,
    effectiveDocument,
    effectiveTokens,
    hasLoadedWorkspace,
    importedGoogleFonts,
    lastSavedAt,
    meta,
    persistenceStatus,
    replaceWorkspace,
    resolvedTheme
  };
}
