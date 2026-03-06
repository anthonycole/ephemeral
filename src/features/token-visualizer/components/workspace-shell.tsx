"use client";

import { ArrowSquareOut, Code as CodeIcon, Plus as PlusIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Flex, Heading } from "@radix-ui/themes";
import { WorkspaceHeaderIconControl } from "@/features/token-visualizer/components/workspace-header-icon-control";
import { WorkspaceShellSlotProvider } from "@/features/token-visualizer/components/workspace-shell-slots";
import { WorkspaceSideRail } from "@/features/token-visualizer/components/workspace-side-rail";
import styles from "@/features/token-visualizer/styles.module.css";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [openCommandPalette, setOpenCommandPalette] = useState<(() => void) | null>(null);
  const defaultStatus = pathname === "/workspace/compare" ? "Comparison dashboard" : "Workspace";
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
      <WorkspaceHeaderIconControl label="Open workspace to add token" title="Open workspace to add token" icon={PlusIcon} href="/workspace" />
      <WorkspaceHeaderIconControl label="Open workspace CSS editor" title="Open workspace CSS editor" icon={CodeIcon} href="/workspace" />
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
            <Flex align="center" justify="end" gap="2" pr="3">
              {effectiveHeaderActions}
              <WorkspaceHeaderIconControl label="Open playground" title="Open playground" icon={ArrowSquareOut} href="/playground" />
            </Flex>
          </div>
        </header>
        <div className={styles.workspaceContentFrame}>
          <WorkspaceSideRail />
          <div className={styles.workspaceFrameMain}>{children}</div>
        </div>
      </main>
    </WorkspaceShellSlotProvider>
  );
}
