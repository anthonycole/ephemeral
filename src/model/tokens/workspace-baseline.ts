import { readFile } from "node:fs/promises";
import path from "node:path";
import { importCssDocument, type TokenDocument } from "@/model/tokens/document";
import { getDefaultBaselineKey, getDefaultWorkspaceMeta, getLegacyWorkspaceMeta, normalizeWorkspaceMeta, type BaselineKey, type WorkspaceMeta } from "@/model/tokens/workspace-meta";

export type BaselineSource = {
  key: BaselineKey;
  label: string;
  document: TokenDocument;
};

let tailwindDefaultSourcePromise: Promise<BaselineSource | null> | null = null;
export { getDefaultBaselineKey, getDefaultWorkspaceMeta, getLegacyWorkspaceMeta, normalizeWorkspaceMeta };
export type { BaselineKey, WorkspaceMeta };

export function getBaselineSource(key: BaselineKey) {
  if (key !== "tailwind-default") {
    return Promise.resolve(null);
  }

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
        document
      } satisfies BaselineSource;
    } catch {
      return null;
    }
  })();

  return tailwindDefaultSourcePromise;
}
