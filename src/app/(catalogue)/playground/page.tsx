import type { Metadata } from "next";
import { isPlaygroundAdapterKey } from "@/features/token-catalogue/playground-adapters";
import { isPlaygroundStoryKey } from "@/features/token-catalogue/playground-stories";
import { getPrimaryPlaygroundSource } from "@/features/token-catalogue/playground-comparison-sources";
import { TokenPlaygroundPage } from "@/features/token-catalogue/token-playground-page";

export const metadata: Metadata = {
  title: "ephemeral playground",
  description: "Design preview for the current token workspace."
};

export const dynamic = "force-dynamic";

export default async function PlaygroundRoute({
  searchParams
}: {
  searchParams?: Promise<{ system?: string; story?: string }>;
}) {
  const params = await searchParams;
  const system = isPlaygroundAdapterKey(params?.system) ? params?.system : "tailwind";
  const story = isPlaygroundStoryKey(params?.story) ? params?.story : "overview";
  const primaryPane = await getPrimaryPlaygroundSource();

  return (
    <TokenPlaygroundPage
      panes={[primaryPane]}
      system={system}
      story={story}
    />
  );
}
