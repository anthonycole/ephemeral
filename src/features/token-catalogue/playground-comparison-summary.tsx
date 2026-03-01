import styles from "@/features/token-catalogue/styles.module.css";
import type { ThemeSnapshot } from "@/features/token-catalogue/theme-snapshot";
import type { DiffIndex, DiffStatus } from "@/features/token-catalogue/token-resolution";

type PlaygroundComparisonSummaryProps = {
  primary: ThemeSnapshot;
  baseline: ThemeSnapshot;
  compact?: boolean;
  diffIndex?: DiffIndex | null;
};

function summarySwatchBackground(value: string) {
  if (value.startsWith("var(")) {
    return "linear-gradient(135deg, rgb(226 232 240), rgb(241 245 249))";
  }

  return value;
}

type SummaryItem = {
  label: string;
  kind: "font" | "color" | "count";
  sampleText?: string;
  primary: {
    displayLabel: string;
    resolvedValue?: string;
    tokenName?: string | null;
  };
  baseline: {
    displayLabel: string;
    resolvedValue?: string;
    tokenName?: string | null;
  };
};

function isSummaryItemChanged(item: SummaryItem) {
  return (
    item.primary.displayLabel !== item.baseline.displayLabel ||
    item.primary.resolvedValue !== item.baseline.resolvedValue ||
    item.primary.tokenName !== item.baseline.tokenName
  );
}

function formatStatusLabel(status: DiffStatus) {
  switch (status) {
    case "baseline-only":
      return "Inherited defaults";
    case "authored-only":
      return "Workspace-only";
    case "overridden":
      return "Overrides";
    case "unchanged":
      return "Matches";
    default:
      return "Conflicts";
  }
}

function statusTone(status: DiffStatus) {
  switch (status) {
    case "baseline-only":
      return "blue";
    case "authored-only":
      return "green";
    case "overridden":
      return "amber";
    case "unchanged":
      return "gray";
    default:
      return "red";
  }
}

function formatCountDelta(primaryCount: number, baselineCount: number) {
  const delta = primaryCount - baselineCount;

  if (delta === 0) {
    return "No change";
  }

  return `${delta > 0 ? "+" : ""}${delta}`;
}

function DifferenceValue({
  item,
  side
}: {
  item: SummaryItem;
  side: "primary" | "baseline";
}) {
  const value = item[side];

  return (
    <div className={styles.compareDifferenceValue}>
      <span className={styles.compareDifferenceValueLabel}>{side === "primary" ? "Workspace" : "Tailwind Default"}</span>
      <div className={styles.compareSummaryValue}>
        {item.kind === "color" ? (
          <span className={styles.compareSummarySwatch} style={{ background: summarySwatchBackground(value.resolvedValue ?? "transparent") }} aria-hidden="true" />
        ) : null}
        {item.kind === "font" ? (
          <span className={styles.compareSummaryFontSample} style={{ fontFamily: value.resolvedValue }}>
            {item.sampleText ?? "Ag"}
          </span>
        ) : null}
        <div className={styles.compareSummaryText}>
          <span className={styles.compareSummaryPrimary}>{value.displayLabel}</span>
          {value.resolvedValue ? <span className={styles.compareSummarySecondary}>{value.resolvedValue}</span> : null}
          <span className={styles.compareSummarySecondary}>{value.tokenName ?? "fallback"}</span>
        </div>
      </div>
    </div>
  );
}

