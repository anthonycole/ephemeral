import type { ReactNode } from "react";
import { WorkspaceShell } from "@/features/token-visualizer/components/workspace-shell";

export default function WorkspaceRouteLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
