import Link from "next/link";
import { Badge, Button, Flex, Heading } from "@radix-ui/themes";
import type { TokenDocument } from "@/features/token-visualizer/document";
import {
  getPlaygroundAdapterDefinition,
  type PlaygroundAdapterKey
} from "@/features/token-catalogue/playground-adapters";
import { PlaygroundPreview } from "@/features/token-catalogue/playground-preview";
import styles from "@/features/token-catalogue/styles.module.css";

type TokenPlaygroundPageProps = {
  document: TokenDocument;
  directives: string[];
  source: "workspace" | "sample";
  updatedAt: string | null;
  system: PlaygroundAdapterKey;
};

export async function TokenPlaygroundPage({ document, directives, source: _source, updatedAt, system }: TokenPlaygroundPageProps) {
  const runtimeCss = await getPlaygroundAdapterDefinition(system).getRuntimeCss();

  return (
    <main className={styles.page}>
      <section className={styles.playgroundLayout}>
        <header className={styles.playgroundToolbar}>
          <Flex direction="column" gap="3" className={styles.playgroundToolbarLead}>
            {updatedAt ? (
              <Flex align="center" gap="2" wrap="wrap">
                <Badge size="2" color="gray" variant="soft">
                  Updated {new Date(updatedAt).toLocaleString()}
                </Badge>
              </Flex>
            ) : null}
            <div>
              <Heading size="7">Preview</Heading>
            </div>
          </Flex>
          <Button asChild variant="soft" color="gray">
            <Link href="/workspace">View workspace</Link>
          </Button>
        </header>

        <section className={styles.playgroundCanvas}>
          <PlaygroundPreview
            directives={directives}
            tokens={document.tokens}
            importedCss={document.importedCss}
            runtimeCss={runtimeCss}
          />
        </section>
      </section>
    </main>
  );
}
