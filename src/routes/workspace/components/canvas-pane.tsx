import { Flex, Grid, Heading, ScrollArea, Text, TextField } from "@radix-ui/themes";
import type { TokenCategory } from "@/model/tokens/design-tokens";
import { CATEGORY_DEFINITIONS } from "@/routes/workspace/config";
import { CategoryPanel } from "@/routes/workspace/components/category-panel";
import { CategoryTabs } from "@/routes/workspace/components/category-tabs";
import type { ImportedGoogleFont } from "@/model/tokens/font-utils";
import type { TokenCounts, TokenGroups } from "@/routes/workspace/types";
import type { TokenSourceFilter } from "@/routes/workspace/hooks/use-token-workspace";
import styles from "@/routes/workspace/styles.module.css";

type CanvasPaneProps = {
  activeCategory: TokenCategory;
  onActiveCategoryChange: (value: TokenCategory) => void;
  counts: TokenCounts;
  visibleCount: number;
  sourceFilter: TokenSourceFilter;
  onSourceFilterChange: (value: TokenSourceFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  importedGoogleFonts: ImportedGoogleFont[];
  onImportGoogleFont: (family: string) => void;
  onRemoveGoogleFont: (family: string) => void;
  groupedVisibleTokens: TokenGroups;
  onSelectToken: (name: string) => void;
  supportsVirtualizedSingleCategory: boolean;
};

export function CanvasPane({
  activeCategory,
  onActiveCategoryChange,
  counts,
  visibleCount,
  sourceFilter,
  onSourceFilterChange,
  searchQuery,
  onSearchQueryChange,
  importedGoogleFonts,
  onImportGoogleFont,
  onRemoveGoogleFont,
  groupedVisibleTokens,
  onSelectToken,
  supportsVirtualizedSingleCategory
}: CanvasPaneProps) {
  const activeCategoryKey = activeCategory as Exclude<TokenCategory, "all">;

  return (
    <section className={`${styles.shellPane} ${styles.centerPane} ${styles.paneStack}`}>
      <Flex direction="column" gap="4" className={`${styles.canvasContent} ${styles.paneStack}`}>
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Flex direction="column" gap="1">
            <Heading size="6">Token Canvas</Heading>
            <Text size="2" color="gray">
              {visibleCount} visible
            </Text>
          </Flex>
          <div>
            <label className={styles.srOnly} htmlFor="token-source-filter">
              Filter token source
            </label>
            <select
              id="token-source-filter"
              value={sourceFilter}
              onChange={(event) => onSourceFilterChange(event.target.value as TokenSourceFilter)}
              className={styles.sourceFilterSelect}
            >
              <option value="all">All tokens</option>
              <option value="authored">Editable only</option>
              <option value="defaults">Tailwind defaults</option>
            </select>
          </div>
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
                      importedGoogleFonts={importedGoogleFonts}
                      onImportGoogleFont={onImportGoogleFont}
                      onRemoveGoogleFont={onRemoveGoogleFont}
                    />
                  ))}
                </Grid>
              ) : (
                <CategoryPanel
                  category={activeCategoryKey}
                  tokens={groupedVisibleTokens[activeCategoryKey]}
                  onSelect={onSelectToken}
                  importedGoogleFonts={importedGoogleFonts}
                  onImportGoogleFont={onImportGoogleFont}
                  onRemoveGoogleFont={onRemoveGoogleFont}
                />
              )}
            </Flex>
          </ScrollArea>
        ) : (
          <div className={styles.paneScroll}>
            <CategoryPanel
              category={activeCategoryKey}
              tokens={groupedVisibleTokens[activeCategoryKey]}
              onSelect={onSelectToken}
              importedGoogleFonts={importedGoogleFonts}
              onImportGoogleFont={onImportGoogleFont}
              onRemoveGoogleFont={onRemoveGoogleFont}
              virtualize
            />
          </div>
        )}
      </Flex>
    </section>
  );
}
