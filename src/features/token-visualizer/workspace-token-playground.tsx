"use client";

import { AutoHeightIframe } from "@/features/token-visualizer/components/auto-height-iframe";
import { useWorkspaceShellSlot } from "@/features/token-visualizer/components/workspace-shell-slots";
import shellStyles from "@/features/token-visualizer/styles.module.css";
import styles from "@/features/token-visualizer/token-preview.module.css";

export function WorkspaceTokenPlayground() {
  useWorkspaceShellSlot({
    headerActions: <></>,
    statusText: "Playground"
  });

  return (
    <main className={shellStyles.workspacePaneRoot}>
      <div className={styles.previewRoutePane}>
        <div className={styles.previewHost}>
          <AutoHeightIframe src="/preview/tokens" title="Published tokens preview" frameClassName={styles.previewFrame} />
        </div>
      </div>
    </main>
  );
}
