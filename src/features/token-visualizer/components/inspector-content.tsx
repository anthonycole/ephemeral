import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, Card, Flex, Select, Separator, Text, TextField } from "@radix-ui/themes";
import TerrazzoColorPicker from "@terrazzo/react-color-picker";
import useColor, { parse as parseTerrazzoColor } from "@terrazzo/use-color";
import { HexAlphaColorPicker } from "react-colorful";
import { CATEGORY_DEFINITIONS } from "@/features/token-visualizer/config";
import type { TokenRecord } from "@/features/token-visualizer/document";
import {
  buildFontFamilyValue,
  extractPrimaryFontFamily,
  getFontTokenDefinition,
  type ImportedGoogleFont
} from "@/features/token-visualizer/font-utils";
import {
  categoryLabel,
  convertDurationUnit,
  convertLengthUnit,
  formatDurationValue,
  formatScopeLabel,
  formatLengthValue,
  parseEditableDuration,
  parseEditableLength,
  preferredDurationUnit,
  preferredLengthUnit,
  toMilliseconds,
  tokenSupportsDurationUnit,
  tokenSupportsLengthUnit,
  tokenValueForWidth
} from "@/features/token-visualizer/utils";
import styles from "@/features/token-visualizer/styles.module.css";

type InspectorContentProps = {
  importedGoogleFonts: ImportedGoogleFont[];
  onCreateOverride: (token: TokenRecord) => void;
  onImportGoogleFont: (family: string) => void;
  token: TokenRecord | null;
  onUpdateToken: (token: TokenRecord, updates: Partial<{ name: string; value: string; category: TokenRecord["category"] }>) => void;
  onDeleteToken: (token: TokenRecord) => void;
};

const HEX_LITERAL_REGEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;

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

function isHexColorLiteral(value: string) {
  return HEX_LITERAL_REGEX.test(value.trim());
}

function supportsTerrazzoColor(value: string) {
  try {
    const parsed = parseTerrazzoColor(value);
    return Boolean(parsed?.original?.space);
  } catch {
    return false;
  }
}

function ColorValueEditor({
  token,
  onUpdateToken
}: {
  token: TokenRecord;
  onUpdateToken: InspectorContentProps["onUpdateToken"];
}) {
  if (isHexColorLiteral(token.value)) {
    return <HexColorValueEditor token={token} onUpdateToken={onUpdateToken} />;
  }

  if (!supportsTerrazzoColor(token.value)) {
    return <RawColorValueEditor token={token} onUpdateToken={onUpdateToken} />;
  }

  return <CssColorValueEditor token={token} onUpdateToken={onUpdateToken} />;
}

function HexColorValueEditor({
  token,
  onUpdateToken
}: {
  token: TokenRecord;
  onUpdateToken: InspectorContentProps["onUpdateToken"];
}) {
  const normalizedValue = normalizeHexColor(token.value) ?? "#000000";
  const [draftHex, setDraftHex] = useState(normalizedValue);
  const [color, setColor] = useState(normalizedValue);

  useEffect(() => {
    setDraftHex(normalizedValue);
    setColor(normalizedValue);
  }, [normalizedValue]);

  const commitHex = (value: string) => {
    const nextHex = normalizeHexColor(value);

    if (!nextHex) {
      return false;
    }

    setDraftHex(nextHex);
    onUpdateToken(token, { value: nextHex });
    return true;
  };

  const handlePickerChange = (nextValue: string) => {
    if (commitHex(nextValue)) {
      setColor(normalizeHexColor(nextValue) ?? normalizedValue);
    }
  };

  return (
    <Flex direction="column" gap="2">
      <div className={styles.colorPickerWrap}>
        <HexAlphaColorPicker color={color} onChange={handlePickerChange} />
      </div>
      <TextField.Root
        value={draftHex}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraftHex(nextValue);

          if (commitHex(nextValue)) {
            setColor(normalizeHexColor(nextValue) ?? normalizedValue);
          }
        }}
        onBlur={() => {
          const nextHex = normalizeHexColor(token.value) ?? normalizedValue;
          setDraftHex(nextHex);
        }}
        className={styles.colorHexField}
      />
      <Text size="1" color="gray">
        Stored as hex.
      </Text>
    </Flex>
  );
}

