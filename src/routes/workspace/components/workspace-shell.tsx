"use client";

import { Plus as PlusIcon } from "@phosphor-icons/react";
import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Flex, Heading } from "@radix-ui/themes";
import { WorkspaceHeaderIconControl } from "@/routes/workspace/components/workspace-header-icon-control";
import { WorkspaceShellSlotProvider } from "@/routes/workspace/components/workspace-shell-slots";
import { WorkspaceSideRail } from "@/routes/workspace/components/workspace-side-rail";
import styles from "@/routes/workspace/styles.module.css";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [openCommandPalette, setOpenCommandPalette] = useState<(() => void) | null>(null);
  const defaultStatus = "Workspace";
  const status = statusText ?? defaultStatus;

  const handleOpenCommandPalette = useCallback(() => {
    openCommandPalette?.();
  }, [openCommandPalette]);

  useEffect(() => {
    if (!openCommandPalette) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return;
      }

      if (event.altKey || event.shiftKey) {
        return;
      }

      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable || target.closest('[role="textbox"]') !== null);

      if (isTypingTarget) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        handleOpenCommandPalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenCommandPalette, openCommandPalette]);

  const slotContext = useMemo(
    () => ({
      setHeaderActions,
      setStatusText,
      setOpenCommandPalette
    }),
    []
  );

  const effectiveHeaderActions = headerActions ?? (
    <>
      <WorkspaceHeaderIconControl
        label="Open workspace to add token"
        title="Open workspace to add token"
        icon={PlusIcon}
        href="/workspace?headerAction=open-token-composer"
      />
    </>
  );

  return (
    <WorkspaceShellSlotProvider value={slotContext}>
      <main className={styles.workspaceRoot}>
        <header className={styles.appHeader}>
          <div className={styles.appHeaderGrid}>
            <Flex direction="column" gap="1">
              <Heading size="6" className={styles.appTitle}>
                ephemeral
              </Heading>
              <span className={styles.appStatus}>{status}</span>
            </Flex>
            <Flex align="center" justify="end" gap="2" pr="3">{effectiveHeaderActions}</Flex>
          </div>
        </header>
        <div className={styles.workspaceContentFrame}>
          <Suspense fallback={<div className={styles.workspaceSideRail} aria-hidden="true" />}>
            <WorkspaceSideRail />
          </Suspense>
          <div className={styles.workspaceFrameMain}>{children}</div>
        </div>
      </main>
    </WorkspaceShellSlotProvider>
  );
}
