"use client";

import { Flex } from "@radix-ui/themes";
import type { CreateTokenInput } from "@/routes/workspace/components/workspace-header-action-types";
import { WorkspaceTokenComposer } from "@/routes/workspace/components/workspace-token-composer";
import type { ImportedGoogleFont } from "@/model/tokens/font-utils";
import styles from "@/routes/workspace/styles.module.css";

export type { CreateTokenInput } from "@/routes/workspace/components/workspace-header-action-types";

type WorkspaceHeaderActionsProps = {
  importedGoogleFonts: ImportedGoogleFont[];
  onCreateToken: (input: CreateTokenInput) => void;
  onTokenComposerOpenChange: (open: boolean) => void;
  tokenComposerOpen: boolean;
};

export function WorkspaceHeaderActions({
  importedGoogleFonts,
  onCreateToken,
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
    </Flex>
  );
}
