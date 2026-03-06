import {
  getPrimaryPlaygroundSource,
  getTailwindDefaultSource,
  type PlaygroundPaneSource
} from "@/features/token-catalogue/playground-comparison-sources";
import { materializeResolvedTheme } from "@/features/token-catalogue/token-materialization";
import { buildDiffIndex, resolveTheme, type DiffIndex } from "@/features/token-catalogue/token-resolution";
import { getPlaygroundTailwindCss } from "@/features/token-catalogue/playground-tailwind";

export type TailwindComparisonData = {
  runtimeCss: string;
  panes: PlaygroundPaneSource[];
  diffIndex: DiffIndex | null;
  baselineUnavailable: boolean;
};

export async function getTailwindComparisonData(): Promise<TailwindComparisonData> {
  const [runtimeCss, primaryPane, baselinePane] = await Promise.all([
    getPlaygroundTailwindCss(),
    getPrimaryPlaygroundSource(),
    getTailwindDefaultSource()
  ]);

  if (!baselinePane) {
    return {
      runtimeCss,
      panes: [primaryPane],
      diffIndex: null,
      baselineUnavailable: true
    };
  }

  const diffTheme = resolveTheme({
    authored: primaryPane.document,
    baseline: baselinePane.document,
    meta: primaryPane.meta
  });
  const primaryCompareDocument = materializeResolvedTheme(diffTheme);
  const comparePrimaryPane: PlaygroundPaneSource = {
    ...primaryPane,
    document: primaryCompareDocument,
    directives: primaryCompareDocument.directives
  };

  return {
    runtimeCss,
    panes: [comparePrimaryPane, baselinePane],
    diffIndex: buildDiffIndex(diffTheme),
    baselineUnavailable: false
  };
}
