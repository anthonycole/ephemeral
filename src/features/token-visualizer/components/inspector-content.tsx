import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Card, Flex, Select, Separator, Text, TextField } from "@radix-ui/themes";
import TerrazzoColorPicker from "@terrazzo/react-color-picker";
import useColor, { parse as parseTerrazzoColor } from "@terrazzo/use-color";
import { HexAlphaColorPicker } from "react-colorful";
import { CATEGORY_DEFINITIONS } from "@/features/token-visualizer/config";
import type { TokenRecord } from "@/features/token-visualizer/document";
import {
  categoryLabel,
  convertLengthUnit,
  formatScopeLabel,
  formatLengthValue,
  parseEditableLength,
  preferredLengthUnit,
  toMilliseconds,
  tokenSupportsLengthUnit,
  tokenValueForWidth
} from "@/features/token-visualizer/utils";
import styles from "@/features/token-visualizer/styles.module.css";

type InspectorContentProps = {
  token: TokenRecord | null;
  onUpdateToken: (tokenId: string, updates: Partial<{ name: string; value: string; category: TokenRecord["category"] }>) => void;
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
    onUpdateToken(token.id, { value: nextHex });
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

  if (!color?.original?.space) {
    return <RawColorValueEditor token={token} onUpdateToken={onUpdateToken} />;
  }

  useEffect(() => {
    if (!pickerInteracted) {
      return;
    }

    if (color.css !== token.value) {
      onUpdateToken(token.id, { value: color.css });
      setDraftValue(color.css);
    }
  }, [color.css, onUpdateToken, pickerInteracted, token.id, token.value]);

  const handleRawValueChange = (nextValue: string) => {
    setDraftValue(nextValue);

    try {
      setColor(nextValue);
      setPickerInteracted(false);
      onUpdateToken(token.id, { value: nextValue });
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
      <TextField.Root value={token.value} onChange={(event) => onUpdateToken(token.id, { value: event.target.value })} className={styles.colorHexField} />
      <Text size="1" color="gray">
        Picker unavailable for this color format. Edit the raw CSS color directly.
      </Text>
    </Flex>
  );
}

export function InspectorContent({ token, onUpdateToken }: InspectorContentProps) {
  const supportsLengthUnit = token ? tokenSupportsLengthUnit(token) : false;
  const tokenAtRules = token?.atRules ?? [];
  const parsedLength = useMemo(() => (token && supportsLengthUnit ? parseEditableLength(token.value) : null), [supportsLengthUnit, token]);
  const [lengthAmountInput, setLengthAmountInput] = useState(parsedLength ? String(parsedLength.amount) : "");
  const [lengthUnit, setLengthUnit] = useState<"px" | "rem">(parsedLength?.unit ?? (token ? preferredLengthUnit(token) : "rem"));

  useEffect(() => {
    if (!token || !supportsLengthUnit) {
      return;
    }

    const nextParsedLength = parseEditableLength(token.value);
    setLengthAmountInput(nextParsedLength ? String(nextParsedLength.amount) : "");
    setLengthUnit(nextParsedLength?.unit ?? preferredLengthUnit(token));
  }, [supportsLengthUnit, token]);

  if (!token) {
    return <Text color="gray">Select a token to inspect.</Text>;
  }

  const handleLengthAmountChange = (value: string) => {
    setLengthAmountInput(value);

    if (value.trim() === "" || value === "-" || value === "." || value === "-.") {
      return;
    }

    const numeric = Number.parseFloat(value);

    if (Number.isNaN(numeric)) {
      return;
    }

    onUpdateToken(token.id, { value: formatLengthValue(numeric, lengthUnit) });
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
    onUpdateToken(token.id, { value: nextValue });
  };

  return (
    <>
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
        <TextField.Root value={token.name} onChange={(event) => onUpdateToken(token.id, { name: event.target.value })} />
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="1" color="gray">
          Value
        </Text>
        {token.category === "color" ? (
          <ColorValueEditor token={token} onUpdateToken={onUpdateToken} />
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
        ) : (
          <TextField.Root value={token.value} onChange={(event) => onUpdateToken(token.id, { value: event.target.value })} />
        )}
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="1" color="gray">
          Category
        </Text>
        <Select.Root value={token.category} onValueChange={(value) => onUpdateToken(token.id, { category: value as TokenRecord["category"] })}>
          <Select.Trigger />
          <Select.Content>
            {CATEGORY_DEFINITIONS.map((definition) => (
              <Select.Item key={definition.key} value={definition.key}>
                {definition.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>
      <Flex align="center" gap="2">
        <Badge>{categoryLabel(token.category)}</Badge>
      </Flex>
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
        <Text size="4" style={{ fontSize: token.name.includes("size") ? token.value : undefined, fontWeight: token.name.includes("weight") ? Number.parseInt(token.value, 10) || undefined : undefined }}>
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
