import Link from "next/link";
import {
  getPlaygroundAdapterDefinition,
  type PlaygroundAdapterKey
} from "@/features/token-catalogue/playground-adapters";
import type { PlaygroundPaneSource } from "@/features/token-catalogue/playground-comparison-sources";
import { PlaygroundPreview } from "@/features/token-catalogue/playground-preview";
import {
  getPlaygroundStoryDefinition,
  listPlaygroundStories,
  type PlaygroundStoryKey
} from "@/features/token-catalogue/playground-stories";
import workspaceStyles from "@/features/token-visualizer/styles.module.css";
import styles from "@/features/token-catalogue/styles.module.css";

type TokenPlaygroundPageProps = {
  panes: PlaygroundPaneSource[];
  system: PlaygroundAdapterKey;
  story: PlaygroundStoryKey;
};

function buildPlaygroundHref({ system, story }: { system: PlaygroundAdapterKey; story: PlaygroundStoryKey }) {
  const searchParams = new URLSearchParams();
  searchParams.set("system", system);
  searchParams.set("story", story);

  return `/playground?${searchParams.toString()}`;
}

export async function TokenPlaygroundPage({
  panes,
  system,
  story
}: TokenPlaygroundPageProps) {
  const runtimeCss = await getPlaygroundAdapterDefinition(system).getRuntimeCss();
  const primaryPane = panes[0];
  const selectedStory = getPlaygroundStoryDefinition(story);
  const headerStatus = `Playground / ${selectedStory.label}`;

  return (
    <main className={styles.page}>
      <section className={styles.playgroundLayout}>
        <section className={styles.playgroundCanvas}>
          <header className={workspaceStyles.appHeader}>
            <div className={workspaceStyles.appHeaderGrid}>
              <div>
                <h1 className={workspaceStyles.appTitle}>ephemeral</h1>
                <span className={workspaceStyles.appStatus}>{headerStatus}</span>
              </div>
              <div className={styles.playgroundWorkspaceActions}>
                <Link href="/workspace" className={styles.playgroundActionLink}>
                  Workspace
                </Link>
              </div>
            </div>
          </header>

          <nav className={styles.playgroundStoryRail} aria-label="Playground stories">
            {listPlaygroundStories().map((candidate) => {
              const href = buildPlaygroundHref({ system, story: candidate.key });
              const isActive = candidate.key === story;

              return (
                <Link
                  key={candidate.key}
                  href={href}
                  className={`${styles.playgroundStoryLink} ${isActive ? styles.playgroundStoryLinkActive : ""}`.trim()}
                  aria-current={isActive ? "page" : undefined}
                >
                  {candidate.label}
                </Link>
              );
            })}
          </nav>

          {primaryPane?.updatedAt ? (
            <p className={styles.playgroundMetaRow}>
              Updated {new Date(primaryPane.updatedAt).toLocaleString()}
            </p>
          ) : null}

          {primaryPane ? (
            <PlaygroundPreview
              directives={primaryPane.directives}
              tokens={primaryPane.document.tokens}
              importedCss={primaryPane.document.importedCss}
              runtimeCss={runtimeCss}
              story={story}
            />
          ) : null}
        </section>
      </section>
    </main>
  );
}
