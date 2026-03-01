import type { Metadata } from "next";
import { isPlaygroundAdapterKey } from "@/features/token-catalogue/playground-adapters";
import { materializeResolvedTheme } from "@/features/token-catalogue/token-materialization";
import { buildDiffIndex, resolveTheme } from "@/features/token-catalogue/token-resolution";
import {
  getPrimaryPlaygroundSource,
  getTailwindDefaultSource
} from "@/features/token-catalogue/playground-comparison-sources";
import { TokenPlaygroundPage } from "@/features/token-catalogue/token-playground-page";

export const metadata: Metadata = {
  title: "ephemeral playground",
  description: "Design preview for the current token workspace."
};

export const dynamic = "force-dynamic";

export default async function PlaygroundRoute({
  searchParams
}: {
  searchParams?: Promise<{ system?: string; compare?: string }>;
}) {
  const params = await searchParams;
  const system = isPlaygroundAdapterKey(params?.system) ? params?.system : "tailwind";
  const primaryPane = await getPrimaryPlaygroundSource();
  const compareTarget = params?.compare === "tailwind-default" ? "tailwind-default" : null;

  if (compareTarget === "tailwind-default") {
    const baselinePane = await getTailwindDefaultSource();

    if (!baselinePane) {
      return (
        <TokenPlaygroundPage
          panes={[primaryPane]}
          compareTarget={null}
          baselineUnavailable={true}
          system={system}
        />
      );
    }

    const diffTheme = resolveTheme({
      authored: primaryPane.document,
      baseline: baselinePane.document,
      meta: primaryPane.meta
    });
    const primaryCompareDocument = materializeResolvedTheme(diffTheme);
    const comparePrimaryPane = {
      ...primaryPane,
      document: primaryCompareDocument,
      directives: primaryCompareDocument.directives
    };

    return (
      <TokenPlaygroundPage
        panes={[comparePrimaryPane, baselinePane]}
        compareTarget={compareTarget}
        diffIndex={buildDiffIndex(diffTheme)}
        system={system}
      />
    );
  }

  return (
    <TokenPlaygroundPage
      panes={[primaryPane]}
      compareTarget={null}
      system={system}
    />
  );
}
