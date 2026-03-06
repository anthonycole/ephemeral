import { getTailwindComparisonData } from "@/features/token-catalogue/tailwind-comparison-data";
import { PlaygroundComparisonSurface } from "@/features/token-catalogue/playground-comparison-surface";

export const dynamic = "force-dynamic";

export default async function WorkspaceComparePage() {
  const data = await getTailwindComparisonData();

  return (
    <PlaygroundComparisonSurface
      panes={data.panes}
      runtimeCss={data.runtimeCss}
      diffIndex={data.diffIndex}
      showMetrics={Boolean(data.diffIndex)}
      baselineUnavailable={data.baselineUnavailable}
      title="Workspace comparison"
      description="Compare your workspace theme with Tailwind defaults."
      layout="workspace"
    />
  );
}
