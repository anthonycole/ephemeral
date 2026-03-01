import Link from "next/link";
import { Badge, Button, Flex, Heading, Text } from "@radix-ui/themes";
import {
  getPlaygroundAdapterDefinition,
  type PlaygroundAdapterKey
} from "@/features/token-catalogue/playground-adapters";
import { PlaygroundComparisonShell } from "@/features/token-catalogue/playground-comparison-shell";
import type { PlaygroundPaneSource } from "@/features/token-catalogue/playground-comparison-sources";
import { PlaygroundPreview } from "@/features/token-catalogue/playground-preview";
import type { DiffIndex } from "@/features/token-catalogue/token-resolution";
import styles from "@/features/token-catalogue/styles.module.css";

type TokenPlaygroundPageProps = {
  panes: PlaygroundPaneSource[];
  compareTarget: "tailwind-default" | null;
  baselineUnavailable?: boolean;
  diffIndex?: DiffIndex | null;
  system: PlaygroundAdapterKey;
};

function toolbarHref({ compareTarget, system }: { compareTarget: "tailwind-default" | null; system: PlaygroundAdapterKey }) {
  if (compareTarget === "tailwind-default") {
    return `/playground?system=${system}`;
  }

  return `/playground?compare=tailwind-default&system=${system}`;
}

export async function TokenPlaygroundPage({ panes, compareTarget, baselineUnavailable = false, diffIndex = null, system }: TokenPlaygroundPageProps) {
  const runtimeCss = await getPlaygroundAdapterDefinition(system).getRuntimeCss();
  const isCompareMode = compareTarget === "tailwind-default" && panes.length === 2;
  const primaryPane = panes[0];

  return (
    <main className={styles.page}>
      <section className={styles.playgroundLayout}>
        <header className={styles.playgroundToolbar}>
          <Flex direction="column" gap="3" className={styles.playgroundToolbarLead}>
            {primaryPane?.updatedAt ? (
              <Flex align="center" gap="2" wrap="wrap">
                <Badge size="2" color="bronze" variant="soft">
                  {primaryPane.label}
                </Badge>
                <Badge size="2" color="gray" variant="soft">
                  Updated {new Date(primaryPane.updatedAt).toLocaleString()}
                </Badge>
                {baselineUnavailable ? (
                  <Badge size="2" color="gray" variant="soft">
                    Baseline unavailable
                  </Badge>
                ) : null}
              </Flex>
            ) : (
              <Flex align="center" gap="2" wrap="wrap">
                <Badge size="2" color="bronze" variant="soft">
                  {primaryPane.label}
                </Badge>
                {baselineUnavailable ? (
                  <Badge size="2" color="gray" variant="soft">
                    Baseline unavailable
                  </Badge>
                ) : null}
              </Flex>
            )}
            <div>
              <Heading size="7">{isCompareMode ? "Design Comparison" : "Design Preview"}</Heading>
              <Text as="p" size="3" color="gray">
                {isCompareMode
                  ? "Compare your current theme against Tailwind v4 defaults using the same mock layout and token roles."
                  : "Review palette, type, spacing, and component tone in a representative mock layout."}
              </Text>
            </div>
          </Flex>
          <Flex gap="3" wrap="wrap">
            <Button asChild variant="soft" color="gray">
              <Link href={toolbarHref({ compareTarget, system })}>
                {isCompareMode ? "Single preview" : "Compare with Tailwind default"}
              </Link>
            </Button>
            <Button asChild variant="soft" color="gray">
              <Link href="/workspace">View workspace</Link>
            </Button>
          </Flex>
        </header>

        {isCompareMode ? (
          <PlaygroundComparisonShell panes={panes} runtimeCss={runtimeCss} diffIndex={diffIndex} />
        ) : primaryPane ? (
          <section className={styles.playgroundCanvas}>
            <PlaygroundPreview
              directives={primaryPane.directives}
              tokens={primaryPane.document.tokens}
              importedCss={primaryPane.document.importedCss}
              runtimeCss={runtimeCss}
            />
          </section>
        ) : null}
      </section>
    </main>
  );
}
