"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { X as CloseIcon } from "@phosphor-icons/react";
import { Badge, Button, Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";
import type { CssSyntaxError } from "@/lib/design-tokens";
import type { ImportedGoogleFont } from "@/features/token-visualizer/font-utils";
import styles from "@/features/token-visualizer/styles.module.css";

const CodeEditor = dynamic(
  () => import("@/features/token-visualizer/components/code-editor").then((module) => module.CodeEditor),
  {
    ssr: false,
    loading: () => <div className={styles.codeEditorWrap} />
  }
);

type EditorPaneProps = {
  className?: string;
  editorCss: string;
  onClose?: () => void;
  importedGoogleFonts: ImportedGoogleFont[];
  onEditorCssChange: (value: string) => void;
  onImportGoogleFont: (family: string) => void;
  onImportCss: () => void;
  onLoadGeneratedCss: () => void;
  onRemoveGoogleFont: (family: string) => void;
  onResetToSample: () => void;
  syntaxErrors: CssSyntaxError[];
};

export function EditorPane({
  className,
  editorCss,
  onClose,
  importedGoogleFonts,
  onEditorCssChange,
  onImportGoogleFont,
  onImportCss,
  onLoadGeneratedCss,
  onRemoveGoogleFont,
  onResetToSample,
  syntaxErrors
}: EditorPaneProps) {
  const hasErrors = syntaxErrors.length > 0;
  const [fontFamilyDraft, setFontFamilyDraft] = useState("");

  return (
    <section className={[styles.shellPane, className].filter(Boolean).join(" ")}>
      <Flex direction="column" gap="3" className={styles.paneStack}>
        <Flex justify="between" align="center" className={styles.editorPaneHeader}>
          <Flex align="center" gap="2" wrap="wrap">
            <Heading size="5">CSS Import / Export</Heading>
            <Badge color={hasErrors ? "red" : "green"}>{hasErrors ? "Import has errors" : "Import ready"}</Badge>
          </Flex>
          {onClose ? (
            <Button size="2" variant="ghost" color="gray" onClick={onClose} className={styles.editorCloseButton} aria-label="Close CSS import and export">
              <CloseIcon size={18} weight="bold" />
            </Button>
          ) : null}
        </Flex>

        <div className={styles.editorWorkspace}>
          <aside className={styles.editorSidebar}>
            <ScrollArea type="auto" scrollbars="vertical" className={styles.paneScroll}>
              <Flex direction="column" gap="3">
                <Flex direction="column" gap="1">
                  <Heading size="4">Google Fonts</Heading>
                  <Text size="2" color="gray">
                    {importedGoogleFonts.length} imported
                  </Text>
                </Flex>
                <Flex direction="column" gap="2">
                  <input
                    value={fontFamilyDraft}
                    onChange={(event) => setFontFamilyDraft(event.target.value)}
                    placeholder="Inter"
                    className={styles.fontFamilyInput}
                  />
                  <Button
                    size="2"
                    onClick={() => {
                      if (!fontFamilyDraft.trim()) {
                        return;
                      }

                      onImportGoogleFont(fontFamilyDraft);
                      setFontFamilyDraft("");
                    }}
                  >
                    Import font
                  </Button>
                </Flex>
                {importedGoogleFonts.length > 0 ? (
                  <div className={styles.fontImportList}>
                    {importedGoogleFonts.map((font) => (
                      <div key={font.family} className={styles.fontImportRow}>
                        <div>
                          <Text size="2">{font.family}</Text>
                        </div>
                        <Button size="1" variant="soft" color="gray" onClick={() => onRemoveGoogleFont(font.family)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text size="2" color="gray">
                    No Google Fonts imported yet.
                  </Text>
                )}
              </Flex>
            </ScrollArea>
          </aside>

          <div className={styles.editorMain}>
            <ScrollArea type="auto" scrollbars="vertical" className={styles.paneScroll}>
              <Flex direction="column" gap="4">
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
          </div>
        </div>
      </Flex>
    </section>
  );
}
