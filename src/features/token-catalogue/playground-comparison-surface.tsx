import { Badge, Flex, Heading, Text } from "@radix-ui/themes";
import { PlaygroundComparisonSummary } from "@/features/token-catalogue/playground-comparison-summary";
import type { PlaygroundPaneSource } from "@/features/token-catalogue/playground-comparison-sources";
import { PlaygroundPreview } from "@/features/token-catalogue/playground-preview";
import { createThemeSnapshot } from "@/features/token-catalogue/theme-snapshot";
import type { DiffIndex } from "@/features/token-catalogue/token-resolution";
import styles from "@/features/token-catalogue/styles.module.css";

type PlaygroundComparisonSurfaceProps = {
  panes: PlaygroundPaneSource[];
  runtimeCss: string;
  diffIndex: DiffIndex | null;
  showMetrics: boolean;
  baselineUnavailable: boolean;
  title: string;
  description: string;
  layout?: "playground" | "workspace";
};

type StatusBadgeTone = "amber" | "blue" | "green" | "gray" | "red";
type StatusBadgeItem = {
  key: string;
  label: string;
  count: number;
  tone: StatusBadgeTone;
};

function paneHeading(index: number) {
  return index === 0 ? "Workspace" : "Tailwind default";
}

function paneDescription(index: number) {
  return index === 0 ? "Hydrated preview of your current workspace theme." : "Reference preview of the Tailwind default baseline.";
}

function statusBadges(diffIndex: DiffIndex | null): StatusBadgeItem[] {
  if (!diffIndex) {
    return [];
  }

  const changed: StatusBadgeItem[] = [
    {
      key: "overridden",
      label: "Overrides",
      count: diffIndex.countsByStatus.overridden,
      tone: "amber" as const
    },
    {
      key: "baseline-only",
      label: "Inherited",
      count: diffIndex.countsByStatus["baseline-only"],
      tone: "blue" as const
    },
    {
      key: "authored-only",
      label: "Workspace-only",
      count: diffIndex.countsByStatus["authored-only"],
      tone: "green" as const
    },
    {
      key: "conflict",
      label: "Conflicts",
      count: diffIndex.countsByStatus.conflict,
      tone: "red" as const
    }
  ].filter((item) => item.count > 0);
  const unchanged = diffIndex.countsByStatus.unchanged;

  if (unchanged > 0) {
    changed.push({
      key: "unchanged",
      label: "Matches",
      count: unchanged,
      tone: "gray"
    });
  }

  return changed;
}

export function PlaygroundComparisonSurface({
  panes,
  runtimeCss,
  diffIndex,
  showMetrics,
  baselineUnavailable,
  title,
  description,
  layout = "playground"
}: PlaygroundComparisonSurfaceProps) {
  const [primaryPane, baselinePane] = panes;
  const badges = statusBadges(diffIndex);
  const canRenderSummary = showMetrics && Boolean(primaryPane && baselinePane);
  const primarySnapshot = canRenderSummary ? createThemeSnapshot(primaryPane.document.tokens) : null;
  const baselineSnapshot = canRenderSummary && baselinePane ? createThemeSnapshot(baselinePane.document.tokens) : null;

  const dashboardContent = (
    <section className={styles.playgroundLayout}>
      <header className={styles.comparisonSurfaceHeader}>
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2" wrap="wrap">
            <Badge size="2" color="bronze" variant="soft">
              Workspace vs Tailwind default
            </Badge>
            {primaryPane?.updatedAt ? (
              <Badge size="2" color="gray" variant="soft">
                Updated {new Date(primaryPane.updatedAt).toLocaleString()}
              </Badge>
            ) : null}
            {baselineUnavailable ? (
              <Badge size="2" color="gray" variant="soft">
                Baseline unavailable
              </Badge>
            ) : null}
          </Flex>
          <div className={styles.comparisonSurfaceLead}>
            <Heading size="7">{title}</Heading>
            <Text as="p" size="3" color="gray">
              {description}
            </Text>
          </div>
          {badges.length > 0 ? (
            <div className={styles.comparisonStatusBadgeRow}>
              {badges.map((badge) => (
                <Badge key={badge.key} size="2" color={badge.tone} variant="soft">
                  {badge.label}: {badge.count}
                </Badge>
              ))}
            </div>
          ) : null}
        </Flex>
      </header>

      {canRenderSummary && primarySnapshot && baselineSnapshot ? (
        <PlaygroundComparisonSummary primary={primarySnapshot} baseline={baselineSnapshot} diffIndex={diffIndex} />
      ) : null}

      <section className={styles.comparePaneGrid}>
        {panes.map((pane, index) => (
          <article key={pane.key} className={styles.comparePaneCard}>
            <div className={styles.comparePaneHeader}>
              <Flex direction="column" gap="2">
                <Badge size="2" color={index === 0 ? "bronze" : "gray"} variant="soft">
                  {paneHeading(index)}
                </Badge>
                <div>
                  <Heading size="5">{paneHeading(index)}</Heading>
                  <Text as="p" size="2" color="gray">
                    {paneDescription(index)}
                  </Text>
                </div>
              </Flex>
            </div>
            <div className={styles.comparePaneCanvas}>
              <PlaygroundPreview
                directives={pane.directives}
                tokens={pane.document.tokens}
                importedCss={pane.document.importedCss}
                runtimeCss={runtimeCss}
                title={paneHeading(index)}
              />
            </div>
          </article>
        ))}
      </section>

      {baselineUnavailable ? (
        <section className={styles.comparisonNotice}>
          <Text as="p" size="2" color="gray">
            Tailwind default baseline is currently unavailable. Showing the workspace preview only.
          </Text>
        </section>
      ) : null}
    </section>
  );

  if (layout === "workspace") {
    return <section className={styles.workspaceDashboardSlot}>{dashboardContent}</section>;
  }

  return <main className={styles.page}>{dashboardContent}</main>;
}