export function PlaygroundComparisonSummary({ primary, baseline, compact = false, diffIndex = null }: PlaygroundComparisonSummaryProps) {
  const items: SummaryItem[] = [
    {
      label: "Sans",
      kind: "font",
      sampleText: "Body",
      primary: primary.fonts.sans,
      baseline: baseline.fonts.sans
    },
    {
      label: "Heading",
      kind: "font",
      sampleText: "Hero",
      primary: primary.fonts.heading,
      baseline: baseline.fonts.heading
    },
    {
      label: "Serif",
      kind: "font",
      sampleText: "Story",
      primary: primary.fonts.serif,
      baseline: baseline.fonts.serif
    },
    {
      label: "Mono",
      kind: "font",
      sampleText: "0127",
      primary: primary.fonts.mono,
      baseline: baseline.fonts.mono
    },
    {
      label: "Background",
      kind: "color",
      primary: primary.colors.background,
      baseline: baseline.colors.background
    },
    {
      label: "Foreground",
      kind: "color",
      primary: primary.colors.foreground,
      baseline: baseline.colors.foreground
    },
    {
      label: "Accent",
      kind: "color",
      primary: primary.colors.accent,
      baseline: baseline.colors.accent
    },
    {
      label: "Border",
      kind: "color",
      primary: primary.colors.border,
      baseline: baseline.colors.border
    },
    {
      label: "Palette size",
      kind: "count",
      primary: { displayLabel: `${primary.counts.palette} tokens` },
      baseline: { displayLabel: `${baseline.counts.palette} tokens` }
    }
  ];
  const changedItems = items.filter((item) => isSummaryItemChanged(item));
  const unchangedItems = items.filter((item) => !isSummaryItemChanged(item));
  const statusCards = diffIndex
    ? ([
        "overridden",
        "baseline-only",
        "authored-only",
        "unchanged"
      ] as const).map((status) => ({
        status,
        label: formatStatusLabel(status),
        count: diffIndex.countsByStatus[status]
      }))
    : [];
  const topChangedCategories = diffIndex
    ? Object.entries(diffIndex.countsByCategory)
        .map(([category, counts]) => {
          const changedCount = counts["overridden"] + counts["baseline-only"] + counts["authored-only"] + counts.conflict;
          return {
            category,
            changedCount,
            summary: [
              counts.overridden > 0 ? `${counts.overridden} overridden` : null,
              counts["baseline-only"] > 0 ? `${counts["baseline-only"]} inherited` : null,
              counts["authored-only"] > 0 ? `${counts["authored-only"]} workspace-only` : null
            ]
              .filter(Boolean)
              .join(" • ")
          };
        })
        .filter((entry) => entry.changedCount > 0)
        .sort((a, b) => b.changedCount - a.changedCount || a.category.localeCompare(b.category))
        .slice(0, compact ? 4 : 6)
    : [];

  return (
    <section className={styles.compareSummaryStack}>
      {statusCards.length > 0 ? (
        <div className={compact ? `${styles.compareStatusGrid} ${styles.compareStatusGridCompact}` : styles.compareStatusGrid}>
          {statusCards.map((item) => (
            <article key={item.status} className={styles.compareStatusCard}>
              <span className={styles.compareStatusEyebrow}>{item.label}</span>
              <div className={styles.compareStatusMetricRow}>
                <span className={styles.compareStatusMetric}>{item.count}</span>
                <span className={styles.compareStatusBadge} data-tone={statusTone(item.status)} />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className={compact ? `${styles.compareHighlightsGrid} ${styles.compareHighlightsGridCompact}` : styles.compareHighlightsGrid}>
        <article className={styles.compareHighlightCard}>
          <div className={styles.compareHighlightHeader}>
            <h2 className={styles.compareSummaryLabel}>What changed most</h2>
            <span className={styles.compareHighlightMeta}>{changedItems.length} semantic differences</span>
          </div>
          {topChangedCategories.length > 0 ? (
            <div className={styles.compareCategoryList}>
              {topChangedCategories.map((entry) => (
                <div key={entry.category} className={styles.compareCategoryRow}>
                  <div className={styles.compareCategoryText}>
                    <span className={styles.compareCategoryName}>{entry.category === "z-index" ? "Z-index" : entry.category}</span>
                    <span className={styles.compareCategorySummary}>{entry.summary}</span>
                  </div>
                  <span className={styles.compareCategoryCount}>{entry.changedCount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.compareHighlightEmpty}>No token-level differences were detected.</p>
          )}
        </article>

        <article className={styles.compareHighlightCard}>
          <div className={styles.compareHighlightHeader}>
            <h2 className={styles.compareSummaryLabel}>Scale impact</h2>
            <span className={styles.compareHighlightMeta}>Relative to Tailwind default</span>
          </div>
          <div className={styles.compareMetricList}>
            <div className={styles.compareMetricRow}>
              <span className={styles.compareMetricLabel}>Palette</span>
              <span className={styles.compareMetricValue}>{formatCountDelta(primary.counts.palette, baseline.counts.palette)}</span>
            </div>
            <div className={styles.compareMetricRow}>
              <span className={styles.compareMetricLabel}>Colors</span>
              <span className={styles.compareMetricValue}>{formatCountDelta(primary.counts.colors, baseline.counts.colors)}</span>
            </div>
            <div className={styles.compareMetricRow}>
              <span className={styles.compareMetricLabel}>Typography</span>
              <span className={styles.compareMetricValue}>{formatCountDelta(primary.counts.typography, baseline.counts.typography)}</span>
            </div>
            <div className={styles.compareMetricRow}>
              <span className={styles.compareMetricLabel}>Spacing</span>
              <span className={styles.compareMetricValue}>{formatCountDelta(primary.counts.spacing, baseline.counts.spacing)}</span>
            </div>
          </div>
        </article>
      </div>

      <div className={compact ? `${styles.compareSummary} ${styles.compareSummaryCompact}` : styles.compareSummary}>
        {(changedItems.length > 0 ? changedItems : unchangedItems).map((item) => (
          <article key={item.label} className={styles.compareSummaryCard}>
            <div className={styles.compareHighlightHeader}>
              <h2 className={styles.compareSummaryLabel}>{item.label}</h2>
              <span className={styles.compareDifferenceState} data-changed={isSummaryItemChanged(item)}>
                {isSummaryItemChanged(item) ? "Changed" : "Matches"}
              </span>
            </div>
            <div className={styles.compareDifferenceColumns}>
              <DifferenceValue item={item} side="primary" />
              <DifferenceValue item={item} side="baseline" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