function CssColorValueEditor({
  token,
  onUpdateToken
}: {
  token: TokenRecord;
  onUpdateToken: InspectorContentProps["onUpdateToken"];
}) {
  const safeInitialColor = useMemo(() => (supportsTerrazzoColor(token.value) ? token.value : "rgb(0 0 0)"), [token.value]);
  const [draftValue, setDraftValue] = useState(token.value);
  const [color, setColor] = useColor(safeInitialColor);
  const [pickerVersion, setPickerVersion] = useState(0);
  const [pickerInteracted, setPickerInteracted] = useState(false);

  useEffect(() => {
    setDraftValue(token.value);
    if (supportsTerrazzoColor(token.value)) {
      setColor(token.value);
    }
    setPickerVersion((current) => current + 1);
    setPickerInteracted(false);
  }, [setColor, token.id, token.value]);

  useEffect(() => {
    if (!color?.original?.space) {
      return;
    }

    if (!pickerInteracted) {
      return;
    }

    if (color.css !== token.value) {
      onUpdateToken(token, { value: color.css });
      setDraftValue(color.css);
    }
  }, [color?.original?.space, color.css, onUpdateToken, pickerInteracted, token]);

  if (!color?.original?.space) {
    return <RawColorValueEditor token={token} onUpdateToken={onUpdateToken} />;
  }

  const handleRawValueChange = (nextValue: string) => {
    setDraftValue(nextValue);

    try {
      setColor(nextValue);
      setPickerInteracted(false);
      onUpdateToken(token, { value: nextValue });
    } catch {
      // Keep the draft visible while the user is typing an incomplete color string.
    }
  };

  return (
    <Flex direction="column" gap="2">
      <div className={styles.terrazzoColorPickerWrap}>
        <TerrazzoColorPicker
          key={`${token.id}-${pickerVersion}`}
          color={color}
          setColor={(nextValue) => {
            setPickerInteracted(true);
            setColor(nextValue);
          }}
        />
      </div>
      <TextField.Root
        value={draftValue}
        onChange={(event) => {
          handleRawValueChange(event.target.value);
        }}
        onBlur={() => {
          setDraftValue(token.value);
        }}
        className={styles.colorHexField}
      />
      <Text size="1" color="gray">
        Stored as CSS color.
      </Text>
    </Flex>
  );
}

function RawColorValueEditor({
  token,
  onUpdateToken
}: {
  token: TokenRecord;
  onUpdateToken: InspectorContentProps["onUpdateToken"];
}) {
  return (
    <Flex direction="column" gap="2">
      <TextField.Root value={token.value} onChange={(event) => onUpdateToken(token, { value: event.target.value })} className={styles.colorHexField} />
      <Text size="1" color="gray">
        Picker unavailable for this color format. Edit the raw CSS color directly.
      </Text>
    </Flex>
  );
}

