"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Code as CodeIcon, Command as CommandIcon, Plus as PlusIcon } from "@phosphor-icons/react";
import { Badge, Button, Flex, Heading, Popover, Select, Text, TextField } from "@radix-ui/themes";
import TerrazzoColorPicker from "@terrazzo/react-color-picker";
import useColor, { parse as parseTerrazzoColor } from "@terrazzo/use-color";
import { HexAlphaColorPicker } from "react-colorful";
import type { TokenCategory } from "@/lib/design-tokens";
import { CATEGORY_DEFINITIONS } from "@/features/token-visualizer/config";
import { buildFontFamilyValue, type ImportedGoogleFont } from "@/features/token-visualizer/font-utils";
import type { EditableDurationUnit, EditableLengthUnit } from "@/features/token-visualizer/utils";
import { formatDurationValue, formatLengthValue } from "@/features/token-visualizer/utils";
import styles from "@/features/token-visualizer/styles.module.css";

export type PersistenceStatus = "loading" | "saving" | "saved" | "error";
type CreateTokenInput = {
  category: Exclude<TokenCategory, "all">;
  name?: string;
  value: string;
};

type TokenComposerUnit = "raw" | EditableLengthUnit | EditableDurationUnit;
type ColorComposerMode = "hex" | "css";
type TypographyTokenType = "font-family" | "font-size" | "font-weight" | "line-height" | "letter-spacing" | "text-shadow" | "custom";

type WorkspaceHeaderProps = {
  importedGoogleFonts: ImportedGoogleFont[];
  onCreateToken: (input: CreateTokenInput) => void;
  onOpenEditor: () => void;
  onOpenCommandPalette: () => void;
  onTokenComposerOpenChange: (open: boolean) => void;
  persistenceStatus: PersistenceStatus;
  tokenComposerOpen: boolean;
};

const persistenceLabels: Record<PersistenceStatus, string> = {
  loading: "Loading workspace",
  saving: "Saving workspace",
  saved: "Workspace saved",
  error: "Save failed"
};

const DEFAULT_TOKEN_CATEGORY: Exclude<TokenCategory, "all"> = "other";
const DEFAULT_COLOR_VALUE = "#2563eb";
const DEFAULT_CSS_COLOR_VALUE = "oklch(0.62 0.19 259)";
const DEFAULT_TYPOGRAPHY_TOKEN_TYPE: TypographyTokenType = "font-size";

function expandShortHex(value: string) {
  return value
    .split("")
    .map((char) => char + char)
    .join("");
}

function clampColorByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function formatHexByte(value: number) {
  return clampColorByte(value).toString(16).padStart(2, "0");
}

