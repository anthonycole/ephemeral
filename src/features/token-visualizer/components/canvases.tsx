import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Badge, Box, Button, Card, Flex, Text, TextField } from "@radix-ui/themes";
import { groupColorTokens, parseColorTokenMeta, resolveColorDisplayMode } from "@/features/token-visualizer/color-meta";
import { VirtualizedCardList } from "@/features/token-visualizer/components/virtualized-card-list";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { GOOGLE_FONT_SUGGESTIONS, getFontTokenDefinition, type ImportedGoogleFont } from "@/features/token-visualizer/font-utils";
import styles from "@/features/token-visualizer/styles.module.css";
import { numericValue, toMilliseconds, tokenValueForWidth } from "@/features/token-visualizer/utils";

type CanvasProps = {
  tokens: TokenRecord[];
  onSelect: (tokenId: string) => void;
  virtualize?: boolean;
};

type ColorVirtualItem =
  {
    key: string;
    title: string;
    subtitle: string;
    tokens: TokenRecord[];
  };

type ScaleGroup = {
  key: string;
  label: string;
  tokens: TokenRecord[];
};

function tokenOriginBadgeLabel(token: TokenRecord) {
  if (token.readOnly !== true) {
    return null;
  }

  return token.origin === "inherited" ? "Inherited" : "Tailwind";
}

function tokenOriginBadgeColor(token: TokenRecord): "gray" | "blue" {
  return token.origin === "inherited" ? "blue" : "gray";
}

function TokenName({ token, size = "2" }: { token: TokenRecord; size?: "1" | "2" }) {
  const originBadge = tokenOriginBadgeLabel(token);

  return (
    <Flex align="center" gap="2" wrap="wrap" className={styles.tokenNameRow}>
      <Text size={size} className="font-mono">
        {token.name}
      </Text>
      {originBadge ? (
        <Badge variant="soft" color={tokenOriginBadgeColor(token)} className={styles.tokenOriginBadge}>
          {originBadge}
        </Badge>
      ) : null}
    </Flex>
  );
}

function compareByNumericValue(a: TokenRecord, b: TokenRecord) {
  return (numericValue(a.value) ?? Number.MAX_SAFE_INTEGER) - (numericValue(b.value) ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name);
}

function renderStack(tokens: TokenRecord[], renderItem: (token: TokenRecord, index: number) => ReactNode, estimateSize: number, virtualize = false) {
  if (virtualize) {
    return <VirtualizedCardList items={tokens} estimateSize={estimateSize} renderItem={(token, index) => renderItem(token, index)} />;
  }

  return <Flex direction="column" gap="2">{tokens.map((token, index) => renderItem(token, index))}</Flex>;
}

function PaintSwatchGroup({
  title,
  subtitle,
  tokens,
  onSelect
}: {
  title: string;
  subtitle: string;
  tokens: TokenRecord[];
  onSelect: (tokenId: string) => void;
}) {
  return (
    <Flex direction="column" gap="2">
      <Flex direction="column" gap="1">
        <Text size="3" weight="medium">
          {title}
        </Text>
        <Text size="1" color="gray">
          {subtitle}
        </Text>
      </Flex>
      <div className={styles.paintSwatchRail}>
        {tokens.map((token, index) => (
          <button
            key={token.id}
            type="button"
            onClick={() => onSelect(token.sourceId)}
            className={styles.paintSwatchCard}
            style={{ background: token.value, zIndex: tokens.length - index }}
            title={`${token.name}: ${token.value}`}
          >
            <div className={styles.paintSwatchCardMeta}>
              <TokenName token={token} size="1" />
            </div>
          </button>
        ))}
      </div>
    </Flex>
  );
}

function VirtualizedColorSections({
  items,
  onSelect
}: {
  items: ColorVirtualItem[];
  onSelect: (tokenId: string) => void;
}) {
  return (
    <VirtualizedCardList
      items={items}
      estimateSize={112}
      renderItem={(item) => <PaintSwatchGroup key={item.key} title={item.title} subtitle={item.subtitle} tokens={item.tokens} onSelect={onSelect} />}
    />
  );
}

