import type { Metadata } from "next";
import { TokenCataloguePage } from "@/features/token-catalogue/token-catalogue-page";

export const metadata: Metadata = {
  title: "ephemeral tokens",
  description: "Read-only reference view for the sample token catalogue."
};

export default function TokensPage() {
  return <TokenCataloguePage />;
}
