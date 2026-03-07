"use client";

import { useMemo } from "react";
import { Heading, Table, Text } from "@radix-ui/themes";
import { tokenCategoryDefinitions } from "@/features/token-catalogue/categories";
import { formatScopeLabel, groupTokens } from "@/features/token-visualizer/utils";
import { useWorkspaceRecordState } from "@/features/token-visualizer/use-workspace-record-state";
import styles from "@/features/token-visualizer/token-preview.module.css";

function formatConditions(conditions: string[]) {
  return conditions.length > 0 ? conditions.join(", ") : "—";
}

export function PublishedTokensFrame() {
  const { effectiveTokens, hasLoadedWorkspace } = useWorkspaceRecordState();
  const groupedTokens = useMemo(() => groupTokens(effectiveTokens), [effectiveTokens]);
  const sections = tokenCategoryDefinitions
    .map((definition) => ({
      ...definition,
      tokens: groupedTokens[definition.key]
    }))
    .filter((section) => section.tokens.length > 0);

  if (!hasLoadedWorkspace) {
    return (
      <main className={styles.frameState}>
        <Text size="2" color="gray">
          Loading tokens…
        </Text>
      </main>
    );
  }

  if (sections.length === 0) {
    return (
      <main className={styles.frameState}>
        <Text size="2" color="gray">
          No published tokens yet.
        </Text>
      </main>
    );
  }

  return (
    <main className={styles.frameRoot}>
      <div className={styles.frameStack}>
        {sections.map((section) => (
          <section key={section.key} className={styles.frameSection}>
            <div className={styles.frameSectionHeader}>
              <Heading size="4">{section.label}</Heading>
              <Text size="1" className={styles.frameMuted}>
                {section.tokens.length} {section.tokens.length === 1 ? "token" : "tokens"}
              </Text>
            </div>
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Token</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Scope</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Conditions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {section.tokens.map((token) => (
                  <Table.Row key={token.sourceId}>
                    <Table.Cell>
                      <code className={styles.frameCode}>{token.name}</code>
                    </Table.Cell>
                    <Table.Cell>
                      <code className={styles.frameCode}>{token.value}</code>
                    </Table.Cell>
                    <Table.Cell>{formatScopeLabel(token.scope)}</Table.Cell>
                    <Table.Cell>
                      <code className={styles.frameCode}>{formatConditions(token.atRules)}</code>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </section>
        ))}
      </div>
    </main>
  );
}
