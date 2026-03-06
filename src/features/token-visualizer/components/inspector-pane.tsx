import { Badge, Button, Flex, Heading, ScrollArea } from "@radix-ui/themes";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { InspectorContent } from "@/features/token-visualizer/components/inspector-content";
import type { ImportedGoogleFont } from "@/features/token-visualizer/font-utils";
import styles from "@/features/token-visualizer/styles.module.css";

type InspectorPaneProps = {
  importedGoogleFonts: ImportedGoogleFont[];
  onCreateOverride: (token: TokenRecord) => void;
  onImportGoogleFont: (family: string) => void;
  token: TokenRecord | null;
  onUpdateToken: (token: TokenRecord, updates: Partial<{ name: string; value: string; category: TokenRecord["category"] }>) => void;
  onDeleteToken: (token: TokenRecord) => void;
  onClose: () => void;
};

function readOnlyBadgeLabel(token: TokenRecord | null) {
  if (!token?.readOnly) {
    return null;
  }

  return token.origin === "inherited" ? "Inherited" : "Tailwind default";
}

export function InspectorPane({
  importedGoogleFonts,
  onCreateOverride,
  onImportGoogleFont,
  token,
  onUpdateToken,
  onDeleteToken,
  onClose
}: InspectorPaneProps) {
  const className = token
    ? `${styles.shellPane} ${styles.inspectorColumn} ${styles.inspectorColumnOpen} ${styles.paneStack}`
    : `${styles.shellPane} ${styles.inspectorColumn} ${styles.paneStack}`;
  const badgeLabel = readOnlyBadgeLabel(token);

  return (
    <section className={className}>
      <Flex direction="column" gap="3" className={styles.paneStack}>
        <Flex align="center" justify="between" gap="2">
          <Flex align="center" gap="2" wrap="wrap">
            <Heading size="5">Inspector</Heading>
            {badgeLabel ? <Badge variant="soft">{badgeLabel}</Badge> : null}
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
              onDeleteToken={onDeleteToken}
            />
          </Flex>
        </ScrollArea>
      </Flex>
    </section>
  );
}