function buildScaleTable(groups: ScaleGroup[]) {
  const steps = [...new Set(groups.flatMap((group) => group.tokens.map((token) => parseColorTokenMeta(token).step).filter((step): step is number => step !== null)))].sort(
    (a, b) => a - b
  );

  return {
    steps,
    rows: groups.map((group) => {
      const byStep = new Map<number, TokenRecord>();
      const extras: TokenRecord[] = [];

      group.tokens.forEach((token) => {
        const step = parseColorTokenMeta(token).step;

        if (step === null) {
          extras.push(token);
          return;
        }

        byStep.set(step, token);
      });

      return {
        ...group,
        byStep,
        extras
      };
    })
  };
}

function ScaleTableRow({
  row,
  steps,
  onSelect
}: {
  row: ReturnType<typeof buildScaleTable>["rows"][number];
  steps: number[];
  onSelect: (tokenId: string) => void;
}) {
  return (
    <div className={styles.scaleTableRow}>
      <div className={styles.scaleTableFamily}>
        <Text size="2" weight="medium">
          {row.label}
        </Text>
      </div>
      <div className={styles.scaleTableCells}>
        {steps.map((step) => {
          const token = row.byStep.get(step);

          if (!token) {
            return <div key={`${row.key}-${step}`} className={styles.scaleTableCellEmpty} />;
          }

          return (
            <button
              key={token.id}
              type="button"
              onClick={() => onSelect(token.sourceId)}
              className={styles.scaleTableSwatchButton}
              title={`${token.name}: ${token.value}`}
            >
              <span className={styles.scaleTableSwatch} style={{ background: token.value }} />
            </button>
          );
        })}
      </div>
      {row.extras.length > 0 ? (
        <div className={styles.scaleTableExtras}>
          {row.extras.map((token) => (
            <button key={token.id} type="button" onClick={() => onSelect(token.sourceId)} className={styles.scaleExtraChip} title={`${token.name}: ${token.value}`}>
              <span className={styles.scaleExtraDot} style={{ background: token.value }} />
              <TokenName token={token} size="1" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ScaleSection({
  title,
  subtitle,
  groups,
  onSelect,
  virtualize = false
}: {
  title: string;
  subtitle: string;
  groups: Array<{ key: string; label: string; tokens: TokenRecord[] }>;
  onSelect: (tokenId: string) => void;
  virtualize?: boolean;
}) {
  const table = useMemo(() => buildScaleTable(groups), [groups]);

  if (virtualize) {
    return (
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="1">
          <Text size="3" weight="medium">
            {title}
          </Text>
          <Text size="1" color="gray">
            {subtitle}
          </Text>
        </Flex>
        <div className={styles.scaleTable}>
          <div className={styles.scaleTableHeader}>
            <div className={styles.scaleTableHeaderLabel} />
            <div className={styles.scaleTableHeaderSteps}>
              {table.steps.map((step) => (
                <Text key={step} size="1" color="gray" className={`font-mono ${styles.scaleTableStepLabel}`}>
                  {step}
                </Text>
              ))}
            </div>
          </div>
        </div>
        <VirtualizedCardList
          items={table.rows}
          estimateSize={56}
          renderItem={(row) => <ScaleTableRow key={row.key} row={row} steps={table.steps} onSelect={onSelect} />}
        />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="1">
        <Text size="3" weight="medium">
          {title}
        </Text>
          <Text size="1" color="gray">
            {subtitle}
          </Text>
        </Flex>
      <div className={styles.scaleTable}>
        <div className={styles.scaleTableHeader}>
          <div className={styles.scaleTableHeaderLabel} />
          <div className={styles.scaleTableHeaderSteps}>
            {table.steps.map((step) => (
              <Text key={step} size="1" color="gray" className={`font-mono ${styles.scaleTableStepLabel}`}>
                {step}
              </Text>
            ))}
          </div>
        </div>
        <Flex direction="column" gap="2">
          {table.rows.map((row) => (
            <ScaleTableRow key={row.key} row={row} steps={table.steps} onSelect={onSelect} />
          ))}
        </Flex>
      </div>
    </Flex>
  );
}

export function ColorCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  const grouped = useMemo(() => groupColorTokens(tokens), [tokens]);
  const displayMode = useMemo(() => resolveColorDisplayMode(grouped), [grouped]);
  const colorModeItems = useMemo<ColorVirtualItem[]>(() => {
    return [
      ...grouped.semantics.map((group) => ({
        key: `section-${group.key}`,
        title: group.label,
        subtitle: "Grouped by role so related surfaces, text, and borders stay together.",
        tokens: group.tokens
      })),
      ...(grouped.unclassified.length > 0
        ? [
            {
              key: "section-unclassified",
              title: "Unclassified",
              subtitle: "Color tokens that did not match a known naming pattern.",
              tokens: grouped.unclassified
            }
          ]
        : [])
    ];
  }, [grouped.semantics, grouped.unclassified]);
  const fallbackColorModeItems = useMemo<ColorVirtualItem[]>(() => {
    return [
      ...grouped.semantics.map((group) => ({
        key: `fallback-section-${group.key}`,
        title: group.label,
        subtitle: "Grouped by role.",
        tokens: group.tokens
      })),
      ...(grouped.unclassified.length > 0
        ? [
            {
              key: "fallback-section-unclassified",
              title: "Unclassified",
              subtitle: "Color tokens that did not match a known naming pattern.",
              tokens: grouped.unclassified
            }
          ]
        : [])
    ];
  }, [grouped.semantics, grouped.unclassified]);

  return (
    <Flex direction="column" gap="5">
      {displayMode === "scales" && grouped.scales.length > 0 ? (
        <ScaleSection title="Scales" subtitle="Grouped by family and compressed into stepped rows." groups={grouped.scales} onSelect={onSelect} virtualize={virtualize} />
      ) : null}

      {displayMode === "colors" && grouped.semantics.length > 0 ? (
        virtualize ? (
          <Flex direction="column" gap="4">
            <Text size="4" weight="medium">
              Colours
            </Text>
            <VirtualizedColorSections items={colorModeItems} onSelect={onSelect} />
          </Flex>
        ) : (
          <Flex direction="column" gap="4">
            <Text size="4" weight="medium">
              Colours
            </Text>
            {grouped.semantics.map((group) => (
              <PaintSwatchGroup
                key={group.key}
                title={group.label}
                subtitle="Grouped by role so related surfaces, text, and borders stay together."
                tokens={group.tokens}
                onSelect={onSelect}
              />
            ))}
            {grouped.unclassified.length > 0 ? (
              <PaintSwatchGroup title="Unclassified" subtitle="Color tokens that did not match a known naming pattern." tokens={grouped.unclassified} onSelect={onSelect} />
            ) : null}
          </Flex>
        )
      ) : null}

      {displayMode === "scales" && grouped.scales.length === 0 && (grouped.semantics.length > 0 || grouped.unclassified.length > 0) ? (
        virtualize ? (
          <Flex direction="column" gap="4">
            <Text size="4" weight="medium">
              Colours
            </Text>
            <VirtualizedColorSections items={fallbackColorModeItems} onSelect={onSelect} />
          </Flex>
        ) : (
          <Flex direction="column" gap="4">
            <Text size="4" weight="medium">
              Colours
            </Text>
            {grouped.semantics.map((group) => (
              <PaintSwatchGroup key={group.key} title={group.label} subtitle="Grouped by role." tokens={group.tokens} onSelect={onSelect} />
            ))}
            {grouped.unclassified.length > 0 ? (
              <PaintSwatchGroup title="Unclassified" subtitle="Color tokens that did not match a known naming pattern." tokens={grouped.unclassified} onSelect={onSelect} />
            ) : null}
          </Flex>
        )
      ) : null}
    </Flex>
  );
}

export function SpacingCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  const sorted = useMemo(() => [...tokens].sort(compareByNumericValue), [tokens]);
  const largest = useMemo(() => Math.max(...sorted.map((token) => numericValue(token.value) ?? 0), 1), [sorted]);

  return renderStack(
    sorted,
    (token, index) => {
      const numeric = numericValue(token.value) ?? 0;
      const width = `${Math.max(6, (numeric / largest) * 100)}%`;

      return (
        <button key={token.id} type="button" onClick={() => onSelect(token.sourceId)} className={styles.comparisonRowButton}>
          <div className={styles.comparisonLabelBlock}>
            <Text size="1" color="gray" className="font-mono">
              {index + 1}
            </Text>
            <TokenName token={token} />
          </div>
          <div className={styles.comparisonTrack}>
            <div className={styles.spacingComparisonBar} style={{ width }} />
          </div>
          <Text size="1" color="gray" className="font-mono">
            {token.value}
          </Text>
        </button>
      );
    },
    56,
    virtualize
  );
}

export function SizingCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  return renderStack(
    tokens,
    (token) => (
      <Card key={token.id} onClick={() => onSelect(token.sourceId)} className={styles.canvasCard}>
        <Flex direction="column" gap="2">
          <Flex justify="between" align="center">
            <TokenName token={token} size="1" />
            <Text size="1" color="gray" className="font-mono">
              {token.value}
            </Text>
          </Flex>
          <Box height="22px" style={{ borderRadius: 8, width: tokenValueForWidth(token.value), background: "var(--amber-9)" }} />
        </Flex>
      </Card>
    ),
    82,
    virtualize
  );
}

type TypographyCanvasProps = CanvasProps & {
  importedGoogleFonts?: ImportedGoogleFont[];
  onImportGoogleFont?: (family: string) => void;
  onRemoveGoogleFont?: (family: string) => void;
};

export function TypographyCanvas({
  tokens,
  onSelect,
  importedGoogleFonts = [],
  onImportGoogleFont,
  onRemoveGoogleFont
}: TypographyCanvasProps) {
  const { familyTokens, sizeTokens, weightTokens, utilityTokens } = useMemo(() => {
    const sorted = [...tokens].sort(compareByNumericValue);
    const familyTokens = sorted.filter((token) => getFontTokenDefinition(token.name));
    const sizeTokens = sorted.filter((token) => isTypographySizeToken(token));
    const weightTokens = sorted.filter((token) => isTypographyWeightToken(token));
    const utilityTokens = sorted.filter((token) => !getFontTokenDefinition(token.name) && !isTypographySizeToken(token) && !isTypographyWeightToken(token));

    return {
      familyTokens,
      sizeTokens,
      weightTokens,
      utilityTokens
    };
  }, [tokens]);
  const [fontQuery, setFontQuery] = useState("");
  const [fontSearchOpen, setFontSearchOpen] = useState(false);
  const normalizedFontQuery = fontQuery.trim().replace(/\s+/g, " ");
  const importedFamilies = useMemo(() => importedGoogleFonts.map((font) => font.family), [importedGoogleFonts]);
  const filteredFontSuggestions = useMemo(() => {
    const normalizedQuery = normalizedFontQuery.toLowerCase();
    const availableFonts = GOOGLE_FONT_SUGGESTIONS.filter((family) => !importedFamilies.includes(family));

    if (!normalizedQuery) {
      return availableFonts.slice(0, 5);
    }

    return availableFonts.filter((family) => family.toLowerCase().includes(normalizedQuery)).slice(0, 5);
  }, [importedFamilies, normalizedFontQuery]);
  const canAddTypedFont =
    normalizedFontQuery.length > 0 && !importedFamilies.some((family) => family.toLowerCase() === normalizedFontQuery.toLowerCase());

  function importFontFamily(family: string) {
    if (!onImportGoogleFont) {
      return;
    }

    onImportGoogleFont(family);
    setFontQuery("");
    setFontSearchOpen(false);
  }

  function renderTypographyToken(token: TokenRecord, sampleClassName?: string) {
    const fontDefinition = getFontTokenDefinition(token.name);

    return (
      <button key={token.id} type="button" onClick={() => onSelect(token.sourceId)} className={styles.typographyComparisonRow}>
        <div className={styles.typographyComparisonMeta}>
          <div className={styles.typographyTokenMetaStack}>
            <TokenName token={token} size="1" />
            <Text size="1" color="gray" className="font-mono">
              {token.value}
            </Text>
          </div>
          {fontDefinition ? (
            <div className={styles.typographyBadgeRow}>
              {tokenOriginBadgeLabel(token) ? (
                <Badge variant="soft" color={tokenOriginBadgeColor(token)} className={styles.tokenOriginBadge}>
                  {tokenOriginBadgeLabel(token)}
                </Badge>
              ) : null}
              <Badge variant="soft">{fontDefinition.framework}</Badge>
              <Badge variant="soft" color="gray">
                {fontDefinition.role}
              </Badge>
            </div>
          ) : tokenOriginBadgeLabel(token) ? (
            <div className={styles.typographyBadgeRow}>
              <Badge variant="soft" color={tokenOriginBadgeColor(token)} className={styles.tokenOriginBadge}>
                {tokenOriginBadgeLabel(token)}
              </Badge>
            </div>
          ) : null}
        </div>
        <Text size="3" className={`${styles.typographyComparisonSample} ${sampleClassName ?? ""}`.trim()} style={typographySampleStyle(token)}>
          {typographySampleCopy(token)}
        </Text>
      </button>
    );
  }

  return (
    <Flex direction="column" gap="4">
      {familyTokens.length > 0 || onImportGoogleFont ? (
        <section className={styles.typographySection}>
          <div className={styles.typographySectionHeader}>
            <Text size="2" weight="medium">
              Font families
            </Text>
          </div>
          {onImportGoogleFont ? (
            <div className={styles.typographyFontManager}>
              <div className={styles.typographyFontInputRow}>
                <div className={styles.typographyFontAutocomplete}>
                  <TextField.Root
                    value={fontQuery}
                    onChange={(event) => {
                      setFontQuery(event.target.value);
                      setFontSearchOpen(true);
                    }}
                    onFocus={() => setFontSearchOpen(true)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setFontSearchOpen(false);
                      }, 120);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") {
                        return;
                      }

                      event.preventDefault();

                      if (filteredFontSuggestions.length > 0) {
                        importFontFamily(filteredFontSuggestions[0]);
                        return;
                      }

                      if (canAddTypedFont) {
                        importFontFamily(normalizedFontQuery);
                      }
                    }}
                    placeholder="Search Google Fonts"
                    className={styles.typographyFontInput}
                  />
                  {fontSearchOpen && filteredFontSuggestions.length > 0 ? (
                    <div className={styles.typographyFontAutocompleteMenu}>
                      {filteredFontSuggestions.map((family) => (
                        <button
                          key={family}
                          type="button"
                          className={styles.typographyFontAutocompleteOption}
                          style={{ fontFamily: `"${family}", ui-sans-serif, system-ui, sans-serif` }}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            importFontFamily(family);
                          }}
                        >
                          {family}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <Button
                  size="2"
                  variant="soft"
                  disabled={!canAddTypedFont}
                  onClick={() => {
                    if (canAddTypedFont) {
                      importFontFamily(normalizedFontQuery);
                    }
                  }}
                >
                  Add font
                </Button>
              </div>
              {importedGoogleFonts.length > 0 ? (
                <div className={styles.typographySelectedFontsGroup}>
                  <div className={styles.typographySelectedFontsHeader}>
                    <Text size="1" color="gray">
                      Installed fonts
                    </Text>
                    <Text size="1" color="gray">
                      {importedGoogleFonts.length}
                    </Text>
                  </div>
                  <div className={styles.typographySelectedFonts}>
                    {importedGoogleFonts.map((font) => (
                      <button
                        key={font.family}
                        type="button"
                        className={styles.typographySelectedFont}
                        style={{ fontFamily: `"${font.family}", ui-sans-serif, system-ui, sans-serif` }}
                        onClick={() => onRemoveGoogleFont?.(font.family)}
                        title={`Remove ${font.family}`}
                      >
                        <span>{font.family}</span>
                        <span className={styles.typographySelectedFontAction}>Remove</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <Text size="1" color="gray">
                  Add fonts here to use them in font-family tokens.
                </Text>
              )}
            </div>
          ) : null}
          <div className={styles.typographyTokenGrid}>
            {familyTokens.map((token) => renderTypographyToken(token, styles.typographyFamilySample))}
          </div>
        </section>
      ) : null}

      {sizeTokens.length > 0 ? (
        <section className={styles.typographySection}>
          <div className={styles.typographySectionHeader}>
            <Text size="2" weight="medium">
              Type scale
            </Text>
          </div>
          <div className={styles.typographyTokenGrid}>
            {sizeTokens.map((token) => renderTypographyToken(token, styles.typographyScaleSample))}
          </div>
        </section>
      ) : null}

      {weightTokens.length > 0 ? (
        <section className={styles.typographySection}>
          <div className={styles.typographySectionHeader}>
            <Text size="2" weight="medium">
              Weights
            </Text>
          </div>
          <div className={styles.typographyTokenGrid}>
            {weightTokens.map((token) => renderTypographyToken(token, styles.typographyWeightSample))}
          </div>
        </section>
      ) : null}

      {utilityTokens.length > 0 ? (
        <section className={styles.typographySection}>
          <div className={styles.typographySectionHeader}>
            <Text size="2" weight="medium">
              Supporting styles
            </Text>
          </div>
          <div className={styles.typographyTokenGrid}>
            {utilityTokens.map((token) => renderTypographyToken(token))}
          </div>
        </section>
      ) : null}
    </Flex>
  );
}

function isTypographyWeightToken(token: TokenRecord) {
  return token.name.toLowerCase().includes("weight");
}

function isTypographySizeToken(token: TokenRecord) {
  const lowerName = token.name.toLowerCase();
  return (
    !lowerName.includes("line-height") &&
    !lowerName.includes("leading") &&
    !lowerName.includes("tracking") &&
    !lowerName.includes("letter-spacing") &&
    !lowerName.includes("weight") &&
    !getFontTokenDefinition(token.name) &&
    (lowerName.includes("font-size") || lowerName.includes("text-") || lowerName.includes("size"))
  );
}

function typographySampleStyle(token: TokenRecord): CSSProperties {
  const lowerName = token.name.toLowerCase();
  const fontToken = getFontTokenDefinition(token.name);

  if (fontToken) {
    return { fontFamily: token.value };
  }

  if (lowerName.includes("text-shadow")) {
    return { textShadow: token.value };
  }

  if (lowerName.includes("line-height") || lowerName.includes("leading")) {
    return { lineHeight: token.value };
  }

  if (lowerName.includes("tracking") || lowerName.includes("letter-spacing")) {
    return { letterSpacing: token.value };
  }

  if (lowerName.includes("weight")) {
    return { fontWeight: token.value as CSSProperties["fontWeight"] };
  }

  if (isTypographySizeToken(token)) {
    return { fontSize: token.value };
  }

  return {};
}

function typographySampleCopy(token: TokenRecord) {
  const lowerName = token.name.toLowerCase();

  if (getFontTokenDefinition(token.name)) {
    return "Sphinx of black quartz, judge my vow.";
  }

  if (lowerName.includes("tracking") || lowerName.includes("letter-spacing")) {
    return "TRACKING SAMPLE";
  }

  if (lowerName.includes("line-height") || lowerName.includes("leading")) {
    return "The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.";
  }

  if (lowerName.includes("text-shadow")) {
    return "Shadow sample";
  }

  return "The quick brown fox jumps over the lazy dog.";
}


export function RadiusCanvas({ tokens, onSelect }: CanvasProps) {
  const sorted = useMemo(() => [...tokens].sort(compareByNumericValue), [tokens]);

  return (
    <Flex direction="column" gap="3">
      <Text size="1" color="gray">
        Same shape, varying corner radius for direct comparison.
      </Text>
      <div className={styles.radiusComparisonRail}>
        {sorted.map((token) => (
          <button key={token.id} type="button" onClick={() => onSelect(token.sourceId)} className={styles.radiusSampleButton} title={`${token.name}: ${token.value}`}>
            <span className={styles.radiusSampleShape} style={{ borderRadius: token.value }} />
            <div className={styles.radiusSampleMeta}>
              <TokenName token={token} size="1" />
              <Text size="1" color="gray" className="font-mono">
                {token.value}
              </Text>
            </div>
          </button>
        ))}
      </div>
    </Flex>
  );
}

export function ShadowCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  const sorted = useMemo(() => [...tokens].sort(compareByNumericValue), [tokens]);

  return renderStack(
    sorted,
    (token, index) => (
      <button key={token.id} type="button" onClick={() => onSelect(token.sourceId)} className={styles.shadowComparisonRow}>
        <div className={styles.shadowComparisonMeta}>
          <Text size="1" color="gray" className="font-mono">
            {index + 1}
          </Text>
          <TokenName token={token} />
        </div>
        <div className={styles.shadowComparisonPreviewWrap}>
          <span className={styles.shadowComparisonPreview} style={{ boxShadow: token.value }} />
        </div>
        <Text size="1" color="gray" className="font-mono">
          {token.value}
        </Text>
      </button>
    ),
    72,
    virtualize
  );
}

export function OpacityCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  const sorted = useMemo(() => [...tokens].sort(compareByNumericValue), [tokens]);

  return renderStack(
    sorted,
    (token) => {
      const opacity = numericValue(token.value) ?? 0;
      return (
        <button key={token.id} type="button" onClick={() => onSelect(token.sourceId)} className={styles.opacityComparisonRow}>
          <div className={styles.opacityComparisonMeta}>
            <TokenName token={token} />
            <Text size="1" color="gray" className="font-mono">
              {token.value}
            </Text>
          </div>
          <div className={styles.opacityComparisonStrip}>
            <span className={styles.opacityComparisonSwatch} style={{ opacity }} />
          </div>
        </button>
      );
    },
    64,
    virtualize
  );
}

export function MotionCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  return renderStack(
    tokens,
    (token) => {
        const ms = toMilliseconds(token.value);
        const width = ms === null ? "35%" : `${Math.max(15, Math.min(100, (ms / 1000) * 100))}%`;

        return (
          <Card key={token.id} onClick={() => onSelect(token.sourceId)} className={styles.canvasCard}>
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <TokenName token={token} size="1" />
                <Text size="1" color="gray" className="font-mono">
                  {token.value}
                </Text>
              </Flex>
              <Box height="8px" style={{ borderRadius: 999, background: "var(--gray-4)" }}>
                <Box height="8px" style={{ borderRadius: 999, width, background: "var(--green-9)" }} />
              </Box>
            </Flex>
          </Card>
        );
    },
    82,
    virtualize
  );
}

export function ZIndexCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  const sorted = useMemo(() => [...tokens].sort((a, b) => (numericValue(b.value) ?? 0) - (numericValue(a.value) ?? 0)), [tokens]);

  return renderStack(
    sorted,
    (token, index) => {
      const itemIndex = index;
      return (
        <Card key={token.id} onClick={() => onSelect(token.sourceId)} className={styles.canvasCard}>
          <Flex align="center" justify="between" gap="3">
            <Flex align="center" gap="2">
              <Box width="22px" height="22px" style={{ borderRadius: 6, background: "var(--iris-9)", opacity: Math.max(0.25, 1 - itemIndex * 0.08) }} />
              <TokenName token={token} size="1" />
            </Flex>
            <Badge variant="solid">{token.value}</Badge>
          </Flex>
        </Card>
      );
    },
    68,
    virtualize
  );
}

export function BreakpointCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  const largest = useMemo(() => Math.max(...tokens.map((token) => numericValue(token.value) ?? 0), 1), [tokens]);

  return renderStack(
    tokens,
    (token) => {
        const numeric = numericValue(token.value) ?? 0;
        const width = `${Math.max(12, (numeric / largest) * 100)}%`;

        return (
          <Card key={token.id} onClick={() => onSelect(token.sourceId)} className={styles.canvasCard}>
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <TokenName token={token} size="1" />
                <Text size="1" color="gray" className="font-mono">
                  {token.value}
                </Text>
              </Flex>
              <Box height="10px" style={{ borderRadius: 999, width, background: "var(--orange-9)" }} />
            </Flex>
          </Card>
        );
    },
    82,
    virtualize
  );
}

export function GenericCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  return renderStack(
    tokens,
    (token) => (
      <Card key={token.id} onClick={() => onSelect(token.sourceId)} className={styles.canvasCard}>
        <Flex justify="between" align="center" gap="3">
          <TokenName token={token} />
          <Text size="1" color="gray" className="font-mono">
            {token.value}
          </Text>
        </Flex>
      </Card>
    ),
    60,
    virtualize
  );
}
