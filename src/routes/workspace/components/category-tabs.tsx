import { Flex, Tabs } from "@radix-ui/themes";
import type { TokenCategory } from "@/model/tokens/design-tokens";
import { ALL_CATEGORY_ICON, CATEGORY_DEFINITIONS } from "@/routes/workspace/config";
import type { TokenCounts } from "@/routes/workspace/types";

type CategoryTabsProps = {
  activeCategory: TokenCategory;
  onActiveCategoryChange: (value: TokenCategory) => void;
  counts: TokenCounts;
};

export function CategoryTabs({ activeCategory, onActiveCategoryChange, counts }: CategoryTabsProps) {
  const visibleCategories = CATEGORY_DEFINITIONS.filter((definition) => counts[definition.key] > 0);

  return (
    <div className="overflow-x-auto">
      <Tabs.Root value={activeCategory} onValueChange={(value) => onActiveCategoryChange(value as TokenCategory)}>
        <Tabs.List size="1" className="min-w-max">
          <Tabs.Trigger value="all">
            <Flex align="center" gap="1">
              <ALL_CATEGORY_ICON size={14} />
              <span>All</span>
              <span>({counts.all})</span>
            </Flex>
          </Tabs.Trigger>
          {visibleCategories.map((definition) => (
            <Tabs.Trigger key={definition.key} value={definition.key}>
              <Flex align="center" gap="1">
                <definition.Icon size={14} />
                <span>{definition.label}</span>
                <span>({counts[definition.key]})</span>
              </Flex>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
    </div>
  );
}