function rgbaStringToHex(value: string) {
  const match = value.match(/^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);

  if (!match) {
    return null;
  }

  const red = Number.parseFloat(match[1]);
  const green = Number.parseFloat(match[2]);
  const blue = Number.parseFloat(match[3]);

  if ([red, green, blue].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  const alphaValue = match[4];
  const alpha = !alphaValue
    ? 1
    : alphaValue.endsWith("%")
      ? Number.parseFloat(alphaValue) / 100
      : Number.parseFloat(alphaValue);

  if (Number.isNaN(alpha)) {
    return null;
  }

  const rgbHex = `#${formatHexByte(red)}${formatHexByte(green)}${formatHexByte(blue)}`;
  const alphaHex = formatHexByte(alpha * 255);
  return alphaHex === "ff" ? rgbHex : `${rgbHex}${alphaHex}`;
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim().toLowerCase();

  if (/^#[\da-f]{3}$/i.test(trimmed)) {
    return `#${expandShortHex(trimmed.slice(1))}`;
  }

  if (/^#[\da-f]{4}$/i.test(trimmed)) {
    return `#${expandShortHex(trimmed.slice(1))}`;
  }

  if (/^#[\da-f]{6}$/i.test(trimmed) || /^#[\da-f]{8}$/i.test(trimmed)) {
    return trimmed;
  }

  if (typeof document !== "undefined") {
    const element = document.createElement("span");
    element.style.color = "";
    element.style.color = trimmed;

    if (element.style.color) {
      return rgbaStringToHex(element.style.color);
    }
  }

  return null;
}

function supportsTerrazzoColor(value: string) {
  try {
    const parsed = parseTerrazzoColor(value);
    return Boolean(parsed?.original?.space);
  } catch {
    return false;
  }
}

function getUnitOptions(category: Exclude<TokenCategory, "all">, typographyTokenType: TypographyTokenType) {
  if (category === "spacing" || category === "radius" || category === "sizing" || category === "breakpoint") {
    return ["rem", "px"] as const;
  }

  if (category === "motion") {
    return ["ms", "s"] as const;
  }

  if (category === "typography") {
    if (typographyTokenType === "font-size" || typographyTokenType === "letter-spacing") {
      return ["rem", "px"] as const;
    }

    if (typographyTokenType === "custom") {
      return ["raw", "rem", "px"] as const;
    }

    return ["raw"] as const;
  }

  return ["raw"] as const;
}

function defaultUnitForCategory(category: Exclude<TokenCategory, "all">, typographyTokenType: TypographyTokenType): TokenComposerUnit {
  if (category === "breakpoint") {
    return "px";
  }

  if (category === "spacing" || category === "radius" || category === "sizing") {
    return "rem";
  }

  if (category === "motion") {
    return "ms";
  }

  if (category === "typography") {
    if (typographyTokenType === "font-size" || typographyTokenType === "letter-spacing") {
      return "rem";
    }

    return "raw";
  }

  return "raw";
}

function getTypographyTokenName(tokenType: TypographyTokenType) {
  switch (tokenType) {
    case "font-family":
      return "--font-family";
    case "font-size":
      return "--font-size";
    case "font-weight":
      return "--font-weight";
    case "line-height":
      return "--line-height";
    case "letter-spacing":
      return "--letter-spacing";
    case "text-shadow":
      return "--text-shadow";
    default:
      return undefined;
  }
}

function isLengthUnit(value: TokenComposerUnit): value is EditableLengthUnit {
  return value === "px" || value === "rem";
}

function isDurationUnit(value: TokenComposerUnit): value is EditableDurationUnit {
  return value === "ms" || value === "s";
}

export function WorkspaceHeader({
  importedGoogleFonts,
  onCreateToken,
  onOpenEditor,
  onOpenCommandPalette,
  onTokenComposerOpenChange,
  persistenceStatus,
  tokenComposerOpen
}: WorkspaceHeaderProps) {
  const [tokenCategory, setTokenCategory] = useState<Exclude<TokenCategory, "all">>(DEFAULT_TOKEN_CATEGORY);
  const [typographyTokenType, setTypographyTokenType] = useState<TypographyTokenType>(DEFAULT_TYPOGRAPHY_TOKEN_TYPE);
  const [tokenRawValue, setTokenRawValue] = useState("");
  const [tokenColorValue, setTokenColorValue] = useState(DEFAULT_COLOR_VALUE);
  const [tokenCssColorValue, setTokenCssColorValue] = useState(DEFAULT_CSS_COLOR_VALUE);
  const [tokenFontFamily, setTokenFontFamily] = useState("");
  const [colorComposerMode, setColorComposerMode] = useState<ColorComposerMode>("hex");
  const [tokenUnit, setTokenUnit] = useState<TokenComposerUnit>(defaultUnitForCategory(DEFAULT_TOKEN_CATEGORY, DEFAULT_TYPOGRAPHY_TOKEN_TYPE));
  const [tokenUnitAmount, setTokenUnitAmount] = useState("");
  const [cssColor, setCssColor] = useColor(DEFAULT_CSS_COLOR_VALUE);
  const [cssPickerVersion, setCssPickerVersion] = useState(0);
  const availableUnits = getUnitOptions(tokenCategory, typographyTokenType);
  const usesManagedUnit = tokenUnit !== "raw";
  const importedTypographyFamilies = useMemo(() => importedGoogleFonts.map((font) => font.family), [importedGoogleFonts]);
  const selectedTypographyFamily = tokenFontFamily || importedTypographyFamilies[0] || "";
  const normalizedColorValue = normalizeHexColor(tokenColorValue);
  const validCssColorValue = supportsTerrazzoColor(tokenCssColorValue) ? tokenCssColorValue : null;
  const previewColorValue = useMemo(() => {
    if (tokenCategory !== "color") {
      return null;
    }

    return colorComposerMode === "hex" ? normalizedColorValue : validCssColorValue;
  }, [colorComposerMode, normalizedColorValue, tokenCategory, validCssColorValue]);
  const canSubmit =
    tokenCategory === "color"
      ? colorComposerMode === "hex"
        ? normalizedColorValue !== null
        : validCssColorValue !== null
      : tokenCategory === "typography" && typographyTokenType === "font-family"
        ? selectedTypographyFamily.trim().length > 0
      : usesManagedUnit
        ? tokenUnitAmount.trim() !== "" && !Number.isNaN(Number.parseFloat(tokenUnitAmount))
        : tokenRawValue.trim() !== "";

  useEffect(() => {
    if (tokenComposerOpen) {
      return;
    }

    setTokenCategory(DEFAULT_TOKEN_CATEGORY);
    setTypographyTokenType(DEFAULT_TYPOGRAPHY_TOKEN_TYPE);
    setTokenRawValue("");
    setTokenColorValue(DEFAULT_COLOR_VALUE);
    setTokenCssColorValue(DEFAULT_CSS_COLOR_VALUE);
    setTokenFontFamily(importedGoogleFonts[0]?.family ?? "");
    setColorComposerMode("hex");
    setTokenUnit(defaultUnitForCategory(DEFAULT_TOKEN_CATEGORY, DEFAULT_TYPOGRAPHY_TOKEN_TYPE));
    setTokenUnitAmount("");
    setCssColor(DEFAULT_CSS_COLOR_VALUE);
    setCssPickerVersion((current) => current + 1);
  }, [importedGoogleFonts, setCssColor, tokenComposerOpen]);

  useEffect(() => {
    if (tokenCategory !== "color" || colorComposerMode !== "css") {
      return;
    }

    if (!supportsTerrazzoColor(tokenCssColorValue)) {
      return;
    }

    setCssColor(tokenCssColorValue);
    setCssPickerVersion((current) => current + 1);
  }, [colorComposerMode, setCssColor, tokenCategory, tokenCssColorValue]);

  useEffect(() => {
    if (tokenCategory !== "color" || colorComposerMode !== "css") {
      return;
    }

    if (!cssColor?.original?.space) {
      return;
    }

    if (cssColor.css !== tokenCssColorValue) {
      setTokenCssColorValue(cssColor.css);
    }
  }, [colorComposerMode, cssColor?.css, cssColor?.original?.space, tokenCategory, tokenCssColorValue]);

  useEffect(() => {
    if (availableUnits.some((unit) => unit === tokenUnit)) {
      return;
    }

    setTokenUnit(defaultUnitForCategory(tokenCategory, typographyTokenType));
  }, [availableUnits, tokenCategory, tokenUnit, typographyTokenType]);

  useEffect(() => {
    if (tokenCategory !== "typography" || typographyTokenType !== "font-family") {
      return;
    }

    if (importedTypographyFamilies.length === 0) {
      if (tokenFontFamily) {
        setTokenFontFamily("");
      }
      return;
    }

    if (tokenFontFamily && importedTypographyFamilies.includes(tokenFontFamily)) {
      return;
    }

    setTokenFontFamily(importedTypographyFamilies[0]);
  }, [importedTypographyFamilies, tokenCategory, tokenFontFamily, typographyTokenType]);

  function handleCreateToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let nextValue = tokenRawValue.trim();
    let nextName: string | undefined;

    if (tokenCategory === "color") {
      nextValue = colorComposerMode === "hex" ? normalizedColorValue ?? "" : validCssColorValue ?? "";
    } else if (tokenCategory === "typography" && typographyTokenType === "font-family") {
      nextName = getTypographyTokenName(typographyTokenType);
      nextValue = buildFontFamilyValue(selectedTypographyFamily, nextName ?? "--font-family");
    } else if (tokenCategory === "typography") {
      nextName = getTypographyTokenName(typographyTokenType);
    } else if (usesManagedUnit) {
      const numeric = Number.parseFloat(tokenUnitAmount);

      if (Number.isNaN(numeric)) {
          return;
      }

      nextValue = isLengthUnit(tokenUnit) ? formatLengthValue(numeric, tokenUnit) : isDurationUnit(tokenUnit) ? formatDurationValue(numeric, tokenUnit) : "";
    }

    if (tokenCategory === "typography" && usesManagedUnit) {
      const numeric = Number.parseFloat(tokenUnitAmount);

      if (Number.isNaN(numeric)) {
        return;
      }

      nextName = getTypographyTokenName(typographyTokenType);
      nextValue = isLengthUnit(tokenUnit) ? formatLengthValue(numeric, tokenUnit) : isDurationUnit(tokenUnit) ? formatDurationValue(numeric, tokenUnit) : "";
    }

    if (!nextValue) {
      return;
    }

    onCreateToken({
      category: tokenCategory,
      name: nextName,
      value: nextValue
    });
    onTokenComposerOpenChange(false);
  }

  return (
    <header className={styles.appHeader}>
      <div className={styles.appHeaderGrid}>
        <Flex direction="column" gap="1">
          <Heading size="6" className={styles.appTitle}>
            ephemeral
          </Heading>
          <span className={styles.appStatus}>{persistenceLabels[persistenceStatus]}</span>
        </Flex>
        <Flex align="center" justify="end" gap="2" pr="3">
          <Popover.Root open={tokenComposerOpen} onOpenChange={onTokenComposerOpenChange}>
            <Popover.Trigger>
              <Button
                type="button"
                variant="soft"
                color="gray"
                className={`${styles.headerActionButton} ${styles.headerIconButton}`}
                aria-label="Add token"
                title="Add token"
              >
                <PlusIcon size={16} weight="regular" />
                <span className={styles.srOnly}>Add token</span>
              </Button>
            </Popover.Trigger>
            <Popover.Content
              align="end"
              sideOffset={8}
              className={`${styles.tokenComposerContent} ${tokenCategory === "color" || tokenCategory === "typography" ? styles.tokenComposerContentWide : ""}`.trim()}
            >
              <form onSubmit={handleCreateToken}>
                <Flex direction="column" gap="3">
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">
                      Add token
                    </Text>
                    <Text size="1" color="gray">
                      Choose a category and add a starting value.
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                      Category
                    </Text>
                    <Select.Root value={tokenCategory} onValueChange={(value) => setTokenCategory(value as Exclude<TokenCategory, "all">)}>
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
                  {tokenCategory === "typography" ? (
                    <Flex direction="column" gap="1">
                      <Text size="1" color="gray">
                        Type
                      </Text>
                      <Select.Root value={typographyTokenType} onValueChange={(value) => setTypographyTokenType(value as TypographyTokenType)}>
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
                      Value
                    </Text>
                    {tokenCategory === "color" ? (
                      <Flex direction="column" gap="2">
                        <Flex align="center" justify="between" gap="2" wrap="wrap">
                          <Badge variant="soft">{colorComposerMode === "hex" ? "Hex" : "Advanced color"}</Badge>
                          <Select.Root value={colorComposerMode} onValueChange={(value) => setColorComposerMode(value as ColorComposerMode)}>
                            <Select.Trigger style={{ minWidth: 112 }} />
                            <Select.Content>
                              <Select.Item value="hex">Hex</Select.Item>
                              <Select.Item value="css">Advanced color</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </Flex>
                        <div className={styles.tokenComposerColorPreview}>
                          <div
                            className={styles.tokenComposerColorSwatch}
                            style={{ background: previewColorValue ?? "linear-gradient(135deg, var(--gray-4), var(--gray-6))" }}
                          />
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
                              <HexAlphaColorPicker color={normalizedColorValue ?? DEFAULT_COLOR_VALUE} onChange={setTokenColorValue} />
                            </div>
                            <TextField.Root
                              autoFocus
                              value={tokenColorValue}
                              onChange={(event) => setTokenColorValue(event.target.value)}
                              placeholder="#2563eb"
                              className={`${styles.tokenComposerField} ${styles.colorHexField}`}
                            />
                          </>
                        ) : (
                          <>
                            <div className={`${styles.terrazzoColorPickerWrap} ${styles.tokenComposerTerrazzoWrap}`}>
                              <TerrazzoColorPicker
                                key={`header-color-${cssPickerVersion}`}
                                color={cssColor}
                                setColor={(nextValue) => {
                                  setCssColor(nextValue);
                                }}
                              />
                            </div>
                            <TextField.Root
                              autoFocus
                              value={tokenCssColorValue}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                setTokenCssColorValue(nextValue);

                                try {
                                  setCssColor(nextValue);
                                } catch {
                                  // Keep the draft visible while the user types an incomplete color.
                                }
                              }}
                              placeholder="oklch(0.62 0.19 259)"
                              className={`${styles.tokenComposerField} ${styles.colorHexField}`}
                            />
                          </>
                        )}
                      </Flex>
                    ) : tokenCategory === "typography" && typographyTokenType === "font-family" ? (
                      <Flex direction="column" gap="2">
                        {importedTypographyFamilies.length > 0 ? (
                          <Select.Root
                            value={selectedTypographyFamily}
                            onValueChange={(value) => {
                              setTokenFontFamily(value);
                            }}
                          >
                            <Select.Trigger />
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
                      </Flex>
                    ) : (
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
                            onChange={(event) => setTokenUnitAmount(event.target.value)}
                            placeholder={
                              tokenCategory === "typography" && typographyTokenType === "font-weight"
                                ? "400"
                                : tokenCategory === "typography" && typographyTokenType === "font-size"
                                  ? "1"
                                  : tokenCategory === "typography" && typographyTokenType === "letter-spacing"
                                    ? "0.02"
                                    : "Value"
                            }
                            className={styles.tokenComposerField}
                          />
                        ) : (
                          <TextField.Root
                            autoFocus
                            value={tokenRawValue}
                            onChange={(event) => setTokenRawValue(event.target.value)}
                            placeholder={
                              tokenCategory === "typography" && typographyTokenType === "line-height"
                                ? "1.4"
                                : tokenCategory === "typography" && typographyTokenType === "text-shadow"
                                  ? "0 1px 2px rgb(0 0 0 / 0.2)"
                                  : "Value"
                            }
                            className={styles.tokenComposerField}
                          />
                        )}
                        {availableUnits.length > 1 ? (
                          <Select.Root value={tokenUnit} onValueChange={(value) => setTokenUnit(value as TokenComposerUnit)}>
                            <Select.Trigger style={{ minWidth: 96 }} />
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
                    )}
                  </Flex>
                  <Flex justify="end">
                    <Button type="submit" disabled={!canSubmit}>
                      Add
                    </Button>
                  </Flex>
                </Flex>
              </form>
            </Popover.Content>
          </Popover.Root>
          <Button
            type="button"
            variant="soft"
            color="gray"
            onClick={onOpenEditor}
            className={styles.headerActionButton}
            aria-label="Open CSS import and export"
            title="Open CSS import and export"
          >
            <CodeIcon size={16} weight="regular" />
            <span className={styles.srOnly}>Open CSS import and export</span>
          </Button>
          <Button asChild type="button" variant="soft" color="gray" className={styles.headerActionButton}>
            <Link href="/playground">Open Playground</Link>
          </Button>
          <Button
            type="button"
            variant="soft"
            color="gray"
            onClick={onOpenCommandPalette}
            className={styles.commandTrigger}
            aria-label="Command K"
            title="Command K"
          >
            <CommandIcon size={16} weight="regular" />
            <span className={styles.commandTriggerKey}>K</span>
            <span className={styles.srOnly}>Command K</span>
          </Button>
        </Flex>
      </div>
    </header>
  );
}
