"use client";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/worker-css";
import styles from "@/routes/workspace/styles.module.css";

export const CODE_EDITOR_THEME_OPTIONS = [
  { value: "textmate", label: "Textmate" },
  { value: "github", label: "GitHub" },
  { value: "solarized_light", label: "Solarized Light" },
  { value: "tomorrow_night", label: "Tomorrow Night" },
  { value: "monokai", label: "Monokai" }
] as const;

export type CodeEditorTheme = (typeof CODE_EDITOR_THEME_OPTIONS)[number]["value"];

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  hasErrors: boolean;
  readOnly?: boolean;
  theme?: CodeEditorTheme;
};

export function CodeEditor({ value, onChange, hasErrors, readOnly = false, theme = "textmate" }: CodeEditorProps) {
  return (
    <div className={`${styles.codeEditorWrap} ${hasErrors ? styles.codeEditorInvalid : styles.codeEditorValid}`}>
      <AceEditor
        mode="css"
        theme={theme}
        name="token-css-editor"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        width="100%"
        height="100%"
        placeholder=":root {\n  --token-name: value;\n}"
        fontSize={12}
        showPrintMargin={false}
        showGutter
        highlightActiveLine={!readOnly}
        wrapEnabled
        setOptions={{
          useWorker: true,
          tabSize: 2,
          useSoftTabs: true,
          showLineNumbers: true,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: false
        }}
        editorProps={{ $blockScrolling: true }}
        className={styles.codeEditorSurface}
      />
    </div>
  );
}
