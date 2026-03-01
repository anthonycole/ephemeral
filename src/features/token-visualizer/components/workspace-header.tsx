import Link from "next/link";
import { Command as CommandIcon } from "@phosphor-icons/react";
import { Button, Flex, Heading } from "@radix-ui/themes";
import styles from "@/features/token-visualizer/styles.module.css";

export type PersistenceStatus = "loading" | "saving" | "saved" | "error";

type WorkspaceHeaderProps = {
  onOpenCommandPalette: () => void;
  persistenceStatus: PersistenceStatus;
};

const persistenceLabels: Record<PersistenceStatus, string> = {
  loading: "Loading workspace",
  saving: "Saving workspace",
  saved: "Workspace saved",
  error: "Save failed"
};

export function WorkspaceHeader({ onOpenCommandPalette, persistenceStatus }: WorkspaceHeaderProps) {
  return (
    <header className={styles.appHeader}>
      <div className={styles.appHeaderGrid}>
        <Flex direction="column" gap="1">
          <Heading size="6" className={styles.appTitle}>
            ephemeral
          </Heading>
          <span className={styles.appStatus}>{persistenceLabels[persistenceStatus]}</span>
        </Flex>
        <Flex align="center" justify="end" gap="2" pr="3">
          <Button asChild type="button" variant="soft" color="gray" className={styles.headerActionButton}>
            <Link href="/tokens">View Tokens</Link>
          </Button>
          <Button
            type="button"
            variant="soft"
            color="gray"
            onClick={onOpenCommandPalette}
            className={styles.commandTrigger}
            aria-label="Command K"
            title="Command K"
          >
            <CommandIcon size={16} weight="regular" />
            <span className={styles.commandTriggerKey}>K</span>
            <span className={styles.srOnly}>Command K</span>
          </Button>
        </Flex>
      </div>
    </header>
  );
}
