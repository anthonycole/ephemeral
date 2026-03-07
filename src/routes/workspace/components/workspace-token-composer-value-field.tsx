"use client";

import { Badge, Flex, Select, Text, TextField } from "@radix-ui/themes";
import TerrazzoColorPicker from "@terrazzo/react-color-picker";
import type { ColorInput, ColorOutput } from "@terrazzo/use-color";
import { HexAlphaColorPicker } from "react-colorful";
import type { TokenCategory } from "@/model/tokens/design-tokens";
import {
  ColorComposerMode,
  DEFAULT_COLOR_VALUE,
  TokenComposerUnit,
  TypographyTokenType
} from "@/routes/workspace/components/workspace-token-composer-utils";
import { buildFontFamilyValue } from "@/model/tokens/font-utils";
import styles from "@/routes/workspace/styles.module.css";

type WorkspaceTokenComposerValueFieldProps = {
  tokenCategory: Exclude<TokenCategory, "all">;
  typographyTokenType: TypographyTokenType;
  colorComposerMode: ColorComposerMode;
  onColorComposerModeChange: (value: ColorComposerMode) => void;
  previewColorValue: string | null;
  normalizedColorValue: string | null;
  tokenColorValue: string;
  onTokenColorValueChange: (value: string) => void;
  tokenCssColorValue: string;
  onTokenCssColorValueChange: (value: string) => void;
  cssColor: ColorOutput;
  onCssPickerColorChange: (nextValue: ColorInput) => void;
  cssPickerVersion: number;
  importedTypographyFamilies: string[];
  selectedTypographyFamily: string;
  onTypographyFamilyChange: (value: string) => void;
  tokenName: string;
  usesManagedUnit: boolean;
  tokenUnit: TokenComposerUnit;
  onTokenUnitChange: (value: TokenComposerUnit) => void;
  availableUnits: readonly TokenComposerUnit[];
  tokenUnitAmount: string;
  onTokenUnitAmountChange: (value: string) => void;
  tokenRawValue: string;
  onTokenRawValueChange: (value: string) => void;
};

