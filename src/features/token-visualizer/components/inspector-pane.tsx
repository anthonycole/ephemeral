import { Button, Flex, Heading, ScrollArea } from "@radix-ui/themes";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { InspectorContent } from "@/features/token-visualizer/components/inspector-content";
import type { ImportedGoogleFont } from "@/features/token-visualizer/font-utils";
import styles from "@/features/token-visualizer/styles.module.css";

type InspectorPaneProps = {
  importedGoogleFonts: ImportedGoogleFont[];
  onImportGoogleFont: (family: string) => void;
  token: TokenRecord | null;
  onUpdateToken: (tokenId: string, updates: Partial<{ name: string; value: string; category: TokenRecord["category"] }>) => void;
  onClose: () => void;
};

export function InspectorPane({ importedGoogleFonts, onImportGoogleFont, token, onUpdateToken, onClose }: InspectorPaneProps) {
  const className = token
    ? `${styles.shellPane} ${styles.inspectorColumn} ${styles.inspectorColumnOpen} ${styles.paneStack}`
    : `${styles.shellPane} ${styles.inspectorColumn} ${styles.paneStack}`;

  return (
    <section className={className}>
      <Flex direction="column" gap="3" className={styles.paneStack}>
        <Flex align="center" justify="between" gap="2">
          <Heading size="5">Inspector</Heading>
          <Button size="1" variant="soft" color="gray" onClick={onClose}>
            Close
          </Button>
        </Flex>
        <ScrollArea type="auto" scrollbars="vertical" className={styles.paneScroll}>
          <Flex direction="column" gap="3" pr="2">
            <InspectorContent
              importedGoogleFonts={importedGoogleFonts}
              onImportGoogleFont={onImportGoogleFont}
              token={token}
              onUpdateToken={onUpdateToken}
            />
          </Flex>
        </ScrollArea>
      </Flex>
    </section>
  );
}
