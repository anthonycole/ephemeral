import { Button, Flex, Heading, ScrollArea } from "@radix-ui/themes";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { InspectorContent } from "@/features/token-visualizer/components/inspector-content";
import styles from "@/features/token-visualizer/styles.module.css";

type InspectorPaneProps = {
  token: TokenRecord | null;
  onUpdateToken: (tokenId: string, updates: Partial<{ name: string; value: string; category: TokenRecord["category"] }>) => void;
  onClose: () => void;
};

export function InspectorPane({ token, onUpdateToken, onClose }: InspectorPaneProps) {
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
            <InspectorContent token={token} onUpdateToken={onUpdateToken} />
          </Flex>
        </ScrollArea>
      </Flex>
    </section>
  );
}
