export type BaselineKey = "tailwind-default";

export type WorkspaceMeta = {
  baselineKey: BaselineKey | null;
  hydrationMode: "inherit" | "materialized";
};

export function getDefaultBaselineKey(): BaselineKey {
  return "tailwind-default";
}

export function getDefaultWorkspaceMeta(): WorkspaceMeta {
  return {
    baselineKey: getDefaultBaselineKey(),
    hydrationMode: "inherit"
  };
}

export function getLegacyWorkspaceMeta(): WorkspaceMeta {
  return {
    baselineKey: null,
    hydrationMode: "materialized"
  };
}

export function normalizeWorkspaceMeta(meta: Partial<WorkspaceMeta> | null | undefined, options?: { legacy?: boolean }): WorkspaceMeta {
  if (options?.legacy) {
    return {
      baselineKey: meta?.baselineKey === "tailwind-default" ? meta.baselineKey : null,
      hydrationMode: meta?.hydrationMode === "inherit" || meta?.hydrationMode === "materialized" ? meta.hydrationMode : "materialized"
    };
  }

  return {
    baselineKey: meta?.baselineKey === "tailwind-default" ? meta.baselineKey : getDefaultBaselineKey(),
    hydrationMode: meta?.hydrationMode === "materialized" ? "materialized" : "inherit"
  };
}