export function WorkspaceTokenComposerValueField({
  tokenCategory,
  typographyTokenType,
  colorComposerMode,
  onColorComposerModeChange,
  previewColorValue,
  normalizedColorValue,
  tokenColorValue,
  onTokenColorValueChange,
  tokenCssColorValue,
  onTokenCssColorValueChange,
  cssColor,
  onCssPickerColorChange,
  cssPickerVersion,
  importedTypographyFamilies,
  selectedTypographyFamily,
  onTypographyFamilyChange,
  tokenName,
  usesManagedUnit,
  tokenUnit,
  onTokenUnitChange,
  availableUnits,
  tokenUnitAmount,
  onTokenUnitAmountChange,
  tokenRawValue,
  onTokenRawValueChange
}: WorkspaceTokenComposerValueFieldProps) {
  const fontStackPreview = buildFontFamilyValue(selectedTypographyFamily || "Inter", tokenName || "--font-family");

  if (tokenCategory === "color") {
    return (
      <Flex direction="column" gap="2">
        <Flex align="center" justify="between" gap="2" wrap="wrap">
          <Badge variant="soft">{colorComposerMode === "hex" ? "Hex" : "Advanced color"}</Badge>
          <Select.Root value={colorComposerMode} onValueChange={(value) => onColorComposerModeChange(value as ColorComposerMode)}>
            <Select.Trigger style={{ minWidth: 112 }} />
            <Select.Content>
              <Select.Item value="hex">Hex</Select.Item>
              <Select.Item value="css">Advanced color</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
        <div className={styles.tokenComposerColorPreview}>
          <div className={styles.tokenComposerColorSwatch} style={{ background: previewColorValue ?? "linear-gradient(135deg, var(--gray-4), var(--gray-6))" }} />
          <div className={styles.tokenComposerColorMeta}>
            <Text size="1" color="gray">
              Preview
            </Text>
            <Text size="2" className={styles.colorHexField}>
              {previewColorValue ?? "Invalid color"}
            </Text>
          </div>
        </div>
        {colorComposerMode === "hex" ? (
          <>
            <div className={styles.colorPickerWrap}>
              <HexAlphaColorPicker color={normalizedColorValue ?? DEFAULT_COLOR_VALUE} onChange={onTokenColorValueChange} />
            </div>
            <TextField.Root
              autoFocus
              value={tokenColorValue}
              onChange={(event) => onTokenColorValueChange(event.target.value)}
              placeholder="#2563eb"
              className={`${styles.tokenComposerField} ${styles.codeLikeField} ${styles.colorHexField}`}
            />
          </>
        ) : (
          <>
            <div className={`${styles.terrazzoColorPickerWrap} ${styles.tokenComposerTerrazzoWrap}`}>
              <TerrazzoColorPicker key={`header-color-${cssPickerVersion}`} color={cssColor} setColor={onCssPickerColorChange} />
            </div>
            <TextField.Root
              autoFocus
              value={tokenCssColorValue}
              onChange={(event) => onTokenCssColorValueChange(event.target.value)}
              placeholder="oklch(0.62 0.19 259)"
              className={`${styles.tokenComposerField} ${styles.codeLikeField} ${styles.colorHexField}`}
            />
          </>
        )}
      </Flex>
    );
  }

  if (tokenCategory === "typography" && typographyTokenType === "font-family") {
    return (
      <Flex direction="column" gap="2">
        {importedTypographyFamilies.length > 0 ? (
          <Select.Root value={selectedTypographyFamily} onValueChange={onTypographyFamilyChange}>
            <Select.Trigger className={styles.codeLikeSelectTrigger} />
            <Select.Content>
              {importedTypographyFamilies.map((family) => (
                <Select.Item key={family} value={family}>
                  {family}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        ) : (
          <Text size="2" color="gray">
            Add a font in Typography first, then create a font-family token here.
          </Text>
        )}
        <Text size="1" color="gray">
          Uses the imported font stack for this token.
        </Text>
        <pre className={styles.codeLikeReadout}>{fontStackPreview}</pre>
      </Flex>
    );
  }

  return (
    <Flex gap="2">
      {usesManagedUnit ? (
        <TextField.Root
          autoFocus
          type={tokenCategory === "typography" && typographyTokenType === "font-weight" ? "number" : usesManagedUnit ? "number" : undefined}
          step={
            tokenCategory === "typography" && typographyTokenType === "font-weight"
              ? "100"
              : tokenUnit === "ms" || tokenUnit === "s"
                ? "0.05"
                : "0.0625"
          }
          value={tokenUnitAmount}
          onChange={(event) => onTokenUnitAmountChange(event.target.value)}
          placeholder={
            tokenCategory === "typography" && typographyTokenType === "font-weight"
              ? "400"
              : tokenCategory === "typography" && typographyTokenType === "font-size"
                ? "1"
                : tokenCategory === "typography" && typographyTokenType === "letter-spacing"
                  ? "0.02"
                  : "Value"
          }
          className={`${styles.tokenComposerField} ${styles.codeLikeField}`}
        />
      ) : (
        <TextField.Root
          autoFocus
          value={tokenRawValue}
          onChange={(event) => onTokenRawValueChange(event.target.value)}
          placeholder={
            tokenCategory === "typography" && typographyTokenType === "line-height"
              ? "1.4"
              : tokenCategory === "typography" && typographyTokenType === "text-shadow"
                ? "0 1px 2px rgb(0 0 0 / 0.2)"
                : "Value"
          }
          className={`${styles.tokenComposerField} ${styles.codeLikeField}`}
        />
      )}
      {availableUnits.length > 1 ? (
        <Select.Root value={tokenUnit} onValueChange={(value) => onTokenUnitChange(value as TokenComposerUnit)}>
          <Select.Trigger style={{ minWidth: 96 }} className={styles.codeLikeSelectTrigger} />
          <Select.Content>
            {availableUnits.map((unit) => (
              <Select.Item key={unit} value={unit}>
                {unit === "raw" ? "Raw CSS" : unit}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      ) : null}
    </Flex>
  );
}
