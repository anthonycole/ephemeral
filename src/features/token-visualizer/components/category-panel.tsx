import { Badge, Card, Flex, Strong } from "@radix-ui/themes";
import type { TokenCategory } from "@/lib/design-tokens";
import type { TokenRecord } from "@/features/token-visualizer/document";
import type { ImportedGoogleFont } from "@/features/token-visualizer/font-utils";
import { getCategoryDefinition } from "@/features/token-visualizer/config";

type CategoryPanelProps = {
  category: Exclude<TokenCategory, "all">;
  tokens: TokenRecord[];
  onSelect: (tokenId: string) => void;
  importedGoogleFonts?: ImportedGoogleFont[];
  onImportGoogleFont?: (family: string) => void;
  onRemoveGoogleFont?: (family: string) => void;
  virtualize?: boolean;
};

export function CategoryPanel({
  category,
  tokens,
  onSelect,
  importedGoogleFonts,
  onImportGoogleFont,
  onRemoveGoogleFont,
  virtualize = false
}: CategoryPanelProps) {
  if (tokens.length === 0) {
    return null;
  }

  const definition = getCategoryDefinition(category);

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Strong>{definition.label}</Strong>
          <Badge variant="soft">{tokens.length}</Badge>
        </Flex>
        {definition.render(tokens, onSelect, { virtualize, importedGoogleFonts, onImportGoogleFont, onRemoveGoogleFont })}
      </Flex>
    </Card>
  );
}
