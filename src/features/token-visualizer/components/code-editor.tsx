"use client";

import { useDeferredValue, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import styles from "@/features/token-visualizer/styles.module.css";
import { useDebouncedValue } from "@/features/token-visualizer/use-debounced-value";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  hasErrors: boolean;
  readOnly?: boolean;
};

export function CodeEditor({ value, onChange, hasErrors, readOnly = false }: CodeEditorProps) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const deferredValue = useDeferredValue(value);
  const highlightedValue = useDebouncedValue(deferredValue, 120);

  return (
    <div className={`${styles.codeEditorWrap} ${hasErrors ? styles.codeEditorInvalid : styles.codeEditorValid}`}>
      <div ref={highlightRef} className={styles.codeHighlight}>
        <SyntaxHighlighter
          language="css"
          style={oneLight}
          customStyle={{
            margin: 0,
            fontSize: "12px",
            minHeight: "340px",
            padding: "12px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere"
            }
          }}
          wrapLongLines
        >
          {highlightedValue.trim().length > 0 ? highlightedValue : "/* Add CSS variables to preview syntax highlighting */"}
        </SyntaxHighlighter>
      </div>
      {!readOnly && (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={(event) => {
            if (highlightRef.current) {
              highlightRef.current.scrollTop = event.currentTarget.scrollTop;
              highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
            }
          }}
          spellCheck={false}
          className={styles.codeEditor}
          placeholder=":root {\n  --token-name: value;\n}"
        />
      )}
    </div>
  );
}
