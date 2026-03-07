import { Button, Flex, Heading, ScrollArea } from "@radix-ui/themes";
import type { TokenRecord } from "@/model/tokens/document";
import { InspectorContent } from "@/routes/workspace/components/inspector-content";
import type { ImportedGoogleFont } from "@/model/tokens/font-utils";
import styles from "@/routes/workspace/styles.module.css";

type InspectorPaneProps = {
  importedGoogleFonts: ImportedGoogleFont[];
  onCreateOverride: (token: TokenRecord) => void;
  onImportGoogleFont: (family: string) => void;
  token: TokenRecord | null;
  onUpdateToken: (token: TokenRecord, updates: Partial<{ name: string; value: string; category: TokenRecord["category"] }>) => void;
  onRequestDeleteToken: (token: TokenRecord) => void;
  onClose: () => void;
};

export function InspectorPane({
  importedGoogleFonts,
  onCreateOverride,
  onImportGoogleFont,
  token,
  onUpdateToken,
  onRequestDeleteToken,
  onClose
}: InspectorPaneProps) {
  const className = token
    ? `${styles.shellPane} ${styles.inspectorColumn} ${styles.inspectorColumnOpen} ${styles.paneStack}`
    : `${styles.shellPane} ${styles.inspectorColumn} ${styles.paneStack}`;

  return (
    <section className={className}>
      <Flex direction="column" gap="3" className={styles.paneStack}>
        <Flex align="center" justify="between" gap="2">
          <Flex align="center" gap="2" wrap="wrap">
            <Heading size="5">Inspector</Heading>
          </Flex>
          <Button size="1" variant="soft" color="gray" onClick={onClose}>
            Close
          </Button>
        </Flex>
        <ScrollArea type="auto" scrollbars="vertical" className={styles.paneScroll}>
          <Flex direction="column" gap="3" pr="2">
            <InspectorContent
              importedGoogleFonts={importedGoogleFonts}
              onCreateOverride={onCreateOverride}
              onImportGoogleFont={onImportGoogleFont}
              token={token}
              onUpdateToken={onUpdateToken}
              onRequestDeleteToken={onRequestDeleteToken}
            />
          </Flex>
        </ScrollArea>
      </Flex>
    </section>
  );
}