function FontFamilyValueEditor({
  importedGoogleFonts,
  onImportGoogleFont,
  token,
  onUpdateToken
}: {
  importedGoogleFonts: ImportedGoogleFont[];
  onImportGoogleFont: InspectorContentProps["onImportGoogleFont"];
  token: TokenRecord;
  onUpdateToken: InspectorContentProps["onUpdateToken"];
}) {
  const fontToken = getFontTokenDefinition(token.name);
  const [fontFamilyDraft, setFontFamilyDraft] = useState(extractPrimaryFontFamily(token.value) ?? "");
  const currentFamily = extractPrimaryFontFamily(token.value);
  const importedFamilies = importedGoogleFonts.map((font) => font.family);
  const selectedFamily = currentFamily && importedFamilies.includes(currentFamily) ? currentFamily : "__custom";

  useEffect(() => {
    setFontFamilyDraft(extractPrimaryFontFamily(token.value) ?? "");
  }, [token.id, token.value]);

  if (!fontToken) {
    return <TextField.Root value={token.value} onChange={(event) => onUpdateToken(token, { value: event.target.value })} />;
  }

  return (
    <Flex direction="column" gap="2">
      <Flex align="center" gap="2" wrap="wrap">
        <Badge>{fontToken.framework}</Badge>
        <Badge color="gray">{fontToken.role}</Badge>
      </Flex>
      {importedFamilies.length > 0 ? (
        <Select.Root
          value={selectedFamily}
          onValueChange={(value) => {
            if (value === "__custom") {
              return;
            }

            onUpdateToken(token, { value: buildFontFamilyValue(value, token.name) });
          }}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="__custom">Current stack</Select.Item>
            {importedFamilies.map((family) => (
              <Select.Item key={family} value={family}>
                {family}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      ) : null}
      <Flex gap="2">
        <TextField.Root
          value={fontFamilyDraft}
          onChange={(event) => setFontFamilyDraft(event.target.value)}
          placeholder="Import Google Font"
        />
        <Button
          size="1"
          onClick={() => {
            if (!fontFamilyDraft.trim()) {
              return;
            }

            onImportGoogleFont(fontFamilyDraft);
            onUpdateToken(token, { value: buildFontFamilyValue(fontFamilyDraft, token.name) });
          }}
        >
          Import
        </Button>
      </Flex>
      <Text size="1" color="gray">
        Font stack
      </Text>
      <TextField.Root value={token.value} onChange={(event) => onUpdateToken(token, { value: event.target.value })} />
    </Flex>
  );
}

function sourceLabel(token: TokenRecord) {
  if (token.origin === "inherited") {
    return "Inherited Tailwind default";
  }

  if (token.origin === "baseline") {
    return "Tailwind default";
  }

  return "Workspace token";
}

function ReadOnlyValue({ value }: { value: string }) {
  return (
    <Card>
      <Text size="2" className="font-mono">
        {value}
      </Text>
    </Card>
  );
}

export function InspectorContent({ importedGoogleFonts, onCreateOverride, onImportGoogleFont, token, onUpdateToken, onDeleteToken }: InspectorContentProps) {
  const supportsLengthUnit = token ? tokenSupportsLengthUnit(token) : false;
  const supportsDurationUnit = token ? tokenSupportsDurationUnit(token) : false;
  const tokenAtRules = token?.atRules ?? [];
  const parsedLength = useMemo(() => (token && supportsLengthUnit ? parseEditableLength(token.value) : null), [supportsLengthUnit, token]);
  const [lengthAmountInput, setLengthAmountInput] = useState(parsedLength ? String(parsedLength.amount) : "");
  const [lengthUnit, setLengthUnit] = useState<"px" | "rem">(parsedLength?.unit ?? (token ? preferredLengthUnit(token) : "rem"));
  const parsedDuration = useMemo(() => (token && supportsDurationUnit ? parseEditableDuration(token.value) : null), [supportsDurationUnit, token]);
  const [durationAmountInput, setDurationAmountInput] = useState(parsedDuration ? String(parsedDuration.amount) : "");
  const [durationUnit, setDurationUnit] = useState<"ms" | "s">(parsedDuration?.unit ?? (token ? preferredDurationUnit(token) : "ms"));
  const fontToken = token ? getFontTokenDefinition(token.name) : null;

  useEffect(() => {
    if (!token || !supportsLengthUnit) {
      return;
    }

    const nextParsedLength = parseEditableLength(token.value);
    setLengthAmountInput(nextParsedLength ? String(nextParsedLength.amount) : "");
    setLengthUnit(nextParsedLength?.unit ?? preferredLengthUnit(token));
  }, [supportsLengthUnit, token]);

  useEffect(() => {
    if (!token || !supportsDurationUnit) {
      return;
    }

    const nextParsedDuration = parseEditableDuration(token.value);
    setDurationAmountInput(nextParsedDuration ? String(nextParsedDuration.amount) : "");
    setDurationUnit(nextParsedDuration?.unit ?? preferredDurationUnit(token));
  }, [supportsDurationUnit, token]);

  if (!token) {
    return <Text color="gray">Select a token to inspect.</Text>;
  }

  const isReadOnly = token.readOnly === true;

  const handleLengthAmountChange = (value: string) => {
    setLengthAmountInput(value);

    if (value.trim() === "" || value === "-" || value === "." || value === "-.") {
      return;
    }

    const numeric = Number.parseFloat(value);

    if (Number.isNaN(numeric)) {
      return;
    }

    onUpdateToken(token, { value: formatLengthValue(numeric, lengthUnit) });
  };

  const handleLengthUnitChange = (nextUnit: "px" | "rem") => {
    setLengthUnit(nextUnit);

    const parsed = parseEditableLength(token.value);

    if (!parsed) {
      return;
    }

    const currentUnit = parsed.unit ?? preferredLengthUnit(token);
    const convertedAmount = convertLengthUnit(parsed.amount, currentUnit, nextUnit);
    const nextValue = formatLengthValue(convertedAmount, nextUnit);

    setLengthAmountInput(String(convertedAmount));
    onUpdateToken(token, { value: nextValue });
  };

  const handleDurationAmountChange = (value: string) => {
    setDurationAmountInput(value);

    if (value.trim() === "" || value === "-" || value === "." || value === "-.") {
      return;
    }

    const numeric = Number.parseFloat(value);

    if (Number.isNaN(numeric)) {
      return;
    }

    onUpdateToken(token, { value: formatDurationValue(numeric, durationUnit) });
  };

  const handleDurationUnitChange = (nextUnit: "ms" | "s") => {
    setDurationUnit(nextUnit);

    const parsed = parseEditableDuration(token.value);

    if (!parsed) {
      return;
    }

    const currentUnit = parsed.unit ?? preferredDurationUnit(token);
    const convertedAmount = convertDurationUnit(parsed.amount, currentUnit, nextUnit);
    const nextValue = formatDurationValue(convertedAmount, nextUnit);

    setDurationAmountInput(String(convertedAmount));
    onUpdateToken(token, { value: nextValue });
  };

  return (
    <>
      <Flex direction="column" gap="1">
        <Text size="1" color="gray">
          Source
        </Text>
        <Text size="2">{sourceLabel(token)}</Text>
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="1" color="gray">
          Scope
        </Text>
        <Text size="2" className="font-mono">
          {formatScopeLabel(token.scope)}
        </Text>
      </Flex>
      {tokenAtRules.length > 0 && (
        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            Wrappers
          </Text>
          <Text size="2" className="font-mono">
            {tokenAtRules.join(" -> ")}
          </Text>
        </Flex>
      )}
      <Flex direction="column" gap="1">
        <Text size="1" color="gray">
          Name
        </Text>
        {isReadOnly ? <ReadOnlyValue value={token.name} /> : <TextField.Root value={token.name} onChange={(event) => onUpdateToken(token, { name: event.target.value })} />}
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="1" color="gray">
          Value
        </Text>
        {isReadOnly ? (
          <ReadOnlyValue value={token.value} />
        ) : token.category === "color" ? (
          <ColorValueEditor token={token} onUpdateToken={onUpdateToken} />
        ) : fontToken ? (
          <FontFamilyValueEditor importedGoogleFonts={importedGoogleFonts} onImportGoogleFont={onImportGoogleFont} token={token} onUpdateToken={onUpdateToken} />
        ) : supportsLengthUnit ? (
          <Flex gap="2">
            <TextField.Root
              type="number"
              step="0.0625"
              value={lengthAmountInput}
              onChange={(event) => handleLengthAmountChange(event.target.value)}
            />
            <Select.Root value={lengthUnit} onValueChange={(value) => handleLengthUnitChange(value as "px" | "rem")}>
              <Select.Trigger style={{ minWidth: 84 }} />
              <Select.Content>
                <Select.Item value="rem">rem</Select.Item>
                <Select.Item value="px">px</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        ) : supportsDurationUnit ? (
          <Flex gap="2">
            <TextField.Root type="number" step="0.05" value={durationAmountInput} onChange={(event) => handleDurationAmountChange(event.target.value)} />
            <Select.Root value={durationUnit} onValueChange={(value) => handleDurationUnitChange(value as "ms" | "s")}>
              <Select.Trigger style={{ minWidth: 84 }} />
              <Select.Content>
                <Select.Item value="ms">ms</Select.Item>
                <Select.Item value="s">s</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        ) : (
          <TextField.Root value={token.value} onChange={(event) => onUpdateToken(token, { value: event.target.value })} />
        )}
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="1" color="gray">
          Category
        </Text>
        {isReadOnly ? (
          <ReadOnlyValue value={categoryLabel(token.category)} />
        ) : (
          <Select.Root value={token.category} onValueChange={(value) => onUpdateToken(token, { category: value as TokenRecord["category"] })}>
            <Select.Trigger />
            <Select.Content>
              {CATEGORY_DEFINITIONS.map((definition) => (
                <Select.Item key={definition.key} value={definition.key}>
                  {definition.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        )}
      </Flex>
      <Flex align="center" gap="2">
        <Badge>{categoryLabel(token.category)}</Badge>
        {isReadOnly ? <Badge color="gray">Read-only</Badge> : null}
      </Flex>
      {!isReadOnly ? (
        <Button
          variant="soft"
          color="red"
          onClick={() => {
            if (globalThis.confirm(`Delete ${token.name}?`)) {
              onDeleteToken(token);
            }
          }}
        >
          Delete token
        </Button>
      ) : null}
      {isReadOnly ? (
        <Card>
          <Flex direction="column" gap="3">
            <Text size="2" color="gray">
              This token comes from the predefined Tailwind baseline. Create an override to copy it into the workspace and edit it there.
            </Text>
            <Button onClick={() => onCreateOverride(token)}>Create override</Button>
          </Flex>
        </Card>
      ) : null}
      {token.baselineValue !== null && token.baselineValue !== undefined && token.baselineValue !== token.value ? (
        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            Baseline value
          </Text>
          <ReadOnlyValue value={token.baselineValue} />
        </Flex>
      ) : null}
      {token.category !== "color" && (
        <>
          <Separator size="4" />
          <Text size="2" color="gray">
            Live Preview
          </Text>
        </>
      )}
      {token.category === "shadow" ? (
        <Box height="120px" style={{ borderRadius: 14, background: "white", boxShadow: token.value, border: "1px solid rgba(0,0,0,0.08)" }} />
      ) : token.category === "radius" ? (
        <Box height="120px" style={{ borderRadius: token.value, background: "linear-gradient(135deg, #c7d2fe, #bfdbfe)", border: "1px solid rgba(0,0,0,0.08)" }} />
      ) : token.category === "spacing" || token.category === "sizing" ? (
        <Box height="16px" style={{ borderRadius: 999, width: tokenValueForWidth(token.value), background: "var(--amber-9)" }} />
      ) : token.category === "typography" ? (
        <Text
          size="4"
          style={{
            fontFamily: fontToken ? token.value : undefined,
            fontSize: token.name.includes("size") ? token.value : undefined,
            fontWeight: token.name.includes("weight") ? Number.parseInt(token.value, 10) || undefined : undefined
          }}
        >
          The quick brown fox jumps over the lazy dog.
        </Text>
      ) : token.category === "motion" ? (
        <Box height="8px" style={{ borderRadius: 999, background: "var(--gray-4)" }}>
          <Box height="8px" style={{ borderRadius: 999, width: `${Math.max(15, Math.min(100, ((toMilliseconds(token.value) ?? 250) / 1000) * 100))}%`, background: "var(--green-9)" }} />
        </Box>
      ) : token.category === "z-index" ? (
        <Flex direction="column" gap="2">
          <Box width="90%" height="24px" style={{ borderRadius: 8, background: "var(--gray-6)" }} />
          <Box width="72%" height="24px" style={{ borderRadius: 8, background: "var(--gray-8)" }} />
          <Box width="54%" height="24px" style={{ borderRadius: 8, background: "var(--iris-9)" }} />
          <Text size="1" color="gray" className="font-mono">
            Layer: {token.value}
          </Text>
        </Flex>
      ) : token.category === "opacity" ? (
        <Box height="100px" style={{ borderRadius: 12, background: "#2563eb", opacity: Number.parseFloat(token.value) || 1, border: "1px solid rgba(0,0,0,0.08)" }} />
      ) : token.category === "breakpoint" ? (
        <Box height="12px" style={{ borderRadius: 999, width: tokenValueForWidth(token.value), background: "var(--orange-9)" }} />
      ) : token.category === "color" ? null : (
        <Card>
          <Text size="2" color="gray">
            {token.value}
          </Text>
        </Card>
      )}
    </>
  );
}
