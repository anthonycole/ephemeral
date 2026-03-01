import type { Metadata } from "next";
import { isSandboxAdapterKey } from "@/features/token-catalogue/sandbox-adapters";
import { TokenSandboxPage } from "@/features/token-catalogue/token-sandbox-page";
import { SAMPLE_DOCUMENT } from "@/features/token-visualizer/sample-workspace";
import { getWorkspace } from "@/features/token-visualizer/workspace-repo";

export const metadata: Metadata = {
  title: "ephemeral sandbox",
  description: "Isolated iframe sandbox for the current token workspace."
};

export const dynamic = "force-dynamic";

export default async function TokensSandboxRoute({
  searchParams
}: {
  searchParams?: Promise<{ system?: string }>;
}) {
  const workspace = await getWorkspace("default");
  const params = await searchParams;
  const system = isSandboxAdapterKey(params?.system) ? params?.system : "tailwind";

  return (
    <TokenSandboxPage
      document={workspace?.document ?? SAMPLE_DOCUMENT}
      source={workspace ? "workspace" : "sample"}
      updatedAt={workspace?.updatedAt.toISOString() ?? null}
      system={system}
    />
  );
}
