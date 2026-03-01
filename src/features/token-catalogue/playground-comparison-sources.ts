import { readFile } from "node:fs/promises";
import path from "node:path";
import { importCssDocument, type TokenDocument } from "@/features/token-visualizer/document";
import { SAMPLE_DOCUMENT } from "@/features/token-visualizer/sample-workspace";
import { getWorkspace } from "@/features/token-visualizer/workspace-repo";
import { getLegacyWorkspaceMeta, type WorkspaceMeta } from "@/features/token-catalogue/workspace-meta";

export type PlaygroundComparisonSourceKey = "workspace" | "sample" | "tailwind-default";

export type PlaygroundPaneSource = {
  key: PlaygroundComparisonSourceKey;
  label: string;
  source: "workspace" | "sample" | "baseline";
  document: TokenDocument;
  directives: string[];
  meta: WorkspaceMeta;
  updatedAt: string | null;
};

let tailwindDefaultSourcePromise: Promise<PlaygroundPaneSource | null> | null = null;

export async function getPrimaryPlaygroundSource(): Promise<PlaygroundPaneSource> {
  const workspace = await getWorkspace("default");

  if (workspace) {
    return {
      key: "workspace",
      label: "Workspace theme",
      source: "workspace",
      document: workspace.document,
      directives: workspace.document.directives,
      meta: workspace.meta,
      updatedAt: workspace.updatedAt.toISOString()
    };
  }

  return {
    key: "sample",
    label: "Sample theme",
    source: "sample",
    document: SAMPLE_DOCUMENT,
    directives: SAMPLE_DOCUMENT.directives,
    meta: getLegacyWorkspaceMeta(),
    updatedAt: null
  };
}

export function getTailwindDefaultSource() {
  tailwindDefaultSourcePromise ??= (async () => {
    try {
      const filePath = path.join(process.cwd(), "src", "lib", "fixtures", "tailwind-default.css");
      const rawCss = await readFile(filePath, "utf8");
      const document = importCssDocument(rawCss);

      if (document.tokens.length === 0) {
        return null;
      }

      return {
        key: "tailwind-default",
        label: "Tailwind default",
        source: "baseline",
        document,
        directives: document.directives,
        meta: getLegacyWorkspaceMeta(),
        updatedAt: null
      } satisfies PlaygroundPaneSource;
    } catch {
      return null;
    }
  })();

  return tailwindDefaultSourcePromise;
}
