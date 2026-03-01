"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { PlaygroundComparisonSummary } from "@/features/token-catalogue/playground-comparison-summary";
import type { PlaygroundPaneSource } from "@/features/token-catalogue/playground-comparison-sources";
import { PlaygroundPreview } from "@/features/token-catalogue/playground-preview";
import { createThemeSnapshot } from "@/features/token-catalogue/theme-snapshot";
import type { DiffIndex } from "@/features/token-catalogue/token-resolution";
import styles from "@/features/token-catalogue/styles.module.css";

type PlaygroundComparisonShellProps = {
  panes: PlaygroundPaneSource[];
  runtimeCss: string;
  diffIndex: DiffIndex | null;
};

type ComparisonView = "preview" | "differences";

function paneHeading(index: number) {
  return index === 0 ? "Workspace" : "Tailwind Default";
}

function paneDescription(index: number) {
  return index === 0 ? "Hydrated preview of your workspace theme." : "Reference preview of the default Tailwind theme.";
}

export function PlaygroundComparisonShell({ panes, runtimeCss, diffIndex }: PlaygroundComparisonShellProps) {
  const [view, setView] = useState<ComparisonView>("preview");
  const primarySnapshot = useMemo(() => createThemeSnapshot(panes[0].document.tokens), [panes]);
  const baselineSnapshot = useMemo(() => createThemeSnapshot(panes[1].document.tokens), [panes]);

  return (
    <section className={styles.comparisonShell}>
      <Flex justify="between" align="start" wrap="wrap" gap="3">
        <div>
          <Heading size="5">Comparison</Heading>
          <Text as="p" size="2" color="gray">
            Switch between visual preview and semantic diff.
          </Text>
        </div>
        <div className={styles.comparisonTabs} role="tablist" aria-label="Comparison views">
          {[
            { key: "preview", label: "Preview" },
            { key: "differences", label: "Diff" }
          ].map((tab) => (
            <Button
              key={tab.key}
              size="2"
              variant={view === tab.key ? "solid" : "soft"}
              color="gray"
              className={styles.comparisonTab}
              onClick={() => setView(tab.key as ComparisonView)}
              role="tab"
              aria-selected={view === tab.key}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </Flex>

      {view === "preview" ? (
        <section className={styles.comparePaneGrid}>
          {panes.map((pane, index) => {
            const heading = paneHeading(index);
            const description = paneDescription(index);
            const badgeLabel = index === 0 ? "Workspace" : "Tailwind Default";

            return (
              <article key={pane.key} className={styles.comparePaneCard}>
                <div className={styles.comparePaneHeader}>
                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="2" wrap="wrap">
                      <Badge size="2" color={pane.source === "baseline" ? "gray" : "bronze"} variant="soft">
                        {badgeLabel}
                      </Badge>
                      {index === 0 && pane.updatedAt ? (
                        <Badge size="2" color="gray" variant="soft">
                          Updated {new Date(pane.updatedAt).toLocaleString()}
                        </Badge>
                      ) : null}
                    </Flex>
                    <div>
                      <Heading size="5">{heading}</Heading>
                      <Text as="p" size="2" color="gray">
                        {description}
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
                    title={heading}
                  />
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {view === "differences" ? <PlaygroundComparisonSummary primary={primarySnapshot} baseline={baselineSnapshot} diffIndex={diffIndex} compact /> : null}
    </section>
  );
}
