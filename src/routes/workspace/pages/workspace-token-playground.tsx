"use client";

import { AutoHeightIframe } from "@/routes/workspace/components/auto-height-iframe";
import { useWorkspaceShellSlot } from "@/routes/workspace/components/workspace-shell-slots";
import shellStyles from "@/routes/workspace/styles.module.css";
import styles from "@/routes/preview/token-preview.module.css";

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
