import type { Metadata } from "next";
import { isPlaygroundAdapterKey } from "@/features/token-catalogue/playground-adapters";
import { TokenPlaygroundPage } from "@/features/token-catalogue/token-playground-page";
import { SAMPLE_DOCUMENT } from "@/features/token-visualizer/sample-workspace";
import { getWorkspace } from "@/features/token-visualizer/workspace-repo";

export const metadata: Metadata = {
  title: "ephemeral playground",
  description: "Isolated iframe playground for the current token workspace."
};

export const dynamic = "force-dynamic";

export default async function TokensPlaygroundRoute({
  searchParams
}: {
  searchParams?: Promise<{ system?: string }>;
}) {
  const workspace = await getWorkspace("default");
  const params = await searchParams;
  const system = isPlaygroundAdapterKey(params?.system) ? params?.system : "tailwind";

  return (
    <TokenPlaygroundPage
      document={workspace?.document ?? SAMPLE_DOCUMENT}
      source={workspace ? "workspace" : "sample"}
      updatedAt={workspace?.updatedAt.toISOString() ?? null}
      system={system}
    />
  );
}
