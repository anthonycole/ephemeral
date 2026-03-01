import Link from "next/link";
import { Badge, Card, Container, Flex, Heading, Section, Separator, Text } from "@radix-ui/themes";
import type { TokenDocument } from "@/features/token-visualizer/document";
import {
  getPlaygroundAdapterDefinition,
  listPlaygroundAdapters,
  type PlaygroundAdapterKey
} from "@/features/token-catalogue/playground-adapters";
import { PlaygroundPreview } from "@/features/token-catalogue/playground-preview";
import styles from "@/features/token-catalogue/styles.module.css";

type TokenPlaygroundPageProps = {
  document: TokenDocument;
  source: "workspace" | "sample";
  updatedAt: string | null;
  system: PlaygroundAdapterKey;
};

export async function TokenPlaygroundPage({ document, source, updatedAt, system }: TokenPlaygroundPageProps) {
  const adapter = getPlaygroundAdapterDefinition(system);
  const adapters = listPlaygroundAdapters();
  const runtimeCss = await adapter.getRuntimeCss();

  return (
    <main className={styles.page}>
      <Container size="4" className={styles.frame}>
        <Flex direction="column" gap="6">
          <Card className={styles.hero}>
            <Flex direction="column" gap="4">
              <Flex align="center" gap="2" wrap="wrap">
                <Badge size="2" color={source === "workspace" ? "green" : "gray"} variant="soft">
                  {source === "workspace" ? "Saved workspace" : "Sample fallback"}
                </Badge>
                {updatedAt ? (
                  <Badge size="2" color="gray" variant="soft">
                    Updated {new Date(updatedAt).toLocaleString()}
                  </Badge>
                ) : null}
                <Badge size="2" color="blue" variant="soft">
                  Iframe
                </Badge>
              </Flex>
              <div>
                <Heading size="8" mt="2">
                  Token Playground
                </Heading>
              </div>
              <Text size="3" color="gray" style={{ maxWidth: "48rem" }}>
                Separate route for the isolated preview. Each system gets its own iframe runtime so Tailwind, and later Radix, Mantine, or
                shadcn, can render without leaking styles into the parent app shell.
              </Text>
              <div className={styles.routeRow}>
                <Link href="/tokens" className={styles.routeLink}>
                  <Badge size="2" color="gray" variant="surface">
                    Catalogue
                  </Badge>
                </Link>
                <Link href="/tokens/playground" className={styles.routeLink} aria-current="page">
                  <Badge size="2" color="blue" variant="soft">
                    Playground
                  </Badge>
                </Link>
              </div>
              <div className={styles.systemSwitch} aria-label="Playground systems">
                {adapters.map((option) =>
                  option.status === "available" ? (
                    <Link
                      key={option.key}
                      href={`/tokens/playground?system=${option.key}`}
                      className={styles.routeLink}
                      aria-current={system === option.key ? "page" : undefined}
                    >
                      <Badge size="2" color={system === option.key ? "blue" : "gray"} variant={system === option.key ? "soft" : "surface"}>
                        {option.label}
                      </Badge>
                    </Link>
                  ) : (
                    <span key={option.key} className={styles.systemStub} aria-disabled="true">
                      <Badge size="2" color="gray" variant="surface">
                        {option.label}
                      </Badge>
                    </span>
                  )
                )}
              </div>
            </Flex>
          </Card>

          <Card className={styles.sectionCard}>
            <Section size="2">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="start" gap="3" wrap="wrap">
                  <div>
                    <Heading size="6">Isolated Preview</Heading>
                    <Text size="2" color="gray">
                      {adapter.label} runs inside the iframe only. Imported theme variables are exposed on `:root`, and the parent Radix app
                      stays outside this styling boundary.
                    </Text>
                  </div>
                  <Badge size="2" color="blue" variant="soft">
                    {adapter.label}
                  </Badge>
                </Flex>
                <Separator size="4" />
                <PlaygroundPreview
                  tokens={document.tokens}
                  importedCss={document.importedCss}
                  runtimeCss={runtimeCss}
                />
              </Flex>
            </Section>
          </Card>
        </Flex>
      </Container>
    </main>
  );
}
