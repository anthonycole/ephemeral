import Link from "next/link";
import { Badge, Card, Container, Flex, Heading, Section, Separator, Text } from "@radix-ui/themes";
import type { TokenDocument } from "@/features/token-visualizer/document";
import { SandboxPreview } from "@/features/token-catalogue/sandbox-preview";
import { getSandboxTailwindCss } from "@/features/token-catalogue/sandbox-tailwind";
import styles from "@/features/token-catalogue/styles.module.css";

type TokenSandboxPageProps = {
  document: TokenDocument;
  source: "workspace" | "sample";
  updatedAt: string | null;
};

export async function TokenSandboxPage({ document, source, updatedAt }: TokenSandboxPageProps) {
  const tailwindCss = await getSandboxTailwindCss();

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
                  Shadow root
                </Badge>
              </Flex>
              <div>
                <Heading size="8" mt="2">
                  Token Sandbox
                </Heading>
              </div>
              <Text size="3" color="gray" style={{ maxWidth: "48rem" }}>
                Separate route for the isolated preview. This is the better default than a tab because the sandbox has its own CSS compiler,
                Shadow DOM runtime, and visual goals that should stay decoupled from the catalogue shell.
              </Text>
              <div className={styles.routeRow}>
                <Link href="/tokens" className={styles.routeLink}>
                  <Badge size="2" color="gray" variant="surface">
                    Catalogue
                  </Badge>
                </Link>
                <Link href="/tokens/sandbox" className={styles.routeLink} aria-current="page">
                  <Badge size="2" color="blue" variant="soft">
                    Sandbox
                  </Badge>
                </Link>
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
                      Tailwind v4 component layer inside a Shadow DOM root, with imported tokens exposed as CSS variables on `:host`.
                    </Text>
                  </div>
                  <Badge size="2" color="blue" variant="soft">
                    Tailwind v4
                  </Badge>
                </Flex>
                <Separator size="4" />
                <SandboxPreview
                  tokens={document.tokens}
                  importedCss={document.importedCss}
                  tailwindCss={tailwindCss}
                />
              </Flex>
            </Section>
          </Card>
        </Flex>
      </Container>
    </main>
  );
}
