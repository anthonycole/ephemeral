"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

type WorkspaceShellSlotContextValue = {
  setHeaderActions: (actions: ReactNode | null) => void;
  setStatusText: (status: string | null) => void;
  setOpenCommandPalette: (handler: (() => void) | null) => void;
};

const WorkspaceShellSlotContext = createContext<WorkspaceShellSlotContextValue | null>(null);

export function WorkspaceShellSlotProvider({
  value,
  children
}: {
  value: WorkspaceShellSlotContextValue;
  children: ReactNode;
}) {
  return <WorkspaceShellSlotContext.Provider value={value}>{children}</WorkspaceShellSlotContext.Provider>;
}

export function useWorkspaceShellSlot({
  headerActions,
  statusText,
  onOpenCommandPalette
}: {
  headerActions?: ReactNode;
  statusText?: string | null;
  onOpenCommandPalette?: () => void;
}) {
  const context = useContext(WorkspaceShellSlotContext);

  useEffect(() => {
    if (!context) {
      return;
    }

    context.setHeaderActions(headerActions ?? null);
  }, [context, headerActions]);

  useEffect(() => {
    if (!context) {
      return;
    }

    return () => {
      context.setHeaderActions(null);
    };
  }, [context]);

  useEffect(() => {
    if (!context) {
      return;
    }

    context.setStatusText(statusText ?? null);
  }, [context, statusText]);

  useEffect(() => {
    if (!context) {
      return;
    }

    return () => {
      context.setStatusText(null);
    };
  }, [context]);

  useEffect(() => {
    if (!context) {
      return;
    }

    if (onOpenCommandPalette) {
      context.setOpenCommandPalette(() => onOpenCommandPalette);
    } else {
      context.setOpenCommandPalette(null);
    }
  }, [context, onOpenCommandPalette]);

  useEffect(() => {
    if (!context) {
      return;
    }

    return () => {
      context.setOpenCommandPalette(null);
    };
  }, [context]);
}
