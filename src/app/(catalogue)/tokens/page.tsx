import type { Metadata } from "next";
import { TokenCataloguePage } from "@/features/token-catalogue/token-catalogue-page";
import { SAMPLE_DOCUMENT } from "@/features/token-visualizer/sample-workspace";
import { getWorkspace } from "@/features/token-visualizer/workspace-repo";

export const metadata: Metadata = {
  title: "ephemeral tokens",
  description: "Read-only reference view for the sample token catalogue."
};

export const dynamic = "force-dynamic";

export default async function TokensPage() {
  const workspace = await getWorkspace("default");

  return (
    <TokenCataloguePage
      document={workspace?.document ?? SAMPLE_DOCUMENT}
      source={workspace ? "workspace" : "sample"}
      updatedAt={workspace?.updatedAt.toISOString() ?? null}
    />
  );
}
