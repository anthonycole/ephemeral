"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle, Palette, SpinnerGap, WarningCircle, X as CloseIcon } from "@phosphor-icons/react";
import { Button, Flex, Heading, Select, Text } from "@radix-ui/themes";
import type { CssSyntaxError } from "@/lib/design-tokens";
import type { PersistenceStatus } from "@/features/token-visualizer/components/workspace-header";
import { CODE_EDITOR_THEME_OPTIONS, type CodeEditorTheme } from "@/features/token-visualizer/components/code-editor";
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
  editorMode: EditorMode;
  onEditorModeChange: (value: EditorMode) => void;
  onClose?: () => void;
  persistenceStatus: PersistenceStatus;
  onEditorCssChange: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
  lastSavedAt: number | null;
  syntaxErrors: CssSyntaxError[];
};

const EDITOR_THEME_STORAGE_KEY = "ephemeral.code-editor-theme";
const DEFAULT_EDITOR_THEME: CodeEditorTheme = "textmate";
export type EditorMode = "raw-css" | "tailwind";

export function EditorPane({
  className,
  editorCss,
  editorMode,
  onEditorModeChange,
  onClose,
  persistenceStatus,
  onEditorCssChange,
  onReset,
  onSave,
  lastSavedAt,
  syntaxErrors
}: EditorPaneProps) {
  const hasErrors = syntaxErrors.length > 0;
  const [editorTheme, setEditorTheme] = useState<CodeEditorTheme>(DEFAULT_EDITOR_THEME);
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit"
      }),
    []
  );
  const footerMessage =
    persistenceStatus === "saving"
      ? "Autosaving changes..."
      : persistenceStatus === "error"
        ? "Autosave failed"
        : persistenceStatus === "loading"
          ? "Preparing workspace..."
          : lastSavedAt
            ? `Saved ${timeFormatter.format(lastSavedAt)}`
            : "Autosave on";
  const footerTone =
    persistenceStatus === "error" ? styles.editorFooterStatusError : persistenceStatus === "saving" ? styles.editorFooterStatusSaving : styles.editorFooterStatusSaved;
  const syntaxSummary = hasErrors ? `${syntaxErrors.length} syntax issue${syntaxErrors.length === 1 ? "" : "s"}` : "Ready to save";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(EDITOR_THEME_STORAGE_KEY);

    if (storedTheme && CODE_EDITOR_THEME_OPTIONS.some((option) => option.value === storedTheme)) {
      setEditorTheme(storedTheme as CodeEditorTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(EDITOR_THEME_STORAGE_KEY, editorTheme);
  }, [editorTheme]);

  return (
    <section className={[styles.shellPane, className].filter(Boolean).join(" ")}>
      <Flex direction="column" gap="3" className={styles.paneStack}>
        <Flex justify="between" align="center" className={styles.editorPaneHeader}>
          <Heading size="5">CSS Import / Export</Heading>
          {onClose ? (
            <Button size="2" variant="ghost" color="gray" onClick={onClose} className={styles.editorCloseButton} aria-label="Close CSS import and export">
              <CloseIcon size={18} weight="bold" />
            </Button>
          ) : null}
        </Flex>

        <div className={styles.editorWorkspace}>
          <div className={styles.editorMain}>
            <Flex direction="column" gap="4" className={styles.editorMainStack}>
              <Flex justify="between" align="center" wrap="wrap" gap="2" className={styles.editorToolbar}>
                <Flex align="center" gap="2" wrap="wrap" className={styles.editorToolbarGroup}>
                  <Text size="1" color="gray">
                    Source
                  </Text>
                  <Select.Root value={editorMode} onValueChange={(value) => onEditorModeChange(value as EditorMode)}>
                    <Select.Trigger className={styles.editorPresetField} />
                    <Select.Content>
                      <Select.Item value="raw-css">Raw CSS</Select.Item>
                      <Select.Item value="tailwind">Tailwind</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <Palette size={15} weight="regular" />
                  <Text size="1" color="gray">
                    Theme
                  </Text>
                  <Select.Root value={editorTheme} onValueChange={(value) => setEditorTheme(value as CodeEditorTheme)}>
                    <Select.Trigger className={styles.editorThemeField} />
                    <Select.Content>
                      {CODE_EDITOR_THEME_OPTIONS.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>

              <div className={styles.editorCodeArea}>
                <CodeEditor value={editorCss} onChange={onEditorCssChange} hasErrors={hasErrors} theme={editorTheme} />
              </div>

              <Flex justify="between" align="center" wrap="wrap" gap="2" className={styles.editorFooter}>
                <Flex align="center" gap="2" className={`${styles.editorFooterStatus} ${footerTone}`}>
                  {persistenceStatus === "saving" || persistenceStatus === "loading" ? (
                    <SpinnerGap size={14} weight="bold" className={styles.editorStatusIconSpin} />
                  ) : persistenceStatus === "error" ? (
                    <WarningCircle size={14} weight="fill" />
                  ) : (
                    <CheckCircle size={14} weight="fill" />
                  )}
                  <Text size="1">{footerMessage}</Text>
                </Flex>
                <Flex align="center" justify="end" gap="2" wrap="wrap" className={styles.editorActionRow}>
                  <Text size="1" color={hasErrors ? "red" : "gray"}>
                    {syntaxSummary}
                  </Text>
                  <Button size="1" variant="soft" color="gray" onClick={onReset} className={styles.editorToolbarButton}>
                    Reset
                  </Button>
                  <Button size="1" onClick={onSave} disabled={hasErrors} className={styles.editorToolbarButton}>
                    Save
                  </Button>
                </Flex>
              </Flex>

              {hasErrors ? (
                <div className={styles.editorErrorList}>
                  <Text size="2" color="red">
                    CSS syntax issues detected:
                  </Text>
                  <Flex direction="column" gap="1" mt="2">
                    {syntaxErrors.slice(0, 6).map((error) => (
                      <Text key={`${error.line}-${error.message}`} size="1" color="red">
                        Line {error.line}: {error.message}
                      </Text>
                    ))}
                    {syntaxErrors.length > 6 ? (
                      <Text size="1" color="red">
                        +{syntaxErrors.length - 6} more
                      </Text>
                    ) : null}
                  </Flex>
                </div>
              ) : null}
            </Flex>
          </div>
        </div>
      </Flex>
    </section>
  );
}
