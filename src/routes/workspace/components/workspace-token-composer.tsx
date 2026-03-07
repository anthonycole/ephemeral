"use client";

import { type FormEvent } from "react";
import { Plus as PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Popover, Select, Text, TextField } from "@radix-ui/themes";
import type { TokenCategory } from "@/model/tokens/design-tokens";
import { CATEGORY_DEFINITIONS } from "@/routes/workspace/config";
import type { CreateTokenInput } from "@/routes/workspace/components/workspace-header-action-types";
import { useWorkspaceTokenComposerState } from "@/routes/workspace/components/use-workspace-token-composer-state";
import { WorkspaceTokenComposerValueField } from "@/routes/workspace/components/workspace-token-composer-value-field";
import type { ImportedGoogleFont } from "@/model/tokens/font-utils";
import type { TypographyTokenType } from "@/routes/workspace/components/workspace-token-composer-utils";
import styles from "@/routes/workspace/styles.module.css";

type WorkspaceTokenComposerProps = {
  importedGoogleFonts: ImportedGoogleFont[];
  onCreateToken: (input: CreateTokenInput) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WorkspaceTokenComposer({ importedGoogleFonts, onCreateToken, open, onOpenChange }: WorkspaceTokenComposerProps) {
  const composer = useWorkspaceTokenComposerState({
    importedGoogleFonts,
    onCreateToken,
    onOpenChange,
    open
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    composer.handleSubmit();
  }

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger>
        <Button type="button" variant="soft" color="gray" className={styles.headerIconControl} aria-label="Add token" title="Add token">
          <PlusIcon size={16} weight="regular" />
          <span className={styles.srOnly}>Add token</span>
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        sideOffset={8}
        className={`${styles.tokenComposerContent} ${composer.isWideLayout ? styles.tokenComposerContentWide : ""}`.trim()}
      >
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Add token
              </Text>
              <Text size="1" color="gray">
                Choose a category, token name, and a starting value.
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">
                Category
              </Text>
              <Select.Root value={composer.tokenCategory} onValueChange={(value) => composer.setTokenCategory(value as Exclude<TokenCategory, "all">)}>
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  {CATEGORY_DEFINITIONS.map((definition) => (
                    <Select.Item key={definition.key} value={definition.key}>
                      {definition.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
            {composer.tokenCategory === "typography" ? (
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                  Type
                </Text>
                <Select.Root
                  value={composer.typographyTokenType}
                  onValueChange={(value) => composer.setTypographyTokenType(value as TypographyTokenType)}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="font-family">Font family</Select.Item>
                    <Select.Item value="font-size">Type scale</Select.Item>
                    <Select.Item value="font-weight">Weight</Select.Item>
                    <Select.Item value="line-height">Line height</Select.Item>
                    <Select.Item value="letter-spacing">Letter spacing</Select.Item>
                    <Select.Item value="text-shadow">Text shadow</Select.Item>
                    <Select.Item value="custom">Custom</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
            ) : null}
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">
                Token name
              </Text>
              <TextField.Root
                value={composer.tokenName}
                onChange={(event) => composer.setTokenName(event.target.value)}
                placeholder="--color-brand-500"
                className={`${styles.tokenComposerField} ${styles.codeLikeField}`}
              />
              <Text size="1" color="gray">
                Required. Use a CSS custom property name.
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">
                Value
              </Text>
              <WorkspaceTokenComposerValueField
                tokenCategory={composer.tokenCategory}
                typographyTokenType={composer.typographyTokenType}
                colorComposerMode={composer.colorComposerMode}
                onColorComposerModeChange={composer.setColorComposerMode}
                previewColorValue={composer.previewColorValue}
                normalizedColorValue={composer.normalizedColorValue}
                tokenColorValue={composer.tokenColorValue}
                onTokenColorValueChange={composer.setTokenColorValue}
                tokenCssColorValue={composer.tokenCssColorValue}
                onTokenCssColorValueChange={composer.setTokenCssColorValue}
                cssColor={composer.cssColor}
                onCssPickerColorChange={composer.setCssColor}
                cssPickerVersion={composer.cssPickerVersion}
                importedTypographyFamilies={composer.importedTypographyFamilies}
                selectedTypographyFamily={composer.selectedTypographyFamily}
                onTypographyFamilyChange={composer.setTokenFontFamily}
                tokenName={composer.tokenName}
                usesManagedUnit={composer.usesManagedUnit}
                tokenUnit={composer.tokenUnit}
                onTokenUnitChange={composer.setTokenUnit}
                availableUnits={composer.availableUnits}
                tokenUnitAmount={composer.tokenUnitAmount}
                onTokenUnitAmountChange={composer.setTokenUnitAmount}
                tokenRawValue={composer.tokenRawValue}
                onTokenRawValueChange={composer.setTokenRawValue}
              />
            </Flex>
            <Flex justify="end">
              <Button type="submit" disabled={!composer.canSubmit}>
                Add
              </Button>
            </Flex>
          </Flex>
        </form>
      </Popover.Content>
    </Popover.Root>
  );
}
