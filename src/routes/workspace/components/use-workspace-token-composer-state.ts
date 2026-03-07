"use client";

import { useEffect, useMemo, useState } from "react";
import useColor from "@terrazzo/use-color";
import type { TokenCategory } from "@/model/tokens/design-tokens";
import { buildFontFamilyValue, type ImportedGoogleFont } from "@/model/tokens/font-utils";
import type { CreateTokenInput } from "@/routes/workspace/components/workspace-header-action-types";
import { formatDurationValue, formatLengthValue } from "@/routes/workspace/utils";
import {
  ColorComposerMode,
  DEFAULT_COLOR_VALUE,
  DEFAULT_CSS_COLOR_VALUE,
  DEFAULT_TOKEN_CATEGORY,
  DEFAULT_TYPOGRAPHY_TOKEN_TYPE,
  defaultUnitForCategory,
  getUnitOptions,
  isDurationUnit,
  isLengthUnit,
  normalizeHexColor,
  supportsTerrazzoColor,
  TokenComposerUnit,
  TypographyTokenType
} from "@/routes/workspace/components/workspace-token-composer-utils";

type UseWorkspaceTokenComposerStateInput = {
  importedGoogleFonts: ImportedGoogleFont[];
  onCreateToken: (input: CreateTokenInput) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function useWorkspaceTokenComposerState({ importedGoogleFonts, onCreateToken, onOpenChange, open }: UseWorkspaceTokenComposerStateInput) {
  const [tokenName, setTokenName] = useState("");
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
  const normalizedTokenName = normalizeTokenNameInput(tokenName);
  const previewColorValue = useMemo(() => {
    if (tokenCategory !== "color") {
      return null;
    }

    return colorComposerMode === "hex" ? normalizedColorValue : validCssColorValue;
  }, [colorComposerMode, normalizedColorValue, tokenCategory, validCssColorValue]);
  const canSubmit =
    normalizedTokenName !== undefined &&
    (tokenCategory === "color"
      ? colorComposerMode === "hex"
        ? normalizedColorValue !== null
        : validCssColorValue !== null
      : tokenCategory === "typography" && typographyTokenType === "font-family"
        ? selectedTypographyFamily.trim().length > 0
      : usesManagedUnit
        ? tokenUnitAmount.trim() !== "" && !Number.isNaN(Number.parseFloat(tokenUnitAmount))
        : tokenRawValue.trim() !== "");
  const isWideLayout = tokenCategory === "color" || tokenCategory === "typography";

  useEffect(() => {
    if (open) {
      return;
    }

    setTokenName("");
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
  }, [importedGoogleFonts, open, setCssColor]);

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

  function handleCssColorInputChange(nextValue: string) {
    setTokenCssColorValue(nextValue);

    try {
      setCssColor(nextValue);
    } catch {
      // Keep the draft visible while the user types an incomplete color.
    }
  }

  function normalizeTokenNameInput(value: string) {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return undefined;
    }

    const normalized = trimmed.replace(/\s+/g, "-").replace(/^-+/, "");
    if (normalized.length === 0) {
      return undefined;
    }

    return normalized.startsWith("--") ? normalized : `--${normalized}`;
  }

  function handleSubmit() {
    let nextValue = tokenRawValue.trim();
    const nextName = normalizeTokenNameInput(tokenName);

    if (!nextName) {
      return;
    }

    if (tokenCategory === "color") {
      nextValue = colorComposerMode === "hex" ? normalizedColorValue ?? "" : validCssColorValue ?? "";
    } else if (tokenCategory === "typography" && typographyTokenType === "font-family") {
      nextValue = buildFontFamilyValue(selectedTypographyFamily, nextName);
    } else if (usesManagedUnit) {
      const numeric = Number.parseFloat(tokenUnitAmount);

      if (Number.isNaN(numeric)) {
        return;
      }

      nextValue = isLengthUnit(tokenUnit)
        ? formatLengthValue(numeric, tokenUnit)
        : isDurationUnit(tokenUnit)
          ? formatDurationValue(numeric, tokenUnit)
          : "";
    }

    if (tokenCategory === "typography" && usesManagedUnit) {
      const numeric = Number.parseFloat(tokenUnitAmount);

      if (Number.isNaN(numeric)) {
        return;
      }

      nextValue = isLengthUnit(tokenUnit)
        ? formatLengthValue(numeric, tokenUnit)
        : isDurationUnit(tokenUnit)
          ? formatDurationValue(numeric, tokenUnit)
          : "";
    }

    if (!nextValue) {
      return;
    }

    onCreateToken({
      category: tokenCategory,
      name: nextName,
      value: nextValue
    });
    onOpenChange(false);
  }

  return {
    tokenName,
    setTokenName,
    tokenCategory,
    setTokenCategory,
    typographyTokenType,
    setTypographyTokenType,
    tokenRawValue,
    setTokenRawValue,
    tokenColorValue,
    setTokenColorValue,
    tokenCssColorValue,
    setTokenCssColorValue: handleCssColorInputChange,
    tokenFontFamily,
    setTokenFontFamily,
    colorComposerMode,
    setColorComposerMode,
    tokenUnit,
    setTokenUnit,
    tokenUnitAmount,
    setTokenUnitAmount,
    cssColor,
    setCssColor,
    cssPickerVersion,
    availableUnits,
    usesManagedUnit,
    importedTypographyFamilies,
    selectedTypographyFamily,
    normalizedColorValue,
    previewColorValue,
    canSubmit,
    isWideLayout,
    handleSubmit
  };
}
