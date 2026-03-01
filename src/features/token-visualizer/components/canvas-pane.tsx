import { Flex, Grid, Heading, ScrollArea, Text, TextField } from "@radix-ui/themes";
import type { TokenCategory } from "@/lib/design-tokens";
import { CATEGORY_DEFINITIONS } from "@/features/token-visualizer/config";
import { CategoryPanel } from "@/features/token-visualizer/components/category-panel";
import { CategoryTabs } from "@/features/token-visualizer/components/category-tabs";
import type { TokenCounts, TokenGroups } from "@/features/token-visualizer/types";
import styles from "@/features/token-visualizer/styles.module.css";

type CanvasPaneProps = {
  activeCategory: TokenCategory;
  onActiveCategoryChange: (value: TokenCategory) => void;
  counts: TokenCounts;
  visibleCount: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  groupedVisibleTokens: TokenGroups;
  onSelectToken: (name: string) => void;
  supportsVirtualizedSingleCategory: boolean;
};

export function CanvasPane({
  activeCategory,
  onActiveCategoryChange,
  counts,
  visibleCount,
  searchQuery,
  onSearchQueryChange,
  groupedVisibleTokens,
  onSelectToken,
  supportsVirtualizedSingleCategory
}: CanvasPaneProps) {
  const activeCategoryKey = activeCategory as Exclude<TokenCategory, "all">;

  return (
    <section className={`${styles.shellPane} ${styles.centerPane} ${styles.paneStack}`}>
      <Flex direction="column" gap="4" className={`${styles.canvasContent} ${styles.paneStack}`}>
        <Flex align="center" justify="between">
          <Heading size="6">Token Canvas</Heading>
          <Text size="2" color="gray">
            {visibleCount} visible
          </Text>
        </Flex>
        <div data-workspace-search-field="">
          <TextField.Root
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search tokens"
            size="3"
            className={styles.canvasSearchField}
          />
        </div>
        <CategoryTabs activeCategory={activeCategory} onActiveCategoryChange={onActiveCategoryChange} counts={counts} />
        {activeCategory === "all" || !supportsVirtualizedSingleCategory ? (
          <ScrollArea type="auto" scrollbars="vertical" className={styles.paneScroll}>
            <Flex direction="column" gap="4" pr="2">
              {activeCategory === "all" ? (
                <Grid columns={{ initial: "1", xl: "2" }} gap="3">
                  {CATEGORY_DEFINITIONS.map((definition) => (
                    <CategoryPanel
                      key={definition.key}
                      category={definition.key}
                      tokens={groupedVisibleTokens[definition.key]}
                      onSelect={onSelectToken}
                    />
                  ))}
                </Grid>
              ) : (
                <CategoryPanel category={activeCategoryKey} tokens={groupedVisibleTokens[activeCategoryKey]} onSelect={onSelectToken} />
              )}
            </Flex>
          </ScrollArea>
        ) : (
          <div className={styles.paneScroll}>
            <CategoryPanel category={activeCategoryKey} tokens={groupedVisibleTokens[activeCategoryKey]} onSelect={onSelectToken} virtualize />
          </div>
        )}
      </Flex>
    </section>
  );
}
