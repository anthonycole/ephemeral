import { Suspense } from "react";
import { TokenWorkspace } from "@/features/token-visualizer";

export default function WorkspacePage() {
  return (
    <Suspense fallback={null}>
      <TokenWorkspace />
    </Suspense>
  );
}
