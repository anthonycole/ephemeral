import type { ReactNode } from "react";
import { useMemo } from "react";
import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import { groupColorTokens, parseColorTokenMeta, resolveColorDisplayMode } from "@/features/token-visualizer/color-meta";
import { VirtualizedCardList } from "@/features/token-visualizer/components/virtualized-card-list";
import type { TokenRecord } from "@/features/token-visualizer/document";
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
            <span className={styles.paintSwatchCardMeta}>
              <Text size="1" className="font-mono">
                {token.name}
              </Text>
            </span>
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
              <Text size="1" className="font-mono">
                {token.name}
              </Text>
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
            <Text size="2" className="font-mono">
              {token.name}
            </Text>
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
            <Text size="1" className="font-mono">
              {token.name}
            </Text>
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

export function TypographyCanvas({ tokens, onSelect, virtualize = false }: CanvasProps) {
  const sorted = useMemo(() => [...tokens].sort(compareByNumericValue), [tokens]);

  return renderStack(
    sorted,
    (token) => (
      <button key={token.id} type="button" onClick={() => onSelect(token.sourceId)} className={styles.typographyComparisonRow}>
        <div className={styles.typographyComparisonMeta}>
          <Text size="1" color="gray" className="font-mono">
            {token.name}
          </Text>
          <Text size="1" color="gray" className="font-mono">
            {token.value}
          </Text>
        </div>
        <Text
          size="3"
          className={styles.typographyComparisonSample}
          style={{
            fontSize: token.name.includes("size") ? token.value : undefined,
            fontWeight: token.name.includes("weight") ? Number.parseInt(token.value, 10) || undefined : undefined
          }}
        >
          The quick brown fox jumps over the lazy dog.
        </Text>
      </button>
    ),
    96,
    virtualize
  );
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
            <span className={styles.radiusSampleMeta}>
              <Text size="1" className="font-mono">
                {token.name}
              </Text>
              <Text size="1" color="gray" className="font-mono">
                {token.value}
              </Text>
            </span>
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
          <Text size="2" className="font-mono">
            {token.name}
          </Text>
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
            <Text size="2" className="font-mono">
              {token.name}
            </Text>
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
                <Text size="1" className="font-mono">
                  {token.name}
                </Text>
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
              <Text size="1" className="font-mono">
                {token.name}
              </Text>
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
                <Text size="1" className="font-mono">
                  {token.name}
                </Text>
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
          <Text size="2" className="font-mono">
            {token.name}
          </Text>
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
