import type { Metadata } from "next";
import { getWorkspace } from "@/features/token-visualizer/workspace-repo";
import { SAMPLE_DOCUMENT } from "@/features/token-visualizer/sample-workspace";
import { TokenSandboxPage } from "@/features/token-catalogue/token-sandbox-page";

export const metadata: Metadata = {
  title: "ephemeral sandbox",
  description: "Isolated Shadow DOM sandbox for the current token workspace."
};

export const dynamic = "force-dynamic";

export default async function TokensSandboxRoute() {
  const workspace = await getWorkspace("default");

  return (
    <TokenSandboxPage
      document={workspace?.document ?? SAMPLE_DOCUMENT}
      source={workspace ? "workspace" : "sample"}
      updatedAt={workspace?.updatedAt.toISOString() ?? null}
    />
  );
}
