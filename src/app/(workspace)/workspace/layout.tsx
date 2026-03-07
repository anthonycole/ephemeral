import type { ReactNode } from "react";
import { WorkspaceShell } from "@/routes/workspace/components/workspace-shell";

export default function WorkspaceRouteLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
