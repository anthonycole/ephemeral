"use client";

import { Code as CodeIcon } from "@phosphor-icons/react";
import { Flex } from "@radix-ui/themes";
import type { CreateTokenInput } from "@/features/token-visualizer/components/workspace-header-action-types";
import { WorkspaceHeaderIconControl } from "@/features/token-visualizer/components/workspace-header-icon-control";
import { WorkspaceTokenComposer } from "@/features/token-visualizer/components/workspace-token-composer";
import type { ImportedGoogleFont } from "@/features/token-visualizer/font-utils";
import styles from "@/features/token-visualizer/styles.module.css";

export type { CreateTokenInput } from "@/features/token-visualizer/components/workspace-header-action-types";

type WorkspaceHeaderActionsProps = {
  importedGoogleFonts: ImportedGoogleFont[];
  onCreateToken: (input: CreateTokenInput) => void;
  onOpenEditor: () => void;
  onTokenComposerOpenChange: (open: boolean) => void;
  tokenComposerOpen: boolean;
};

export function WorkspaceHeaderActions({
  importedGoogleFonts,
  onCreateToken,
  onOpenEditor,
  onTokenComposerOpenChange,
  tokenComposerOpen
}: WorkspaceHeaderActionsProps) {
  return (
    <Flex align="center" justify="end" gap="2" className={styles.workspaceHeaderActionRow}>
      <WorkspaceTokenComposer
        importedGoogleFonts={importedGoogleFonts}
        onCreateToken={onCreateToken}
        open={tokenComposerOpen}
        onOpenChange={onTokenComposerOpenChange}
      />
      <WorkspaceHeaderIconControl label="Open CSS import and export" title="Open CSS import and export" icon={CodeIcon} onClick={onOpenEditor} />
    </Flex>
  );
}
