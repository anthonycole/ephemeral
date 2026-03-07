import { Suspense } from "react";
import { TokenWorkspace } from "@/routes/workspace/pages/token-workspace";

export default function WorkspacePage() {
  return (
    <Suspense fallback={null}>
      <TokenWorkspace />
    </Suspense>
  );
}
