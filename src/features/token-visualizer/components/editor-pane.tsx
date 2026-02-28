"use client";

import dynamic from "next/dynamic";
import { Badge, Button, Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";
import type { CssSyntaxError } from "@/lib/design-tokens";
import styles from "@/features/token-visualizer/styles.module.css";

const CodeEditor = dynamic(
  () => import("@/features/token-visualizer/components/code-editor").then((module) => module.CodeEditor),
  {
    ssr: false,
    loading: () => <div className={styles.codeEditorWrap} />
  }
);

type EditorPaneProps = {
  editorCss: string;
  onEditorCssChange: (value: string) => void;
  onImportCss: () => void;
  onLoadGeneratedCss: () => void;
  onResetToSample: () => void;
  syntaxErrors: CssSyntaxError[];
};

export function EditorPane({
  editorCss,
  onEditorCssChange,
  onImportCss,
  onLoadGeneratedCss,
  onResetToSample,
  syntaxErrors
}: EditorPaneProps) {
  const hasErrors = syntaxErrors.length > 0;

  return (
    <section className={`${styles.shellPane} ${styles.leftPane}`}>
      <Flex direction="column" gap="3" className={styles.paneStack}>
        <ScrollArea type="auto" scrollbars="vertical" className={styles.paneScroll}>
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center" className={styles.editorPaneHeader}>
              <Heading size="5">CSS Import / Export</Heading>
              <Badge color={hasErrors ? "red" : "green"}>{hasErrors ? "Import has errors" : "Import ready"}</Badge>
            </Flex>

            <Flex justify="between" align="center" wrap="wrap" gap="2">
              <Text size="2" color="gray">
                Paste CSS to import tokens into the document.
              </Text>
              <Flex gap="2" wrap="wrap">
                <Button size="1" onClick={onImportCss} disabled={hasErrors}>
                  Import CSS
                </Button>
                <Button size="1" variant="soft" onClick={onLoadGeneratedCss}>
                  Load generated
                </Button>
                <Button size="1" variant="soft" color="gray" onClick={onResetToSample}>
                  Reset sample
                </Button>
              </Flex>
            </Flex>

            <CodeEditor value={editorCss} onChange={onEditorCssChange} hasErrors={hasErrors} />

            {hasErrors && (
              <div>
                <Text size="2" color="red">
                  CSS syntax issues detected:
                </Text>
                <Flex direction="column" gap="1" mt="2">
                  {syntaxErrors.slice(0, 6).map((error) => (
                    <Text key={`${error.line}-${error.message}`} size="1" color="red">
                      Line {error.line}: {error.message}
                    </Text>
                  ))}
                  {syntaxErrors.length > 6 && (
                    <Text size="1" color="red">
                      +{syntaxErrors.length - 6} more
                    </Text>
                  )}
                </Flex>
              </div>
            )}
          </Flex>
        </ScrollArea>
      </Flex>
    </section>
  );
}
